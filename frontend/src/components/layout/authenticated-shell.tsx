import { AppShell } from '@/components/layout/app-shell'
import { SessionProvider } from '@/contexts/session-context'

export function AuthenticatedShell() {
  return (
    <SessionProvider>
      <AppShell />
    </SessionProvider>
  )
}
