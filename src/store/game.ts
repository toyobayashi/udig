import { fileOrBlobToDataURL, getBrowserFingerprint } from '@/util'
import { makeAutoObservable, runInAction } from 'mobx'

export enum GameStatus {
  PRERARING,
  SELECTING,
  PENDING
}

export enum PlayerAnswer {
  NONE,
  TRUE,
  FALSE
}

export interface IPlayer {
  id: string
  name: string
  point: number
  ready: boolean
  painter: boolean
  answer: PlayerAnswer
}

export interface IMsg {
  senderName: string
  senderId: string
  content: string
}

export interface IMessageObject<T> {
  channel: string
  data: T
}

export interface IGameSyncMessage {
  status: GameStatus
  countdown: number
  tip: string
  players: IPlayer[]
  myId: string
}

class Game {
  joined: boolean
  status: GameStatus
  countdown: number
  tip: string
  players: IPlayer[]
  myId: string
  msgList: IMsg[]

  canvasElement: HTMLCanvasElement | null = null
  canvasContext: CanvasRenderingContext2D | null = null

  fillStyle: string = '#000'
  lineWidth: number = 2
  erasor: boolean = false

  ws: WebSocket | null = null

  constructor () {
    this.joined = false
    this.status = GameStatus.PRERARING
    this.countdown = -1
    this.myId = ''
    this.msgList = []
    this.tip = ''
    this.players = []

    makeAutoObservable(this, {
      myId: false,
      canvasElement: false,
      canvasContext: false,
      ws: false,
      doReady: false
    })
  }

  get me (): IPlayer | null {
    return this.players.filter(p => p.id === this.myId)[0] ?? null
  }

  get ready (): boolean {
    return this.me ? this.me.ready : false
  }

  get canDraw (): boolean {
    return true
    // return (this.status === GameStatus.PENDING) && (this.me ? this.me.painter : false)
  }

  get preparing (): boolean {
    return this.status === GameStatus.PRERARING
  }

  get selecting (): boolean {
    return this.status === GameStatus.SELECTING
  }

  get pending (): boolean {
    return this.status === GameStatus.PENDING
  }

  setErasor (): void {
    this.erasor = true
  }

  setFillStyle (style: string): void {
    this.fillStyle = style
    if (this.canvasContext) this.canvasContext.fillStyle = style
  }

  setLineWidth (lineWidth: number): void {
    this.erasor = false
    this.lineWidth = lineWidth
    if (this.canvasContext) this.canvasContext.lineWidth = lineWidth
  }

  sync (msgobj: IGameSyncMessage): void {
    Object.keys(msgobj).forEach(k => {
      (this as any)[k] = (msgobj as any)[k]
    })
  }

  async doReady (): Promise<void> {
    if (this.status === GameStatus.PRERARING) {
      return new Promise<void>((resolve) => {
        this.ws?.send(JSON.stringify({
          channel: 'ready'
        }))
        resolve()
      })
    }
    return Promise.resolve()
  }

  async sendImageData (): Promise<void> {
    if (!this.canDraw || !this.canvasElement) return
    return new Promise<Blob>((resolve) => {
      this.canvasElement?.toBlob((blob) => {
        resolve(blob!)
      }, 'image/png')
    }).then(blob => {
      if (this.ws) {
        this.ws.send(blob)
      }
    })
  }

  async start (): Promise<void> {
    if (this.ws) this.ws.close()
    this.myId = await getBrowserFingerprint()

    return new Promise<void>((resolve, reject) => {
      this.ws = new WebSocket(`ws://${location.hostname}:8099/?id=${this.myId}&roomId=0`)
      this.ws.addEventListener('open', () => {
        console.log('open')
        runInAction(() => { this.joined = true })
        resolve()
      })
      this.ws.addEventListener('message', (ev) => {
        console.log('message')
        console.log(ev.data)
        if (typeof ev.data === 'string') {
          const msgobj = JSON.parse(ev.data)
          if (msgobj.channel === 'game-sync') {
            this.sync((msgobj as IMessageObject<IGameSyncMessage>).data)
            console.log(this)
          }
          // if (ev.data === 'member') {
          //   setDisabled(true)
          // } else {
          //   setDisabled(false)
          // }
        } else if (ev.data instanceof Blob) {
          fileOrBlobToDataURL(ev.data).then(dataurl => {
            const image = new Image()
            image.src = dataurl
            image.onload = () => {
              if (this.canvasContext) {
                this.canvasContext.clearRect(0, 0, 300, 400)
                this.canvasContext.drawImage(image, 0, 0)
              }
            }
          }).catch(err => {
            console.error(err)
          })
        }
      })
      this.ws.addEventListener('error', (ev) => {
        console.log('error')
        console.log(ev)
      })
      this.ws.addEventListener('close', (ev) => {
        console.log('close: ', ev.code, ev.reason)
        this.ws = null
        runInAction(() => { this.joined = false })
        reject(new Error('Join failed'))
      })
    })
  }
}

export { Game }

export const game = new Game()
