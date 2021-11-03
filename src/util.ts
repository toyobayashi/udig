import type { MouseEvent, TouchEvent } from 'react'

export interface Point {
  x: number
  y: number
}

export function getCanvasPoint (e: MouseEvent | TouchEvent, canvasElement: HTMLCanvasElement): Point {
  const rect = canvasElement.getBoundingClientRect()
  return {
    x: ((e as MouseEvent).pageX ?? (e as TouchEvent).changedTouches[0].pageX - rect.left) * (canvasElement.width / rect.width),
    y: ((e as MouseEvent).pageY ?? (e as TouchEvent).changedTouches[0].pageY - rect.top) * (canvasElement.height / rect.height)
  }
}

export function fileOrBlobToDataURL (obj: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = (e) => {
      resolve(e.target ? e.target.result as string : '')
    }
    fr.onerror = (e) => {
      reject(e)
    }
    fr.readAsDataURL(obj)
  })
}
