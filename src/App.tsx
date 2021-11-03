import * as React from 'react'

import Canvas from './Canvas'
import { fileOrBlobToDataURL } from './util'

let ws: WebSocket | null = null

const App: React.FC<{}> = () => {
  const [lineWidth, setLineWidth] = React.useState(4)
  const callback = React.useCallback(() => {
    setLineWidth(lineWidth + 1)
  }, [lineWidth])

  const [disabled, setDisabled] = React.useState(true)
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)

  React.useEffect(() => {
    if (ws) {
      ws.close()
    }
    ws = new WebSocket('ws://localhost:8099')
    ws.addEventListener('open', () => { console.log('open') })
    ws.addEventListener('message', (ev) => {
      console.log('message')
      console.log(ev.data)
      if (typeof ev.data === 'string') {
        if (ev.data === 'member') {
          setDisabled(true)
        } else {
          setDisabled(false)
        }
      } else {
        const blob: Blob = ev.data
        fileOrBlobToDataURL(blob).then(dataurl => {
          const image = new Image()
          image.src = dataurl
          image.onload = () => {
            const ctx = canvasRef.current!.getContext('2d')!
            ctx.clearRect(0, 0, 300, 400)
            ctx.drawImage(image, 0, 0)
          }
        }).catch(err => {
          console.error(err)
        })
      }
    })
    ws.addEventListener('error', (ev) => { console.log('error'); console.log(ev) })
    ws.addEventListener('close', (ev) => { console.log('close: ', ev.code, ev.reason) })
  }, [])

  const sendCanvas = React.useCallback(() => {
    if (disabled) return
    new Promise<Blob>((resolve) => {
      canvasRef.current!.toBlob((blob) => {
        resolve(blob!)
      }, 'image/png')
    }).then(blob => {
      ws && (ws.send(blob))
    }).catch(err => {
      console.error(err)
    })
  }, [disabled])

  return (
    <>
      <Canvas width={300} height={400} lineWidth={lineWidth} domRef={canvasRef} disabled={disabled} onUp={sendCanvas} />
      <button onClick={callback}>+++</button>
    </>
  )
}

export default App
