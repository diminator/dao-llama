import React from 'react'
import {useLocation} from 'react-router-dom'
import { chain, createClient, WagmiConfig } from 'wagmi'
import { ConnectKitProvider, getDefaultClient } from 'connectkit'

import queue from './artifacts/Queue.sol/Queue.json'
import './App.scss'
import { GifStream } from './+queue'
import Card from './+cards/Cards'
import Tabs from './+tabs/Tabs'
import {QueueStory} from './+queue/index'
import {ReactComponent as PauseSvg} from './img/pause.svg'

const alchemyId = process.env.REACT_APP_ALCHEMY_ID

interface ConfigProviderState {
  addressOrName?: string
  contractInterface?: any
}
export const supportedContracts = JSON.parse(process.env.REACT_APP_QUEUE_ADDRESS!)


function App() {
  const search = useLocation().search
  const paramStory = parseInt(new URLSearchParams(search).get('story') || '2', 10)
  const chainId = new URLSearchParams(search).get('chain')
  const contractConfig : ConfigProviderState = {
    addressOrName: (chainId && chainId === 'goerli') ? supportedContracts.goerli : supportedContracts.mumbai,
    contractInterface: queue.abi
  }
  const chains = [(chainId && chainId === 'goerli') ? chain.goerli : chain.polygonMumbai]

  const client = createClient(
    getDefaultClient({
      appName: 'Nevermined AI Prompt',
      alchemyId,
      chains
    })
  )

  const [fetchStories, setFetchStories] = React.useState<number>(paramStory)
  const [prompts, setPrompts] = React.useState<any[]>([])
  const [pause, setPause] = React.useState<boolean>(false)

  const handleStory = (response: any[]) => {
    const receivedPrompts = (response[0] as any[])
    setPrompts(receivedPrompts.concat(prompts))
    setFetchStories(-1)
  }

  const spaceFunction = React.useCallback((event: any) => {
    if (event.keyCode === 32) {
      setPause(!pause)
    }
  }, [pause])

  React.useEffect(() => {
    document.addEventListener("keydown", spaceFunction)

    return () => {
      document.removeEventListener("keydown", spaceFunction)
    }
  }, [spaceFunction])

  // const handleCardClick = (index: number) => {
  //   if (index === active && stories[active]){
  //     setActive(index + 1)
  //   } else {
  //     setActive(index)
  //   }
  // }
  //
  // const handleTabClick = (storyIndex: number) => {
  //   if (storyIndex > Math.max(...fetchedStories)
  //     || storyIndex < Math.min(...fetchedStories)) {
  //     setFetchStories(storyIndex)
  //   } else {
  //     setActive(stories.findIndex(s => s.storyIndex === storyIndex))
  //   }
  // }

  // const fetchedStories = [...new Set(stories.map(s => s.storyIndex))]
  // console.log(active, stories, stories[active], activeStory, stories[active] ? stories[active].storyIndex : -1)
  // console.log(gifs)
  // React.useEffect(() => {
  //   const timer = setTimeout(
  //     () => {
  //       if (!pause) {
  //         if (active > stories.length - 2) {
  //           setActive(0)
  //         } else {
  //           setActive(active + 1)
  //         }
  //       }
  //     }, 3000
  //   )
  //   return () => clearTimeout(timer)
  // })

  // React.useEffect(() => {
  //   if (gifs.length && gifs[active]) {
  // //     stories[active].show = true
  // //     if (stories[active + 1]) {
  // //       stories[active + 1].show = true
  // //     }
  // //     setStories(stories)
  //     if (active > gifs.length - 2) {
  //       console.log(gifs, active, gifs[active])
  //       // setFetchStories(gifs[active].storyIndex - 1)
  //     }
  // //     if (active < stories.length - 2) {
  // //       new Image().src = stories[active + 2].uri
  // //     }
  //   }
  // }, [active])

  // React.useEffect(()=>{
  //   if (stories.length) {
  //     if (fetchStories > -1) setFetchStories(-1)
  //     // setActive(stories.findIndex(s => s.storyIndex === fetchStories))
  //
  //   }
  // }, [stories])

  // console.log(active, gifs.length)

  // User has switched back to the tab
  const onFocus = () => {
    setPause(false)
  }

  // User has switched away from the tab (AKA tab is hidden)
  const onBlur = () => {
    setPause(true)
  }

  React.useEffect(() => {
    window.addEventListener("focus", onFocus)
    window.addEventListener("blur", onBlur)
    // Calls onFocus when the window first loads
    onFocus()
    // Specify how to clean up after this effect:
    return () => {
        window.removeEventListener("focus", onFocus)
        window.removeEventListener("blur", onBlur)
    }
  }, [])

  // const shiftedStories = stories.slice(0, active + 1)




  // console.log(gifs, active, state)
  // console.log(state.index, state.length, active, gifs.length)

  return (
    <WagmiConfig client={client}>
      <ConnectKitProvider>
        <div className="App">
          {contractConfig.addressOrName && fetchStories > -1 && (
            <QueueStory
              contractConfig={contractConfig}
              story={fetchStories}
              onSuccess={handleStory} />
          )}
          <header className="App-header">
            {/*<Tabs
              stories={stories}
              active={active}
              noMoreStories={noMoreStories}
              onClick={handleTabClick} />*/}
            {/*<div className="Cards-container">
              {shiftedStories
                .map((s: any, index: number) => (
                  <div className="Card-wrapper"
                    key={s.prompt + s.uri}
                    onClick={() => handleCardClick(index)}>
                    <Card
                      gif={s.uri}
                      index={index}
                      show={s.show}
                      total={shiftedStories.length} />
                  </div>
                ))}
              </div>
            */}
            <div className="Tiles-container">
              {/*shiftedStories.map((s: any, index: number) => (
                <div className="Tile-wrapper"
                  key={s.prompt + s.uri}
                  onClick={() => handleCardClick(index)}>
                  <div className="Tile-container">
                    <img src={s.uri} className="Tile-img" onLoad={}/>
                  </div>
                </div>
              ))} */}
              <GifStream prompts={prompts} pause={pause}/>
            </div>
            {pause && (
              <div className="Control-container" onClick={() => setPause(!pause)}>
               <PauseSvg />
               <div className="Control-label">press space</div>
             </div>
            )}
          </header>
        </div>
      </ConnectKitProvider>
    </WagmiConfig>
  )
}

export default App
