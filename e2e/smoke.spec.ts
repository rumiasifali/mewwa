import { test, expect } from "@playwright/test";

// Smoke tests for the critical public flows. They run against the real
// Supabase project (read-only requests), so they assume at least one
// available product and one published state of the store.

test.describe("public pages", () => {
  test("home page renders hero and header", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/QAAQ/);
    await expect(page.locator("header").first()).toBeVisible();
    await expect(page.getByRole("link", { name: /products/i }).first()).toBeVisible();
  });

  test("products catalog lists real products", async ({ page }) => {
    await page.goto("/products");
    const productLinks = page.locator('a[href^="/products/"]');
    await expect(productLinks.first()).toBeVisible();
    expect(await productLinks.count()).toBeGreaterThan(0);
  });

  test("product detail shows buy box from catalog data", async ({ page }) => {
    await page.goto("/products");
    const first = page.locator('a[href^="/products/"]').first();
    await first.click();
    await page.waitForURL(/\/products\/.+/);
    await expect(page.getByText(/PKR/).first()).toBeVisible();
  });

  test("shipping page renders rate tables", async ({ page }) => {
    await page.goto("/shipping");
    await expect(page.getByText("Punjab & KPK")).toBeVisible();
    await expect(page.getByText("PKR 250").first()).toBeVisible();
  });

  test("contact page renders a working form", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("form").first()).toBeVisible();
  });

  test("blog index renders", async ({ page }) => {
    await page.goto("/blog");
    await expect(page).toHaveTitle(/QAAQ/);
  });
});

test.describe("route protection", () => {
  test("anonymous /admin is redirected to login", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });

  test("anonymous /account is redirected home with auth prompt", async ({ page }) => {
    await page.goto("/account");
    await page.waitForURL((url) => !url.pathname.startsWith("/account"));
    expect(new URL(page.url()).pathname).toBe("/");
  });
});

test.describe("API", () => {
  test("search returns results for a real product term", async ({ request }) => {
    const res = await request.get("/api/search?q=almond");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.results)).toBe(true);
  });

  test("cart requires authentication", async ({ request }) => {
    const res = await request.get("/api/cart");
    expect(res.status()).toBe(401);
  });

  test("orders reject anonymous placement", async ({ request }) => {
    const res = await request.post("/api/orders", {
      data: { customerName: "Anon" },
    });
    expect(res.status()).toBe(401);
  });

  test("cart items reject bogus payloads even before auth", async ({ request }) => {
    const res = await request.post("/api/cart/items", {
      data: { productId: "x", weightGrams: 250, price: 1 },
    });
    expect(res.status()).toBe(401);
  });
});

test.describe("security headers", () => {
  test("CSP and hardening headers are served", async ({ request }) => {
    const res = await request.get("/");
    const headers = res.headers();
    expect(headers["content-security-policy"]).toContain("default-src 'self'");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
  });
});
