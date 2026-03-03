import { createBrowserRouter } from "react-router-dom"
import AppLayout from "@/layouts/AppLayout"

const Dashboard = () => (
  <div className="p-8 text-white">Dashboard</div>
)

const Projects = () => (
  <div className="p-8 text-white">Projects</div>
)

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <Dashboard /> },
      { path: "/projects", element: <Projects /> },
    ],
  },
])