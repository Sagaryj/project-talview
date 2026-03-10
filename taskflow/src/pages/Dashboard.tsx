import { useState } from "react"
import { useKanban } from "../features/kanban/useKanban"
import StatusChart from "../components/charts/StatusChart"
import ActivityFeed from "../components/ActivityFeed"
export default function Dashboard() {

  const {
    tasks,
    addTask,
    activity
  } = useKanban()

  const [newTask,setNewTask] = useState("")

  const today = new Date().toISOString().split("T")[0]
  
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === "done").length,
    overdue: tasks.filter(t => t.dueDate && t.dueDate < today).length,
    dueToday: tasks.filter(t => t.dueDate === today).length
  }

  const completion =
    tasks.length === 0
      ? 0
      : Math.round((stats.completed / tasks.length) * 100)

  const focusToday = tasks.filter(
    t =>
      t.priority === "high" ||
      t.dueDate === today
  ).slice(0,5)

  const upcoming = [...tasks]
    .filter(t => t.dueDate && t.dueDate >= today)
    .sort((a,b)=> (a.dueDate ?? "").localeCompare(b.dueDate ?? ""))
    .slice(0,5)

  const workload = {
    todo: tasks.filter(t => t.status==="todo").length,
    progress: tasks.filter(t => t.status==="in-progress").length,
    done: tasks.filter(t => t.status==="done").length
  }

const handleAdd = () => {

  if(!newTask.trim()) return

  addTask(
    newTask,
    "todo",
    "medium",
    [],
    ""
  )

  setNewTask("")
}

  return (

    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
          Dashboard
        </h1>

        <p className="text-sm text-neutral-500">
          Overview of your project activity
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <StatCard title="Total Tasks" value={stats.total}/>
        <StatCard title="Completed" value={stats.completed}/>
        <StatCard title="Due Today" value={stats.dueToday}/>
        <StatCard title="Overdue" value={stats.overdue}/>

      </div>

      {/* COMPLETION */}
      <Card title="Project Completion">

        <div className="w-full bg-neutral-200 rounded-full h-3">

          <div
            className="bg-indigo-600 h-3 rounded-full"
            style={{width:`${completion}%`}}
          />

        </div>

        <p className="text-sm text-neutral-500 mt-2">
          {completion}% completed
        </p>

      </Card>

      {/* FOCUS + DEADLINES */}
      <div className="grid lg:grid-cols-2 gap-6">

        <Card title="Focus Today">

          {focusToday.map(task => (

            <div
              key={task.id}
              className="flex justify-between text-sm py-2"
            >

              <span>{task.title}</span>

              <span className="
                text-xs px-2 py-1 rounded bg-red-100 text-red-600
              ">
                {task.priority}
              </span>

            </div>

          ))}

        </Card>

        <Card title="Upcoming Deadlines">

          {upcoming.map(task => (

            <div
              key={task.id}
              className="flex justify-between text-sm py-2"
            >

              <span>{task.title}</span>

              <span className="text-neutral-400">
                {task.dueDate}
              </span>

            </div>

          ))}

        </Card>

      </div>

      {/* WORKLOAD */}
      <Card title="Workload Indicator">

        <div className="space-y-3">

          <Bar label="Todo" value={workload.todo}/>
          <Bar label="In Progress" value={workload.progress}/>
          <Bar label="Done" value={workload.done}/>

        </div>
      <Card title="Activity Feed">
  <ActivityFeed activity={activity}/>
</Card>
      </Card>

      {/* QUICK ADD */}
      <Card title="Quick Add Task">

        <div className="flex gap-3">

          <input
            value={newTask}
            onChange={e=>setNewTask(e.target.value)}
            placeholder="Task title..."
            className="
              border
              border-neutral-300
              rounded-lg
              px-3 py-2
              flex-1
            "
          />

          <button
            onClick={handleAdd}
            className="
              bg-indigo-600
              text-white
              px-4
              rounded-lg
            "
          >
            Add
          </button>

        </div>

      </Card>

      {/* TASK STATUS */}
      <Card title="Task Status">
        <StatusChart tasks={tasks}/>
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

function Bar({label,value}:{label:string,value:number}){

  return(

    <div>

      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>{value}</span>
      </div>

      <div className="bg-neutral-200 h-2 rounded-full">

        <div
          className="bg-indigo-600 h-2 rounded-full"
          style={{width:`${value*10}%`}}
        />

      </div>

    </div>

  )
}