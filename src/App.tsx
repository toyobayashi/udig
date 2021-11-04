import * as React from 'react'
import { observer } from 'mobx-react'

import Game from './components/Game'
import { game } from './store/game'

const App: React.FC<{}> = observer(() => {
  React.useEffect(() => {
    game.start().catch(err => {
      console.error(err)
    })
  }, [])

  return (
    <>
      {game.joined ? <Game /> : <div>Loading...</div>}
    </>
  )
})

export default App
