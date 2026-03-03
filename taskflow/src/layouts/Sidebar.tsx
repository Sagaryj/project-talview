import { NavLink } from "react-router-dom"
import type { Dispatch, SetStateAction } from "react"
import { LayoutDashboard, FolderKanban } from "lucide-react"

interface SidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  setCollapsed: Dispatch<SetStateAction<boolean>>
  setMobileOpen: Dispatch<SetStateAction<boolean>>
}

export default function Sidebar({
  collapsed,
  mobileOpen,
  setCollapsed,
  setMobileOpen,
}: SidebarProps) {
  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen
        bg-white border-r border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 backdrop-blur-xl
        transform transition-all duration-300 ease-in-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        ${collapsed ? "md:w-20" : "md:w-64"}
        w-64
        flex flex-col
      `}
    >
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <span className="text-lg font-semibold tracking-tight">
            TaskFlow
          </span>
        )}

        <button
          onClick={() => setCollapsed(prev => !prev)}
          className="hidden md:block text-neutral-400 hover:text-white"
        >
          ☰
        </button>

        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden text-neutral-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-2">
        <NavItem
          to="/"
          label="Dashboard"
          icon={<LayoutDashboard size={18} />}
          collapsed={collapsed}
        />
        <NavItem
          to="/projects"
          label="Projects"
          icon={<FolderKanban size={18} />}
          collapsed={collapsed}
        />
      </nav>

      <div className="p-4 border-t border-neutral-800 text-xs text-neutral-500">
        {!collapsed && "v1.0.0"}
      </div>
    </aside>
  )
}

function NavItem({
  to,
  label,
  icon,
  collapsed,
}: {
  to: string
  label: string
  icon: React.ReactNode
  collapsed: boolean
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `
        flex items-center gap-3 px-3 py-2 rounded-xl
        transition-all duration-200
        ${
          isActive
            ? "bg-neutral-800 text-white"
            : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
        }
      `
      }
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </NavLink>
  )
}