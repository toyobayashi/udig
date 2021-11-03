import './canvas.scss'
import * as React from 'react'
import { getCanvasPoint, IS_MOBILE, Point } from './util'

export interface CanvasProps {
  width: number
  height: number
  disabled?: boolean
  fillStyle?: string
  lineWidth?: number
  domRef?: ((instance: HTMLCanvasElement | null) => void) | React.MutableRefObject<HTMLCanvasElement | null>
  onMove?: (this: HTMLCanvasElement, e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, x: number, y: number) => void
  onDown?: (this: HTMLCanvasElement, e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, x: number, y: number) => void
  onUp?: (this: HTMLCanvasElement, e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, x: number, y: number) => void
}

class Canvas extends React.PureComponent<CanvasProps> {
  private _ctx: CanvasRenderingContext2D | null = null
  private _canvas: HTMLCanvasElement | null = null
  private _down: boolean = false
  private _lastPoint: Point | null = null

  private static readonly DEFAULT_FILL_STYLE = '#000'
  private static readonly DEFAULT_LINE_WIDTH = 8

  public constructor (props: CanvasProps) {
    super(props)

    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onRef = this.onRef.bind(this)
  }

  private _getProp<K extends keyof CanvasProps> (key: K, defaultValue: NonNullable<CanvasProps[K]>): NonNullable<CanvasProps[K]> {
    return this.props[key] ?? defaultValue
  }

  public componentDidUpdate (prevProps: Readonly<CanvasProps>, _prevState: Readonly<{}>): void {
    if (this._ctx) {
      if (!Object.is(prevProps.fillStyle, this.props.fillStyle)) {
        this._ctx.fillStyle = this._getProp('fillStyle', Canvas.DEFAULT_FILL_STYLE)
      }
      if (!Object.is(prevProps.lineWidth, this.props.lineWidth)) {
        this._ctx.lineWidth = this._getProp('lineWidth', Canvas.DEFAULT_LINE_WIDTH)
      }
    }
  }

  public componentDidMount (): void {
    if (IS_MOBILE) {
      this._canvas!.addEventListener('touchmove', this.onMouseMove as any, { passive: false })
    }
  }

  public componentWillUnmount (): void {
    if (IS_MOBILE) {
      this._canvas!.removeEventListener('touchmove', this.onMouseMove as any)
    }
  }

  public render (): React.ReactNode {
    return (
      <div className='canvas'>
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
    )
  }

  public onRef (instance: HTMLCanvasElement | null): void {
    if (instance) {
      this._canvas = instance
      this._ctx = instance.getContext('2d')!
      this._ctx.fillStyle = this._getProp('fillStyle', Canvas.DEFAULT_FILL_STYLE)
      this._ctx.lineWidth = this._getProp('lineWidth', Canvas.DEFAULT_LINE_WIDTH)
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
    const point = getCanvasPoint(e, this._canvas!)
    this.fill(point)
    if (typeof this.props.onDown === 'function') {
      this.props.onDown.call(this._canvas!, e, point.x, point.y)
    }
  }

  public onMouseUp (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): void {
    e.stopPropagation()
    this._down = false
    this._lastPoint = null
    if (typeof this.props.onUp === 'function') {
      const point = getCanvasPoint(e, this._canvas!)
      this.props.onUp.call(this._canvas!, e, point.x, point.y)
    }
  }

  public onMouseMove (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): void {
    e.stopPropagation()
    e.preventDefault()
    const point = getCanvasPoint(e, this._canvas!)
    if (this._down) {
      this.fill(point)
    }
    if (typeof this.props.onMove === 'function') {
      this.props.onMove.call(this._canvas!, e, point.x, point.y)
    }
  }

  public fill (point: Point): void {
    if (this.props.disabled) return
    const ctx = this._ctx!
    const lineWidth = ctx.lineWidth
    ctx.beginPath()
    ctx.arc(point.x, point.y, lineWidth / 2, 0, 2 * Math.PI, true)
    ctx.fill()
    if (this._lastPoint) {
      ctx.beginPath()
      ctx.moveTo(this._lastPoint.x, this._lastPoint.y)
      ctx.lineTo(point.x, point.y)
      ctx.stroke()
    }
    this._lastPoint = point
  }
}

export default Canvas
