import { IntlProvider } from "react-intl"
import type { ReactNode } from "react"

import en from "./en"
import es from "./es"
import fr from "./fr"
import de from "./de"
import hi from "./hi"
import ja from "./ja"

const messages: Record<string, Record<string, string>> = {
  en,
  es,
  fr,
  de,
  hi,
  ja
}

interface Props {
  children: ReactNode
}

export default function IntlProviderWrapper({ children }: Props) {

  const language = localStorage.getItem("app-language") || "en"

  return (
    <IntlProvider
      locale={language}
      messages={messages[language]}
    >
      {children}
    </IntlProvider>
  )
}