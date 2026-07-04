import { useState, type ReactNode } from 'react'
import {
  Calendar,
  FolderKanban,
  MessageSquare,
  MoreHorizontal,
  Send,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
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
import { useCreateComment, useTaskComments } from '@/hooks/use-projects'
import { KANBAN_COLUMNS, PRIORITY_LABELS, STATUS_LABELS } from '@/lib/constants'
import type { TaskStatus } from '@/types'

function formatCommentTime(iso: string) {
  const date = new Date(iso)
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  return `${days}天前`
}

export function TaskDetailSheet() {
  const { selectedTask, closeTask, updateTask, updateTaskStatus } = useTasks()
  const { data: comments = [], isLoading: commentsLoading } = useTaskComments(selectedTask?.id)
  const createComment = useCreateComment()
  const [comment, setComment] = useState('')

  const handleStatusChange = (status: TaskStatus) => {
    if (selectedTask && status !== selectedTask.status) {
      updateTaskStatus(selectedTask.id, status)
    }
  }

  const handleSendComment = () => {
    const content = comment.trim()
    if (!selectedTask || !content) return

    createComment.mutate(
      { taskId: selectedTask.id, content },
      {
        onSuccess: () => {
          setComment('')
          toast.success('评论已添加')
        },
        onError: () => {
          toast.error('评论发送失败')
        },
      },
    )
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
              {selectedTask.key} · 创建于 {selectedTask.createdAt ?? '-'}
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
                <span className="text-primary">{selectedTask.projectName}</span>
              }
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="text-sm font-medium">描述</div>
            <Textarea
              key={selectedTask.id}
              defaultValue={selectedTask.description}
              placeholder="添加任务描述..."
              className="min-h-28 resize-none bg-muted/40"
              onBlur={(event) => {
                const value = event.target.value
                if (value !== (selectedTask.description ?? '')) {
                  updateTask(selectedTask.id, { description: value })
                }
              }}
            />
          </div>

          <Tabs defaultValue="comments">
            <TabsList>
              <TabsTrigger value="activity">活动</TabsTrigger>
              <TabsTrigger value="comments">
                评论 {comments.length > 0 ? comments.length : ''}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="activity" className="space-y-3 pt-3">
              <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                状态变更记录功能即将上线
              </div>
            </TabsContent>
            <TabsContent value="comments" className="space-y-3 pt-3">
              {commentsLoading ? (
                <div className="text-sm text-muted-foreground">加载评论...</div>
              ) : comments.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  暂无评论，来发表第一条吧
                </div>
              ) : (
                comments.map((item) => (
                  <div key={item.id} className="rounded-lg border border-border p-3">
                    <div className="mb-2 flex items-center gap-2 text-sm">
                      <Avatar className="size-6">
                        <AvatarFallback className="text-[10px]">
                          {item.author.name.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{item.author.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatCommentTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.content}</p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare className="size-3.5" />
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="sticky bottom-0 border-t border-border bg-card p-4">
          <div className="flex gap-2">
            <Input
              placeholder="添加评论..."
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  handleSendComment()
                }
              }}
            />
            <Button
              size="icon"
              disabled={!comment.trim() || createComment.isPending}
              onClick={handleSendComment}
            >
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
