import type { MouseEvent, TouchEvent } from 'react'
import { load } from '@fingerprintjs/fingerprintjs'

export interface Point {
  x: number
  y: number
}

export function getCanvasPoint (e: MouseEvent | TouchEvent, canvasElement: HTMLCanvasElement): Point {
  const rect = canvasElement.getBoundingClientRect()
  if (IS_MOBILE) {
    if (e.type === 'touchstart' || e.type === 'touchmove') {
      return {
        x: ((e as TouchEvent).targetTouches[0].pageX - rect.left) * (canvasElement.width / rect.width),
        y: ((e as TouchEvent).targetTouches[0].pageY - rect.top) * (canvasElement.height / rect.height)
      }
    } else {
      return {
        x: ((e as TouchEvent).changedTouches[0].pageX - rect.left) * (canvasElement.width / rect.width),
        y: ((e as TouchEvent).changedTouches[0].pageY - rect.top) * (canvasElement.height / rect.height)
      }
    }
  } else {
    return {
      x: ((e as MouseEvent).pageX - rect.left) * (canvasElement.width / rect.width),
      y: ((e as MouseEvent).pageY - rect.top) * (canvasElement.height / rect.height)
    }
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

export const IS_MOBILE = 'ontouchstart' in window

const fpPromise = load()

export function getBrowserFingerprint (): Promise<string> {
  return fpPromise
    .then(fp => fp.get())
    .then(result => result.visitorId)
}
