import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useProjectMembers } from '@/hooks/use-projects'

const roleLabels: Record<string, string> = {
  project_admin: '管理员',
  developer: '开发者',
  viewer: '查看者',
}

export function ProjectSettingsPage() {
  const { projectId } = useParams()
  const { data: members = [], isLoading } = useProjectMembers(projectId)

  return (
    <div className="space-y-6">
      <Card className="border-border shadow-sm">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">成员管理</CardTitle>
            <p className="text-sm text-muted-foreground">管理项目成员及其角色权限</p>
          </div>
          <Button>+ 邀请成员</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 rounded-lg bg-muted p-3">
            <Input placeholder="输入同事邮箱..." className="bg-card" />
            <Button variant="outline">Developer</Button>
            <Button variant="ghost">发送邀请</Button>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">加载中...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>头像/姓名</TableHead>
                  <TableHead>邮箱</TableHead>
                  <TableHead>项目角色</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                      暂无项目成员
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-7">
                            <AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
                          </Avatar>
                          {user.name}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{roleLabels[user.role] ?? user.role}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive/30 bg-[#FFF7F7]">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <div className="font-medium text-destructive">删除项目</div>
            <p className="text-sm text-muted-foreground">此操作不可撤销，将永久删除所有任务数据</p>
          </div>
          <Button variant="outline" className="text-destructive">
            删除项目
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
