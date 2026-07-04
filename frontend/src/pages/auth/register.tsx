import { Link } from 'react-router-dom'
import { Building2, Lock, Mail, RefreshCw, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function RegisterPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-center bg-card px-16 lg:flex">
        <h1 className="text-4xl font-bold">协作，从任务开始</h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          连接您的团队、任务和工具，在一个纯粹、高效的工作空间中实现目标。
        </p>
      </div>

      <div className="flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md border-border shadow-sm">
          <CardHeader>
            <CardTitle>创建新账号</CardTitle>
            <p className="text-sm text-muted-foreground">加入 Flybook，开启高效协作之旅</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: 'name', label: '用户名', icon: User, placeholder: '输入您的显示名称' },
              { id: 'email', label: '邮箱', icon: Mail, placeholder: 'name@company.com' },
              { id: 'password', label: '密码', icon: Lock, placeholder: '设置8位以上复杂密码' },
              { id: 'confirm', label: '确认密码', icon: RefreshCw, placeholder: '再次输入密码' },
            ].map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>{field.label}</Label>
                <div className="relative">
                  <field.icon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id={field.id} className="pl-9" placeholder={field.placeholder} />
                </div>
              </div>
            ))}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="org">组织名称</Label>
                <span className="text-xs text-muted-foreground">选填</span>
              </div>
              <div className="relative">
                <Building2 className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="org" className="pl-9" placeholder="创建你的团队空间" />
              </div>
            </div>
            <Button className="w-full" render={<Link to="/dashboard" />}>
              注册
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              已有账号?{' '}
              <Link to="/login" className="text-primary">
                去登录
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
