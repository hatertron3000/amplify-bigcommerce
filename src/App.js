import Amplify from 'aws-amplify'
import awsconfig from './aws-exports'
import React from 'react'
import './App.css'
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom'
import { GlobalStyles } from '@bigcommerce/big-design'
import Install from './components/Install'
import Load from './components/Load'
import Dashboard from './components/dashboard'
import config from './config'
const lang = config.lang

Amplify.configure(awsconfig)

function App() {
  return <Router>
    <GlobalStyles />
    <Switch>
      <Route path="/oauth" render={(props) =>
        <Install lang={lang.Install} {...props} />
      } />
      <Route path="/load" render={(props) =>
        <Load lang={lang.Load} {...props} />
      } />
      <Route path="/dashboard" render={(props) =>
        <Dashboard lang={lang.Dashboard}
          modules={config.modules}
          {...props} />
      } />
    </Switch>
  </Router>
}

export default App
