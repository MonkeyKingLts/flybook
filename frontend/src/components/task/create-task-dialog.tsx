import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { mockUsers } from '@/data/mock'
import { useTasks } from '@/contexts/task-context'
import { KANBAN_COLUMNS, PRIORITY_LABELS, STATUS_LABELS } from '@/lib/constants'
import type { TaskPriority, TaskStatus } from '@/types'
import { cn } from '@/lib/utils'

interface CreateTaskDialogProps {
  projectId: string
  projectName: string
}

export function CreateTaskDialog({ projectId, projectName }: CreateTaskDialogProps) {
  const {
    createDialogOpen,
    createDefaultStatus,
    closeCreateDialog,
    createTask,
  } = useTasks()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [assigneeId, setAssigneeId] = useState<string>('1')
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    if (createDialogOpen) {
      setStatus(createDefaultStatus)
      setTitle('')
      setDescription('')
      setPriority('medium')
      setAssigneeId('1')
      setDueDate('')
    }
  }, [createDialogOpen, createDefaultStatus])

  const handleSubmit = () => {
    if (!title.trim()) return

    createTask({
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      projectId,
      projectName,
      assigneeId,
      dueDate: dueDate || undefined,
    })
  }

  return (
    <Dialog open={createDialogOpen} onOpenChange={(open) => !open && closeCreateDialog()}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[520px]">
        <DialogHeader className="border-b border-border p-5">
          <DialogTitle>新建任务</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 p-5">
          <div className="space-y-2">
            <Label htmlFor="task-title">
              标题 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="task-title"
              placeholder="输入任务标题..."
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">描述</Label>
            <Textarea
              id="task-description"
              placeholder="添加任务描述详细信息..."
              className="min-h-24 resize-none"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>状态</Label>
              <Select
                value={status}
                onValueChange={(value) => value && setStatus(value as TaskStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KANBAN_COLUMNS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {STATUS_LABELS[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>负责人</Label>
              <Select
                value={assigneeId}
                onValueChange={(value) => {
                  if (value) setAssigneeId(value)
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>优先级</Label>
            <div className="flex gap-2">
              {(['high', 'medium', 'low'] as TaskPriority[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPriority(item)}
                  className={cn(
                    'flex-1 rounded-md border px-3 py-2 text-sm transition-colors',
                    priority === item
                      ? 'border-primary bg-accent text-primary'
                      : 'border-border text-muted-foreground hover:bg-muted',
                  )}
                >
                  {PRIORITY_LABELS[item]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-due-date">截止日期</Label>
            <Input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="border-t border-border bg-muted/30 p-4">
          <Button variant="outline" onClick={closeCreateDialog}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            创建任务
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
