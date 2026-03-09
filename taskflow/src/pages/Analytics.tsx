import { useKanban } from "../features/kanban/useKanban"
import StatusChart from "../components/charts/StatusChart"
import PriorityChart from "../components/charts/PriorityChart"
import WeeklyChart from "../components/charts/WeeklyChart"

export default function Analytics() {

  const { tasks } = useKanban()

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-2xl font-bold dark:text-white">
          Analytics
        </h1>

        <p className="text-neutral-500 text-sm">
          Productivity insights and project metrics
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <Card title="Task Status Breakdown">
          <StatusChart tasks={tasks}/>
        </Card>

        <Card title="Priority Distribution">
          <PriorityChart tasks={tasks}/>
        </Card>

      </div>

      <Card title="Tasks Completed Per Week">
        <WeeklyChart tasks={tasks}/>
      </Card>

    </div>
  )
}

function Card({
  title,
  children
}:{
  title:string
  children:React.ReactNode
}){

  return(
    <div className="
      bg-white dark:bg-neutral-900
      border border-neutral-200 dark:border-neutral-800
      rounded-xl p-6
    ">

      <h3 className="text-sm font-semibold mb-4 dark:text-white">
        {title}
      </h3>

      {children}

    </div>
  )
}