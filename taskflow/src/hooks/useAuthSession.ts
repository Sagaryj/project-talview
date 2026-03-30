import { useEffect, useState } from "react"
import { AUTH_SESSION_EVENT, getAuthSession, type AuthSession } from "../lib/auth"

export function useAuthSession() {
  const [session, setSession] = useState<AuthSession | null>(() => getAuthSession())

  useEffect(() => {
    function syncSession() {
      setSession(getAuthSession())
    }

    window.addEventListener(AUTH_SESSION_EVENT, syncSession)
    window.addEventListener("storage", syncSession)

    return () => {
      window.removeEventListener(AUTH_SESSION_EVENT, syncSession)
      window.removeEventListener("storage", syncSession)
    }
  }, [])

  return session
}
