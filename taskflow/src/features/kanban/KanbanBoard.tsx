import { useState } from "react"

import { useKanban } from "./useKanban"
import KanbanColumn from "./KanbanColumn"
import TaskModal from "./TaskModal"
import type { Task, TaskStatus } from "./types"
import TaskDetailsModal from "./TaskDetailsModal"


export default function KanbanBoard() {
  const { tasks, moveTask, addTask, deleteTask,  
    reorderTask,  
    draggingId, setDraggingId,updateTask,updatePriority, updateDueDate } 
    = useKanban()
  const[selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] =
    useState<TaskStatus>("todo")

  return (
    <div className="h-full flex flex-col">

      {/* Add Task Button */}
      <div className="mb-6">
        <button
          onClick={() => {
            setSelectedStatus("todo")
            setModalOpen(true)
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
        >
          Hey, Add Task
        </button>
      </div>

      {/* Columns */}
      <div className="flex gap-6 flex-1">
        <KanbanColumn
          title="To Do"
          status="todo"
          tasks={tasks.filter(t => t.status === "todo")}
          moveTask={moveTask}
          onAddTask={(status) => {
            setSelectedStatus(status)
            setModalOpen(true)
          }}
          onDeleteTask={deleteTask}
          reorderTask={reorderTask}
          draggingId={draggingId}
          setDraggingId={setDraggingId} 
          updateTask={updateTask} 
          setSelectedTask={setSelectedTask}
          
        />

        <KanbanColumn
          title="In Progress"
          status="in-progress"
          tasks={tasks.filter(t => t.status === "in-progress")}
          moveTask={moveTask}
            onAddTask={(status) => {
                setSelectedStatus(status)
                setModalOpen(true)
            }}
            onDeleteTask={deleteTask}
            draggingId={draggingId}
            setDraggingId={setDraggingId}
              reorderTask={reorderTask}
              updateTask={updateTask}
              setSelectedTask={setSelectedTask}
              


        />

        <KanbanColumn
          title="Done"
          status="done"
          tasks={tasks.filter(t => t.status === "done")}
          moveTask={moveTask}
          onAddTask={(status) => {
            setSelectedStatus(status)
            setModalOpen(true)
          }}
            onDeleteTask={deleteTask}
            reorderTask={reorderTask}
            draggingId={draggingId}
            setDraggingId={setDraggingId}
            updateTask={updateTask}
            setSelectedTask={setSelectedTask}
            
        />
      </div>
      {selectedTask && (
       <TaskDetailsModal
         task={selectedTask}
          updateTask={updateTask}
          onClose={() => setSelectedTask(null)}
          updatePriority={updatePriority}
          updateDueDate={updateDueDate} 
  />
)}

      {modalOpen && (
        <TaskModal

          status={selectedStatus}
          onClose={() => setModalOpen(false)}
          onCreate={addTask}
        />
      )}
    </div>
  )
}