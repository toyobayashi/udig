import './canvas.scss'
import * as React from 'react'
import { getCanvasPoint, Point } from './util'

export interface CanvasProps {
  width: number
  height: number
  disabled?: boolean
  fillStyle?: string
  lineWidth?: number
  domRef?: ((instance: HTMLCanvasElement | null) => void) | React.MutableRefObject<HTMLCanvasElement | null>
  onMouseMove?: (this: HTMLCanvasElement, e: React.MouseEvent<HTMLCanvasElement>, x: number, y: number) => void
  onMouseDown?: (this: HTMLCanvasElement, e: React.MouseEvent<HTMLCanvasElement>, x: number, y: number) => void
  onMouseUp?: (this: HTMLCanvasElement, e: React.MouseEvent<HTMLCanvasElement>, x: number, y: number) => void
}

class Canvas extends React.Component<CanvasProps> {
  private _ctx: CanvasRenderingContext2D | null = null
  private _canvas: HTMLCanvasElement | null = null
  private _down: boolean = false
  private _lastPoint: Point | null = null

  public constructor (props: CanvasProps) {
    super(props)

    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onRef = this.onRef.bind(this)
  }

  public componentDidUpdate (): void {
    this.updateContextSettings()
  }

  public updateContextSettings (): void {
    if (this._ctx) {
      this._ctx.fillStyle = this.props.fillStyle ?? '#000'
      this._ctx.lineWidth = this.props.lineWidth ?? 8
    }
  }

  public componentDidMount (): void {
    if ('ontouchstart' in window) {
      this._canvas!.addEventListener('touchmove', this.onMouseMove, { passive: false })
    }
  }

  public componentWillUnmount (): void {
    if ('ontouchstart' in window) {
      this._canvas!.removeEventListener('touchmove', this.onMouseMove)
    }
  }

  public render (): React.ReactNode {
    return (
      <canvas
        className='canvas'
        width={this.props.width.toString()}
        height={this.props.height.toString()}
        ref={this.onRef}
        {...('ontouchstart' in window
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
    )
  }

  public onRef (instance: HTMLCanvasElement | null): void {
    if (instance) {
      this._canvas = instance
      this._ctx = instance.getContext('2d')!
      this.updateContextSettings()
    }
    if (typeof this.props.domRef === 'function') {
      this.props.domRef(instance)
    } else {
      this.props.domRef && (this.props.domRef.current = instance)
    }
  }

  public onMouseDown (e: any): void {
    e.stopPropagation()
    this._down = true
    const point = getCanvasPoint(e, this._canvas!)
    this.fill(point)
    if (typeof this.props.onMouseDown === 'function') {
      this.props.onMouseDown.call(this._canvas!, e, point.x, point.y)
    }
  }

  public onMouseUp (e: any): void {
    e.stopPropagation()
    this._down = false
    this._lastPoint = null
    if (typeof this.props.onMouseUp === 'function') {
      const point = getCanvasPoint(e, this._canvas!)
      this.props.onMouseUp.call(this._canvas!, e, point.x, point.y)
    }
  }

  public onMouseMove (e: any): void {
    e.stopPropagation()
    e.preventDefault()
    const point = getCanvasPoint(e, this._canvas!)
    if (this._down) {
      this.fill(point)
    }
    if (typeof this.props.onMouseMove === 'function') {
      this.props.onMouseMove.call(this._canvas!, e, point.x, point.y)
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
