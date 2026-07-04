import { Navigate } from 'react-router-dom'
import {
  CreateOrganization,
  OrganizationList,
  useOrganization,
} from '@clerk/clerk-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { clerkAppearance } from '@/lib/clerk-appearance'

export function SelectOrgPage() {
  const { organization, isLoaded } = useOrganization()

  if (isLoaded && organization) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-lg border-border shadow-sm">
        <CardHeader>
          <CardTitle>选择或创建组织</CardTitle>
          <p className="text-sm text-muted-foreground">
            Flybook 是团队协作工具，请先加入一个组织空间。
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <OrganizationList
            hidePersonal
            afterSelectOrganizationUrl="/dashboard"
            afterCreateOrganizationUrl="/dashboard"
            appearance={clerkAppearance}
          />
          <div className="border-t border-border pt-4">
            <p className="mb-3 text-sm text-muted-foreground">或创建新组织</p>
            <CreateOrganization
              afterCreateOrganizationUrl="/dashboard"
              appearance={clerkAppearance}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
