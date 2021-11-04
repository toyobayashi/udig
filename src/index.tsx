import './styles/index.scss'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App from './App'
import { IS_MOBILE } from './util'

if (IS_MOBILE) {
  import('vconsole').then(({ default: VConsole }) => {
    const vconsole = new VConsole()
    console.log(vconsole)
    main()
  }).catch(err => {
    console.error(err)
    main()
  })
} else {
  main()
}

function main (): void {
  ReactDOM.render(<App />, document.getElementById('app'))
}

// @ts-expect-error
if (module.hot) {
  // @ts-expect-error
  module.hot.accept()
}
