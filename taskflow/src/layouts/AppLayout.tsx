import { Outlet, useLocation } from "react-router-dom"
import { useState } from "react"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"
import CommandPalette from "../components/CommandPalette"
import { motion, AnimatePresence } from "framer-motion"

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)

  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors duration-300">
      
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        setCollapsed={setCollapsed}
        setMobileOpen={setMobileOpen}
      />

      <CommandPalette open={commandOpen} setOpen={setCommandOpen} />

      <div
        className={`
          flex flex-col flex-1 transition-all duration-300
          ${collapsed ? "md:ml-20" : "md:ml-64"}
        `}
      >
<Topbar
  toggleDesktop={() => setCollapsed(prev => !prev)}
  toggleMobile={() => setMobileOpen(prev => !prev)}
  openCommand={() => setCommandOpen(true)}
/>

        <main className="flex-1 p-8 bg-neutral-100 dark:bg-neutral-950 transition-colors duration-300">
          <div className="
            h-full rounded-2xl 
            bg-white border border-neutral-200 
            dark:bg-neutral-900 dark:border-neutral-800 
            p-6 shadow-xl
            transition-colors duration-300
          ">
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