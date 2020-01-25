import React from 'react'
import ReactDOM from 'react-dom'
import {
  BrowserRouter as Router,
  Route, Switch
} from 'react-router-dom'
import SNSUsers from './users'
import SNSTimeline from './timeline'
import SNSLogin from './login'
import WikiEdit from './wiki_edit'
import WikiShow from './wiki_show'

const WikiApp = () => (
  <Router>
    <div>
      <Switch>
        <Route path='/users' component={SNSUsers} />
        <Route path='/timeline' component={SNSTimeline} />
        <Route path='/login' component={SNSLogin} />
        <Route path='/wiki/:name' component={WikiShow} />
        <Route path='/edit/:name' component={WikiEdit} />
      </Switch>
    </div>
  </Router>
)

//DOMにメインコンポーネントを書き込む
ReactDOM.render(
  <WikiApp />,
  document.getElementById('root')
)