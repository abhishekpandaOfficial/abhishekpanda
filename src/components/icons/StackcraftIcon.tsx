export function StackcraftIcon(props: { className?: string }) {
  const { className } = props;
  return (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
      shapeRendering="geometricPrecision"
    >
      <rect width="32" height="32" rx="7" fill="#3B6DF0" />
      <path
        d="M16 5 L27 11 L16 17 L5 11 Z"
        fill="white"
      />
      <path
        d="M5 17 L16 23 L27 17"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.65"
      />
      <path
        d="M5 22.5 L16 28.5 L27 22.5"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
      />
    </svg>
  );
}
