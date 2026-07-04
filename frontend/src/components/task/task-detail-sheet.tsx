import { useState, type ReactNode } from 'react'
import {
  Calendar,
  FolderKanban,
  MessageSquare,
  MoreHorizontal,
  Send,
  User,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge } from '@/components/task/task-badges'
import { useTasks } from '@/contexts/task-context'
import { KANBAN_COLUMNS, PRIORITY_LABELS, STATUS_LABELS } from '@/lib/constants'
import type { TaskStatus } from '@/types'

export function TaskDetailSheet() {
  const { selectedTask, closeTask, updateTask, updateTaskStatus } = useTasks()
  const [comment, setComment] = useState('')

  const handleStatusChange = (status: TaskStatus) => {
    if (selectedTask && status !== selectedTask.status) {
      updateTaskStatus(selectedTask.id, status)
    }
  }

  return (
    <Sheet open={Boolean(selectedTask)} onOpenChange={(open) => !open && closeTask()}>
      {selectedTask ? (
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-[520px]">
        <SheetHeader className="space-y-4 border-b border-border p-5">
          <div className="flex items-center justify-between pr-8">
            <Select
              value={selectedTask.status}
              onValueChange={(value) => value && handleStatusChange(value as TaskStatus)}
            >
              <SelectTrigger className="h-8 w-auto gap-2 border-0 bg-transparent px-0 shadow-none">
                <StatusBadge status={selectedTask.status} />
              </SelectTrigger>
              <SelectContent>
                {KANBAN_COLUMNS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="size-4" />
            </Button>
          </div>

          <div className="space-y-2 text-left">
            <SheetTitle className="text-lg leading-7">{selectedTask.title}</SheetTitle>
            <p className="text-xs text-muted-foreground">
              {selectedTask.key} · 创建于 {selectedTask.createdAt ?? '3月1日'}
            </p>
          </div>
        </SheetHeader>

        <div className="space-y-5 p-5">
          <div className="space-y-3">
            <PropertyRow
              icon={User}
              label="负责人"
              value={
                selectedTask.assignee ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6">
                      <AvatarFallback className="text-[10px]">
                        {selectedTask.assignee.name.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    {selectedTask.assignee.name}
                  </div>
                ) : (
                  '未分配'
                )
              }
            />
            <PropertyRow
              icon={FolderKanban}
              label="优先级"
              value={
                <Badge variant="secondary" className="font-normal">
                  {PRIORITY_LABELS[selectedTask.priority]}
                </Badge>
              }
            />
            <PropertyRow
              icon={Calendar}
              label="截止日期"
              value={selectedTask.dueDate ?? '未设置'}
            />
            <PropertyRow
              icon={FolderKanban}
              label="项目"
              value={
                <button type="button" className="text-primary hover:underline">
                  {selectedTask.projectName}
                </button>
              }
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="text-sm font-medium">描述</div>
            <Textarea
              defaultValue={selectedTask.description}
              placeholder="添加任务描述..."
              className="min-h-28 resize-none bg-muted/40"
              onBlur={(event) =>
                updateTask(selectedTask.id, { description: event.target.value })
              }
            />
          </div>

          <Tabs defaultValue="activity">
            <TabsList>
              <TabsTrigger value="activity">活动</TabsTrigger>
              <TabsTrigger value="comments">
                评论 {selectedTask.commentCount ? selectedTask.commentCount : ''}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="activity" className="space-y-3 pt-3">
              <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                张三 将状态由 <strong className="text-foreground">待办</strong> 改为{' '}
                <strong className="text-foreground">进行中</strong>
                <div className="mt-1 text-xs">2小时前</div>
              </div>
            </TabsContent>
            <TabsContent value="comments" className="space-y-3 pt-3">
              <div className="rounded-lg border border-border p-3">
                <div className="mb-2 flex items-center gap-2 text-sm">
                  <Avatar className="size-6">
                    <AvatarFallback className="text-[10px]">李</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">李四</span>
                  <span className="text-xs text-muted-foreground">1小时前</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  @王五 请看一下初步的设计稿，主要是想确认一下第三方登录的排列顺序。
                </p>
                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageSquare className="size-3.5" />
                  1
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="sticky bottom-0 border-t border-border bg-card p-4">
          <div className="flex gap-2">
            <Input
              placeholder="添加评论..."
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
            <Button size="icon" disabled={!comment.trim()}>
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
      ) : null}
    </Sheet>
  )
}

function PropertyRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User
  label: string
  value: ReactNode
}) {
  return (
    <div className="grid grid-cols-[80px_1fr] items-center gap-3 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </div>
      <div>{value}</div>
    </div>
  )
}
