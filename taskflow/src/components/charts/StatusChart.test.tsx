import { render } from "@testing-library/react"
import StatusChart from "./StatusChart"

const setThemes = jest.fn()
const dispose = jest.fn()
const xAxisDataSetAll = jest.fn()
const seriesDataSetAll = jest.fn()
const chartAppear = jest.fn()
const seriesAppear = jest.fn()
const columnsAdapterAdd = jest.fn()

jest.mock("@amcharts/amcharts5", () => ({
  Root: {
    new: () => ({
      setThemes,
      dispose,
      container: { children: { push: () => chartMock } }
    })
  },
  color: (value: string) => value
}))

const chartMock = {
  xAxes: { push: () => ({ data: { setAll: xAxisDataSetAll } }) },
  yAxes: { push: () => ({}) },
  series: { push: () => ({ data: { setAll: seriesDataSetAll }, columns: { template: { adapters: { add: columnsAdapterAdd } } }, appear: seriesAppear }) },
  appear: chartAppear
}

jest.mock("@amcharts/amcharts5/xy", () => ({
  XYChart: { new: () => ({}) },
  AxisRendererX: { new: () => ({ labels: { template: { setAll: jest.fn() } }, grid: { template: { setAll: jest.fn() } } }) },
  AxisRendererY: { new: () => ({ labels: { template: { setAll: jest.fn() } }, grid: { template: { setAll: jest.fn() } } }) },
  CategoryAxis: { new: () => ({ data: { setAll: xAxisDataSetAll } }) },
  ValueAxis: { new: () => ({}) },
  ColumnSeries: { new: () => ({ data: { setAll: seriesDataSetAll }, columns: { template: { adapters: { add: columnsAdapterAdd } } }, appear: seriesAppear }) }
}))

jest.mock("@amcharts/amcharts5/themes/Animated", () => ({
  __esModule: true,
  default: { new: () => ({}) }
}))

describe("StatusChart", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("initializes the chart with workflow status data", () => {
    render(
      <StatusChart
        tasks={[{ id: "1", title: "One", status: "todo", priority: "medium" }]}
        statuses={[{ id: "todo", label: "Todo", color: "#64748b", category: "pending", system: true }]}
      />
    )

    expect(setThemes).toHaveBeenCalled()
    expect(xAxisDataSetAll).toHaveBeenCalledWith([{ status: "Todo", value: 1, color: "#64748b" }])
    expect(seriesDataSetAll).toHaveBeenCalledWith([{ status: "Todo", value: 1, color: "#64748b" }])
    expect(columnsAdapterAdd).toHaveBeenCalled()
  })
})
