import { Link } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-center bg-card px-16 lg:flex">
        <h1 className="text-4xl font-bold text-primary">协作，从任务开始</h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          连接团队、任务与目标。打造高效的现代化数字工作空间。
        </p>
      </div>

      <div className="flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md border-border shadow-sm">
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              F
            </div>
            <CardTitle>登录 Flybook</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" className="pl-9" placeholder="name@company.com" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">密码</Label>
                <button type="button" className="text-sm text-primary">
                  忘记密码?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" className="pl-9" placeholder="输入密码" />
              </div>
            </div>
            <Button className="w-full" render={<Link to="/dashboard" />}>
              登录
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              没有账号?{' '}
              <Link to="/register" className="text-primary">
                立即注册
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
