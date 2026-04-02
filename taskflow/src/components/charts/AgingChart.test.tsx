const remove = jest.fn()
const transitionChain: Record<string, jest.Mock> = {}
transitionChain.duration = jest.fn(() => transitionChain)
transitionChain.attr = jest.fn(() => transitionChain)

const rectChain: Record<string, jest.Mock> = {}
rectChain.data = jest.fn(() => rectChain)
rectChain.enter = jest.fn(() => rectChain)
rectChain.append = jest.fn(() => rectChain)
rectChain.attr = jest.fn(() => rectChain)
rectChain.transition = jest.fn(() => transitionChain)

const chartChain: Record<string, jest.Mock> = {}
chartChain.attr = jest.fn(() => chartChain)
chartChain.append = jest.fn(() => chartChain)
chartChain.call = jest.fn(() => chartChain)
chartChain.selectAll = jest.fn(() => rectChain)

const svgChain: Record<string, jest.Mock> = {}
svgChain.selectAll = jest.fn(() => ({ remove }))
svgChain.attr = jest.fn(() => svgChain)
svgChain.append = jest.fn(() => chartChain)

const select = jest.fn((_: unknown) => svgChain)

jest.mock('d3', () => ({
  select: (value: unknown) => select(value),
  scaleBand: () => ({ domain: jest.fn(() => ({ range: jest.fn(() => ({ padding: jest.fn(() => ({ bandwidth: () => 10 })) })) })) }),
  scaleLinear: () => ({ domain: jest.fn(() => ({ range: jest.fn(() => ({}) ) })) }),
  max: () => 2,
  axisBottom: jest.fn(() => jest.fn()),
  axisLeft: jest.fn(() => jest.fn())
}))

import { render } from '@testing-library/react'
import AgingChart from './AgingChart'

describe('AgingChart', () => {
  it('builds the chart when rendered', () => {
    render(
      <AgingChart
        tasks={[
          { id: '1', title: 'One', status: 'todo', priority: 'medium', dueDate: '2026-03-30' }
        ]}
        statuses={[
          { id: 'todo', label: 'Todo', color: '#64748b', category: 'pending', system: true },
          { id: 'done', label: 'Done', color: '#22c55e', category: 'completed', system: true }
        ]}
      />
    )

    expect(select).toHaveBeenCalled()
    expect(remove).toHaveBeenCalled()
  })
})
