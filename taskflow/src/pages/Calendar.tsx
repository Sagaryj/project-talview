import { useMemo, useState } from "react"
import { useKanban } from "../features/kanban/useKanban"
import TaskDetailsModal from "../features/kanban/TaskDetailsModal"
import type { Task } from "../features/kanban/types"

import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core"
import type { DragEndEvent } from "@dnd-kit/core"

import { useIntl } from "react-intl"
import type { ReactNode } from "react"

interface DroppableDayProps {
  day: number | null
  children: ReactNode
}

interface DraggableTaskProps {
  task: Task
  children: ReactNode
}

export default function Calendar() {

  const intl = useIntl()

  const {
    tasks,
    updateTask,
    updatePriority,
    updateDueDate,
    updateTags,
    updateDescription
  } = useKanban()

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const calendarDays = useMemo(() => {

    const days: (number | null)[] = []

    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    return days

  }, [firstDay, daysInMonth])

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  function tasksForDay(day: number) {

    const dateString =
      `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`

    return tasks.filter(t => t.dueDate === dateString)
  }

  function handleDragEnd(event: DragEndEvent) {

    const { active, over } = event

    if (!over) return

    const taskId = active.id as string
    const day = over.id as number

    const newDate =
      `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`

    updateDueDate(taskId, newDate)
  }

  const days = [
    intl.formatMessage({ id: "sun" }),
    intl.formatMessage({ id: "mon" }),
    intl.formatMessage({ id: "tue" }),
    intl.formatMessage({ id: "wed" }),
    intl.formatMessage({ id: "thu" }),
    intl.formatMessage({ id: "fri" }),
    intl.formatMessage({ id: "sat" })
  ]

  return (

    <DndContext onDragEnd={handleDragEnd}>

      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">

          <h1 className="text-2xl font-bold dark:text-white">
            {intl.formatMessage({ id: "calendar" })}
          </h1>

          <div className="flex gap-2">

            <button
              onClick={prevMonth}
              className="px-3 py-1 rounded-lg border dark:border-neutral-700"
            >
              ◀
            </button>

            <button
              onClick={nextMonth}
              className="px-3 py-1 rounded-lg border dark:border-neutral-700"
            >
              ▶
            </button>

          </div>

        </div>

        {/* MONTH */}
        <div className="text-lg font-semibold dark:text-white">

          {currentDate.toLocaleString(
            localStorage.getItem("app-language") || "en",
            { month: "long", year: "numeric" }
          )}

        </div>

        {/* GRID */}
        <div className="grid grid-cols-7 gap-2 text-sm">

          {days.map(d => (
            <div key={d} className="text-center text-neutral-500 font-medium">
              {d}
            </div>
          ))}

          {calendarDays.map((day, i) => {

            const dayTasks = day ? tasksForDay(day) : []

            return (

              <DroppableDay key={i} day={day}>

                {day && (
                  <div className="text-xs font-medium mb-1 dark:text-white">
                    {day}
                  </div>
                )}

                <div className="space-y-1">

                  {dayTasks.map(task => (

                    <DraggableTask key={task.id} task={task}>

                      <button
                        onClick={()=>{
                          setSelectedTask(task)
                          setSelectedTaskId(task.id)
                        }}
                        className={`
                          w-full flex items-center gap-2
                          text-left text-xs px-2 py-1 rounded
                          transition
                          ${
                            selectedTaskId === task.id
                              ? "bg-indigo-100 dark:bg-indigo-900"
                              : "hover:bg-neutral-200 dark:hover:bg-neutral-800"
                          }
                        `}
                      >

                        <span
                          className={`
                            w-2 h-2 rounded-full
                            ${
                              task.priority === "high"
                                ? "bg-red-500"
                                : task.priority === "medium"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }
                          `}
                        />

                        <span className="truncate">
                          {task.title}
                        </span>

                      </button>

                    </DraggableTask>

                  ))}

                </div>

              </DroppableDay>

            )
          })}

        </div>

        {selectedTask && (
          <TaskDetailsModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            updateTask={updateTask}
            updatePriority={updatePriority}
            updateDueDate={updateDueDate}
            updateTags={updateTags}
            updateDescription={updateDescription}
          />
        )}

      </div>

    </DndContext>
  )
}

/* ---------- DROPPABLE DAY ---------- */

function DroppableDay({ day, children }: DroppableDayProps) {

  const { setNodeRef } = useDroppable({
    id: day ?? 0
  })

  return (
    <div
      ref={setNodeRef}
      className="
        min-h-[90px]
        p-2
        border
        rounded-lg
        bg-white
        dark:bg-neutral-900
        dark:border-neutral-800
      "
    >
      {children}
    </div>
  )
}

/* ---------- DRAGGABLE TASK ---------- */

function DraggableTask({ task, children }: DraggableTaskProps) {

  const { attributes, listeners, setNodeRef, transform } =
    useDraggable({ id: task.id })

  const style = transform
    ? { transform:`translate(${transform.x}px, ${transform.y}px)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  )
}