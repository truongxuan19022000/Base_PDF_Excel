import React from 'react'

import { DASHBOARD } from 'src/constants/config'

import MessageBox from 'src/components/MessageBox'
import RevenueDiagram from 'src/components/RevenueDiagram'
import CustomerDiagram from 'src/components/CustomerDiagram'

const Dashboard = () => {

  const renderSummary = () => (
    DASHBOARD.SUMMARY.map((item, index) => (
      <div key={index} className="dashboardBox">
        <div className="dashboardBox__icon"><img src={item.iconUrl} alt={item.iconName} /></div>
        <div className="dashboardBox__value">{item.value}</div>
        <div className="dashboardBox__title">{item.title}</div>
      </div>
    ))
  )

  return (
    <div className="dashboard">
      <div className="dashboard__left">
        <div className="dashboard__summary">
          {renderSummary()}
        </div>
        <div className="dashboard__content">
          <RevenueDiagram />
          <CustomerDiagram />
        </div>
      </div>
      <div className="dashboard__right">
        <MessageBox />
      </div>
    </div>
  )
}

export default Dashboard
