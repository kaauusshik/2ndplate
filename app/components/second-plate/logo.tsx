export function SecondPlateMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx="24"
        cy="28"
        r="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <circle cx="24" cy="28" r="9" fill="currentColor" opacity="0.14" />
      <path
        d="M24 13C23 7 27 3 34 3C35 9 31 13 24 13Z"
        fill="#61B879"
      />
      <path
        d="M24 13C22 9 18 7 13 8C14 12 18 14 24 13Z"
        fill="#61B879"
        opacity="0.7"
      />
    </svg>
  );
}
