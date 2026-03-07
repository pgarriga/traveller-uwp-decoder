// URL routing helpers

// Support GitHub Pages subdirectory - Vite provides BASE_URL
export const getBasePath = () => {
  const base = import.meta.env.BASE_URL || "/";
  return base.endsWith("/") ? base.slice(0, -1) : base;
};

export const parseUrl = () => {
  const basePath = getBasePath();
  const path = window.location.pathname.replace(basePath, "") || "/";

  if (path === "/" || path === "") {
    return { view: "decoder", uwp: null };
  }
  if (path === "/recent") {
    return { view: "saved", uwp: null };
  }
  if (path === "/settings") {
    return { view: "settings", uwp: null };
  }
  const planetMatch = path.match(/^\/planet\/([A-Za-z0-9-]+)$/);
  if (planetMatch) {
    return { view: "planet", uwp: planetMatch[1].toUpperCase() };
  }
  return { view: "decoder", uwp: null };
};

export const buildUrl = (view, uwp = null) => {
  const basePath = getBasePath();
  if (view === "saved") return `${basePath}/recent`;
  if (view === "settings") return `${basePath}/settings`;
  if (view === "planet" && uwp) return `${basePath}/planet/${uwp.toUpperCase()}`;
  return basePath || "/";
};
