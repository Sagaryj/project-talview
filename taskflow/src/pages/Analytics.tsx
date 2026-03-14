import { useKanban } from "../features/kanban/useKanban"
import { useWorkflow } from "../features/kanban/useWorkflow"
import { getCompletedStatusIds } from "../features/kanban/workflowConfig"
import StatusChart from "../components/charts/StatusChart"
import PriorityChart from "../components/charts/PriorityChart"
import WeeklyChart from "../components/charts/WeeklyChart"
import TagChart from "../components/charts/TagChart"
import AgingChart from "../components/charts/AgingChart"

import CompletionRing from "../components/charts/CompletionRing"
import { useIntl } from "react-intl"
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
  const { statuses } = useWorkflow()
  const intl = useIntl()
  const completedStatusIds = getCompletedStatusIds(statuses)

  const completed = tasks.filter((task) => completedStatusIds.has(task.status)).length

  const productivity = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>

        <h1 className="text-2xl font-bold dark:text-white">
          {intl.formatMessage({ id: "Analytics" })}
        </h1>

        <p className="text-neutral-500 text-sm">
          {intl.formatMessage({ id: "Advanced Insights" })}
        </p>

      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-6">

        <Stat
          title={intl.formatMessage({ id: "Total Tasks" })}
          value={tasks.length}
        />

        <Stat
          title={intl.formatMessage({ id: "Completed Tasks" })}
          value={completed}
        />

        <Stat
          title={intl.formatMessage({ id: "Productivity Score" })}
          value={`${productivity}%`}
        />

      </div>

      {/* ROW 1 */}
      <div className="grid md:grid-cols-2 gap-6">

        <Card title={intl.formatMessage({ id: "Task Status Breakdown" })}>
          <StatusChart tasks={tasks} statuses={statuses}/>
        </Card>

        <Card title={intl.formatMessage({ id: "Priority Distribution" })}>
          <PriorityChart tasks={tasks}/>
        </Card>

      </div>

      {/* ROW 2 */}
      <div className="grid md:grid-cols-2 gap-6">

        <Card title={intl.formatMessage({ id: "Tasks Per Week" })}>
          <WeeklyChart tasks={tasks} statuses={statuses}/>
        </Card>

        <Card title={intl.formatMessage({ id: "Tag Distribution" })}>
          <TagChart tasks={tasks}/>
        </Card>

      </div>

      {/* ROW 3 */}

      <Card title={intl.formatMessage({ id: "Task Aging" })}>
        <AgingChart tasks={tasks} statuses={statuses}/>
      </Card>

      <Card title={intl.formatMessage({ id: "Created Vs Completed" })}>
        <CompletionRing tasks={tasks} statuses={statuses}/>
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
