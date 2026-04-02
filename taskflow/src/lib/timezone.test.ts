import { DateTime } from "luxon"
import { DEFAULT_TIMEZONE, getAvailableTimezones, normalizeTimezone } from "./timezone"

describe("timezone helpers", () => {
  it("returns a non-empty timezone list", () => {
    const timezones = getAvailableTimezones()

    expect(Array.isArray(timezones)).toBe(true)
    expect(timezones.length).toBeGreaterThan(0)
  })

  it("falls back to the default timezone when none is provided", () => {
    expect(normalizeTimezone(undefined)).toBe(DEFAULT_TIMEZONE)
    expect(normalizeTimezone(null)).toBe(DEFAULT_TIMEZONE)
  })

  it("returns valid timezones unchanged and rejects invalid ones", () => {
    expect(normalizeTimezone("Asia/Kolkata")).toBe("Asia/Kolkata")
    expect(normalizeTimezone("Not/AZone")).toBe(DEFAULT_TIMEZONE)
    expect(DateTime.now().setZone(normalizeTimezone("Asia/Kolkata")).isValid).toBe(true)
  })
})
