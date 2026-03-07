import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  BookOpenText,
  CalendarDays,
  CheckCircle2,
  Home,
  ListTree,
  Loader2,
  Pause,
  Play,
  Square,
  Timer,
  Volume2,
  WandSparkles,
} from "lucide-react";
import { LongformEngagementBar, useLongformEngagement } from "@/components/content/LongformEngagementBar";
import {
  buildTocFromRoot,
  computeScrollProgress,
  getActiveHeadingId,
  type LongformTocItem,
} from "@/lib/longformNavigation";
import { applyEmbeddedThemeBridge } from "@/lib/readerActions";
import { useTheme } from "@/components/ThemeProvider";
import type { ScriptureRecord } from "@/content/scriptures";

type ScriptureDetailProps = {
  scripture: ScriptureRecord;
};

type WordSyncMap = {
  words: string[];
  spans: HTMLSpanElement[];
  charStarts: number[];
};

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") || "https://www.abhishekpanda.com";
const SARVAM_API_KEY = (import.meta.env.VITE_SARVAM_API_KEY as string | undefined)?.trim();
const SARVAM_TTS_URL =
  (import.meta.env.VITE_SARVAM_TTS_URL as string | undefined)?.trim() ||
  "https://api.sarvam.ai/text-to-speech";

const SPEAK_WORD_CLASS = "scripture-speaking-word";
const SPEAK_WORD_ATTR = "data-scripture-word";
const AMBIENT_GAIN = 0.025;

const cleanText = (value: string) => value.replace(/\s+/g, " ").trim();
const slugifyHeading = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const toExplainableNarration = (raw: string) => {
  const simplified = raw
    .replace(/\s+/g, " ")
    .replace(/\((.*?)\)/g, "$1")
    .replace(/;/g, ".")
    .replace(/:/g, ".")
    .trim();

  const lines = simplified
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 220);

  const transformed = lines.map((line, index) => {
    if (index % 4 === 0) return `In simple words, ${line}`;
    if (/\btherefore\b|\bhence\b|\bso\b/i.test(line)) return `Meaning clearly: ${line}`;
    return line;
  });

  return transformed.join(" ");
};

const findWordIndexByChar = (charIndex: number, starts: number[]) => {
  let low = 0;
  let high = starts.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const start = starts[mid];
    const next = starts[mid + 1] ?? Number.POSITIVE_INFINITY;
    if (charIndex >= start && charIndex < next) return mid;
    if (charIndex < start) high = mid - 1;
    else low = mid + 1;
  }

  return Math.max(0, Math.min(starts.length - 1, low));
};

const clearWordHighlight = (doc: Document) => {
  doc.querySelectorAll(`.${SPEAK_WORD_CLASS}`).forEach((node) => node.classList.remove(SPEAK_WORD_CLASS));
};

const cleanupWordWrappers = (doc: Document) => {
  doc.querySelectorAll(`span[${SPEAK_WORD_ATTR}="1"]`).forEach((node) => {
    const text = doc.createTextNode(node.textContent || "");
    node.parentNode?.replaceChild(text, node);
  });
};

const injectWordHighlightStyle = (doc: Document) => {
  const id = "scripture-word-sync-style";
  if (doc.getElementById(id)) return;

  const style = doc.createElement("style");
  style.id = id;
  style.textContent = `
    .${SPEAK_WORD_CLASS} {
      background: rgba(59,130,246,0.28) !important;
      color: inherit !important;
      border-radius: 3px;
      box-shadow: 0 0 0 1px rgba(59,130,246,0.25) inset;
    }
  `;
  doc.head.appendChild(style);
};

const collectReadableNodes = (scope: ParentNode) => {
  const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node = walker.nextNode();
  while (node) {
    const textNode = node as Text;
    const parent = textNode.parentElement;
    const text = textNode.nodeValue || "";
    const parentTag = parent?.tagName?.toLowerCase() || "";

    if (
      parent &&
      !["script", "style", "noscript", "code", "pre"].includes(parentTag) &&
      /[\p{L}\p{N}]/u.test(text)
    ) {
      nodes.push(textNode);
    }

    node = walker.nextNode();
  }

  return nodes;
};

const wrapWordsForSync = (doc: Document, scopes: ParentNode[]): WordSyncMap => {
  cleanupWordWrappers(doc);
  clearWordHighlight(doc);
  injectWordHighlightStyle(doc);

  const words: string[] = [];
  const spans: HTMLSpanElement[] = [];

  scopes.forEach((scope) => {
    const nodes = collectReadableNodes(scope);
    nodes.forEach((textNode) => {
      const value = textNode.nodeValue || "";
      const parts = value.split(/(\s+)/);
      const fragment = doc.createDocumentFragment();

      parts.forEach((part) => {
        if (!part) return;
        if (/\s+/.test(part)) {
          fragment.appendChild(doc.createTextNode(part));
          return;
        }

        const span = doc.createElement("span");
        span.setAttribute(SPEAK_WORD_ATTR, "1");
        span.textContent = part;
        fragment.appendChild(span);
        words.push(part);
        spans.push(span);
      });

      textNode.parentNode?.replaceChild(fragment, textNode);
    });
  });

  const charStarts: number[] = [];
  let offset = 0;
  words.forEach((word, index) => {
    charStarts[index] = offset;
    offset += word.length + 1;
  });

  return { words, spans, charStarts };
};

const isHeading = (el: Element) => /^H[1-6]$/.test(el.tagName);

const collectChapterScopes = (doc: Document, headingId: string | null): ParentNode[] => {
  if (!headingId) return [doc.body];
  const heading = doc.getElementById(headingId);
  if (!heading) return [doc.body];

  const scopes: ParentNode[] = [heading];
  const level = Number(heading.tagName.replace("H", "")) || 6;
  let cursor: Element | null = heading.nextElementSibling;

  while (cursor) {
    if (isHeading(cursor)) {
      const nextLevel = Number(cursor.tagName.replace("H", "")) || 6;
      if (nextLevel <= level) break;
    }
    scopes.push(cursor);
    cursor = cursor.nextElementSibling;
  }

  return scopes;
};

const extractNarrationText = (scopes: ParentNode[]) => {
  const chunks: string[] = [];
  scopes.forEach((scope) => {
    const text = cleanText((scope as Element).textContent || "");
    if (text) chunks.push(text);
  });
  return cleanText(chunks.join(" "));
};

const readSarvamAudioBase64 = (payload: Record<string, unknown>): string | null => {
  const direct = payload.audio || payload.audio_base64 || payload.base64 || payload.wav;
  if (typeof direct === "string" && direct.length > 40) return direct;

  const nested = payload.data as Record<string, unknown> | undefined;
  if (nested) {
    const nestedAudio = nested.audio || nested.audio_base64 || nested.base64 || nested.wav;
    if (typeof nestedAudio === "string" && nestedAudio.length > 40) return nestedAudio;
  }

  const arr = payload.audios as Array<Record<string, unknown>> | undefined;
  if (arr?.length) {
    const first = arr[0];
    const candidate = first.audio || first.audio_base64 || first.base64 || first.wav;
    if (typeof candidate === "string" && candidate.length > 40) return candidate;
  }

  return null;
};

const buildFallbackToc = (doc: Document) => {
  const headingElements = Array.from(
    doc.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6, .section-title, .section-heading"),
  );
  const usedIds = new Set<string>();

  const items = headingElements
    .map((element) => {
      const text = cleanText(element.textContent || "");
      if (!text) return null;

      let id = element.id || slugifyHeading(text);
      if (!id) return null;

      let suffix = 2;
      const baseId = id;
      while (usedIds.has(id)) {
        id = `${baseId}-${suffix}`;
        suffix += 1;
      }

      element.id = id;
      usedIds.add(id);

      return {
        id,
        text,
        depth: Number(element.tagName.slice(1)),
      } satisfies LongformTocItem;
    })
    .filter((entry): entry is LongformTocItem => Boolean(entry));

  return { items, elements: headingElements.filter((element) => element.id) };
};

const stripInlineTags = (value: string) =>
  value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

const buildTocFromHtmlString = (html: string): LongformTocItem[] => {
  const usedIds = new Set<string>();
  const items: LongformTocItem[] = [];
  const headingRegex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;

  for (const match of html.matchAll(headingRegex)) {
    const depth = Number(match[1]) || 2;
    const text = stripInlineTags(match[2] || "");
    if (!text) continue;

    let id = slugifyHeading(text);
    if (!id) continue;
    let suffix = 2;
    const baseId = id;
    while (usedIds.has(id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }
    usedIds.add(id);
    items.push({ id, text, depth });
  }

  return items;
};

const applyStaticTocIdsToDocument = (doc: Document, toc: LongformTocItem[]) => {
  if (!toc.length) return;
  const headingElements = Array.from(
    doc.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6, .section-title, .section-heading"),
  );
  headingElements.forEach((element, index) => {
    const tocItem = toc[index];
    if (!tocItem) return;
    if (!element.id) element.id = tocItem.id;
  });
};

async function requestSarvamTts(text: string) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(SARVAM_TTS_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SARVAM_API_KEY}`,
        "x-api-key": SARVAM_API_KEY || "",
      },
      body: JSON.stringify({
        text,
        language: "en-IN",
        voice: "anushka",
        format: "mp3",
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Sarvam TTS failed (${response.status}) ${body.slice(0, 140)}`);
    }

    const payload = (await response.json()) as Record<string, unknown>;
    const base64 = readSarvamAudioBase64(payload);
    if (!base64) throw new Error("Sarvam TTS response did not contain playable audio.");

    const src = base64.startsWith("data:") ? base64 : `data:audio/mpeg;base64,${base64}`;
    return src;
  } finally {
    window.clearTimeout(timeout);
  }
}

type AmbientRefs = {
  ctx: AudioContext | null;
  master: GainNode | null;
  oscillators: OscillatorNode[];
};

const stopAmbientRefs = (refs: AmbientRefs) => {
  refs.oscillators.forEach((osc) => {
    try {
      osc.stop();
      osc.disconnect();
    } catch {
      // ignore
    }
  });
  refs.oscillators = [];
  if (refs.master) {
    try {
      refs.master.disconnect();
    } catch {
      // ignore
    }
    refs.master = null;
  }
  if (refs.ctx) {
    refs.ctx.close().catch(() => undefined);
    refs.ctx = null;
  }
};

const startAmbientForScripture = async (religion: ScriptureRecord["religion"], refs: AmbientRefs) => {
  stopAmbientRefs(refs);

  const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return false;

  const ctx = new Ctx();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const addOsc = (freq: number, type: OscillatorType, gain: number) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    osc.connect(g);
    g.connect(master);
    osc.start();
    refs.oscillators.push(osc);
  };

  if (religion === "Hinduism") {
    addOsc(136.1, "sine", 0.55);
    addOsc(272.2, "triangle", 0.18);
  } else if (religion === "Islam") {
    addOsc(174.6, "sine", 0.5);
    addOsc(349.2, "triangle", 0.14);
  } else if (religion === "Christianity") {
    addOsc(196.0, "sine", 0.45);
    addOsc(246.9, "triangle", 0.14);
    addOsc(293.7, "sine", 0.1);
  } else if (religion === "Buddhism") {
    addOsc(110.0, "sine", 0.38);
    addOsc(220.0, "triangle", 0.12);
    addOsc(261.6, "sine", 0.08);
  } else {
    addOsc(220.0, "sine", 0.35);
  }

  master.gain.linearRampToValueAtTime(AMBIENT_GAIN, ctx.currentTime + 1.2);
  refs.ctx = ctx;
  refs.master = master;
  return true;
};

export default function ScriptureDetail({ scripture }: ScriptureDetailProps) {
  const location = useLocation();
  const { theme } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wordSyncRef = useRef<WordSyncMap | null>(null);
  const currentSpokenIndexRef = useRef<number>(-1);

  const [toc, setToc] = useState<LongformTocItem[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const [selectedHeadingId, setSelectedHeadingId] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const [audioMode, setAudioMode] = useState<"chapter" | "full">("chapter");
  const [narrationMode, setNarrationMode] = useState<"explained" | "original">("explained");
  const [wordSyncEnabled, setWordSyncEnabled] = useState(true);
  const [speechRate, setSpeechRate] = useState(1);

  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [provider, setProvider] = useState<"browser" | "sarvam" | "idle">("idle");
  const [audioError, setAudioError] = useState<string | null>(null);

  const [spokenWordIndex, setSpokenWordIndex] = useState(0);
  const [spokenTotalWords, setSpokenTotalWords] = useState(0);
  const staticToc = useMemo(() => buildTocFromHtmlString(scripture.rawHtml), [scripture.rawHtml]);
  const ambientRefs = useRef<AmbientRefs>({ ctx: null, master: null, oscillators: [] });
  const [ambientEnabled, setAmbientEnabled] = useState(true);
  const [ambientRunning, setAmbientRunning] = useState(false);

  useEffect(() => {
    setToc(staticToc);
    setActiveHeadingId(staticToc[0]?.id || null);
    setSelectedHeadingId(staticToc[0]?.id || null);
  }, [scripture.slug, staticToc]);

  const canonical = `${SITE_URL}${location.pathname}`;
  const engagement = useLongformEngagement({
    canonical,
    title: scripture.title,
    description: scripture.description,
  });

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
      window.speechSynthesis.cancel();
      stopAmbientRefs(ambientRefs.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (doc) applyEmbeddedThemeBridge(doc, theme);
  }, [theme]);

  useEffect(() => {
    if (!ambientEnabled) {
      stopAmbientRefs(ambientRefs.current);
      setAmbientRunning(false);
      return;
    }

    void startAmbientForScripture(scripture.religion, ambientRefs.current).then((started) => setAmbientRunning(started));
    return () => {
      stopAmbientRefs(ambientRefs.current);
      setAmbientRunning(false);
    };
  }, [ambientEnabled, scripture.religion, scripture.slug]);

  const iframeSrc = `${scripture.assetUrl}${location.hash || ""}`;

  const onLoad = () => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    const win = iframe?.contentWindow;
    if (!iframe || !doc || !win) return;

    cleanupRef.current?.();
    applyEmbeddedThemeBridge(doc, theme);

    let liveElements: HTMLElement[] = [];
    let observer: MutationObserver | null = null;
    let observerStopTimer: number | null = null;
    let retryCount = 0;
    const maxRetries = 8;

    const refreshToc = () => {
      applyStaticTocIdsToDocument(doc, staticToc);
      const primary = buildTocFromRoot(doc);
      const fallback = primary.items.length ? primary : buildFallbackToc(doc);
      liveElements = fallback.elements;

      const finalItems = fallback.items.length ? fallback.items : staticToc;
      setToc(finalItems);
      const firstId = finalItems[0]?.id || null;
      setActiveHeadingId(firstId);
      setSelectedHeadingId((current) => current || firstId);

      if (!finalItems.length && retryCount < maxRetries) {
        retryCount += 1;
        window.setTimeout(refreshToc, 250);
      }
    };

    refreshToc();
    if (doc.body) {
      observer = new MutationObserver(() => {
        refreshToc();
      });
      observer.observe(doc.body, { childList: true, subtree: true, attributes: false });
      observerStopTimer = window.setTimeout(() => observer?.disconnect(), 15000);
    }

    const update = () => {
      const root = doc.documentElement;
      const scrollTop = Math.max(
        win.scrollY || 0,
        win.pageYOffset || 0,
        doc.documentElement.scrollTop || 0,
        doc.body.scrollTop || 0,
      );
      const scrollHeight = Math.max(root.scrollHeight || 0, doc.body.scrollHeight || 0);
      const viewportHeight = win.innerHeight || root.clientHeight || 1;
      setScrollProgress(computeScrollProgress(scrollTop, scrollHeight, viewportHeight));
      const nextActive = getActiveHeadingId(liveElements);
      setActiveHeadingId(nextActive);
      setSelectedHeadingId((current) => current || nextActive);
    };

    update();
    win.addEventListener("scroll", update, { passive: true });
    doc.addEventListener("scroll", update, { passive: true });
    win.addEventListener("resize", update);

    cleanupRef.current = () => {
      win.removeEventListener("scroll", update);
      doc.removeEventListener("scroll", update);
      win.removeEventListener("resize", update);
      if (observerStopTimer) window.clearTimeout(observerStopTimer);
      observer?.disconnect();
    };
  };

  const completionPercent = Math.round(scrollProgress);
  const estimatedRemaining = useMemo(() => {
    const normalized = Math.max(0, Math.min(1, scrollProgress / 100));
    const remaining = Math.max(0, scripture.readMinutes * (1 - normalized));
    return Math.max(0, Math.ceil(remaining));
  }, [scripture.readMinutes, scrollProgress]);

  const scrollToHeading = (id: string) => {
    const doc = iframeRef.current?.contentDocument;
    let target = doc?.getElementById(id) || null;
    if (!target && doc) {
      const match = Array.from(doc.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6, .section-title, .section-heading")).find(
        (el) => slugifyHeading(cleanText(el.textContent || "")) === id,
      );
      if (match) {
        if (!match.id) match.id = id;
        target = match;
      }
    }
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
    setSelectedHeadingId(id);
  };

  const stopAudio = () => {
    window.speechSynthesis.cancel();
    utteranceRef.current = null;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = "";
    }

    const doc = iframeRef.current?.contentDocument;
    if (doc) clearWordHighlight(doc);

    setIsPlaying(false);
    setProvider("idle");
    setIsLoadingAudio(false);
    setSpokenWordIndex(0);
    currentSpokenIndexRef.current = -1;
  };

  const highlightWordByIndex = (index: number) => {
    const map = wordSyncRef.current;
    if (!map || !map.spans.length) return;

    const safeIndex = Math.max(0, Math.min(index, map.spans.length - 1));
    const prev = currentSpokenIndexRef.current;
    if (prev >= 0 && map.spans[prev]) map.spans[prev].classList.remove(SPEAK_WORD_CLASS);

    const nextSpan = map.spans[safeIndex];
    nextSpan.classList.add(SPEAK_WORD_CLASS);
    if (safeIndex % 12 === 0) {
      nextSpan.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }

    currentSpokenIndexRef.current = safeIndex;
    setSpokenWordIndex(safeIndex + 1);
  };

  const buildNarrationPayload = () => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return null;

    const scopes = audioMode === "full" ? [doc.body] : collectChapterScopes(doc, selectedHeadingId || activeHeadingId);
    const map = wrapWordsForSync(doc, scopes);
    wordSyncRef.current = map;

    const baseText = cleanText(map.words.join(" ")) || extractNarrationText(scopes);
    if (!baseText) return null;

    const narrationText = narrationMode === "explained" ? toExplainableNarration(baseText) : baseText;

    return {
      narrationText,
      words: map.words,
      charStarts: map.charStarts,
    };
  };

  const playWithBrowser = (text: string, charStarts: number[]) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setProvider("browser");
      setIsPlaying(true);
      setIsLoadingAudio(false);
    };

    utterance.onboundary = (event) => {
      if (event.name !== "word" && event.charIndex == null) return;
      const index = findWordIndexByChar(event.charIndex, charStarts);
      highlightWordByIndex(index);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setProvider("idle");
      setSpokenWordIndex(spokenTotalWords);
    };

    utterance.onerror = () => {
      setAudioError("Browser speech playback failed. Please retry.");
      setIsPlaying(false);
      setProvider("idle");
      setIsLoadingAudio(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const startAudio = async () => {
    setAudioError(null);
    setIsLoadingAudio(true);

    const payload = buildNarrationPayload();
    if (!payload) {
      setIsLoadingAudio(false);
      setAudioError("No readable text found for narration.");
      return;
    }

    setSpokenTotalWords(payload.words.length);
    setSpokenWordIndex(0);
    currentSpokenIndexRef.current = -1;

    const useBrowserForSync = wordSyncEnabled;
    if (!useBrowserForSync && SARVAM_API_KEY) {
      try {
        const audioSrc = await requestSarvamTts(payload.narrationText);
        if (!audioRef.current) audioRef.current = new Audio();

        audioRef.current.src = audioSrc;
        audioRef.current.playbackRate = speechRate;
        audioRef.current.onplay = () => {
          setProvider("sarvam");
          setIsPlaying(true);
          setIsLoadingAudio(false);
        };
        audioRef.current.onended = () => {
          setIsPlaying(false);
          setProvider("idle");
        };
        audioRef.current.onerror = () => {
          setAudioError("Sarvam audio could not play. Falling back to browser speech.");
          playWithBrowser(payload.narrationText, payload.charStarts);
        };

        await audioRef.current.play();
        return;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Sarvam TTS failed.";
        setAudioError(`${message} Using browser speech fallback.`);
      }
    }

    playWithBrowser(payload.narrationText, payload.charStarts);
  };

  const togglePlayPause = async () => {
    if (isPlaying) {
      if (provider === "browser") {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
          setIsPlaying(true);
        } else {
          window.speechSynthesis.pause();
          setIsPlaying(false);
        }
      } else if (provider === "sarvam" && audioRef.current) {
        if (audioRef.current.paused) {
          await audioRef.current.play();
          setIsPlaying(true);
        } else {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      }
      return;
    }

    await startAudio();
  };

  return (
    <div className="relative grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-8">
      <section className="space-y-4 min-w-0">
        <div className="rounded-[1.75rem] border border-border/60 bg-card/80 p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            <BookOpenText className="h-4 w-4" />
            {scripture.religion} Scripture
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground md:text-4xl">{scripture.title}</h1>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground md:text-base">{scripture.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" />{scripture.publishedAt}</span>
            <span className="inline-flex items-center gap-2"><Timer className="h-4 w-4" />{scripture.readMinutes} min read</span>
          </div>
        </div>

        <LongformEngagementBar title={scripture.title} controller={engagement} placement="top" showPageUrl={false} />

        <div className="overflow-hidden rounded-[1.75rem] border border-border/60 bg-background/80 shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            title={`${scripture.title} reader`}
            className="h-[78vh] w-full bg-white"
            onLoad={onLoad}
          />
        </div>
      </section>

      <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
        <div className="rounded-[1.75rem] border border-border/60 bg-card/85 p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Reading Progress</p>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completionPercent}%` }} />
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <p className="inline-flex items-center gap-2 text-foreground"><CheckCircle2 className="h-4 w-4 text-emerald-500" />Completion: {completionPercent}%</p>
            <p className="inline-flex items-center gap-2 text-muted-foreground"><Timer className="h-4 w-4" />Remaining: {estimatedRemaining} min</p>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-border/60 bg-card/85 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-primary" />
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Audio Narrator</p>
          </div>

          <label className="flex items-center justify-between rounded-lg border border-border/70 bg-background/70 px-3 py-2 text-xs font-medium text-foreground">
            Ambient {scripture.religion} sound
            <input
              type="checkbox"
              checked={ambientEnabled}
              onChange={(e) => setAmbientEnabled(e.target.checked)}
              className="h-4 w-4"
            />
          </label>
          <p className="text-xs text-muted-foreground">
            Ambient status: {ambientRunning ? "playing" : "stopped"} (browser may require first user click)
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setAudioMode("chapter")}
              className={`rounded-lg border px-3 py-2 font-semibold ${audioMode === "chapter" ? "border-primary/40 bg-primary/10 text-primary" : "border-border/70 bg-background/70 text-foreground"}`}
            >
              This Chapter
            </button>
            <button
              type="button"
              onClick={() => setAudioMode("full")}
              className={`rounded-lg border px-3 py-2 font-semibold ${audioMode === "full" ? "border-primary/40 bg-primary/10 text-primary" : "border-border/70 bg-background/70 text-foreground"}`}
            >
              Full Scripture
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setNarrationMode("explained")}
              className={`rounded-lg border px-3 py-2 font-semibold inline-flex items-center justify-center gap-1 ${narrationMode === "explained" ? "border-primary/40 bg-primary/10 text-primary" : "border-border/70 bg-background/70 text-foreground"}`}
            >
              <WandSparkles className="h-3.5 w-3.5" />
              Explained
            </button>
            <button
              type="button"
              onClick={() => setNarrationMode("original")}
              className={`rounded-lg border px-3 py-2 font-semibold ${narrationMode === "original" ? "border-primary/40 bg-primary/10 text-primary" : "border-border/70 bg-background/70 text-foreground"}`}
            >
              Original
            </button>
          </div>

          <label className="flex items-center justify-between rounded-lg border border-border/70 bg-background/70 px-3 py-2 text-xs font-medium text-foreground">
            Word-level sync
            <input
              type="checkbox"
              checked={wordSyncEnabled}
              onChange={(e) => setWordSyncEnabled(e.target.checked)}
              className="h-4 w-4"
            />
          </label>

          <label className="block text-xs text-muted-foreground">
            Speech speed: {speechRate.toFixed(2)}x
            <input
              type="range"
              min="0.8"
              max="1.2"
              step="0.05"
              value={speechRate}
              onChange={(e) => setSpeechRate(Number(e.target.value))}
              className="mt-2 w-full"
            />
          </label>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => void togglePlayPause()}
              className="inline-flex items-center justify-center rounded-lg border border-primary/30 bg-primary/10 p-2 text-primary hover:bg-primary/15"
              disabled={isLoadingAudio}
            >
              {isLoadingAudio ? <Loader2 className="h-4 w-4 animate-spin" /> : isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={stopAudio}
              className="inline-flex items-center justify-center rounded-lg border border-border/70 bg-background/70 p-2 text-foreground hover:bg-muted"
            >
              <Square className="h-4 w-4" />
            </button>
            <div className="inline-flex items-center justify-center rounded-lg border border-border/70 bg-background/70 p-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {provider}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {wordSyncEnabled
              ? "Word sync uses browser speech for precise highlighting."
              : SARVAM_API_KEY
              ? "Sarvam AI will be used first, then browser fallback if needed."
              : "Sarvam API key not detected. Browser speech fallback is active."}
          </p>

          <p className="text-xs text-muted-foreground">
            Audio progress: {spokenWordIndex}/{spokenTotalWords || 0} words
          </p>

          {audioError ? <p className="text-xs text-rose-600 dark:text-rose-400">{audioError}</p> : null}
        </div>

        <div className="rounded-[1.75rem] border border-border/60 bg-card/85 p-5">
          <div className="flex items-center gap-2">
            <ListTree className="h-4 w-4 text-primary" />
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">On This Scripture</p>
          </div>
          <div className="mt-4 space-y-2 max-h-[340px] overflow-auto pr-1">
            {toc.length ? (
              toc.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToHeading(item.id)}
                  className={`w-full rounded-xl border border-border/60 px-3 py-2 text-left text-sm transition hover:border-primary/30 hover:bg-primary/5 ${
                    item.id === activeHeadingId ? "bg-primary/10 text-primary" : "bg-background/70 text-foreground"
                  } ${item.depth > 2 ? "ml-3 w-[calc(100%-0.75rem)]" : ""}`}
                >
                  <span className="mr-2 text-xs font-semibold">{String(index + 1).padStart(2, "0")}</span>
                  {item.text}
                </button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Headings will appear once content loads.</p>
            )}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-border/60 bg-card/85 p-5 space-y-3">
          <Link to="/scriptures" className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/75 px-3 py-2 text-sm font-medium hover:border-primary/30 hover:bg-primary/5">
            <ArrowLeft className="h-4 w-4" /> Back to Scriptures
          </Link>
          <Link to="/" className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/75 px-3 py-2 text-sm font-medium hover:border-primary/30 hover:bg-primary/5">
            <Home className="h-4 w-4" /> Home
          </Link>
        </div>
      </aside>
    </div>
  );
}
