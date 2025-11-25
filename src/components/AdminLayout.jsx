import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { cn } from '../lib/utils'
import {
  LayoutDashboard,
  MapPin,
  CheckCircle,
  Activity,
  LogOut,
  Menu,
  X,
  Home
} from 'lucide-react'
import { Button } from './ui/button'
import { Separator } from './ui/separator'

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  const navItems = [
    {
      title: 'Tất cả điểm cứu trợ',
      icon: MapPin,
      href: '/admin/dashboard',
      badge: null,
    },
    {
      title: 'Chờ xét duyệt',
      icon: CheckCircle,
      href: '/admin/dashboard?tab=unverified',
      badge: null,
    },
    {
      title: 'Activity Logs',
      icon: Activity,
      href: '/admin/activity-logs',
    },
  ]

  const isActive = (href) => {
    if (href.includes('?')) {
      return location.pathname + location.search === href
    }
    return location.pathname === href
  }

  return (
    <div className="admin-layout flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-[hsl(var(--color-card))] border-r border-[hsl(var(--color-border))] flex flex-col transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-64",
          "hidden md:flex"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-[hsl(var(--color-border))]">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))] flex h-8 w-8 items-center justify-center rounded-md">
                  <Home className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">Relief Map</span>
                  <span className="text-xs text-[hsl(var(--color-muted-foreground))]">Quản trị</span>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className={cn("h-8 w-8", collapsed && "mx-auto")}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    active
                      ? "bg-[hsl(var(--color-accent))] text-[hsl(var(--color-accent-foreground))]"
                      : "text-[hsl(var(--color-muted-foreground))] hover:bg-[hsl(var(--color-accent))] hover:text-[hsl(var(--color-accent-foreground))]",
                    collapsed && "justify-center px-2"
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                  {!collapsed && item.badge && (
                    <span className="ml-auto bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))] text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-[hsl(var(--color-border))]">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "w-full justify-start text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-destructive))]",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? "Đăng xuất" : undefined}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="ml-3">Đăng xuất</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[hsl(var(--color-card))] border-r border-[hsl(var(--color-border))] flex flex-col">
            <div className="p-4 border-b border-[hsl(var(--color-border))] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))] flex h-8 w-8 items-center justify-center rounded-md">
                  <Home className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">Relief Map</span>
                  <span className="text-xs text-[hsl(var(--color-muted-foreground))]">Quản trị</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <nav className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        navigate(item.href)
                        setMobileMenuOpen(false)
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        active
                          ? "bg-[hsl(var(--color-accent))] text-[hsl(var(--color-accent-foreground))]"
                          : "text-[hsl(var(--color-muted-foreground))] hover:bg-[hsl(var(--color-accent))] hover:text-[hsl(var(--color-accent-foreground))]"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </button>
                  )
                })}
              </div>
            </nav>

            <div className="p-2 border-t border-[hsl(var(--color-border))]">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-destructive))]"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span className="ml-3">Đăng xuất</span>
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-[hsl(var(--color-card))] border-b border-[hsl(var(--color-border))] p-4 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            className="h-8 w-8"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))] flex h-8 w-8 items-center justify-center rounded-md">
              <Home className="h-5 w-5" />
            </div>
            <span className="font-semibold">Relief Map Admin</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-[hsl(var(--color-background))]">
          {children}
        </main>
      </div>
    </div>
  )
}
