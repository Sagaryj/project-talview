import { createBrowserRouter } from "react-router-dom"
import Profile from "../pages/Profile"
import AppLayout from "../layouts/AppLayout"

import Dashboard from "../pages/Dashboard"
import Projects from "../pages/Projects"
import Calendar from "../pages/Calendar"
import Analytics from "../pages/Analytics"
import Settings from "../pages/Settings"

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <Dashboard /> },
      { path: "/projects", element: <Projects /> },
      { path: "/calendar", element: <Calendar /> },
      { path: "/analytics", element: <Analytics /> },
      { path: "/settings", element: <Settings /> },
      { path: "/profile", element: <Profile /> }
    ]
  }
])