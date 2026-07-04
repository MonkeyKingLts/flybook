import { OrganizationSwitcher, UserButton } from '@clerk/clerk-react'
import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { clerkAppearance } from '@/lib/clerk-appearance'

export function AppHeader() {
  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-6 shadow-sm">
      <OrganizationSwitcher
        hidePersonal
        afterSelectOrganizationUrl="/dashboard"
        afterCreateOrganizationUrl="/dashboard"
        appearance={{
          ...clerkAppearance,
          elements: {
            ...clerkAppearance.elements,
            organizationSwitcherTrigger:
              'border border-[#E5E6EB] rounded-md px-3 py-1.5 text-sm',
          },
        }}
      />

      <div className="relative mx-auto w-full max-w-md">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="bg-muted pl-9" placeholder="搜索任务、项目..." />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-destructive" />
        </Button>
        <UserButton
          afterSignOutUrl="/login"
          appearance={{
            elements: {
              avatarBox: 'size-8',
            },
          }}
        />
      </div>
    </header>
  )
}
