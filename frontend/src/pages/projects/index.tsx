import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useProjects } from '@/hooks/use-projects'

export function ProjectsPage() {
  const { data: projects = [], isLoading } = useProjects()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">项目</h1>
        <Button>
          <Plus className="size-4" />
          新建项目
        </Button>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">加载中...</div>
      ) : projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          暂无项目，点击右上角创建第一个项目
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}/board`}>
              <Card className="border-border shadow-sm transition-colors hover:border-primary/40">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{project.name}</div>
                      <div className="mt-1 inline-flex rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {project.key}
                      </div>
                    </div>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {project.description}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    待办 {project.todoCount} · 进行中 {project.inProgressCount} · 已完成{' '}
                    {project.doneCount}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {project.members.map((member) => (
                        <Avatar key={member.id} className="size-7 border-2 border-card">
                          <AvatarFallback className="text-xs">
                            {member.name.slice(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{project.updatedAt}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
