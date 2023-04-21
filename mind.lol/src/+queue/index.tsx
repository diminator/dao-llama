import React from 'react'
import { useAsyncFn } from 'react-use'
import { useContractRead } from 'wagmi'
import { Canvas, useWorkerParser, usePlayback, usePlayerState } from '@react-gifs/tools'

import './index.scss'


const SPEED = 1
const IMG_DELAY = 1000
const LOADING_GIF = 'https://media.giphy.com/media/hRLz2uLh5AX1zPsjOS/giphy.gif'

export const QueueStory = ({ contractConfig, story, onSuccess }: any) => {
  // conditional hook as rendered component
  useContractRead({
    ...contractConfig,
    functionName: 'getPrompts',
    args: [story],
    onSuccess: async (data: any) => {
      // const metadata = await parseMetadata(data)
      console.log('getPrompts', story, data)
      onSuccess(
        [data.map((s: any[], index: number) => {
          return {
            promptIndex: index,
            storyIndex: story,
            ...s
        }}), story] as any[])
    }
  })
  return null
}


export const convertURIToImageData = (url: string) => {
  return new Promise((resolve, reject) => {
    if (!url) {
      return reject();
    }
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    const image = new Image();
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      context!.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(context!.getImageData(0, 0, canvas.width, canvas.height));
    }
    image.crossOrigin = "Anonymous";
    image.src = url;
  });
}

export const Gif = ({ gifLoading, gif, onLoad }: any) => {
  React.useEffect(()=> {
    console.log('mount')
    return () => {
      console.log('unmount')
    }
  }, [])
  // useWorkerParser(gif.uri, (info: any) => {
  //   console.log('loaded info')
  //   if (info.error && info.error.code !== 20) {
  //     console.error('error', info)
  //     // const img = await convertURIToImageData(gif.uri)
  //     // onLoad({
  //     //   ...gif,
  //     //   frames: [img],
  //     //   delays: [IMG_DELAY],
  //     //   promptIndex: [gifLoading]
  //     // })
  //   } else {
  //     onLoad({
  //       ...gif,
  //       ...info
  //     })
  //   }
  // })

  // React.useEffect(() => {
  //   return () => {
  //       console.log('will unmount', gif)
  //   }
  // }, [])
  return null
}


export const GifStream = ({ prompts, pause }: any) => {
  // const speed = SPEED
  // const [gifs, setGifs] = React.useState<any>([])
  // const [promptIndices, setPromptIndices] = React.useState<number[]>([])
  // const [state, update] = usePlayerState()
  // const [gifLoading, setGifLoading] = React.useState<number>(0)

  // React.useEffect(() => {
  //   if (prompts.length) {
  //     setGifs(prompts.map((p : any) => {
  //       if (!p.uri) {
  //         return {
  //           ...p,
  //           uri: LOADING_GIF
  //         }
  //       } else {
  //         return p
  //       }
  //     }).map((p: any) => {
  //       return {
  //         ...p,
  //         loaded: false
  //       }
  //     }))
  //   }
  // }, [prompts])

  // const delays = React.useMemo(() => state.delays.map((delay: number) => delay / speed), [
  //   state.delays,
  //   speed,
  // ])
  // const gifActive = React.useMemo(() => promptIndices[state.index], [state.index])
  // const setGifActive = (promptIndex: number) => {
  //   // update({index: promptIndices.indexOf(promptIndex)})
  // }
  //
  // const onLoadGif = (gif: any) => {
  //   console.log('here', gif)
  //   if (!gif || !gif.frames) {
  //     console.log('was here 1 ')
  //     if (gif && gif.error && gif.error.message === "Failed to fetch") {
  //       setGifLoading(gifLoading + 1)
  //       console.log('was here')
  //     }
  //     return
  //   }
  //   // only for loop = true
  //   const length = Math.ceil(gif.frames.length / 2)
  //
  //   const insertIndex = promptIndices
  //     .filter((p: number) => p < gif.promptIndex)
  //     .length
  //
  //   promptIndices.splice(insertIndex, 0,
  //     ...Array.from({length: length}, () => gif.promptIndex)
  //   )
  //   setPromptIndices(promptIndices)
  //
  //   const frames = [...state.frames]
  //   frames.splice(insertIndex, 0, ...gif.frames.slice(0, length))
  //   const delays = [...state.delays]
  //   delays.splice(insertIndex, 0, ...gif.delays.slice(0, length))
  //
  //   update({
  //     loaded: true,
  //     playing: true,
  //     frames: frames,
  //     delays: delays,
  //     length: state.length + length,
  //   })
  //
  //   setGifLoading(gifLoading + 1)
  // }

  // usePlayback({...state}, () => {
  //   update(({ index } : any) => ({
  //     index: (index === state.length - 1 &&
  //           gifLoading < gifs.length) || pause ? index : index + 1}))
  // })


  return (
    <div className="GifStream-container">
      { /* gifLoading > -1 && gifs.length && gifs[gifLoading] && <Gif
        onLoad={onLoadGif}
        gifLoading={gifLoading}
        gif={gifs[gifLoading]} /> */
      }
      <Gif onLoad={()=> {}} gifLoading={0} gifs={prompts[0]}/>
      { /*<Canvas
        index={state.index}
        frames={state.frames}
        width={512}
        height={512}
        fit='fill'
      /> */}
      <div>
      {/* gifs.map((gif: any) => {
        return (
          <div key={gif.promptIndex}
            style={{
              color: gifActive === gif.promptIndex ? 'yellow' : 'grey',
              background: 'black',
              cursor: 'pointer'
            }}
            onClick={() => setGifActive(gif.promptIndex)}>
            { gif.prompt }
          </div>
        )
      }) */}
      </div>
    </div>
  )
}
