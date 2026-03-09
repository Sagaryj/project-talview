import { useEffect, useRef } from "react"
import * as d3 from "d3"
import type { Task } from "../../features/kanban/types"

interface Props {
  tasks: Task[]
}

export default function TagChart({ tasks }: Props) {

  const ref = useRef<SVGSVGElement | null>(null)

  useEffect(() => {

    const svg = d3.select(ref.current)
    svg.selectAll("*").remove()

    const tagCounts: Record<string, number> = {}

    tasks.forEach(task => {
      task.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    const data = Object.entries(tagCounts).map(([tag, value]) => ({
      tag,
      value
    }))

    const width = 400
    const height = 300

    const x = d3.scaleBand()
      .domain(data.map(d => d.tag))
      .range([0, width])
      .padding(0.2)

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 1])
      .range([height, 0])

    const chart = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")

    chart.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x(d.tag)!)
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.value))
      .attr("fill", "#6366f1")

    chart.selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .text(d => d.value)
      .attr("x", d => x(d.tag)! + x.bandwidth()/2)
      .attr("y", d => y(d.value) - 5)
      .attr("text-anchor","middle")

  }, [tasks])

  return <svg ref={ref} className="w-full h-[300px]" />
}