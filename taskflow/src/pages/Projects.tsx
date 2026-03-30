import KanbanBoard from "../features/kanban/KanbanBoard"
import { useIntl } from "react-intl"

export default function Projects() {

  const intl = useIntl()

  return (

    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold dark:text-white">
          {intl.formatMessage({ id: "projects" })}
        </h1>

        <p className="text-sm text-neutral-500">
          {intl.formatMessage({ id: "manageProjects" })}
        </p>
      </div>

      <KanbanBoard />

    </div>

  )
}