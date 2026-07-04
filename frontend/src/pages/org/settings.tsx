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
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { mockUsers } from '@/data/mock'

const roleStyles: Record<string, string> = {
  Owner: 'bg-[#E8F7E6] text-[#34C724]',
  Admin: 'bg-[#E8F0FF] text-[#3370FF]',
  Member: 'bg-[#F0F1F3] text-[#646A73]',
  Guest: 'bg-[#FFF3E0] text-[#FF8800]',
}

export function OrgSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">组织设置</h1>
        <p className="text-sm text-muted-foreground">
          管理组织的基本信息、成员及权限设置。
        </p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">成员管理</CardTitle>
          <Button>+ 邀请成员</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="搜索成员姓名或邮箱..." />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>姓名</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead>组织角色</TableHead>
                <TableHead>加入时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsers.map((user, index) => {
                const roles = ['Owner', 'Admin', 'Member']
                const role = roles[index] ?? 'Guest'

                return (
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
                    <TableCell>
                      <Badge variant="secondary" className={roleStyles[role]}>
                        {role}
                      </Badge>
                    </TableCell>
                    <TableCell>2024-03-01</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
