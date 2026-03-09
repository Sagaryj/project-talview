import { useEffect, useRef } from "react"
import * as am5 from "@amcharts/amcharts5"
import * as am5xy from "@amcharts/amcharts5/xy"
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated"
import type { Task } from "../../features/kanban/types"

interface Props {
  tasks: Task[]
}

export default function StatusChart({ tasks }: Props) {

  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {

    if (!chartRef.current) return

    const root = am5.Root.new(chartRef.current)
    root.setThemes([am5themes_Animated.new(root)])

    const chart = root.container.children.push(
      am5xy.XYChart.new(root,{})
    )

    const data = [
      { status: "Todo", value: tasks.filter(t => t.status === "todo").length },
      { status: "Progress", value: tasks.filter(t => t.status === "in-progress").length },
      { status: "Done", value: tasks.filter(t => t.status === "done").length }
    ]

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
    series.appear(1200)
    chart.appear(1200, 100)

    return () => root.dispose()

  },[tasks])

  return <div ref={chartRef} style={{height:300}} />
}