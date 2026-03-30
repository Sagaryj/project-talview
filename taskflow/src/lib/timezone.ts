import { DateTime } from "luxon"

export const DEFAULT_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"

export function getAvailableTimezones() {
  if (typeof Intl.supportedValuesOf === "function") {
    return Intl.supportedValuesOf("timeZone")
  }

  return [
    "UTC",
    "Asia/Kolkata",
    "Europe/London",
    "America/New_York",
    "America/Los_Angeles",
    "Asia/Tokyo",
    "Australia/Sydney"
  ]
}

export function normalizeTimezone(timezone?: string | null) {
  if (!timezone) return DEFAULT_TIMEZONE

  const candidate = DateTime.now().setZone(timezone)
  return candidate.isValid ? timezone : DEFAULT_TIMEZONE
}
