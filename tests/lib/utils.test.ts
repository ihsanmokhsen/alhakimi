import { describe, expect, it } from "vitest";

import {
  formatMakassarDateKey,
  formatMakassarDateTimeInput,
  isValidProjectUrl,
  moveItem,
  parseMakassarDateTimeInput
} from "@/lib/utils";

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

describe("Makassar date-time input", () => {
  it("formats UTC dates for a datetime-local input", () => {
    expect(formatMakassarDateTimeInput(new Date("2026-07-19T07:21:00.000Z"))).toBe("2026-07-19T15:21");
  });

  it("round-trips a Makassar datetime-local value", () => {
    const value = "2026-07-19T15:21";
    expect(formatMakassarDateTimeInput(parseMakassarDateTimeInput(value)!)).toBe(value);
  });

  it("uses the Makassar calendar day for visit counting", () => {
    expect(formatMakassarDateKey("2026-07-20T17:00:00.000Z")).toBe("2026-07-21");
  });
});
