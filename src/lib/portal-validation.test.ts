import { describe, expect, it } from "vitest";
import { validMark, percentage, validateFile, safeExternalUrl } from "./portal-validation";
describe("school portal rules", () => {
  it("marks cannot exceed the test maximum", () => { expect(validMark(101, 100)).toBe(false); expect(validMark(100, 100)).toBe(true); expect(validMark(-1, 100)).toBe(false); });
  it("zero maximum marks never produces a percentage", () => { expect(percentage(0, 0)).toBeNull(); expect(percentage(75, 100)).toBe(75); });
  it("daily work accepts PDF, JPEG and PNG but not executable files", () => { for (const type of ["application/pdf", "image/jpeg", "image/png"]) expect(() => validateFile({type, size: 100})).not.toThrow(); expect(() => validateFile({type: "application/x-msdownload", size: 100})).toThrow(); });
  it("private uploads reject empty or oversized files", () => { expect(() => validateFile({type: "application/pdf", size: 0})).toThrow(); expect(() => validateFile({type: "application/pdf", size: 16 * 1024 * 1024})).toThrow(); });
  it("external resources cannot execute javascript", () => { expect(() => safeExternalUrl("javascript:alert(1)")).toThrow(); expect(safeExternalUrl("https://cisce.org")).toBe("https://cisce.org/"); });
});