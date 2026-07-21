const ICONES = {
  alert: (
    <>
      <path d="M12 3 2.8 20h18.4L12 3Z" />
      <path d="M12 8v6" />
      <path d="M12 17.2v.2" />
    </>
  ),
  arrowLeft: (
    <>
      <path d="M20 12H5" />
      <path d="m10 6-6 6 6 6" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M4 12h15" />
      <path d="m14 6 6 6-6 6" />
    </>
  ),
  bus: (
    <>
      <path d="M5 4h14l2 4v10H3V8l2-4Z" />
      <path d="M4 10h16M7 18v2M17 18v2M7 14h.2M16.8 14h.2" />
    </>
  ),
  check: <path d="m4 12 5 5L20 6" />,
  code: (
    <>
      <path d="m9 7-5 5 5 5M15 7l5 5-5 5M13 4l-2 16" />
    </>
  ),
  confetti: (
    <>
      <path d="m4 20 4-10 6 6-10 4Z" />
      <path d="M13 5V2M17 8l3-2M10 4 8 8M18 14h3" />
    </>
  ),
  cross: (
    <>
      <path d="m6 6 12 12M18 6 6 18" />
    </>
  ),
  flame: (
    <path d="M13 2c1 5-3 5-1 9 1-2 3-2 4-4 3 3 4 6 2 10-1.2 2.5-3.2 4-6 4-4.4 0-7-3-7-7 0-3 2-6 5-8 0 3 1 4 3 5-1-3 2-5 0-9Z" />
  ),
  hourglass: (
    <>
      <path d="M6 3h12M6 21h12M7 3c0 5 3 5 5 9-2 4-5 4-5 9M17 3c0 5-3 5-5 9 2 4 5 4 5 9" />
    </>
  ),
  idea: (
    <>
      <path d="M9 18h6M10 21h4M8.5 15.5C6.8 14.3 6 12.8 6 10.8A6 6 0 0 1 18 11c0 1.9-.9 3.5-2.5 4.5L15 17H9l-.5-1.5Z" />
      <path d="M12 2V0.8M4.8 4.2 3.5 2.9M19.2 4.2l1.3-1.3" />
    </>
  ),
  install: (
    <>
      <path d="M7 3h10v18H7z" />
      <path d="M12 6v8M9 11l3 3 3-3M10 18h4" />
    </>
  ),
  keyboard: (
    <>
      <path d="M3 6h18v12H3z" />
      <path d="M6 10h1M10 10h1M14 10h1M18 10h.1M6 14h2M10 14h8" />
    </>
  ),
  lock: (
    <>
      <path d="M6 10h12v11H6zM9 10V7a3 3 0 0 1 6 0v3" />
      <path d="M12 14v3" />
    </>
  ),
  muscle: (
    <path d="M8 12V8l3-4 2 1-1 4h3l2-2 2 1v5c0 5-3 8-8 8H6c-2 0-3-1-3-3v-6h5Z" />
  ),
  offline: (
    <>
      <path d="M4 16h16M6 16l1-8h10l1 8M8 20h.1M16 20h.1M8 12h8" />
      <path d="m3 3 18 18" />
    </>
  ),
  pin: (
    <>
      <path d="M12 22s7-7 7-13a7 7 0 0 0-14 0c0 6 7 13 7 13Z" />
      <path d="M12 7v4M10 9h4" />
    </>
  ),
  play: <path d="m7 4 12 8-12 8V4Z" />,
  puzzle: (
    <path d="M4 4h6a2.5 2.5 0 1 0 4 0h6v6a2.5 2.5 0 1 0 0 4v6h-6a2.5 2.5 0 1 0-4 0H4v-6a2.5 2.5 0 1 0 0-4V4Z" />
  ),
  return: (
    <>
      <path d="M9 7 4 12l5 5" />
      <path d="M5 12h9a6 6 0 0 1 6 6v1" />
    </>
  ),
  target: (
    <>
      <path d="M19 12a7 7 0 1 1-7-7" />
      <path d="M16 12a4 4 0 1 1-4-4M12 12l8-8M16 4h4v4" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 3h10v5c0 4-2 7-5 7s-5-3-5-7V3Z" />
      <path d="M7 6H3v2c0 3 2 5 5 5M17 6h4v2c0 3-2 5-5 5M12 15v4M8 21h8" />
    </>
  ),
  warning: (
    <>
      <path d="M12 3 2.8 20h18.4L12 3Z" />
      <path d="M12 8v6M12 17.2v.2" />
    </>
  ),
};

export function Icon({ name, className = "", size, title }) {
  const desenho = ICONES[name] || ICONES.code;
  return (
    <svg
      className={"brut-icon" + (className ? " " + className : "")}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden={title ? undefined : "true"}
      role={title ? "img" : undefined}
      focusable="false"
    >
      {title && <title>{title}</title>}
      {desenho}
    </svg>
  );
}
