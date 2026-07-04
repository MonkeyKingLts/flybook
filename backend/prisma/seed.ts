import { PrismaClient, TaskPriority, TaskStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const org = await prisma.organization.upsert({
    where: { slug: 'xingchen-tech' },
    create: {
      name: '星辰科技',
      slug: 'xingchen-tech',
      clerkOrgId: 'org_seed_demo',
    },
    update: {},
  })

  const users = await Promise.all(
    [
      { clerkId: 'user_seed_1', email: 'zhangsan@flybook.com', name: '张三' },
      { clerkId: 'user_seed_2', email: 'lisi@flybook.com', name: '李四' },
      { clerkId: 'user_seed_3', email: 'wangwu@flybook.com', name: '王五' },
    ].map((u) =>
      prisma.user.upsert({
        where: { clerkId: u.clerkId },
        create: u,
        update: { name: u.name, email: u.email },
      }),
    ),
  )

  for (const [index, user] of users.entries()) {
    await prisma.organizationMember.upsert({
      where: {
        organizationId_userId: { organizationId: org.id, userId: user.id },
      },
      create: {
        organizationId: org.id,
        userId: user.id,
        role: index === 0 ? 'OWNER' : index === 1 ? 'ADMIN' : 'MEMBER',
      },
      update: {},
    })
  }

  const project = await prisma.project.upsert({
    where: { organizationId_key: { organizationId: org.id, key: 'FB' } },
    create: {
      organizationId: org.id,
      name: '飞书迁移',
      key: 'FB',
      description: '致力于提升团队内部沟通与任务流转效率',
    },
    update: {},
  })

  for (const user of users) {
    await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId: project.id, userId: user.id } },
      create: { projectId: project.id, userId: user.id, role: 'DEVELOPER' },
      update: {},
    })
  }

  const seedTasks = [
    {
      number: 12,
      title: '完成登录页 UI 设计',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      assigneeId: users[0].id,
    },
    {
      number: 13,
      title: '后端 API 接口数据结构联调',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      assigneeId: users[1].id,
    },
    {
      number: 14,
      title: '完成官网首页 UI 设计与视觉规范统一定义',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      assigneeId: users[0].id,
    },
    {
      number: 15,
      title: '看板拖拽交互开发与状态流转联调',
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.HIGH,
      assigneeId: users[2].id,
    },
    {
      number: 16,
      title: '组织成员权限模型梳理',
      status: TaskStatus.DONE,
      priority: TaskPriority.MEDIUM,
      assigneeId: users[0].id,
    },
  ]

  for (const task of seedTasks) {
    await prisma.task.upsert({
      where: { projectId_number: { projectId: project.id, number: task.number } },
      create: {
        organizationId: org.id,
        projectId: project.id,
        ...task,
        dueDate: new Date('2026-03-15'),
      },
      update: {
        title: task.title,
        status: task.status,
        priority: task.priority,
        assigneeId: task.assigneeId,
      },
    })
  }

  console.log('Seed completed.')
  console.log(`Organization: ${org.name} (${org.id})`)
  console.log(`Project: ${project.name} (${project.id})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
