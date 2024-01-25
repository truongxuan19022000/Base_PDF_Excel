import React, { Component } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import './lang/i18n';
import './scss/style.scss';

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
);

// Containers
const TheLayout = React.lazy(() => import('./containers/TheLayout'));

class App extends Component {
  render() {
    return (
      <DndProvider backend={HTML5Backend}>
        <BrowserRouter>
          <React.Suspense fallback={loading}>
            <Switch>
              <Route path="/" name="Home" render={props => <TheLayout {...props} />} />
            </Switch>
          </React.Suspense>
        </BrowserRouter>
      </DndProvider>
    );
  }
}

export default App;
