import { useEffect, useState } from "react"
import { DateTime } from "luxon"
import { normalizeTimezone } from "../lib/timezone"

export function useZonedTime(timezone?: string, locale?: string) {
  const zone = normalizeTimezone(timezone)
  const [now, setNow] = useState(() => DateTime.now().setZone(zone).setLocale(locale ?? "en"))

  useEffect(() => {
    function updateNow() {
      setNow(DateTime.now().setZone(zone).setLocale(locale ?? "en"))
    }

    updateNow()
    const intervalId = window.setInterval(updateNow, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [zone, locale])

  return now
}
