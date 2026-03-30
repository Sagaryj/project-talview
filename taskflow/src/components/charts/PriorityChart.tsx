import { useEffect, useRef } from "react"
import * as d3 from "d3"
import type { Task } from "../../features/kanban/types"

interface Props {
  tasks: Task[]
}

export default function PriorityChart({ tasks }: Props) {

  const ref = useRef<SVGSVGElement | null>(null)

  useEffect(() => {

    const svg = d3.select(ref.current)
    svg.selectAll("*").remove()

    const data = [
      { label: "Low", value: tasks.filter(t => t.priority === "low").length },
      { label: "Medium", value: tasks.filter(t => t.priority === "medium").length },
      { label: "High", value: tasks.filter(t => t.priority === "high").length },
    ]

    const width = 320
    const height = 320
    const radius = Math.min(width, height) / 2

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`)

    const color = d3.scaleOrdinal<string>()
      .range(["#22c55e", "#eab308", "#ef4444"])

    const pie = d3.pie<typeof data[0]>()
      .value(d => d.value)

    const arc = d3.arc<d3.PieArcDatum<typeof data[0]>>()
      .innerRadius(0)
      .outerRadius(radius)

    const arcs = g.selectAll("arc")
      .data(pie(data))
      .enter()
      .append("g")

    // Draw slices with animation
    arcs.append("path")
      .attr("fill", (d, i) => color(String(i)))
      .transition()
      .duration(900)
      .attrTween("d", function (d) {

        const interpolate = d3.interpolate(
          { startAngle: 0, endAngle: 0 },
          d
        )

        return function (t) {
          return arc(interpolate(t))!
        }

      })

    // Task count labels
    arcs.append("text")
      .attr("transform", d => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("font-size", "13px")
      .attr("fill", "#111")
      .attr("font-weight", "600")
      .text(d => d.data.value)

  }, [tasks])

  return <svg ref={ref} className="w-full h-[320px]" />
}