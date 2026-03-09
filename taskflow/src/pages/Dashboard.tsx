import { useKanban } from "../features/kanban/useKanban"
import StatusChart from "../components/charts/StatusChart"
import PriorityChart from "../components/charts/PriorityChart"
import WeeklyChart from "../components/charts/WeeklyChart"

export default function Dashboard() {

  const { tasks } = useKanban()

  const today = new Date().toISOString().split("T")[0]

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === "done").length,
    overdue: tasks.filter(t => t.dueDate && t.dueDate < today).length,
    dueToday: tasks.filter(t => t.dueDate === today).length
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">Dashboard</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Overview of your project activity
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <StatCard title="Total Tasks" value={stats.total}/>
        <StatCard title="Completed" value={stats.completed}/>
        <StatCard title="Due Today" value={stats.dueToday}/>
        <StatCard title="Overdue" value={stats.overdue}/>

      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Card title="Task Status">
          <StatusChart tasks={tasks}/>
        </Card>

        <Card title="Priority Distribution">
          <PriorityChart tasks={tasks}/>
        </Card>

      </div>

      {/* WEEKLY CHART */}
      <Card title="Tasks Completed Per Week">
        <WeeklyChart tasks={tasks}/>
      </Card>

      {/* RECENT TASKS */}
      <Card title="Recent Tasks">

        <div className="divide-y">

          {tasks.slice(-5).reverse().map(task => (

            <div
              key={task.id}
              className="flex justify-between py-3 text-sm"
            >
              <span className="text-neutral-700">
                {task.title}
              </span>

              <span className="text-neutral-400">
                {task.status}
              </span>
            </div>

          ))}

        </div>

      </Card>

    </div>
  )
}

function Card({title, children}:{title:string, children:React.ReactNode}){

  return(
    <div className="
      bg-white
      border
      border-neutral-200
      rounded-xl
      p-6
      shadow-sm
    ">

      <h3 className="text-sm font-semibold text-neutral-600 mb-4">
        {title}
      </h3>

      {children}

    </div>
  )
}

function StatCard({title,value}:{title:string,value:number}){

  return(
    <div className="
      bg-white
      border
      border-neutral-200
      rounded-xl
      p-6
      shadow-sm
    ">

      <p className="text-sm text-neutral-500">
        {title}
      </p>

      <p className="text-3xl font-bold text-neutral-800 mt-2">
        {value}
      </p>

    </div>
  )
}