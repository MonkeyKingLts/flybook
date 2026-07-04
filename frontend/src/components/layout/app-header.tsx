import { Bell, ChevronDown, Search } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { currentOrg, currentUser } from '@/data/mock'

export function AppHeader() {
  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-6 shadow-sm">
      <Button variant="outline" className="gap-2">
        {currentOrg.name}
        <ChevronDown className="size-4 text-muted-foreground" />
      </Button>

      <div className="relative mx-auto w-full max-w-md">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="bg-muted pl-9" placeholder="搜索任务、项目..." />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-destructive" />
        </Button>
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {currentUser.name.slice(0, 1)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
