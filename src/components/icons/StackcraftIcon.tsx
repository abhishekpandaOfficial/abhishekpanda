export function StackcraftIcon(props: { className?: string }) {
  const { className } = props;
  return (
    <svg
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* From stackcraft_logo.svg. Background stays dark; glyph uses currentColor so we can tint on hover. */}
      <rect x="8" y="8" width="32" height="32" rx="6" fill="#111827" />
      <path
        d="M16 18h16v4H16v-4zm0 6h20v4H16v-4zm0 6h14v4H16v-4z"
        fill="currentColor"
      />
    </svg>
  );
}
