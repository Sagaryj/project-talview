import { Search, Sun, Moon, LogOut, KeyRound, HelpCircle } from "lucide-react"
import { useTheme } from "../hooks/useTheme"
import { useState, useRef, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import type {ReactNode} from "react"
interface TopbarProps {
  toggleDesktop: () => void
  toggleMobile: () => void
  openCommand: () => void
}

export default function Topbar({
  toggleDesktop,
  toggleMobile,
  openCommand,
}: TopbarProps) {

  const { theme, setTheme } = useTheme()

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <header
      className="
        h-16 flex items-center justify-between px-6
        border-b border-neutral-200
        dark:border-neutral-800
        bg-white dark:bg-neutral-900
        transition-colors duration-300
      "
    >

      {/* LEFT SIDE */}
      <div className="flex items-center gap-4">

        <button
          onClick={toggleMobile}
          className="md:hidden text-neutral-500 hover:text-black dark:hover:text-white transition"
        >
          ☰
        </button>

        <button
          onClick={toggleDesktop}
          className="hidden md:block text-neutral-500 hover:text-black dark:hover:text-white transition"
        >
          ☰
        </button>

        <span className="text-sm text-neutral-600 dark:text-neutral-300">
          Welcome back 👋
        </span>

      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">

        {/* Search Button */}
        <button
          onClick={openCommand}
          className="
            flex items-center gap-2
            px-3 py-2 rounded-lg
            bg-neutral-100 dark:bg-neutral-800
            hover:bg-neutral-200 dark:hover:bg-neutral-700
            text-neutral-700 dark:text-neutral-200
            transition
          "
        >
          <Search size={16} />
          <span className="hidden sm:inline text-sm">Search</span>
          <span className="hidden sm:inline text-xs opacity-50">
            ⌘K
          </span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() =>
            setTheme(theme === "dark" ? "light" : "dark")
          }
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          {theme === "dark" ? (
            <Sun size={18} />
          ) : (
            <Moon size={18} />
          )}
        </button>

        {/* Avatar + Dropdown */}
        <div className="relative" ref={menuRef}>

          <button
            onClick={() => setMenuOpen(prev => !prev)}
            className="
              w-9 h-9
              rounded-full
              bg-gradient-to-br
              from-indigo-500
              to-purple-500
              hover:scale-105
              transition
            "
          />

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                className="
                  absolute right-0 mt-3 w-48
                  bg-white dark:bg-neutral-900
                  border border-neutral-200 dark:border-neutral-800
                  rounded-xl shadow-xl
                  p-2 space-y-1
                  z-50
                "
              >

                <MenuItem icon={<KeyRound size={16} />}>
                  Change Password
                </MenuItem>

                <MenuItem icon={<HelpCircle size={16} />}>
                  FAQs
                </MenuItem>

                <div className="border-t border-neutral-200 dark:border-neutral-800 my-2" />

                <MenuItem icon={<LogOut size={16} />}>
                  Logout
                </MenuItem>

              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </header>
  )
}

interface MenuItemProps {
  icon: ReactNode
  children: ReactNode
}

function MenuItem({ icon, children }: MenuItemProps) {
  return (
    <button
      className="
        flex items-center gap-3
        w-full px-3 py-2
        text-sm rounded-lg
        text-neutral-700 dark:text-neutral-200
        hover:bg-neutral-100 dark:hover:bg-neutral-800
        transition
      "
    >
      {icon}
      {children}
    </button>
  )
}