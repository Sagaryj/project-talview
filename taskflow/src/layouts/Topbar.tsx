import { Search, Sun, Moon } from "lucide-react"
import { useTheme } from "../hooks/useTheme"

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
        
        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobile}
          className="md:hidden text-neutral-500 hover:text-black dark:hover:text-white transition"
        >
          ☰
        </button>

        {/* Desktop Collapse Button */}
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

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
      </div>
    </header>
  )
}