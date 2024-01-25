import React from 'react'

import BarChart from '../BarChart';

const CustomerDiagram = () => {
  const chartData = {
    labels: ['Sun', 'Mon', 'Tue', 'Thu', 'Fri', 'Sat'],
    values1: [12500, 4000, 7500, 15000, 18000, 15000, 13000],
    values2: [10500, 7000, 7500, 16000, 12000, 17000, 19000],
  }

  return (
    <div className="customerDiagram">
      <div className="customerDiagram__header">Customers</div>
      <div className="customerDiagram__diagram">
        <BarChart data={chartData} />
      </div>
    </div>
  )
}

export default CustomerDiagram
