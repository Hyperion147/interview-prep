import assert from "node:assert/strict";
import test from "node:test";
import { safeRedirectPath } from "../src/lib/auth/redirects";

test("keeps same-origin paths with query strings and hashes", () => {
    assert.equal(safeRedirectPath("/admin/leads"), "/admin/leads");
    assert.equal(
        safeRedirectPath("/portal?tab=trips#documents"),
        "/portal?tab=trips#documents",
    );
    assert.equal(safeRedirectPath("/trips"), "/trips");
});

test("falls back for missing, relative, and absolute destinations", () => {
    assert.equal(safeRedirectPath(undefined), "/portal");
    assert.equal(safeRedirectPath(null), "/portal");
    assert.equal(safeRedirectPath(""), "/portal");
    assert.equal(safeRedirectPath("portal"), "/portal");
    assert.equal(safeRedirectPath("https://evil.example"), "/portal");
    assert.equal(safeRedirectPath("//evil.example/path"), "/portal");
    assert.equal(safeRedirectPath("/\\evil.example"), "/portal");
    assert.equal(safeRedirectPath("javascript:alert(1)"), "/portal");
});

test("does not bounce back to auth pages", () => {
    assert.equal(safeRedirectPath("/auth/login"), "/portal");
    assert.equal(safeRedirectPath("/auth/signup?next=/admin"), "/portal");
    assert.equal(safeRedirectPath("/author"), "/author");
});

test("honours a custom fallback", () => {
    assert.equal(safeRedirectPath(undefined, "/"), "/");
    assert.equal(safeRedirectPath("https://evil.example", "/admin"), "/admin");
    assert.equal(safeRedirectPath(undefined, ""), "");
});
