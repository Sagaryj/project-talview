import { useEffect, useRef } from "react"
import * as d3 from "d3"
import type { Task } from "../../features/kanban/types"

interface Props {
  tasks: Task[]
}

export default function CreatedVsCompletedChart({ tasks }: Props) {

  const ref = useRef<SVGSVGElement | null>(null)

  useEffect(() => {

    const svg = d3.select(ref.current)
    svg.selectAll("*").remove()

    const data = [
      { label: "Created", value: tasks.length },
      { label: "Completed", value: tasks.filter(t => t.status === "done").length }
    ]

    const margin = { top: 20, right: 20, bottom: 40, left: 40 }
    const width = 420 - margin.left - margin.right
    const height = 300 - margin.top - margin.bottom

    const chart = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const x = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, width])
      .padding(0.4)

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 1])
      .range([height, 0])

    chart.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))

    chart.append("g")
      .call(d3.axisLeft(y))

    chart.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x(d.label)!)
      .attr("width", x.bandwidth())
      .attr("y", height)
      .attr("height", 0)
      .attr("fill", "#22c55e")
      .transition()
      .duration(800)
      .attr("y", d => y(d.value))
      .attr("height", d => height - y(d.value))

  }, [tasks])

  return <svg ref={ref} className="w-full" />
}