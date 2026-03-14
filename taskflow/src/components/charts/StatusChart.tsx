import { useEffect, useRef } from "react"
import * as am5 from "@amcharts/amcharts5"
import * as am5xy from "@amcharts/amcharts5/xy"
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated"
import type { Task } from "../../features/kanban/types"
import type { WorkflowStatus } from "../../types/workflow"

interface Props {
  tasks: Task[]
  statuses: WorkflowStatus[]
}

export default function StatusChart({ tasks, statuses }: Props) {

  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {

    if (!chartRef.current) return

    const root = am5.Root.new(chartRef.current)
    root.setThemes([am5themes_Animated.new(root)])

    const chart = root.container.children.push(
      am5xy.XYChart.new(root,{})
    )

    const data = statuses.map((status) => ({
      status: status.label,
      value: tasks.filter((task) => task.status === status.id).length,
      color: am5.color(status.color)
    }))

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root,{
        categoryField:"status",
        renderer: am5xy.AxisRendererX.new(root,{})
      })
    )

    xAxis.data.setAll(data)

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root,{
        renderer: am5xy.AxisRendererY.new(root,{})
      })
    )

    const series = chart.series.push(
      am5xy.ColumnSeries.new(root,{
        xAxis,
        yAxis,
        valueYField:"value",
        categoryXField:"status"
      })
    )

    series.data.setAll(data)
    series.columns.template.adapters.add("fill", (_, target) => {
      const context = target.dataItem?.dataContext as { color?: am5.Color } | undefined
      return context?.color
    })
    series.columns.template.adapters.add("stroke", (_, target) => {
      const context = target.dataItem?.dataContext as { color?: am5.Color } | undefined
      return context?.color
    })
    series.appear(1200)
    chart.appear(1200, 100)

    return () => root.dispose()

  },[tasks, statuses])

  return <div ref={chartRef} style={{height:300}} />
}
