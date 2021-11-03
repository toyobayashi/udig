import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App from './App'

if ('ontouchstart' in window) {
  import('vconsole').then(({ default: VConsole }) => {
    const vconsole = new VConsole()
    console.log(vconsole)
    ReactDOM.render(<App />, document.getElementById('app'))
  }).catch(err => {
    console.error(err)
  })
} else {
  ReactDOM.render(<App />, document.getElementById('app'))
}

// @ts-expect-error
if (module.hot) {
  // @ts-expect-error
  module.hot.accept()
}
