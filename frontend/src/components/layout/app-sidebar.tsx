import { Link, useLocation } from 'react-router-dom'
import {
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: '工作台', href: '/dashboard', icon: LayoutDashboard },
  { label: '我的任务', href: '/my-tasks', icon: ListTodo },
  { label: '项目', href: '/projects', icon: FolderKanban },
  { label: '组织设置', href: '/org/settings', icon: Settings },
]

export function AppSidebar() {
  const { pathname } = useLocation()

  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
          F
        </div>
        <div>
          <div className="text-sm font-semibold">Flybook</div>
          <div className="text-xs text-muted-foreground">Productivity</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'relative flex h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors',
                active
                  ? 'bg-accent font-medium text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {active ? (
                <span className="absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r bg-primary" />
              ) : null}
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
