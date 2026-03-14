import { NavLink } from "react-router-dom"
import type { Dispatch, SetStateAction } from "react"
import { useIntl } from "react-intl"
import {
  LayoutDashboard,
  FolderKanban,
  Calendar,
  BarChart3,
  Settings,
  User
} from "lucide-react"

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

  const intl = useIntl()

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen
        bg-white border-r border-neutral-200
        dark:bg-neutral-900 dark:border-neutral-800
        transform transition-all duration-300 ease-in-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        ${collapsed ? "md:w-20" : "md:w-64"}
        w-64
        flex flex-col
      `}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between p-4">

        {!collapsed && (
          <span className="text-lg font-semibold tracking-tight dark:text-white">
            TaskFlow
          </span>
        )}

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(prev => !prev)}
          className="hidden md:block text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
        >
          ☰
        </button>

        {/* Mobile Close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
        >
          ✕
        </button>

      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-3 space-y-2">

        <NavItem
          to="/"
          label={intl.formatMessage({ id: "dashboard" })}
          icon={<LayoutDashboard size={18} />}
          collapsed={collapsed}
          onClick={() => setMobileOpen(false)}
        />

        <NavItem
          to="/projects"
          label={intl.formatMessage({ id: "projects" })}
          icon={<FolderKanban size={18} />}
          collapsed={collapsed}
          onClick={() => setMobileOpen(false)}
        />

        <NavItem
          to="/calendar"
          label={intl.formatMessage({ id: "calendar" })}
          icon={<Calendar size={18} />}
          collapsed={collapsed}
          onClick={() => setMobileOpen(false)}
        />

        <NavItem
          to="/analytics"
          label={intl.formatMessage({ id: "analytics" })}
          icon={<BarChart3 size={18} />}
          collapsed={collapsed}
          onClick={() => setMobileOpen(false)}
        />

        <NavItem
          to="/settings"
          label={intl.formatMessage({ id: "settings" })}
          icon={<Settings size={18} />}
          collapsed={collapsed}
          onClick={() => setMobileOpen(false)}
        />

        <NavItem
          to="/profile"
          label={intl.formatMessage({ id: "profile" })}
          icon={<User size={18} />}
          collapsed={collapsed}
          onClick={() => setMobileOpen(false)}
        />

      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500">
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
  onClick,
}: {
  to: string
  label: string
  icon: React.ReactNode
  collapsed: boolean
  onClick?: () => void
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `
        flex items-center gap-3 px-3 py-2 rounded-xl
        transition-all duration-200
        ${
          isActive
            ? "bg-neutral-800 text-white"
            : "text-neutral-500 hover:bg-neutral-200 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
        }
      `
      }
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </NavLink>
  )
}
