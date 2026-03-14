import { useState } from "react"
import { useKanban } from "../features/kanban/useKanban"
import { useWorkflow } from "../features/kanban/useWorkflow"
import { getCompletedStatusIds, getDefaultStatusId } from "../features/kanban/workflowConfig"
import StatusChart from "../components/charts/StatusChart"
import ActivityFeed from "../components/ActivityFeed"
import { useIntl } from "react-intl"

export default function Dashboard() {
  const { tasks, addTask, activity } = useKanban()
  const { statuses } = useWorkflow()
  const [newTask, setNewTask] = useState("")
  const intl = useIntl()
  const completedStatusIds = getCompletedStatusIds(statuses)
  const defaultStatusId = getDefaultStatusId(statuses)

  const today = new Date().toISOString().split("T")[0]

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => completedStatusIds.has(t.status)).length,
    overdue: tasks.filter((t) => t.dueDate && t.dueDate < today).length,
    dueToday: tasks.filter((t) => t.dueDate === today).length,
  }

  const completion =
    tasks.length === 0
      ? 0
      : Math.round((stats.completed / tasks.length) * 100)

  const focusToday = tasks
    .filter((t) => t.priority === "high" || t.dueDate === today)
    .slice(0, 5)

  const upcoming = [...tasks]
    .filter((t) => t.dueDate && t.dueDate >= today)
    .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""))
    .slice(0, 5)

  const workload = statuses.map((status) => ({
    id: status.id,
    label: status.label,
    color: status.color,
    value: tasks.filter((task) => task.status === status.id).length
  }))

  const handleAdd = () => {
    if (!newTask.trim()) return

    addTask(newTask, defaultStatusId, "medium", [], "")
    setNewTask("")
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
          {intl.formatMessage({ id: "dashboard" })}
        </h1>

        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {intl.formatMessage({ id: "overview" })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={intl.formatMessage({ id: "totalTasks" })}
          value={stats.total}
        />
        <StatCard
          title={intl.formatMessage({ id: "completed" })}
          value={stats.completed}
        />
        <StatCard
          title={intl.formatMessage({ id: "dueToday" })}
          value={stats.dueToday}
        />
        <StatCard
          title={intl.formatMessage({ id: "overdue" })}
          value={stats.overdue}
        />
      </div>

      <Card title={intl.formatMessage({ id: "projectCompletion" })}>
        <div className="h-3 w-full rounded-full bg-neutral-200 dark:bg-neutral-800">
          <div
            className="h-3 rounded-full bg-indigo-600"
            style={{ width: `${completion}%` }}
          />
        </div>

        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          {completion}% {intl.formatMessage({ id: "completed" })}
        </p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title={intl.formatMessage({ id: "focusToday" })}>
          <div className="space-y-2">
            {focusToday.length > 0 ? (
              focusToday.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span className="text-neutral-700 dark:text-neutral-200">
                    {task.title}
                  </span>

                  <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-600 dark:bg-red-900/30 dark:text-red-300">
                    {task.priority}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {intl.formatMessage({ id: "noTasks" })}
              </p>
            )}
          </div>
        </Card>

        <Card title={intl.formatMessage({ id: "upcomingDeadlines" })}>
          <div className="space-y-2">
            {upcoming.length > 0 ? (
              upcoming.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span className="text-neutral-700 dark:text-neutral-200">
                    {task.title}
                  </span>

                  <span className="text-neutral-400">{task.dueDate}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {intl.formatMessage({ id: "noDeadlines" })}
              </p>
            )}
          </div>
        </Card>
      </div>

      <Card title={intl.formatMessage({ id: "workloadIndicator" })}>
        <div className="space-y-3">
          {workload.map((item) => (
            <Bar
              key={item.id}
              label={item.label}
              value={item.value}
              color={item.color}
            />
          ))}
        </div>
      </Card>

      <Card title={intl.formatMessage({ id: "quickAddTask" })}>
        <div className="flex gap-3">
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd()
            }}
            placeholder={intl.formatMessage({ id: "taskTitlePlaceholder" })}
            className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />

          <button
            onClick={handleAdd}
            className="rounded-lg bg-indigo-600 px-4 text-white"
          >
            {intl.formatMessage({ id: "add" })}
          </button>
        </div>
      </Card>

      <Card title={intl.formatMessage({ id: "taskStatus" })}>
        <StatusChart tasks={tasks} statuses={statuses} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title={intl.formatMessage({ id: "recentTasks" })}>
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {tasks.slice(-5).reverse().map((task) => (
              <div
                key={task.id}
                className="flex justify-between py-3 text-sm"
              >
                <span className="text-neutral-700 dark:text-neutral-200">
                  {task.title}
                </span>

                <span className="text-neutral-400">{task.status}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title={intl.formatMessage({ id: "activityFeed" })}>
          <ActivityFeed activity={activity} />
        </Card>
      </div>
    </div>
  )
}

function Card({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="mb-4 text-sm font-semibold text-neutral-600 dark:text-white">
        {title}
      </h3>
      {children}
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{title}</p>
      <p className="mt-2 text-3xl font-bold text-neutral-800 dark:text-white">
        {value}
      </p>
    </div>
  )
}

function Bar({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-neutral-700 dark:text-neutral-200">{label}</span>
        <span className="text-neutral-500 dark:text-neutral-400">{value}</span>
      </div>

      <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-800">
        <div
          className="h-2 rounded-full"
          style={{ width: `${Math.min(value * 10, 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
