import { useState } from 'react'
import { toast } from 'sonner'
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
import { Textarea } from '@/components/ui/textarea'
import { useCreateProject } from '@/hooks/use-projects'

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const createProject = useCreateProject()
  const [name, setName] = useState('')
  const [key, setKey] = useState('')
  const [description, setDescription] = useState('')

  const reset = () => {
    setName('')
    setKey('')
    setDescription('')
  }

  const handleSubmit = () => {
    if (!name.trim() || !key.trim()) return

    createProject.mutate(
      {
        name: name.trim(),
        key: key.trim().toUpperCase(),
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success('项目已创建')
          reset()
          onOpenChange(false)
        },
        onError: () => {
          toast.error('项目创建失败，请检查 Key 是否重复')
        },
      },
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>新建项目</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">项目名称</Label>
            <Input
              id="project-name"
              placeholder="例如：飞书迁移"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-key">项目 Key</Label>
            <Input
              id="project-key"
              placeholder="2-5 位大写字母，如 FB"
              value={key}
              onChange={(event) => setKey(event.target.value.toUpperCase())}
              maxLength={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-desc">项目描述</Label>
            <Textarea
              id="project-desc"
              placeholder="简要描述项目目标..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-20 resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || !key.trim() || createProject.isPending}
          >
            创建
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
