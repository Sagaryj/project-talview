import type { Task } from "../../features/kanban/types"

interface Props {
  tasks: Task[]
}

export default function CompletionRing({ tasks }: Props) {

  const total = tasks.length
  const completed = tasks.filter(t => t.status === "done").length

  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)

  const radius = 70
  const stroke = 12
  const normalizedRadius = radius - stroke * 0.5
  const circumference = normalizedRadius * 2 * Math.PI

  const strokeDashoffset =
    circumference - (percent / 100) * circumference

  return (

    <div className="flex items-center justify-center">

      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >

        {/* background circle */}
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        {/* progress circle */}
        <circle
          stroke="#22c55e"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + " " + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

      </svg>

      {/* center text */}
      <div className="absolute text-center">

        <p className="text-2xl font-bold text-neutral-800 dark:text-white">
          {percent}%
        </p>

        <p className="text-xs text-neutral-500">
          Completed
        </p>

      </div>

    </div>

  )
}