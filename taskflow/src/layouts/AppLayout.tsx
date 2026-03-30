import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"
import CommandPalette from "../components/CommandPalette"
import { motion, AnimatePresence } from "framer-motion"
import { getAuthSession } from "../lib/auth"

export default function AppLayout() {

  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)

  const location = useLocation()

  /* CTRL + K LISTENER */

  useEffect(() => {

    function handleShortcut(e: KeyboardEvent) {

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setCommandOpen(prev => !prev)
      }

    }

    window.addEventListener("keydown", handleShortcut)

    return () => {
      window.removeEventListener("keydown", handleShortcut)
    }

  }, [])

  if (!getAuthSession()) {
    return <Navigate to="/login" replace />
  }

  return (

    <div className="flex min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors duration-300">

      {/* SIDEBAR */}

      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        setCollapsed={setCollapsed}
        setMobileOpen={setMobileOpen}
      />

      {/* COMMAND PALETTE */}

      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
      />

      {/* MAIN AREA */}

      <div
        className={`
          flex flex-col flex-1 transition-all duration-300
          ${collapsed ? "md:ml-20" : "md:ml-64"}
        `}
      >

        {/* TOPBAR */}

        <Topbar
          toggleDesktop={() => setCollapsed(prev => !prev)}
          toggleMobile={() => setMobileOpen(prev => !prev)}
          openCommand={() => setCommandOpen(true)}
        />

        {/* PAGE CONTENT */}

        <main className="flex-1 p-8 bg-neutral-100 dark:bg-neutral-950 transition-colors duration-300">

          <div
            className="
              h-full rounded-2xl 
              bg-white border border-neutral-200 
              dark:bg-neutral-900 dark:border-neutral-800 
              p-6 shadow-xl
              transition-colors duration-300
            "
          >

            <AnimatePresence mode="wait">

              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <Outlet />
              </motion.div>

            </AnimatePresence>

          </div>

        </main>

      </div>

    </div>

  )
}
