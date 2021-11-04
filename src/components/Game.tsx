import { game, GameStatus } from '@/store/game'
import * as React from 'react'

import Canvas from './Canvas'
import PlayerList from './PlayerList'

const Game: React.FC<{}> = () => {
  const onClickReady = React.useCallback(() => {
    game.doReady().catch(err => {
      console.error(err)
    })
  }, [])
  return (
    <>
      <Canvas width={300} height={300} />
      {game.status === GameStatus.PRERARING ? <button onClick={onClickReady}>READY</button> : null}
      <PlayerList />
    </>
  )
}

export default Game
