export default function Logo({ size = 24, className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size * (39 / 50)}
      viewBox="0 0 50 39"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <g>
        <path d="M16.4992 2H37.5808L22.0816 24.9729H1L16.4992 2Z" fill="#007AFF" />
        <path
          d="M17.4231 27.1022L11.4199 36.0002H33.5015L49.0007 13.0273H32.7031L23.2071 27.1022H17.4231Z"
          fill="#312ECB"
        />
      </g>
    </svg>
  );
}
