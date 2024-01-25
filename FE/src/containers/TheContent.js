import React, { Suspense } from 'react'
import {
  Route,
  Switch
} from 'react-router-dom'
import { CFade } from '@coreui/react'

// routes config
import routes from '../routes'

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
)

const TheContent = ({ isShowSidebar }) => {
  return (
    <Suspense fallback={loading}>
      <Switch>
        {routes.map((route, idx) => {
          return route.component && (
            <Route
              key={idx}
              path={route.path}
              exact={route.exact}
              name={route.name}
              render={props => (
                <CFade>
                  <route.component isShowSidebar={isShowSidebar} {...props} />
                </CFade>
              )} />
          )
        })}
      </Switch>
    </Suspense>
  )
}

export default React.memo(TheContent)
