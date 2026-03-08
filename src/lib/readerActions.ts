import JSZip from "jszip";

export type ReaderTheme = "light" | "dark";

export type ReaderExportPayload = {
  title: string;
  slug?: string;
  description?: string;
  author?: string;
  bodyHtml: string;
  fullHtml?: string;
  stylesCss?: string;
  stylesheets?: string[];
  bodyClassName?: string;
  lang?: string;
};

const PRINT_BASE_STYLES = `
  @page { margin: 16mm; }
  html { color-scheme: light; }
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  img, svg, video, canvas, iframe {
    max-width: 100%;
    height: auto;
  }
  a {
    color: inherit;
  }
`;

const EPUB_BASE_STYLES = `
  body {
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    line-height: 1.7;
    color: #0f172a;
    background: #ffffff;
    margin: 0 auto;
    max-width: 760px;
    padding: 24px 20px 48px;
  }
  img, svg, video, canvas {
    max-width: 100%;
    height: auto;
  }
  h1, h2, h3, h4, h5, h6 {
    color: #020617;
    line-height: 1.2;
  }
  p, li, td, th, figcaption, small {
    color: #334155;
  }
  pre, code {
    font-family: "JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  }
  pre {
    white-space: pre-wrap;
    word-break: break-word;
    overflow-wrap: anywhere;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
  }
  code {
    background: #f8fafc;
    border-radius: 6px;
    padding: 0.1rem 0.35rem;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
  }
  th, td {
    border: 1px solid #cbd5e1;
    padding: 8px;
    vertical-align: top;
  }
  blockquote {
    margin: 16px 0;
    padding-left: 16px;
    border-left: 4px solid #94a3b8;
    color: #475569;
  }
`;

const stripScripts = (html: string) => html.replace(/<script[\s\S]*?<\/script>/gi, "");

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const slugifyFileName = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "document";

const injectIntoHead = (html: string, injection: string) => {
  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, `${injection}</head>`);
  }
  if (/<html[^>]*>/i.test(html)) {
    return html.replace(/<html[^>]*>/i, (match) => `${match}<head>${injection}</head>`);
  }
  return `<!DOCTYPE html><html><head>${injection}</head><body>${html}</body></html>`;
};

const buildStandaloneHtml = (payload: ReaderExportPayload) => {
  const stylesheetLinks = (payload.stylesheets || [])
    .map((href) => `<link rel="stylesheet" href="${href}">`)
    .join("");
  const lang = payload.lang || "en";
  const bodyClass = payload.bodyClassName ? ` class="${payload.bodyClassName}"` : "";
  return `<!DOCTYPE html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${payload.title}</title>
    ${stylesheetLinks}
    <style>${payload.stylesCss || ""}</style>
    <style>${PRINT_BASE_STYLES}</style>
  </head>
  <body${bodyClass}>${stripScripts(payload.bodyHtml)}</body>
</html>`;
};

const buildPrintableHtml = (payload: ReaderExportPayload) => {
  if (payload.fullHtml) {
    const safeHtml = stripScripts(payload.fullHtml);
    return injectIntoHead(safeHtml, `<style>${PRINT_BASE_STYLES}</style>`);
  }

  return buildStandaloneHtml(payload);
};

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

export const openPrintWindow = (payload: ReaderExportPayload) => {
  const printWindow = window.open("", "_blank", "width=1280,height=960");
  if (!printWindow) return false;

  const printableHtml = buildPrintableHtml(payload);
  printWindow.document.open();
  printWindow.document.write(printableHtml);
  printWindow.document.close();

  const triggerPrint = () => {
    printWindow.focus();
    printWindow.print();
  };

  printWindow.onload = () => window.setTimeout(triggerPrint, 250);
  window.setTimeout(triggerPrint, 700);
  return true;
};

export const downloadPdfViaPrint = (payload: ReaderExportPayload) => openPrintWindow(payload);

export const downloadEpub = async (payload: ReaderExportPayload) => {
  const zip = new JSZip();
  const safeTitle = payload.title || "Document";
  const safeAuthor = payload.author || "Abhishek Panda";
  const safeFileName = `${slugifyFileName(payload.slug || safeTitle)}.epub`;
  const sanitizedBody = stripScripts(payload.bodyHtml);
  const stylesheet = `${EPUB_BASE_STYLES}\n${payload.stylesCss || ""}`;

  const epubFolder = zip.folder("OEBPS");
  if (!epubFolder) return false;

  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
  zip.folder("META-INF")?.file(
    "container.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`,
  );

  epubFolder.file(
    "content.xhtml",
    `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" lang="${payload.lang || "en"}">
  <head>
    <title>${escapeXml(safeTitle)}</title>
    <link rel="stylesheet" type="text/css" href="styles.css" />
  </head>
  <body>${sanitizedBody}</body>
</html>`,
  );

  epubFolder.file(
    "nav.xhtml",
    `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${payload.lang || "en"}">
  <head>
    <title>${escapeXml(safeTitle)}</title>
  </head>
  <body>
    <nav epub:type="toc" id="toc">
      <h1>${escapeXml(safeTitle)}</h1>
      <ol>
        <li><a href="content.xhtml">${escapeXml(safeTitle)}</a></li>
      </ol>
    </nav>
  </body>
</html>`,
  );

  epubFolder.file("styles.css", stylesheet);

  epubFolder.file(
    "content.opf",
    `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">${escapeXml(payload.slug || slugifyFileName(safeTitle))}</dc:identifier>
    <dc:title>${escapeXml(safeTitle)}</dc:title>
    <dc:creator>${escapeXml(safeAuthor)}</dc:creator>
    <dc:language>${escapeXml(payload.lang || "en")}</dc:language>
    <dc:description>${escapeXml(payload.description || safeTitle)}</dc:description>
  </metadata>
  <manifest>
    <item id="content" href="content.xhtml" media-type="application/xhtml+xml" />
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav" />
    <item id="css" href="styles.css" media-type="text/css" />
  </manifest>
  <spine>
    <itemref idref="content" />
  </spine>
</package>`,
  );

  const blob = await zip.generateAsync({
    type: "blob",
    mimeType: "application/epub+zip",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  triggerDownload(blob, safeFileName);
  return true;
};

export const buildIframeExportPayload = (
  doc: Document,
  fallback: Pick<ReaderExportPayload, "title" | "slug" | "description" | "author">,
): ReaderExportPayload => ({
  title: fallback.title,
  slug: fallback.slug,
  description: fallback.description,
  author: fallback.author,
  bodyHtml: doc.body.innerHTML,
  fullHtml: `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`,
  stylesCss: Array.from(doc.querySelectorAll("style"))
    .map((node) => node.textContent || "")
    .join("\n"),
  stylesheets: Array.from(doc.querySelectorAll('link[rel="stylesheet"]'))
    .map((node) => node.getAttribute("href"))
    .filter((href): href is string => Boolean(href)),
  bodyClassName: doc.body.className,
  lang: doc.documentElement.lang || "en",
});

export const buildHtmlExportPayload = (payload: ReaderExportPayload) => payload;

export const applyEmbeddedThemeBridge = (doc: Document, theme: ReaderTheme) => {
  const isDesignPatternsGuide = /design patterns/i.test(doc.title);
  const palette =
    theme === "dark"
      ? {
          bg: "#020617",
          bg2: "#0f172a",
          bg3: "#111827",
          text: "#e5edf8",
          text2: "#94a3b8",
          text3: "#64748b",
          border: "rgba(148, 163, 184, 0.18)",
          borderStrong: "rgba(148, 163, 184, 0.28)",
          codeBg: "#020617",
          link: "#7dd3fc",
        }
      : {
          bg: "#f8fafc",
          bg2: "#ffffff",
          bg3: "#eef2ff",
          text: "#0f172a",
          text2: "#475569",
          text3: "#64748b",
          border: "rgba(15, 23, 42, 0.12)",
          borderStrong: "rgba(15, 23, 42, 0.2)",
          codeBg: "#f8fafc",
          link: "#2563eb",
        };

  const bridgeCss = `
    html {
      color-scheme: ${theme};
    }
    :root {
      --bg: ${palette.bg} !important;
      --bg2: ${palette.bg2} !important;
      --bg3: ${palette.bg3} !important;
      --surface: ${palette.bg2} !important;
      --surface2: ${palette.bg3} !important;
      --card: ${palette.bg2} !important;
      --panel: ${palette.bg2} !important;
      --border: ${palette.border} !important;
      --border2: ${palette.borderStrong} !important;
      --text: ${palette.text} !important;
      --text2: ${palette.text2} !important;
      --text3: ${palette.text3} !important;
      --muted: ${palette.text2} !important;
      --code-bg: ${palette.codeBg} !important;
    }
    html, body {
      background: var(--bg) !important;
      color: var(--text) !important;
      font-family: Inter, ui-sans-serif, system-ui, sans-serif !important;
    }
    body {
      overflow-x: hidden;
    }
    h1, h2, h3, h4, h5, h6 {
      font-family: Inter, ui-sans-serif, system-ui, sans-serif !important;
      letter-spacing: -0.03em;
    }
    body, p, li, td, th, dd, figcaption, .hero-desc, .cs-lead, .card p, .card ul li, .nav-a, .sb-sub, .nav-num, .stat-pill, .code-file, .code-tag {
      color: var(--text2) !important;
    }
    p, li, td, th, dd, figcaption, span, div:not([class*="code"]):not([class*="mono"]) {
      font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    }
    pre, code, kbd, samp, .code, .code *, [class*="code"], [class*="mono"] {
      font-family: "JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace !important;
    }
    h1, h2, h3, h4, h5, h6, .hero h1, .cs-title, .sb-title, .card h3 {
      color: var(--text) !important;
    }
    .sb, .card, .diagram, .code, nav, .box, .panel, .surface {
      border-color: var(--border) !important;
    }
    pre, code, .code, .code pre {
      background: var(--code-bg) !important;
    }
    a:not(.nav-a) {
      color: ${palette.link} !important;
    }
    .nav-a:hover, .nav-a.on {
      color: var(--text) !important;
      background: color-mix(in srgb, var(--bg3) 70%, transparent) !important;
    }
    svg text[fill="#555"], svg text[fill="#64748b"], svg text[fill="#6b7280"], svg text[fill="#888"] {
      fill: var(--text2) !important;
    }
    svg text[fill="#fff"], svg text[fill="#ffffff"] {
      fill: var(--text) !important;
    }
    img, picture, svg, video, canvas, iframe {
      max-width: 100% !important;
      visibility: visible !important;
    }
    img, video, canvas {
      height: auto;
      object-fit: contain;
      opacity: 1 !important;
    }
    img[alt*="logo" i], .logo img, [class*="logo"] img {
      object-fit: contain !important;
    }
    ${isDesignPatternsGuide && theme === "light"
      ? `
    html[data-ap-theme="light"] body {
      filter: invert(1) hue-rotate(180deg);
      background: #f8fafc !important;
    }
    html[data-ap-theme="light"] img,
    html[data-ap-theme="light"] picture,
    html[data-ap-theme="light"] svg,
    html[data-ap-theme="light"] video,
    html[data-ap-theme="light"] canvas,
    html[data-ap-theme="light"] iframe {
      filter: invert(1) hue-rotate(180deg) !important;
    }`
      : ""}
  `;

  let styleNode = doc.getElementById("ap-theme-bridge") as HTMLStyleElement | null;
  if (!styleNode) {
    styleNode = doc.createElement("style");
    styleNode.id = "ap-theme-bridge";
    doc.head.appendChild(styleNode);
  }
  styleNode.textContent = bridgeCss;
  doc.documentElement.setAttribute("data-ap-theme", theme);
};
