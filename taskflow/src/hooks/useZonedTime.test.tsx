import { render, screen } from "@testing-library/react"
import { DateTime } from "luxon"
import { useZonedTime } from "./useZonedTime"

function ZonedTimeHarness({ timezone, locale }: { timezone?: string; locale?: string }) {
  const value = useZonedTime(timezone, locale)
  return <span>{value.zoneName}::{value.locale}</span>
}

describe("useZonedTime", () => {
  it("returns a luxon DateTime in the requested zone and locale", () => {
    render(<ZonedTimeHarness timezone="Asia/Kolkata" locale="en-GB" />)

    expect(screen.getByText(`Asia/Kolkata::${DateTime.now().setLocale("en-GB").locale}`)).toBeInTheDocument()
  })
})
