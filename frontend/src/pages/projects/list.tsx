import { useParams } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { PriorityBadge, StatusBadge } from '@/components/task/task-badges'
import { useTasks } from '@/contexts/task-context'

export function ProjectListPage() {
  const { projectId = '1' } = useParams()
  const { getProjectTasks, openTask, isLoading } = useTasks()
  const tasks = getProjectTasks(projectId)

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        加载任务中...
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
        暂无任务
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-10" />
            <TableHead>标题</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>负责人</TableHead>
            <TableHead>优先级</TableHead>
            <TableHead>截止日期</TableHead>
            <TableHead>更新时间</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow
              key={task.id}
              className="cursor-pointer"
              onClick={() => openTask(task.id)}
            >
              <TableCell onClick={(event) => event.stopPropagation()}>
                <Checkbox />
              </TableCell>
              <TableCell>
                <div className="text-xs text-muted-foreground">{task.key}</div>
                <div className="font-medium">{task.title}</div>
              </TableCell>
              <TableCell>
                <StatusBadge status={task.status} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {task.assignee ? (
                    <>
                      <Avatar className="size-6">
                        <AvatarFallback className="text-[10px]">
                          {task.assignee.name.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      {task.assignee.name}
                    </>
                  ) : (
                    '未分配'
                  )}
                </div>
              </TableCell>
              <TableCell>
                <PriorityBadge priority={task.priority} />
              </TableCell>
              <TableCell className={task.dueDate === '昨天' ? 'text-destructive' : ''}>
                {task.dueDate}
              </TableCell>
              <TableCell>{task.updatedAt}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
