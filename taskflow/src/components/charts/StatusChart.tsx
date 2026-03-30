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
type ChartData = {
  status: string
  value: number
  color: am5.Color
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

    const isDark = document.documentElement.classList.contains("dark")
    const axisColor = isDark ? 0x9ca3af : 0x374151

    const data = statuses.map((status) => ({
      status: status.label,
      value: tasks.filter(t => t.status === status.id).length,
      color: am5.color(status.color)
    }))

    /* X Axis */

    const xRenderer = am5xy.AxisRendererX.new(root,{})

    xRenderer.labels.template.setAll({
      fill: am5.color(axisColor)
    })

    xRenderer.grid.template.setAll({
      stroke: am5.color(axisColor),
      strokeOpacity: 0.2
    })

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root,{
        categoryField:"status",
        renderer: xRenderer
      })
    )

    xAxis.data.setAll(data)

    /* Y Axis */

    const yRenderer = am5xy.AxisRendererY.new(root,{})

    yRenderer.labels.template.setAll({
      fill: am5.color(axisColor)
    })

    yRenderer.grid.template.setAll({
      stroke: am5.color(axisColor),
      strokeOpacity: 0.2
    })

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root,{
        renderer: yRenderer
      })
    )

    /* Series */

    const series = chart.series.push(
      am5xy.ColumnSeries.new(root,{
        xAxis,
        yAxis,
        valueYField:"value",
        categoryXField:"status"
      })
    )

    series.data.setAll(data)

    /* Column colors */

   series.columns.template.adapters.add("fill", (fill, target) => {

  const item = target.dataItem
  if (!item) return fill

  const context = item.dataContext as ChartData

  return context.color ?? fill
})

series.columns.template.adapters.add("stroke", (stroke, target) => {

  const item = target.dataItem
  if (!item) return stroke

  const context = item.dataContext as ChartData

  return context.color ?? stroke
})

    series.appear(1200)
    chart.appear(1200,100)

    return () => root.dispose()

  },[tasks, statuses])

  return <div ref={chartRef} style={{ height: 300 }} />

}