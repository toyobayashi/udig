import './player.scss'

import { game, IPlayer } from '@/store/game'
import { observer } from 'mobx-react'
import * as React from 'react'

const PlayerItem: React.FC<{ player: IPlayer }> = observer(({ player }) => {
  return (
    <div className='player-item'>
      <p>{player.name}{player.ready ? ': ready' : ''}</p>
    </div>
  )
})

const PlayerList: React.FC<{}> = observer(() => {
  return (
    <div className='player-list'>
      {
        game.players.map(player => {
          return <PlayerItem player={player} key={player.id} />
        })
      }
    </div>
  )
})

export default PlayerList
