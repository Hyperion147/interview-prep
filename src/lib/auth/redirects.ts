const INTERNAL_ORIGIN = "http://traveldesk.internal";

/**
 * Returns a safe same-origin path for post-auth redirects.
 * Rejects absolute URLs, protocol-relative URLs, and auth pages so a crafted
 * `next` value cannot turn sign-in into an open redirect or a login loop.
 */
export function safeRedirectPath(value: unknown, fallback = "/portal") {
    if (typeof value !== "string") return fallback;
    const path = value.trim();
    if (!path.startsWith("/")) return fallback;
    try {
        const url = new URL(path, INTERNAL_ORIGIN);
        if (url.origin !== INTERNAL_ORIGIN) return fallback;
        if (url.pathname === "/auth" || url.pathname.startsWith("/auth/"))
            return fallback;
        return `${url.pathname}${url.search}${url.hash}`;
    } catch {
        return fallback;
    }
}
