import { type ComponentType, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Copy, MessageCircle, Share2, ThumbsDown, ThumbsUp } from "lucide-react";
import { SiLinkedin, SiX } from "react-icons/si";
import { AbhishekAnimatedLogo } from "@/components/ui/AbhishekAnimatedLogo";
import { Button } from "@/components/ui/button";
import { FALLBACK_SOCIAL_LINKS } from "@/constants/socialLinks";
import { iconForKey } from "@/lib/social/iconMap";
import { cn } from "@/lib/utils";

type UseLongformEngagementOptions = {
  canonical: string;
  title: string;
  description?: string;
  commentsTargetId?: string;
  storageKey?: string;
};

type LongformEngagementController = {
  shareUrl: string;
  displayUrl: string;
  liked: boolean;
  disliked: boolean;
  copied: boolean;
  canNativeShare: boolean;
  likeLabel: string;
  dislikeLabel: string;
  onLike: () => void;
  onDislike: () => void;
  onComments: () => void;
  onCopyLink: () => Promise<void>;
  onShare: () => Promise<void>;
  onShareToX: () => void;
  onShareToLinkedIn: () => void;
};

type LongformEngagementBarProps = {
  title: string;
  controller: LongformEngagementController;
  placement?: "top" | "bottom";
  variant?: "full" | "share-footer";
  className?: string;
};

type EmojiParticle = {
  id: number;
  emoji: string;
  left: number;
  rotate: number;
  distance: number;
  duration: number;
  size: number;
};

const getShareUrl = (canonical: string) => {
  if (typeof window === "undefined") return canonical;
  return `${window.location.origin}${window.location.pathname}`;
};

const getDisplayUrl = (value: string) => {
  try {
    const url = new URL(value);
    return `${url.host}${url.pathname}`.replace(/\/$/, "") || url.host;
  } catch {
    return value.replace(/^https?:\/\//, "");
  }
};

const openSharePopup = (url: string) => {
  if (typeof window === "undefined") return;
  window.open(url, "_blank", "noopener,noreferrer,width=760,height=720");
};

export function useLongformEngagement({
  canonical,
  title,
  description,
  commentsTargetId,
  storageKey,
}: UseLongformEngagementOptions): LongformEngagementController {
  const shareUrl = useMemo(() => getShareUrl(canonical), [canonical]);
  const displayUrl = useMemo(() => getDisplayUrl(shareUrl), [shareUrl]);
  const stateKey = storageKey || `ap-longform-engagement:${canonical}`;
  const shareText = useMemo(
    () => `${title}${description ? `\n\n${description}` : ""}\n\n${shareUrl}`,
    [description, shareUrl, title],
  );

  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(stateKey);
      if (!raw) {
        setLiked(false);
        setDisliked(false);
        return;
      }
      const parsed = JSON.parse(raw) as { liked?: boolean; disliked?: boolean };
      setLiked(Boolean(parsed.liked));
      setDisliked(Boolean(parsed.disliked));
    } catch {
      setLiked(false);
      setDisliked(false);
    }
  }, [stateKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(stateKey, JSON.stringify({ liked, disliked }));
    } catch {
      // Ignore storage failures.
    }
  }, [disliked, liked, stateKey]);

  const onLike = useCallback(() => {
    setLiked((current) => {
      const next = !current;
      if (next) setDisliked(false);
      return next;
    });
  }, []);

  const onDislike = useCallback(() => {
    setDisliked((current) => {
      const next = !current;
      if (next) setLiked(false);
      return next;
    });
  }, []);

  const onComments = useCallback(() => {
    if (!commentsTargetId || typeof document === "undefined") return;
    document.getElementById(commentsTargetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [commentsTargetId]);

  const onCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }, [shareUrl]);

  const onShare = useCallback(async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title,
          text: description || title,
          url: shareUrl,
        });
        return;
      } catch {
        // Fall through to copy if native share was dismissed or failed.
      }
    }
    await onCopyLink();
  }, [description, onCopyLink, shareUrl, title]);

  const onShareToX = useCallback(() => {
    openSharePopup(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
    );
  }, [shareUrl, title]);

  const onShareToLinkedIn = useCallback(() => {
    openSharePopup(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`,
    );
  }, [shareText, shareUrl]);

  return {
    shareUrl,
    displayUrl,
    liked,
    disliked,
    copied,
    canNativeShare: typeof navigator !== "undefined" && "share" in navigator,
    likeLabel: liked ? "Liked" : "Like",
    dislikeLabel: disliked ? "Noted" : "Dislike",
    onLike,
    onDislike,
    onComments,
    onCopyLink,
    onShare,
    onShareToX,
    onShareToLinkedIn,
  };
}

const burstFor = (emojis: string[]): EmojiParticle[] =>
  emojis.map((emoji, index) => ({
    id: Number(`${Date.now()}${index}${Math.floor(Math.random() * 9)}`),
    emoji,
    left: 14 + Math.random() * 72,
    rotate: -22 + Math.random() * 44,
    distance: 32 + Math.random() * 42,
    duration: 0.75 + Math.random() * 0.4,
    size: 16 + Math.random() * 10,
  }));

export function LongformEngagementBar({
  title,
  controller,
  placement = "top",
  variant = "full",
  className,
}: LongformEngagementBarProps) {
  const [particles, setParticles] = useState<EmojiParticle[]>([]);
  const [emojiReactions, setEmojiReactions] = useState<Record<string, boolean>>({});
  const cleanupTimersRef = useRef<number[]>([]);

  const socialProfiles = useMemo(
    () =>
      FALLBACK_SOCIAL_LINKS.filter((item) => item.category === "social" || item.category === "blog")
        .slice(0, 7)
        .map((item) => ({
          ...item,
          Icon: iconForKey(item.icon_key),
        })),
    [],
  );

  const emojiButtons = useMemo(
    () => [
      { key: "love", label: "Loved", emoji: "❤️" },
      { key: "fire", label: "Useful", emoji: "🔥" },
      { key: "rocket", label: "Boost", emoji: "🚀" },
      { key: "mind", label: "Insight", emoji: "🤯" },
      { key: "clap", label: "Clap", emoji: "👏" },
    ],
    [],
  );

  useEffect(() => {
    return () => {
      cleanupTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      cleanupTimersRef.current = [];
    };
  }, []);

  const spawnParticles = useCallback((emojis: string[]) => {
    const nextParticles = burstFor(emojis);
    setParticles((current) => [...current, ...nextParticles]);
    nextParticles.forEach((particle) => {
      const timer = window.setTimeout(() => {
        setParticles((current) => current.filter((item) => item.id !== particle.id));
      }, particle.duration * 1000 + 260);
      cleanupTimersRef.current.push(timer);
    });
  }, []);

  const shareCaption =
    placement === "top"
      ? "Share this page before you dive in."
      : "If this helped, share it or leave a reaction.";

  const compactFooter = variant === "share-footer";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-gradient-to-br from-card via-background to-primary/10 p-4 shadow-sm",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.10),transparent_30%)]" />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex items-center gap-3">
            <AbhishekAnimatedLogo size="md" animate={false} />
            <div className="min-w-0">
              <p className="text-sm font-black tracking-tight text-foreground">
                {compactFooter ? "Share" : "Abhishek Panda"}
              </p>
              {!compactFooter ? <p className="text-xs text-muted-foreground">{shareCaption}</p> : null}
            </div>
          </div>

          {compactFooter ? (
            <div className="flex flex-wrap gap-2">
              {socialProfiles.map((profile) => {
                const Icon = profile.Icon as ComponentType<{ className?: string }>;
                return (
                  <a
                    key={profile.platform}
                    href={profile.profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={profile.display_name}
                    title={profile.display_name}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/80 text-foreground transition hover:border-primary/40 hover:bg-primary/5"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border border-border/60 bg-background/80 px-3 py-2">
              <p className="line-clamp-1 text-sm font-semibold text-foreground">{title}</p>
              <p className="line-clamp-1 text-xs text-muted-foreground">{controller.displayUrl}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 lg:items-end">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                void controller.onShare();
                spawnParticles(controller.canNativeShare ? ["🚀", "🔗", "✨"] : ["🔗", "📋", "✨"]);
              }}
              className="rounded-full border-border/70 bg-background/80"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                void controller.onCopyLink();
                spawnParticles(["📋", "🔗", "✨"]);
              }}
              className="rounded-full border-border/70 bg-background/80"
            >
              <Copy className="h-4 w-4" />
              {controller.copied ? "Copied" : "Copy Link"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                controller.onShareToX();
                spawnParticles(["🐦", "⚡", "✨"]);
              }}
              className="rounded-full border-border/70 bg-background/80"
            >
              <SiX className="h-3.5 w-3.5" />
              X
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                controller.onShareToLinkedIn();
                spawnParticles(["💼", "🔗", "✨"]);
              }}
              className="rounded-full border-border/70 bg-background/80"
            >
              <SiLinkedin className="h-3.5 w-3.5" />
              LinkedIn
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                controller.onLike();
                spawnParticles(controller.liked ? ["👍", "💙", "🔥"] : ["👏", "✨", "🚀"]);
              }}
              className={cn(
                "rounded-full border-border/70 bg-background/80 transition-all",
                controller.liked && "border-emerald-400/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
              )}
            >
              <ThumbsUp className="h-4 w-4" />
              <span aria-hidden="true">👍</span>
              {controller.likeLabel}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                controller.onComments();
                spawnParticles(["💬", "📝", "👀"]);
              }}
              className="rounded-full border-border/70 bg-background/80"
            >
              <MessageCircle className="h-4 w-4" />
              <span aria-hidden="true">💬</span>
              Comments
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                controller.onDislike();
                spawnParticles(controller.disliked ? ["👎", "🫡", "📌"] : ["🤔", "👎", "📌"]);
              }}
              className={cn(
                "rounded-full border-border/70 bg-background/80 transition-all",
                controller.disliked && "border-amber-400/50 bg-amber-500/10 text-amber-600 dark:text-amber-300",
              )}
            >
              <ThumbsDown className="h-4 w-4" />
              <span aria-hidden="true">👎</span>
              {controller.dislikeLabel}
            </Button>
          </div>

          {compactFooter ? (
            <div className="flex flex-wrap gap-2">
              {emojiButtons.map((item) => (
                <Button
                  key={item.key}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEmojiReactions((current) => ({
                      ...current,
                      [item.key]: !current[item.key],
                    }));
                    spawnParticles([item.emoji, "✨", item.emoji]);
                  }}
                  className={cn(
                    "rounded-full border-border/70 bg-background/80 px-3",
                    emojiReactions[item.key] && "border-primary/40 bg-primary/10 text-primary",
                  )}
                >
                  <span aria-hidden="true">{item.emoji}</span>
                  {item.label}
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {particles.length ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {particles.map((particle) => (
            <span
              key={particle.id}
              className="absolute bottom-6 opacity-0"
              style={{
                left: `${particle.left}%`,
                fontSize: `${particle.size}px`,
                animation: `ap-engagement-float ${particle.duration}s ease-out forwards`,
                transform: `translateX(-50%) rotate(${particle.rotate}deg)`,
                ["--ap-distance" as string]: `${particle.distance}px`,
              }}
            >
              {particle.emoji}
            </span>
          ))}
        </div>
      ) : null}

      <style>{`
        @keyframes ap-engagement-float {
          0% {
            opacity: 0;
            transform: translate3d(-50%, 0, 0) scale(0.8) rotate(0deg);
          }
          18% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate3d(-50%, calc(-1 * var(--ap-distance)), 0) scale(1.16) rotate(10deg);
          }
        }
      `}</style>
    </div>
  );
}
