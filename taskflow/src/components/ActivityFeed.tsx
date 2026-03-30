import type { Activity } from "../types/activity"

interface Props {
  activity: Activity[]
}

export default function ActivityFeed({ activity }: Props) {

  return (

    <div className="space-y-3">

      {activity.slice(0,5).map(item => (

        <div
          key={item.id}
          className="
          text-sm
          border-b
          border-neutral-200
          pb-2
        "
        >

          <p>{item.message}</p>

          <p className="text-xs text-neutral-400">
            {new Date(item.timestamp).toLocaleString()}
          </p>

        </div>

      ))}

    </div>

  )
}