import { expect, it } from "vitest";
import { isValidURL } from "./network.js";

it("should validate URL", () => {
    expect(isValidURL("https://example.com")).toBe(true);
    expect(isValidURL("http://example.com")).toBe(true);
    expect(isValidURL("HtTpS://example.com/path")).toBe(true);
});

it("should invalidate invalid URL", () => {
    expect(isValidURL("example.com")).toBe(false);
    expect(isValidURL("ftp://example.com")).toBe(false);
    expect(isValidURL("mailto:info@example.com")).toBe(false);
    expect(isValidURL("data:text/plain,Hello%2C%20World!")).toBe(false);
});
