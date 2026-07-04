import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useOrganization } from '@clerk/clerk-react'

export function RequireOrg() {
  const { isLoaded, organization } = useOrganization()
  const location = useLocation()

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        加载中...
      </div>
    )
  }

  if (!organization) {
    return <Navigate to="/select-org" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
