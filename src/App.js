import Amplify from 'aws-amplify'
import awsconfig from './aws-exports'
import React from 'react'
import './App.css'
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom'
import Install from './components/Install'
import Load from './components/Load'
import Dashboard from './components/dashboard'

Amplify.configure(awsconfig)

function App() {
  return <Router>
    <Switch>
      <Route path="/oauth" render={(props) =>
        <Install {...props} />
      } />
      <Route path="/load" render={(props) =>
        <Load {...props} />
      } />
      <Route path="/dashboard" render={(props) =>
        <Dashboard {...props} />
      } />
    </Switch>
  </Router>
}

export default App
