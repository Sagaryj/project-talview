import { createBrowserRouter } from "react-router-dom"
import AppLayout from "../layouts/AppLayout"
import Dashboard from "../pages/Dashboard"
import Projects from "../pages/Projects"

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <Dashboard /> },
      { path: "/projects", element: <Projects /> },
    ],
  },
])