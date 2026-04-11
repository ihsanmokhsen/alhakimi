import { describe, expect, it } from "vitest";

import { isValidProjectUrl, moveItem } from "@/lib/utils";

describe("isValidProjectUrl", () => {
  it("accepts https portfolio project links", () => {
    expect(isValidProjectUrl("https://absenpagi-perbidang.vercel.app/")).toBe(true);
  });

  it("rejects non-https URLs", () => {
    expect(isValidProjectUrl("http://example.com")).toBe(false);
  });
});

describe("moveItem", () => {
  it("moves an item to a new index without losing order", () => {
    expect(moveItem(["a", "b", "c", "d"], 0, 2)).toEqual(["b", "c", "a", "d"]);
  });
});
