(() => {
  const DESKTOP_BREAKPOINT = 1100;
  const STORAGE_PREFIX = "mastery-right-width:";
  const HANDLE_CLASS = "mastery-resize-handle";
  const ACTIVE_BODY_CLASS = "mastery-is-resizing";
  const SEARCH_UI_ID = "mastery-global-search";
  const SEARCH_HIT_CLASS = "mastery-search-hit";
  const SEARCH_HIT_ACTIVE_CLASS = "is-active";
  const THEME_KEY = "abhishekpanda-theme";
  const LEGACY_THEME_KEY = "theme";

  let highlightNodes = [];
  let activeHighlightIndex = -1;

  function injectStyles() {
    if (document.getElementById("mastery-resize-styles")) return;

    const style = document.createElement("style");
    style.id = "mastery-resize-styles";
    style.textContent = `
      :root {
        color-scheme: dark;
      }

      html[data-theme="dark"] {
        color-scheme: dark;
      }

      html[data-theme="light"] {
        color-scheme: light;
      }

      body {
        background: var(--bg, var(--bg-primary, #0b1120));
        color: var(--text-primary, #e5edf8);
      }

      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }

      img,
      picture,
      svg,
      video,
      canvas,
      iframe {
        max-width: 100%;
      }

      img,
      video,
      canvas {
        height: auto;
      }

      svg {
        display: block;
        height: auto;
      }

      pre,
      code,
      td,
      th,
      p,
      li {
        overflow-wrap: anywhere;
        word-break: break-word;
      }

      pre {
        max-width: 100%;
        overflow: auto;
        white-space: pre-wrap;
      }

      table {
        display: block;
        width: 100%;
        max-width: 100%;
        overflow-x: auto;
      }

      .layout,
      .lay,
      .left-panel,
      .middle-panel,
      .right-panel,
      #leftPanel,
      #middlePanel,
      #rightPanel,
      .rb,
      .detail-content,
      .diagram,
      .diagram-box,
      .arch,
      .code-block,
      .code-body,
      .callout,
      .qa-item {
        min-width: 0;
        max-width: 100%;
      }

      .${HANDLE_CLASS} {
        width: 12px;
        flex: 0 0 12px;
        position: relative;
        cursor: col-resize;
        background: transparent;
        touch-action: none;
        user-select: none;
        display: none;
      }

      .${HANDLE_CLASS}::before {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        left: 50%;
        width: 2px;
        transform: translateX(-50%);
        background: rgba(148, 163, 184, 0.2);
        transition: background 0.2s ease, box-shadow 0.2s ease;
      }

      .${HANDLE_CLASS}:hover::before,
      .${HANDLE_CLASS}.is-active::before {
        background: rgba(56, 189, 248, 0.75);
        box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.12);
      }

      body.${ACTIVE_BODY_CLASS},
      body.${ACTIVE_BODY_CLASS} * {
        cursor: col-resize !important;
        user-select: none !important;
      }

      @media (max-width: ${DESKTOP_BREAKPOINT - 1}px) {
        .${HANDLE_CLASS} {
          display: none !important;
        }
      }

      #${SEARCH_UI_ID} {
        position: relative;
        z-index: 5;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 10px;
        padding: 0;
        border-radius: 0;
        border: none;
        background: transparent;
        box-shadow: none;
        backdrop-filter: none;
      }

      #${SEARCH_UI_ID}.is-floating-fallback {
        position: fixed;
        top: 70px;
        left: 18px;
        z-index: 1600;
        width: min(320px, calc(100vw - 24px));
        padding: 12px;
        border-radius: 14px;
        border: 1px solid var(--border, rgba(148, 163, 184, 0.18));
        background: color-mix(in srgb, var(--bg-secondary, #0f172a) 94%, transparent);
        box-shadow: 0 18px 38px rgba(0,0,0,.22);
        backdrop-filter: blur(14px);
      }

      #${SEARCH_UI_ID} .mastery-search-row {
        display: flex;
        gap: 0;
        align-items: center;
      }

      #${SEARCH_UI_ID} input {
        flex: 1;
        min-width: 0;
        padding: 9px 12px;
        border-radius: 10px;
        border: 1px solid var(--border, rgba(148, 163, 184, 0.24));
        background: var(--bg-card, rgba(15, 23, 42, 0.7));
        color: var(--text-primary, #e2e8f0);
        font: 12px/1.4 'JetBrains Mono', monospace;
        outline: none;
      }

      .lp-hdr #${SEARCH_UI_ID} input,
      .left-panel #${SEARCH_UI_ID} input,
      #leftPanel #${SEARCH_UI_ID} input,
      .lp #${SEARCH_UI_ID} input {
        width: 100%;
      }

      #${SEARCH_UI_ID} input::placeholder {
        color: var(--text-muted, #94a3b8);
      }

      #${SEARCH_UI_ID} input:focus {
        border-color: rgba(250, 204, 21, 0.8);
        box-shadow: 0 0 0 3px rgba(250, 204, 21, 0.14);
      }

      #${SEARCH_UI_ID} .mastery-search-status {
        min-height: 16px;
        color: var(--text-secondary, #cbd5e1);
        font: 11px/1.4 'JetBrains Mono', monospace;
        padding: 0 2px;
      }

      #${SEARCH_UI_ID} .mastery-search-status.is-miss {
        color: #f59e0b;
      }

      .${SEARCH_HIT_CLASS} {
        background: rgba(250, 204, 21, 0.88);
        color: #111827 !important;
        border-radius: 3px;
        padding: 0 2px;
        box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.28);
      }

      .${SEARCH_HIT_CLASS}.${SEARCH_HIT_ACTIVE_CLASS} {
        background: #facc15;
        box-shadow: 0 0 0 2px rgba(250, 204, 21, 0.5);
      }

      [data-theme="light"] #${SEARCH_UI_ID}.is-floating-fallback {
        box-shadow: 0 18px 34px rgba(15, 23, 42, 0.12);
      }

      [data-theme="light"] body {
        background: var(--bg, var(--bg-primary, #f8fafc));
        color: var(--text-primary, #0f172a);
      }

      [data-theme="dark"] svg text,
      [data-theme="dark"] .diagram-body text {
        fill: #e5edf8 !important;
      }

      [data-theme="light"] svg text,
      [data-theme="light"] .diagram-body text {
        fill: #0f172a !important;
      }

      [data-theme="dark"] .diagram-box,
      [data-theme="dark"] .arch,
      [data-theme="dark"] .code-block,
      [data-theme="dark"] .callout,
      [data-theme="dark"] .qa-item,
      [data-theme="dark"] .topic-card,
      [data-theme="dark"] .tc,
      [data-theme="dark"] .mc,
      [data-theme="dark"] .sc,
      [data-theme="dark"] .az,
      [data-theme="dark"] .ac,
      [data-theme="dark"] .fbox,
      [data-theme="dark"] .tbl th,
      [data-theme="dark"] .tbl td,
      [data-theme="dark"] .prose,
      [data-theme="dark"] .bd,
      [data-theme="dark"] .tc-d,
      [data-theme="dark"] .topic-card-desc {
        color: var(--text-primary, #e5edf8);
      }

      [data-theme="dark"] .diagram-header,
      [data-theme="dark"] .code-header,
      [data-theme="dark"] .results-hdr,
      [data-theme="dark"] .exec-info {
        color: var(--text-secondary, #cbd5e1);
      }

      [data-theme="light"] .diagram-box,
      [data-theme="light"] .arch,
      [data-theme="light"] .code-block,
      [data-theme="light"] .callout,
      [data-theme="light"] .qa-item,
      [data-theme="light"] .topic-card,
      [data-theme="light"] .tc,
      [data-theme="light"] .mc,
      [data-theme="light"] .sc,
      [data-theme="light"] .az,
      [data-theme="light"] .ac,
      [data-theme="light"] .fbox,
      [data-theme="light"] .tbl th,
      [data-theme="light"] .tbl td {
        color: var(--text-primary, #0f172a);
      }

      [data-theme="light"] .code-body pre,
      [data-theme="light"] .sql-code,
      [data-theme="light"] .qa-answer-text,
      [data-theme="light"] .prose,
      [data-theme="light"] .bd,
      [data-theme="light"] .tc-d,
      [data-theme="light"] .topic-card-desc {
        color: var(--text-primary, #0f172a);
      }

      [data-theme="light"] .diagram-header,
      [data-theme="light"] .code-header,
      [data-theme="light"] .results-hdr,
      [data-theme="light"] .exec-info {
        color: var(--text-secondary, #334155);
      }

      @media (max-width: 900px) {
        #${SEARCH_UI_ID}.is-floating-fallback {
          top: auto;
          bottom: 12px;
          right: 12px;
          left: 12px;
          width: auto;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function applyTheme(theme) {
    const nextTheme = theme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    try {
      localStorage.setItem(THEME_KEY, nextTheme);
      localStorage.setItem(LEGACY_THEME_KEY, nextTheme);
    } catch (error) {
      // Ignore private-mode/localStorage errors.
    }
  }

  function initThemeSync() {
    const params = new URLSearchParams(window.location.search);
    let storedTheme = "dark";
    try {
      storedTheme = localStorage.getItem(THEME_KEY) || localStorage.getItem(LEGACY_THEME_KEY) || "dark";
    } catch (error) {
      storedTheme = "dark";
    }

    applyTheme(params.get("theme") || storedTheme || "dark");

    window.addEventListener("message", (event) => {
      if (event.data && event.data.type === "parent-theme") applyTheme(event.data.theme);
    });

    window.addEventListener("storage", (event) => {
      if (event.key === THEME_KEY || event.key === LEGACY_THEME_KEY) applyTheme(event.newValue);
    });

    try {
      const channel = new BroadcastChannel(THEME_KEY);
      channel.addEventListener("message", (event) => {
        const theme = event.data && event.data.theme;
        if (theme === "light" || theme === "dark") applyTheme(theme);
      });
    } catch (error) {
      // BroadcastChannel may be unavailable.
    }
  }

  function unwrapNode(node) {
    const parent = node.parentNode;
    if (!parent) return;
    while (node.firstChild) parent.insertBefore(node.firstChild, node);
    parent.removeChild(node);
  }

  function clearHighlights() {
    highlightNodes.forEach(unwrapNode);
    highlightNodes = [];
    activeHighlightIndex = -1;
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function getSearchTerms(rawQuery) {
    return String(rawQuery || "")
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }

  function setSearchStatus(message, miss = false) {
    const status = document.querySelector(`#${SEARCH_UI_ID} .mastery-search-status`);
    if (!status) return;
    status.textContent = message || "";
    status.classList.toggle("is-miss", Boolean(miss));
  }

  function updateActiveHighlight(nextIndex) {
    if (!highlightNodes.length) {
      activeHighlightIndex = -1;
      return;
    }

    highlightNodes.forEach((node) => node.classList.remove(SEARCH_HIT_ACTIVE_CLASS));
    activeHighlightIndex = ((nextIndex % highlightNodes.length) + highlightNodes.length) % highlightNodes.length;
    const active = highlightNodes[activeHighlightIndex];
    active.classList.add(SEARCH_HIT_ACTIVE_CLASS);
    active.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    setSearchStatus(`${activeHighlightIndex + 1} / ${highlightNodes.length} matches`);
  }

  function collectSearchRoots() {
    return [
      document.querySelector("#middle"),
      document.querySelector(".middle-panel"),
      document.querySelector("#chapterContent"),
      document.querySelector("#detailContent"),
      document.querySelector("#rightBody"),
      document.querySelector(".rb"),
      document.querySelector(".detail-content"),
      document.querySelector(".mid"),
      document.querySelector(".middle"),
      document.querySelector(".right-panel")
    ].filter(Boolean);
  }

  function searchVisibleText(query) {
    clearHighlights();
    const terms = getSearchTerms(query);
    if (!terms.length) {
      setSearchStatus("");
      return false;
    }

    const roots = collectSearchRoots();
    const seen = new Set();

    for (const root of roots) {
      if (seen.has(root)) continue;
      seen.add(root);

      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          if (
            !node.nodeValue ||
            !node.nodeValue.trim() ||
            parent.closest(`#${SEARCH_UI_ID}`) ||
            parent.closest("script, style, noscript, textarea, input, select, option, svg, mark, .mastery-search-hit")
          ) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      });

      const matches = [];
      while (walker.nextNode()) matches.push(walker.currentNode);

      for (const node of matches) {
        const text = node.nodeValue;
        const lowerText = text.toLowerCase();
        if (!terms.every((term) => lowerText.includes(term))) continue;

        const frag = document.createDocumentFragment();
        let lastIndex = 0;
        const termPattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
        let match;
        while ((match = termPattern.exec(text)) !== null) {
          if (match.index > lastIndex) {
            frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
          }
          const mark = document.createElement("mark");
          mark.className = SEARCH_HIT_CLASS;
          mark.textContent = match[0];
          frag.appendChild(mark);
          highlightNodes.push(mark);
          lastIndex = match.index + match[0].length;
        }
        if (lastIndex < text.length) frag.appendChild(document.createTextNode(text.slice(lastIndex)));
        node.parentNode.replaceChild(frag, node);
      }
    }

    if (!highlightNodes.length) {
      setSearchStatus(`Not found: "${query}"`, true);
      return false;
    }

    updateActiveHighlight(0);
    return true;
  }

  function tryNavigateToMatch(query) {
    const terms = getSearchTerms(query);
    const chaptersData = Array.isArray(window.chapters) ? window.chapters : Array.isArray(window.CHAPTERS) ? window.CHAPTERS : null;
    if (!chaptersData || !terms.length) return false;

    const matchesTerms = (value) => terms.every((term) => String(value || "").toLowerCase().includes(term));

    const chapterIndex = chaptersData.findIndex((chapter) => {
      const haystack = `${chapter.title || ""} ${chapter.desc || ""} ${(chapter.tags || []).join(" ")}`.toLowerCase();
      return matchesTerms(haystack) || (chapter.topics || []).some((topic) => matchesTerms(`${topic.title || ""} ${topic.desc || ""} ${(topic.tags || []).join(" ")}`));
    });

    if (chapterIndex < 0) return false;

    const chapter = chaptersData[chapterIndex];
    const topic = (chapter.topics || []).find((item) => matchesTerms(`${item.title || ""} ${item.desc || ""} ${(item.tags || []).join(" ")}`));

    try {
      if (typeof window.selectChapter === "function") {
        window.selectChapter(chapterIndex);
      } else if (typeof window.selChapter === "function") {
        window.selChapter(chapter.id);
      }
    } catch (error) {
      // Navigation fallback below may still succeed.
    }

    if (!topic) return true;

    requestAnimationFrame(() => {
      try {
        if (typeof window.selectTopic === "function") {
          window.selectTopic(topic.id, chapterIndex);
        } else if (typeof window.selTopic === "function") {
          const cards = Array.from(document.querySelectorAll(".tc, .topic-card"));
          const card = cards.find((element) => element.textContent.toLowerCase().includes((topic.title || "").toLowerCase()));
          if (card) {
            window.selTopic(chapter.id, topic.id, { currentTarget: card });
          }
        }
      } catch (error) {
        // Ignore if a page has a different navigation contract.
      }

      setTimeout(() => searchVisibleText(query), 60);
    });

    return true;
  }

  function performSearch(rawQuery) {
    const query = String(rawQuery || "").trim();
    if (!query) {
      clearHighlights();
      setSearchStatus("");
      return;
    }

    if (searchVisibleText(query)) return;
    if (tryNavigateToMatch(query)) return;
    setSearchStatus(`Not found: "${query}"`, true);
  }

  function initGlobalSearch() {
    if (document.getElementById(SEARCH_UI_ID)) return;

    const shell = document.createElement("div");
    shell.id = SEARCH_UI_ID;
    shell.innerHTML = `
      <div class="mastery-search-row">
        <input type="text" id="masteryGlobalSearchInput" placeholder="Search this mastery..." autocomplete="off" spellcheck="false" />
      </div>
      <div class="mastery-search-status"></div>
    `;

    const host =
      document.querySelector(".lp-hdr") ||
      document.querySelector("#leftPanel .lp-hdr") ||
      document.querySelector(".left-panel .lp-hdr") ||
      document.querySelector(".lp") ||
      document.querySelector("#leftPanel") ||
      document.querySelector(".left-panel");

    if (host) {
      host.appendChild(shell);
    } else {
      shell.classList.add("is-floating-fallback");
      document.body.appendChild(shell);
    }

    const input = shell.querySelector("#masteryGlobalSearchInput");

    input.addEventListener("input", () => performSearch(input.value));
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        performSearch(input.value);
      } else if (event.key === "Escape") {
        input.value = "";
        clearHighlights();
        setSearchStatus("");
      }
    });
  }

  function parsePixels(value) {
    const match = String(value || "").match(/-?\d+(\.\d+)?/);
    return match ? Number(match[0]) : NaN;
  }

  function findPanel(selectors) {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) return element;
    }
    return null;
  }

  function setupResizablePanel() {
    const layout = findPanel([".layout", ".lay"]);
    const rightPanel = findPanel(["#rightPanel", ".right-panel", "#rp", ".rp"]);
    const middlePanel = findPanel(["#middlePanel", ".middle-panel", "#middle", ".middle", "#mp", ".mp"]);
    const leftPanel = findPanel(["#leftPanel", ".left-panel", "#lp", ".lp"]);

    if (!layout || !rightPanel || !middlePanel) return;

    injectStyles();

    let handle = rightPanel.previousElementSibling;
    if (!(handle instanceof HTMLElement) || !handle.classList.contains(HANDLE_CLASS)) {
      handle = document.createElement("div");
      handle.className = HANDLE_CLASS;
      handle.setAttribute("role", "separator");
      handle.setAttribute("aria-orientation", "vertical");
      handle.setAttribute("aria-label", "Resize details panel");
      handle.tabIndex = 0;
      rightPanel.parentNode.insertBefore(handle, rightPanel);
    }

    const storageKey = `${STORAGE_PREFIX}${window.location.pathname}:${rightPanel.id || rightPanel.className || "panel"}`;
    let activePointerId = null;

    const getDefaultRightWidth = () => {
      const candidates = [
        getComputedStyle(rightPanel).width,
        getComputedStyle(document.documentElement).getPropertyValue("--right-w"),
        getComputedStyle(document.documentElement).getPropertyValue("--rw"),
      ];

      for (const candidate of candidates) {
        const pixels = parsePixels(candidate);
        if (Number.isFinite(pixels) && pixels > 120) return pixels;
      }

      return Math.round(window.innerWidth * 0.34);
    };

    const isPanelVisible = () => {
      const style = getComputedStyle(rightPanel);
      return !rightPanel.classList.contains("hidden") && style.display !== "none" && style.visibility !== "hidden";
    };

    const isDesktopLayout = () => {
      const layoutStyle = getComputedStyle(layout);
      return window.innerWidth >= DESKTOP_BREAKPOINT && layoutStyle.display.includes("flex") && isPanelVisible();
    };

    const getMiddleMinWidth = () => {
      if (window.innerWidth >= 1600) return 680;
      if (window.innerWidth >= 1400) return 600;
      if (window.innerWidth >= 1240) return 500;
      return 420;
    };

    const getBounds = () => {
      const layoutRect = layout.getBoundingClientRect();
      const leftWidth = leftPanel && getComputedStyle(leftPanel).display !== "none"
        ? leftPanel.getBoundingClientRect().width
        : 0;
      const handleWidth = handle.getBoundingClientRect().width || 12;
      const minRightWidth = Math.max(320, Math.round(window.innerWidth * 0.24));
      const maxRightWidth = Math.max(
        minRightWidth,
        layoutRect.width - leftWidth - getMiddleMinWidth() - handleWidth - 8
      );

      return { minRightWidth, maxRightWidth };
    };

    const clearResizedState = () => {
      rightPanel.style.width = "";
      rightPanel.style.minWidth = "";
      rightPanel.style.flex = "";
      middlePanel.style.minWidth = "";
      handle.style.display = "none";
      handle.classList.remove("is-active");
      document.body.classList.remove(ACTIVE_BODY_CLASS);
    };

    const applyWidth = (requestedWidth, persist = true) => {
      if (!isDesktopLayout()) {
        clearResizedState();
        return;
      }

      const { minRightWidth, maxRightWidth } = getBounds();
      const clamped = Math.max(minRightWidth, Math.min(requestedWidth, maxRightWidth));

      rightPanel.style.width = `${clamped}px`;
      rightPanel.style.minWidth = `${clamped}px`;
      rightPanel.style.flex = `0 0 ${clamped}px`;
      middlePanel.style.minWidth = `${getMiddleMinWidth()}px`;
      handle.style.display = "block";
      handle.setAttribute("aria-valuenow", String(Math.round(clamped)));

      if (persist) {
        try {
          localStorage.setItem(storageKey, String(clamped));
        } catch (error) {
          // Ignore storage failures in embedded/private contexts.
        }
      }
    };

    const syncState = () => {
      if (!isDesktopLayout()) {
        clearResizedState();
        return;
      }

      let storedWidth = NaN;
      try {
        storedWidth = Number(localStorage.getItem(storageKey));
      } catch (error) {
        // Ignore storage failures in embedded/private contexts.
      }

      const currentWidth = rightPanel.getBoundingClientRect().width;
      const fallbackWidth = currentWidth > 120 ? currentWidth : getDefaultRightWidth();
      applyWidth(Number.isFinite(storedWidth) && storedWidth > 0 ? storedWidth : fallbackWidth, false);
    };

    const finishDrag = () => {
      activePointerId = null;
      handle.classList.remove("is-active");
      document.body.classList.remove(ACTIVE_BODY_CLASS);
    };

    const resizeFromPointer = (clientX) => {
      const layoutRect = layout.getBoundingClientRect();
      const widthFromRight = layoutRect.right - clientX;
      applyWidth(widthFromRight);
    };

    handle.addEventListener("pointerdown", (event) => {
      if (!isDesktopLayout()) return;
      activePointerId = event.pointerId;
      handle.classList.add("is-active");
      document.body.classList.add(ACTIVE_BODY_CLASS);
      handle.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    });

    handle.addEventListener("pointermove", (event) => {
      if (activePointerId !== event.pointerId) return;
      resizeFromPointer(event.clientX);
    });

    handle.addEventListener("pointerup", finishDrag);
    handle.addEventListener("pointercancel", finishDrag);
    handle.addEventListener("lostpointercapture", finishDrag);

    handle.addEventListener("dblclick", () => {
      applyWidth(getDefaultRightWidth());
    });

    handle.addEventListener("keydown", (event) => {
      if (!isDesktopLayout()) return;

      const currentWidth = rightPanel.getBoundingClientRect().width || getDefaultRightWidth();

      if (event.key === "ArrowLeft") {
        applyWidth(currentWidth + 24);
        event.preventDefault();
      } else if (event.key === "ArrowRight") {
        applyWidth(currentWidth - 24);
        event.preventDefault();
      } else if (event.key === "Home") {
        applyWidth(getBounds().maxRightWidth);
        event.preventDefault();
      } else if (event.key === "End") {
        applyWidth(getBounds().minRightWidth);
        event.preventDefault();
      }
    });

    window.addEventListener("resize", syncState);

    const observer = new MutationObserver(syncState);
    observer.observe(rightPanel, { attributes: true, attributeFilter: ["class", "style"] });
    observer.observe(layout, { attributes: true, attributeFilter: ["class", "style"] });
    if (middlePanel) observer.observe(middlePanel, { attributes: true, attributeFilter: ["class", "style"] });
    if (leftPanel) observer.observe(leftPanel, { attributes: true, attributeFilter: ["class", "style"] });

    syncState();
  }

  function boot() {
    injectStyles();
    initThemeSync();
    initGlobalSearch();
    setupResizablePanel();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
