import { useEffect, useRef } from "react"
import * as d3 from "d3"
import type { Task } from "../../features/kanban/types"

interface Props {
  tasks: Task[]
}

export default function CreatedVsCompletedChart({ tasks }: Props) {

  const ref = useRef<SVGSVGElement | null>(null)

  useEffect(()=>{

    const svg = d3.select(ref.current)
    svg.selectAll("*").remove()

    const created = tasks.length
    const completed = tasks.filter(t=>t.status==="done").length

    const data = [
      {label:"Created",value:created},
      {label:"Completed",value:completed}
    ]

    const width = 400
    const height = 300

    const x = d3.scaleBand()
      .domain(data.map(d=>d.label))
      .range([0,width])
      .padding(0.3)

    const y = d3.scaleLinear()
      .domain([0,d3.max(data,d=>d.value) || 1])
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
      .attr("fill","#22c55e")

  },[tasks])

  return <svg ref={ref} className="w-full h-[300px]" />
}