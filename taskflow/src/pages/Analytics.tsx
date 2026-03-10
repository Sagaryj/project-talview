import { useKanban } from "../features/kanban/useKanban"
import StatusChart from "../components/charts/StatusChart"
import PriorityChart from "../components/charts/PriorityChart"
import WeeklyChart from "../components/charts/WeeklyChart"
import TagChart from "../components/charts/TagChart"
import AgingChart from "../components/charts/AgingChart"
import CreatedVsCompletedChart from "../components/charts/CreatedVsCompletedChart"
import type { ReactNode } from "react"


interface CardProps {
  title: string
  children: ReactNode
}
interface StatProps {
  title: string
  value: number | string
}
export default function Analytics() {

  const { tasks } = useKanban()

  const completed = tasks.filter(t => t.status === "done").length
  const productivity = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0

  return (
    <div className="space-y-8">


      <div>
        <h1 className="text-2xl font-bold dark:text-white">
          Analytics
        </h1>

        <p className="text-neutral-500 text-sm">
          Advanced productivity insights
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-6">

        <Stat title="Total Tasks" value={tasks.length}/>
        <Stat title="Completed Tasks" value={completed}/>
        <Stat title="Productivity Score" value={`${productivity}%`}/>

      </div>

      {/* Row 1 */}
      <div className="grid md:grid-cols-2 gap-6">

        <Card title="Task Status Breakdown">
          <StatusChart tasks={tasks}/>
        </Card>

        <Card title="Priority Distribution">
          <PriorityChart tasks={tasks}/>
        </Card>

      </div>

      {/* Row 2 */}
      <div className="grid md:grid-cols-2 gap-6">

        <Card title="Tasks Completed Per Week">
          <WeeklyChart tasks={tasks}/>
        </Card>

        <Card title="Tag Distribution">
          <TagChart tasks={tasks}/>
        </Card>

      </div>

      {/* Row 3 */}
      <Card title="Task Aging">
        <AgingChart tasks={tasks}/>
      </Card>
        <Card title="Created vs Completed">
  <CreatedVsCompletedChart tasks={tasks}/>
</Card>
    </div>
  )
}

function Card({ title, children }: CardProps) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
      <h3 className="font-semibold mb-4 dark:text-white">{title}</h3>
      {children}
    </div>
  )
}

function Stat({ title, value }: StatProps) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
      <p className="text-sm text-neutral-500">{title}</p>
      <p className="text-2xl font-bold dark:text-white">{value}</p>
    </div>
  )
}