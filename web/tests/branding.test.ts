import { describe, expect, it } from "vitest";
import { APP_LOGO, APP_NAME, getAppLogo, getAppTitle } from "@/lib/branding";

describe("minimal notes branding", () => {
  it.each([undefined, "", "  ", "Memos", " Memos "])("rebrands the default title %s", (title) => {
    expect(getAppTitle(title)).toBe(APP_NAME);
  });

  it("preserves a customized instance title", () => {
    expect(getAppTitle(" 我的笔记 ")).toBe("我的笔记");
  });

  it.each([undefined, "", "/logo.webp", "/full-logo.webp"])("rebrands the default logo %s", (logo) => {
    expect(getAppLogo(logo)).toBe(APP_LOGO);
  });

  it("preserves a customized instance logo", () => {
    expect(getAppLogo("/custom-logo.png")).toBe("/custom-logo.png");
  });
});
