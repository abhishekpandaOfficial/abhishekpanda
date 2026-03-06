export type LongformTocItem = {
  id: string;
  text: string;
  depth: number;
};

const slugifyHeading = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const getHeadingText = (element: Element) => (element.textContent || "").replace(/\s+/g, " ").trim();

export const buildTocFromRoot = (root: ParentNode) => {
  const headingElements = Array.from(root.querySelectorAll<HTMLElement>("h2, h3"));
  const usedIds = new Set<string>();

  const items = headingElements
    .map((element) => {
      const text = getHeadingText(element);
      if (!text) return null;

      let nextId = element.id || slugifyHeading(text);
      if (!nextId) return null;

      let suffix = 2;
      const baseId = nextId;
      while (usedIds.has(nextId)) {
        nextId = `${baseId}-${suffix}`;
        suffix += 1;
      }

      element.id = nextId;
      usedIds.add(nextId);

      return {
        id: nextId,
        text,
        depth: Number(element.tagName.slice(1)),
      } satisfies LongformTocItem;
    })
    .filter((item): item is LongformTocItem => Boolean(item));

  return {
    items,
    elements: headingElements.filter((element) => element.id),
  };
};

export const computeScrollProgress = (scrollTop: number, scrollHeight: number, clientHeight: number) => {
  const travel = Math.max(scrollHeight - clientHeight, 0);
  if (!travel) return 0;
  const pct = (scrollTop / travel) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
};

export const getActiveHeadingId = (elements: HTMLElement[], offset = 140) => {
  let activeId = elements[0]?.id || null;
  for (const element of elements) {
    if (element.getBoundingClientRect().top <= offset) {
      activeId = element.id;
    } else {
      break;
    }
  }
  return activeId;
};
