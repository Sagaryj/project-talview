import { useEffect, useRef } from "react"
import * as d3 from "d3"
import type { Task } from "../../features/kanban/types"

interface Props {
  tasks: Task[]
}

export default function WeeklyChart({ tasks }: Props) {

  const ref = useRef<SVGSVGElement | null>(null)

  useEffect(() => {

    const svg = d3.select(ref.current)
    svg.selectAll("*").remove()

    const width = 650
    const height = 300
    const margin = { top: 20, right: 20, bottom: 40, left: 40 }

    const data = [0,0,0,0,0,0,0]

    tasks.forEach(task => {
      if (task.status === "done") {
        const day = new Date().getDay()
        data[day] += 1
      }
    })

    const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

    const x = d3.scaleBand()
      .domain(days)
      .range([margin.left, width - margin.right])
      .padding(0.3)

    const y = d3.scaleLinear()
      .domain([0, d3.max(data)! || 1])
      .range([height - margin.bottom, margin.top])

    svg.attr("width", width).attr("height", height)

    // X Axis
const xAxis = svg.append("g")
  .attr("transform", `translate(0,${height - margin.bottom})`)
  .call(d3.axisBottom(x))

xAxis.selectAll("text")
  .style("fill", "#9ca3af")

xAxis.selectAll("path, line")
  .style("stroke", "#9ca3af")


// Y Axis
const yAxis = svg.append("g")
  .attr("transform", `translate(${margin.left},0)`)
  .call(d3.axisLeft(y))

yAxis.selectAll("text")
  .style("fill", "#9ca3af")

yAxis.selectAll("path, line")
  .style("stroke", "#9ca3af")

    // Bars
    svg.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d, i) => x(days[i])!)
      .attr("y", height - margin.bottom)
      .attr("width", x.bandwidth())
      .attr("height", 0)
      .attr("fill", "#3b82f6")
      .transition()
      .duration(800)
      .attr("y", d => y(d))
      .attr("height", d => height - margin.bottom - y(d))

  }, [tasks])

  return <svg ref={ref} className="w-full h-[320px]" />
}