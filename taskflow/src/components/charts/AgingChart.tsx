import { useEffect, useRef } from "react"
import * as d3 from "d3"
import type { Task } from "../../features/kanban/types"

interface Props {
  tasks: Task[]
}

export default function AgingChart({ tasks }: Props) {

  const ref = useRef<SVGSVGElement | null>(null)

  useEffect(() => {

    const svg = d3.select(ref.current)
    svg.selectAll("*").remove()

    const now = new Date()

    const aging = {
      "0-3 days": 0,
      "4-7 days": 0,
      "8+ days": 0
    }

    tasks.forEach(task => {

      if (!task.dueDate || task.status === "done") return

      const diff =
        (now.getTime() - new Date(task.dueDate).getTime()) /
        (1000*60*60*24)

      if (diff <= 3) aging["0-3 days"]++
      else if (diff <= 7) aging["4-7 days"]++
      else aging["8+ days"]++

    })

    const data = Object.entries(aging).map(([label,value]) => ({
      label,
      value
    }))

    const width = 400
    const height = 300

    const x = d3.scaleBand()
      .domain(data.map(d=>d.label))
      .range([0,width])
      .padding(0.3)

    const y = d3.scaleLinear()
      .domain([0, d3.max(data,d=>d.value) || 1])
      .range([height,0])

    const chart = svg
      .attr("width",width)
      .attr("height",height)
      .append("g")

    chart.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x",d=>x(d.label)!)
      .attr("y",d=>y(d.value))
      .attr("width",x.bandwidth())
      .attr("height",d=>height-y(d.value))
      .attr("fill","#ef4444")

  },[tasks])

  return <svg ref={ref} className="w-full h-[300px]" />
}