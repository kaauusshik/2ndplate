export function SecondPlateMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
    >
      {/* Plate Outer Circle */}
      <circle
        cx="24"
        cy="26"
        r="18"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <circle cx="24" cy="26" r="14" fill="currentColor" fillOpacity="0.08" />

      {/* Fresh Rescue Leaves on top */}
      <path
        d="M24 10C23 4 27 1 33 1C34 6 31 10 24 10Z"
        fill="#10B981"
      />
      <path
        d="M24 10C22 6 18 5 13 6C14 10 18 11 24 10Z"
        fill="#34D399"
        opacity="0.85"
      />

      {/* "2" and "nd" mark */}
      <text
        x="20"
        y="33"
        fontSize="17"
        fontWeight="900"
        fill="currentColor"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        2
      </text>
      <text
        x="29"
        y="25"
        fontSize="8"
        fontWeight="800"
        fill="#10B981"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        nd
      </text>
    </svg>
  );
}
