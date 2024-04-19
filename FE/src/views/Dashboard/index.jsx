import React from 'react'
import { useSelector } from 'react-redux'

import { ROLES } from 'src/constants/config'
import { isEmptyObject } from 'src/helper/helper'

import NonAdminDashboard from './NonAdminDashboard'
import AdminDashboard from './AdminDashboard'

const Dashboard = () => {
  const userData = useSelector((state) => state.user?.user)

  const renderBody = () => {
    if (isEmptyObject(userData)) {
      return null;
    } else {
      switch (userData.role_id) {
        case ROLES.ADMIN_ID:
          return <AdminDashboard />;
        default:
          return <NonAdminDashboard />;
      }
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard__header">Welcome back, {userData?.name}</div>
      <div className="dashboard__body">
        {renderBody()}
      </div>
    </div>
  )
}

export default Dashboard
