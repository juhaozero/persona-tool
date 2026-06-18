export const DEFAULT_BASE_PATH = "/";

export function normalizeBasePath(raw: string | undefined): string {
  if (!raw?.trim() || raw.trim() === "/") return "/";
  let base = raw.trim();
  if (!base.startsWith("/")) base = `/${base}`;
  if (!base.endsWith("/")) base = `${base}/`;
  return base;
}

/** 拼接应用 base 下的资源路径（浏览器端使用 Vite 注入的 BASE_URL） */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL;
  const normalized = path.replace(/^\//, "");
  return `${base}${normalized}`;
}
