import { StrictMode } from "react"
import { ApolloProvider } from "@apollo/client/react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import { ToastProvider } from "./components/ToastProvider"
import { router } from "./app/router"
import  I18nProvider  from "./i18n/provider"
import "./index.css"
import { apolloClient } from "./lib/apollo"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <I18nProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </I18nProvider>
    </ApolloProvider>
  </StrictMode>
)
