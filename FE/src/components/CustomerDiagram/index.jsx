import React, { memo } from 'react'

import BarChart from '../BarChart'
import FilterDate from '../FilterDate'
import { TIME_TOTAL_REVENUE } from 'src/constants/config'
import { chartRoundNumber } from 'src/helper/helper'

const CustomerDiagram = ({ setSelectedItem, salesRevenueData = {} }) => {
  const diagramData = Object.values(salesRevenueData).map(item => chartRoundNumber(+item))
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    values1: diagramData,
  }

  return (
    <div className="customerDiagram">
      <div className="customerDiagram__filter">
        <FilterDate options={TIME_TOTAL_REVENUE} selectAction={setSelectedItem} />
      </div>
      <div className="customerDiagram__header">total sales revenue</div>
      <div className="customerDiagram__diagram">
        {diagramData.length > 0 &&
          <BarChart data={chartData} />
        }
      </div>
    </div>
  )
}

export default memo(CustomerDiagram)
