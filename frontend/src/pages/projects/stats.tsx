import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const metrics = [
  { label: '总任务', value: '47' },
  { label: '已完成', value: '28', extra: '60%', progress: 60 },
  { label: '逾期任务', value: '3', danger: true },
  { label: '本周新增', value: '8' },
]

export function ProjectStatsPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="border-border shadow-sm">
            <CardContent className="p-5">
              <div className="text-sm text-muted-foreground">{metric.label}</div>
              <div
                className={`mt-2 text-3xl font-semibold ${
                  metric.danger ? 'text-destructive' : ''
                }`}
              >
                {metric.value}
                {metric.extra ? (
                  <span className="ml-2 text-sm font-normal text-[#34C724]">{metric.extra}</span>
                ) : null}
              </div>
              {metric.progress ? <Progress value={metric.progress} className="mt-3" /> : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">任务状态分布</CardTitle>
          </CardHeader>
          <CardContent className="h-56 flex items-center justify-center text-sm text-muted-foreground">
            图表区域（后续接入 Recharts）
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">优先级分布</CardTitle>
          </CardHeader>
          <CardContent className="h-56 flex items-center justify-center text-sm text-muted-foreground">
            图表区域（后续接入 Recharts）
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
