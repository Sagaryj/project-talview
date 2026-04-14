const remove = jest.fn()
const attrTween = jest.fn(() => ({ attr: jest.fn(() => ({})) }))

const textChain: Record<string, jest.Mock> = {}
textChain.attr = jest.fn(() => textChain)
textChain.text = jest.fn(() => textChain)

const pathChain: Record<string, jest.Mock> = {}
pathChain.attr = jest.fn(() => pathChain)
pathChain.transition = jest.fn(() => ({ duration: jest.fn(() => ({ attrTween })) }))

const arcsChain = {
  append: jest.fn((tag: string) => (tag === 'path' ? pathChain : textChain))
}

const enterChain = {
  append: jest.fn(() => arcsChain)
}

const dataChain = {
  enter: jest.fn(() => enterChain)
}

const selectAllChain = {
  data: jest.fn(() => dataChain)
}

const gChain: Record<string, jest.Mock> = {}
gChain.attr = jest.fn(() => gChain)
gChain.selectAll = jest.fn(() => selectAllChain)

const svgChain: Record<string, jest.Mock> = {}
svgChain.selectAll = jest.fn(() => ({ remove }))
svgChain.attr = jest.fn(() => svgChain)
svgChain.append = jest.fn(() => gChain)

const select = jest.fn(() => svgChain)

jest.mock('d3', () => ({
  select: (value: unknown) => {
    void value
    return select()
  },
  scaleOrdinal: () => ({ range: jest.fn(() => jest.fn((value: string) => value)) }),
  pie: () => ({ value: jest.fn(() => (data: unknown) => data) }),
  arc: () => ({ innerRadius: jest.fn(() => ({ outerRadius: jest.fn(() => ({ centroid: () => [0, 0] })) })) }),
  interpolate: jest.fn(() => jest.fn())
}))

import { render } from '@testing-library/react'
import PriorityChart from './PriorityChart'

describe('PriorityChart', () => {
  it('builds the priority chart when rendered', () => {
    render(
      <PriorityChart
        tasks={[
          { id: '1', title: 'One', status: 'todo', priority: 'low' },
          { id: '2', title: 'Two', status: 'todo', priority: 'medium' }
        ]}
      />
    )

    expect(select).toHaveBeenCalled()
    expect(remove).toHaveBeenCalled()
    expect(arcsChain.append).toHaveBeenCalledWith('path')
    expect(arcsChain.append).toHaveBeenCalledWith('text')
  })
})
