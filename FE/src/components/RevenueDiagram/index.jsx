import React from 'react'



import LineChart from '../LineChart';

const RevenueDiagram = () => {

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    values1: [50, 20, 15, 25, 30, 40, 10, 50, 80],
    values2: [25, 25, 20, 30, 35, 60, 65, 30, 65],
  };

  return (
    <div className="revenueDiagram">
      <div className="revenueDiagram__header">Revenue</div>
      <div className="revenueDiagram__diagram">
        <LineChart data={chartData} />
      </div>
    </div>
  )
}

export default RevenueDiagram
