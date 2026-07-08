import React from "react";

/* Inline-SVG icon set drawn to match the prototype's HugeIcons
   "stroke rounded" style (24 grid, 1.5 stroke, round caps/joins).
   Self-hosted so the app works without the icon CDN. */

const PATHS: Record<string, React.ReactNode> = {
  "search-01": (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M19.5 19.5 15.7 15.7" />
    </>
  ),
  "clock-01": (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l2.8 2.3" />
    </>
  ),
  "plus-sign": <path d="M12 5v14M5 12h14" />,
  "minus-sign": <path d="M5 12h14" />,
  "cancel-01": <path d="M6 6l12 12M18 6L6 18" />,
  "arrow-left-01": <path d="M14.5 6 9 12l5.5 6" />,
  "arrow-right-01": <path d="M9.5 6 15 12l-5.5 6" />,
  "shopping-basket-01": (
    <>
      <path d="M4 9.5h16l-1.2 8a3 3 0 0 1-3 2.5H8.2a3 3 0 0 1-3-2.5L4 9.5Z" />
      <path d="M8.5 9.5 12 4l3.5 5.5" />
      <path d="M9.5 13.5v3M14.5 13.5v3" />
    </>
  ),
  "delete-02": (
    <>
      <path d="M5.5 7h13" />
      <path d="M9.5 4.5h5" />
      <path d="M6.5 7l.8 11a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9l.8-11" />
      <path d="M10 11v5M14 11v5" />
    </>
  ),
  "attachment-01": (
    <path d="M20 11.5 12.4 19a5 5 0 0 1-7-7l7.5-7.6a3.4 3.4 0 0 1 4.8 4.8L10.3 16.7a1.8 1.8 0 0 1-2.6-2.6l7-7.1" />
  ),
  "download-01": (
    <>
      <path d="M12 4v10.5" />
      <path d="M7.5 11 12 15.5 16.5 11" />
      <path d="M4.5 16v2A2.5 2.5 0 0 0 7 20.5h10a2.5 2.5 0 0 0 2.5-2.5v-2" />
    </>
  ),
  "location-01": (
    <>
      <path d="M12 21s-6.5-5.3-6.5-10.4A6.4 6.4 0 0 1 12 4a6.4 6.4 0 0 1 6.5 6.6C18.5 15.7 12 21 12 21Z" />
      <circle cx="12" cy="10.5" r="2.3" />
    </>
  ),
  "tick-02": <path d="M4.5 12.5 10 18 19.5 7" />,
  "coffee-02": (
    <>
      <path d="M5 10h11v6a4.5 4.5 0 0 1-4.5 4.5H9.5A4.5 4.5 0 0 1 5 16v-6Z" />
      <path d="M16 11.5h1.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M8 3.5c0 1.2 1.2 1.2 1.2 2.4M12 3.5c0 1.2 1.2 1.2 1.2 2.4" />
    </>
  ),
  "shopping-bag-01": (
    <>
      <path d="M5.5 8h13l-.9 10.4a2.5 2.5 0 0 1-2.5 2.3H8.9a2.5 2.5 0 0 1-2.5-2.3L5.5 8Z" />
      <path d="M9 10.5V7a3 3 0 0 1 6 0v3.5" />
    </>
  ),
  "delivery-truck-01": (
    <>
      <path d="M3.5 6.5h10v10h-10Z" />
      <path d="M13.5 9.5h3.4l3.1 3.4v3.6h-6.5" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="16.8" cy="17.5" r="1.8" />
    </>
  ),
  "checkmark-circle-02": (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.3 12.4 11 15l4.8-5.6" />
    </>
  ),
  "menu-restaurant": (
    <>
      <path d="M4 18.5h16" />
      <path d="M5 18.5a7 7 0 0 1 14 0" />
      <path d="M12 11.5v-2" />
      <circle cx="12" cy="8" r="1" />
    </>
  ),
  favourite: (
    <path d="M12 20s-7.5-4.7-7.5-10A4.4 4.4 0 0 1 9 5.5c1.3 0 2.4.7 3 1.7a3.6 3.6 0 0 1 3-1.7 4.4 4.4 0 0 1 4.5 4.5c0 5.3-7.5 10-7.5 10Z" />
  ),
  "alert-02": (
    <>
      <path d="M12 4 3.5 19h17L12 4Z" />
      <path d="M12 10v4M12 16.8v.2" />
    </>
  ),
  "logout-01": (
    <>
      <path d="M14 4.5H8A2.5 2.5 0 0 0 5.5 7v10A2.5 2.5 0 0 0 8 19.5h6" />
      <path d="M10.5 12h9M16.5 8.5 20 12l-3.5 3.5" />
    </>
  ),
  "store-01": (
    <>
      <path d="M4.5 9.5 5.8 4.5h12.4l1.3 5" />
      <path d="M5.5 9.5v8A2.5 2.5 0 0 0 8 20h8a2.5 2.5 0 0 0 2.5-2.5v-8" />
      <path d="M4 9.5h16" />
      <path d="M9.5 20v-5.5h5V20" />
    </>
  ),
  "image-01": (
    <>
      <rect x="4" y="4.5" width="16" height="15" rx="2.5" />
      <circle cx="9" cy="9.5" r="1.5" />
      <path d="M4.5 16.5 9 12.5l3.5 3 3-2.5 4 3.5" />
    </>
  ),
  "star-01": (
    <path d="M12 3.5l2.5 5.2 5.7.7-4.2 4 1.1 5.6-5.1-2.8-5.1 2.8 1.1-5.6-4.2-4 5.7-.7L12 3.5Z" />
  ),
  "edit-02": (
    <>
      <path d="M6 18l.7-3.4L14.8 6.5a1.7 1.7 0 0 1 2.4 0l.3.3a1.7 1.7 0 0 1 0 2.4L9.4 17.3 6 18Z" />
      <path d="M13.3 8 16 10.7" />
    </>
  ),
};

export function Icon({
  name,
  size = 24,
  style = {},
  ...rest
}: { name: string; size?: number; style?: React.CSSProperties } & React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0, display: "inline-block", ...style }}
      {...rest}
    >
      {PATHS[name] || <circle cx="12" cy="12" r="8.5" />}
    </svg>
  );
}
