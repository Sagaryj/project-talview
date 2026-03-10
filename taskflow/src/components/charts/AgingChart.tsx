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

    const margin = { top: 20, right: 20, bottom: 40, left: 40 }
    const width = 420 - margin.left - margin.right
    const height = 300 - margin.top - margin.bottom

    const chart = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const x = d3.scaleBand()
      .domain(data.map(d=>d.label))
      .range([0,width])
      .padding(0.3)

    const y = d3.scaleLinear()
      .domain([0,d3.max(data,d=>d.value) || 1])
      .range([height,0])

    chart.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))

    chart.append("g")
      .call(d3.axisLeft(y))

    chart.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x",d=>x(d.label)!)
      .attr("width",x.bandwidth())
      .attr("y",height)
      .attr("height",0)
      .attr("fill","#ef4444")
      .transition()
      .duration(800)
      .attr("y",d=>y(d.value))
      .attr("height",d=>height-y(d.value))

  },[tasks])

  return <svg ref={ref} className="w-full" />
}