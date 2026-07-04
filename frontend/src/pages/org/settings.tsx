import { useMemo, useState } from 'react'
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
import { useOrgMembers } from '@/hooks/use-projects'

const roleStyles: Record<string, string> = {
  owner: 'bg-[#E8F7E6] text-[#34C724]',
  admin: 'bg-[#E8F0FF] text-[#3370FF]',
  member: 'bg-[#F0F1F3] text-[#646A73]',
  guest: 'bg-[#FFF3E0] text-[#FF8800]',
}

const roleLabels: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
  guest: 'Guest',
}

export function OrgSettingsPage() {
  const { data: members = [], isLoading } = useOrgMembers()
  const [keyword, setKeyword] = useState('')

  const filteredMembers = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    if (!q) return members
    return members.filter(
      (member) =>
        member.name.toLowerCase().includes(q) || member.email.toLowerCase().includes(q),
    )
  }, [members, keyword])

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
          <Input
            placeholder="搜索成员姓名或邮箱..."
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          {isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">加载中...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>姓名</TableHead>
                  <TableHead>邮箱</TableHead>
                  <TableHead>组织角色</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                      暂无成员
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((user) => {
                    const role = user.role.toLowerCase()

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
                          <Badge variant="secondary" className={roleStyles[role] ?? roleStyles.member}>
                            {roleLabels[role] ?? role}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
