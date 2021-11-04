import './canvas.scss'
import * as React from 'react'
import { observer } from 'mobx-react'
import { getCanvasPoint, IS_MOBILE, Point } from '../util'
import { game } from '../store/game'
export interface CanvasProps {
  width: number
  height: number
  domRef?: ((instance: HTMLCanvasElement | null) => void) | React.MutableRefObject<HTMLCanvasElement | null>
  onMove?: (this: HTMLCanvasElement, e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, x: number, y: number) => void
  onDown?: (this: HTMLCanvasElement, e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, x: number, y: number) => void
  onUp?: (this: HTMLCanvasElement, e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, x: number, y: number) => void
}

const Toolbar: React.FC<{}> = observer(() => {
  console.log('render')
  const setErasor = React.useCallback(() => {
    game.setErasor()
  }, [])

  const setLineWidth2 = React.useCallback(() => {
    game.setLineWidth(2)
  }, [])

  const setLineWidth4 = React.useCallback(() => {
    game.setLineWidth(4)
  }, [])

  const setLineWidth8 = React.useCallback(() => {
    game.setLineWidth(8)
  }, [])

  return <div className='toolbar'>
    <div className='pen-group'>
      <div className={'pen-item' + (!game.erasor ? (game.lineWidth === 2 ? ' active' : '') : '')} onClick={setLineWidth2}>细画笔</div>
      <div className={'pen-item' + (!game.erasor ? (game.lineWidth === 4 ? ' active' : '') : '')} onClick={setLineWidth4}>普通画笔</div>
      <div className={'pen-item' + (!game.erasor ? (game.lineWidth === 8 ? ' active' : '') : '')} onClick={setLineWidth8}>粗画笔</div>
      <div className='pen-item'>颜色</div>
      <div className={'pen-item' + (game.erasor ? ' active' : '')} onClick={setErasor}>橡皮擦</div>
    </div>
  </div>
})

class Canvas extends React.PureComponent<CanvasProps> {
  private _down: boolean = false
  private _lastPoint: Point | null = null

  private static readonly DEFAULT_FILL_STYLE = '#000'
  private static readonly DEFAULT_LINE_WIDTH = 2

  public constructor (props: CanvasProps) {
    super(props)

    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onRef = this.onRef.bind(this)
  }

  public componentDidMount (): void {
    if (IS_MOBILE) {
      game.canvasElement!.addEventListener('touchmove', this.onMouseMove as any, { passive: false })
    }
  }

  public componentWillUnmount (): void {
    if (IS_MOBILE) {
      game.canvasElement!.removeEventListener('touchmove', this.onMouseMove as any)
    }
  }

  public render (): React.ReactNode {
    return (
      <div className='canvas'>
        <div className='canvas-wrap'>
          <canvas
            width={this.props.width.toString()}
            height={this.props.height.toString()}
            ref={this.onRef}
            {...(IS_MOBILE
              ? {
                  onTouchStart: this.onMouseDown,
                  onTouchEnd: this.onMouseUp/* ,
                  onTouchMove: this.onMouseMove */
                }
              : {
                  onMouseDown: this.onMouseDown,
                  onMouseUp: this.onMouseUp,
                  onMouseMove: this.onMouseMove
                })}
          ></canvas>
        </div>
        <Toolbar />
      </div>
    )
  }

  public onRef (instance: HTMLCanvasElement | null): void {
    if (instance) {
      game.canvasElement = instance
      game.canvasContext = instance.getContext('2d')!
      game.canvasContext.fillStyle = Canvas.DEFAULT_FILL_STYLE
      game.canvasContext.lineWidth = Canvas.DEFAULT_LINE_WIDTH
    }
    if (typeof this.props.domRef === 'function') {
      this.props.domRef(instance)
    } else if (this.props.domRef) {
      this.props.domRef.current = instance
    }
  }

  public onMouseDown (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): void {
    e.stopPropagation()
    this._down = true
    const point = getCanvasPoint(e, game.canvasElement!)
    this.fill(point)
    if (typeof this.props.onDown === 'function') {
      this.props.onDown.call(game.canvasElement!, e, point.x, point.y)
    }
  }

  public onMouseUp (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): void {
    e.stopPropagation()
    this._down = false
    this._lastPoint = null
    // test
    // game.sendImageData().catch(err => {
    //   console.error(err)
    // })
    if (typeof this.props.onUp === 'function') {
      const point = getCanvasPoint(e, game.canvasElement!)
      this.props.onUp.call(game.canvasElement!, e, point.x, point.y)
    }
  }

  public onMouseMove (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): void {
    e.stopPropagation()
    e.preventDefault()
    const point = getCanvasPoint(e, game.canvasElement!)
    if (this._down) {
      this.fill(point)
    }
    if (typeof this.props.onMove === 'function') {
      this.props.onMove.call(game.canvasElement!, e, point.x, point.y)
    }
  }

  public fill (point: Point): void {
    if (!game.canDraw) return
    const ctx = game.canvasContext!
    const lineWidth = ctx.lineWidth
    if (game.erasor) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(point.x, point.y, lineWidth / 2, 0, 2 * Math.PI, true)
      ctx.clip()
      ctx.clearRect(0, 0, 300, 300)
      if (this._lastPoint) {
        // TODO
      }
      ctx.restore()
    } else {
      ctx.save()
      ctx.beginPath()
      ctx.arc(point.x, point.y, lineWidth / 2, 0, 2 * Math.PI, true)
      ctx.fill()
      if (this._lastPoint) {
        ctx.beginPath()
        ctx.moveTo(this._lastPoint.x, this._lastPoint.y)
        ctx.lineTo(point.x, point.y)
        ctx.stroke()
      }
      ctx.restore()
    }
    this._lastPoint = point
  }
}

export default observer(Canvas)
