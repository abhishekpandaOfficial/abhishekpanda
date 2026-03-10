(() => {
  const DESKTOP_BREAKPOINT = 1100;
  const STORAGE_PREFIX = "mastery-right-width:";
  const HANDLE_CLASS = "mastery-resize-handle";
  const ACTIVE_BODY_CLASS = "mastery-is-resizing";

  function injectStyles() {
    if (document.getElementById("mastery-resize-styles")) return;

    const style = document.createElement("style");
    style.id = "mastery-resize-styles";
    style.textContent = `
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
    `;

    document.head.appendChild(style);
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

    syncState();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupResizablePanel, { once: true });
  } else {
    setupResizablePanel();
  }
})();
