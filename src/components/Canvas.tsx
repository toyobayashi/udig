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

const useCallback = React.useCallback

const Toolbar: React.FC<{}> = observer(() => {
  console.log('render')

  const setLineWidth2 = useCallback(() => {
    game.setLineWidth(2)
  }, [])

  const setLineWidth4 = useCallback(() => {
    game.setLineWidth(4)
  }, [])

  const setLineWidth8 = useCallback(() => {
    game.setLineWidth(6)
  }, [])

  const setPen = useCallback(() => {
    game.setEraser(false)
  }, [])

  const setEraser = useCallback(() => {
    game.setEraser(true)
  }, [])

  const setBlack = useCallback(() => {
    game.setColor('black')
  }, [])

  const setRed = useCallback(() => {
    game.setColor('red')
  }, [])

  const setPurple = useCallback(() => {
    game.setColor('purple')
  }, [])

  const setBlue = useCallback(() => {
    game.setColor('blue')
  }, [])

  const setOrange = useCallback(() => {
    game.setColor('orange')
  }, [])

  const setGreen = useCallback(() => {
    game.setColor('green')
  }, [])

  const setGray = useCallback(() => {
    game.setColor('gray')
  }, [])

  return <div className='toolbar'>
    <div className='pen-group'>
      <div className='line'>
        <div>粗细：</div>
        <div className={'pen-item' + (game.lineWidth === 2 ? ' active' : '')} onClick={setLineWidth2}>细</div>
        <div className={'pen-item' + (game.lineWidth === 4 ? ' active' : '')} onClick={setLineWidth4}>普通</div>
        <div className={'pen-item' + (game.lineWidth === 6 ? ' active' : '')} onClick={setLineWidth8}>粗</div>
      </div>
      <div className='line'>
        <div>画笔：</div>
        <div className={'pen-item' + (game.globalCompositeOperation === 'source-over' ? ' active' : '')} onClick={setPen}>画笔</div>
        <div className={'pen-item' + (game.globalCompositeOperation === 'destination-out' ? ' active' : '')} onClick={setEraser}>橡皮擦</div>
      </div>
      <div className='line'>
        <div>颜色：</div>
        <div className={'pen-item' + (game.color === 'black' ? ' active' : '')} onClick={setBlack}>黑</div>
        <div className={'pen-item' + (game.color === 'red' ? ' active' : '')} onClick={setRed}>红</div>
        <div className={'pen-item' + (game.color === 'blue' ? ' active' : '')} onClick={setBlue}>蓝</div>
        <div className={'pen-item' + (game.color === 'purple' ? ' active' : '')} onClick={setPurple}>紫</div>
        <div className={'pen-item' + (game.color === 'orange' ? ' active' : '')} onClick={setOrange}>橙</div>
        <div className={'pen-item' + (game.color === 'green' ? ' active' : '')} onClick={setGreen}>绿</div>
        <div className={'pen-item' + (game.color === 'gray' ? ' active' : '')} onClick={setGray}>灰</div>
      </div>
    </div>
  </div>
})

class Canvas extends React.PureComponent<CanvasProps> {
  private _down: boolean = false
  private _lastPoint: Point | null = null

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
      game.canvasContext.fillStyle = game.color
      game.canvasContext.strokeStyle = game.color
      game.canvasContext.lineWidth = game.lineWidth
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
    this._lastPoint = point
  }
}

export default observer(Canvas)
