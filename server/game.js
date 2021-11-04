const GameStatus = {
  PRERARING: 0,
  SELECTING: 1,
  PENDING: 2,
  0: 'PRERARING',
  1: 'SELECTING',
  2: 'PENDING'
}

const PlayerAnswer = {
  NONE: 0,
  TRUE: 1,
  FALSE: 2,
  0: 'NONE',
  1: 'TRUE',
  2: 'FALSE'
}

class Player {
  constructor (id, name, ws) {
    this.id = id
    this.name = name
    this.point = 0
    this.ready = false
    this.painter = false
    this.answer = PlayerAnswer.NONE
    this.ws = ws
  }

  toJSON () {
    return {
      id: this.id,
      name: this.name,
      point: this.point,
      ready: this.ready,
      painter: this.painter,
      answer: this.answer
    }
  }
}

class Game {
  constructor () {
    this.status = GameStatus.PRERARING
    this.endTime = -1
    this.tip = ''
    /** @type {Player[]} */
    this.players = []
    this.imageData = null
    this.target = null
  }

  preparing () {
    return this.status === GameStatus.PRERARING
  }

  selecting () {
    return this.status === GameStatus.SELECTING
  }

  pending () {
    return this.status === GameStatus.PENDING
  }

  allReady () {
    return this.players.filter(p => !p.ready).length === 0
  }

  playerCount () {
    return this.players.filter(p => p != null).length
  }

  toJSON () {
    return {
      status: this.status,
      countdown: this.endTime === -1 ? -1 : (this.endTime - Date.now()),
      tip: this.tip,
      players: this.players.map(p => p.toJSON())
    }
  }
}

exports.Game = Game
exports.Player = Player
exports.GameStatus = GameStatus
