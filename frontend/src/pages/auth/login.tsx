import { Navigate } from 'react-router-dom'
import { SignIn, useAuth } from '@clerk/clerk-react'
import { clerkAppearance } from '@/lib/clerk-appearance'

export function LoginPage() {
  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-center bg-card px-16 lg:flex">
        <h1 className="text-4xl font-bold text-primary">协作，从任务开始</h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          连接团队、任务与目标。打造高效的现代化数字工作空间。
        </p>
      </div>

      <div className="flex items-center justify-center bg-background p-6">
        <SignIn
          routing="path"
          path="/login"
          signUpUrl="/register"
          appearance={clerkAppearance}
        />
      </div>
    </div>
  )
}
