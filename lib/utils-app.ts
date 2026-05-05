const RESERVED_USERNAMES = new Set([
  "admin",
  "api",
  "auth",
  "dashboard",
  "editor",
  "feed",
  "settings",
  "onboarding",
  "sign-in",
  "sign-up",
  "u",
  "public",
  "static",
  "me",
  "login",
  "logout",
  "register",
  "support",
  "about",
  "tag",
  "tags",
  "search",
]);

export function isValidUsername(value: string): boolean {
  if (!/^[a-z0-9_]{3,20}$/.test(value)) return false;
  if (RESERVED_USERNAMES.has(value)) return false;
  return true;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
