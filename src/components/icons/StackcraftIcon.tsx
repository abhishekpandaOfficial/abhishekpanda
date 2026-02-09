export function StackcraftIcon(props: { className?: string }) {
  const { className } = props;
  // Simple flame + open book mark, designed to match the provided Stackcraft logo vibe.
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor" aria-hidden="true">
      {/* Book */}
      <path d="M6 38c10-5 19-6 26-6v22c-10 0-18 2-26 6V38z" opacity="0.9" />
      <path d="M58 38c-10-5-19-6-26-6v22c10 0 18 2 26 6V38z" opacity="0.9" />
      <path d="M32 32c-7 0-16 1-26 6v4c10-5 19-6 26-6s16 1 26 6v-4c-10-5-19-6-26-6z" opacity="0.75" />
      {/* Center spine */}
      <path d="M31 31h2v25h-2V31z" opacity="0.8" />
      {/* Flame */}
      <path
        d="M32 8c2 7-4 10-6 14-2 4-1 9 4 12-1-4 1-7 4-9 3-2 5-5 4-10 4 5 7 9 7 15 0 10-8 18-13 18s-13-8-13-18c0-8 7-11 13-22z"
        opacity="0.95"
      />
    </svg>
  );
}

