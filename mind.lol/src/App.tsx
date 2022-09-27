import React from 'react'
import {useLocation} from 'react-router-dom'
import ReactGA from 'react-ga'
import { chain, useNetwork, createClient, useContractRead, WagmiConfig } from 'wagmi'
import { ConnectKitProvider, getDefaultClient } from 'connectkit'
import queue from './artifacts/Queue.sol/Queue.json'
import './App.scss'
import {ReactComponent as PauseSvg} from './img/pause.svg'

const alchemyId = process.env.REACT_APP_ALCHEMY_ID
const maxCards = 30

interface ConfigProviderState {
  addressOrName?: string
  contractInterface?: any
}
export const supportedContracts = JSON.parse(process.env.REACT_APP_QUEUE_ADDRESS!)


const Card = ({ gif, index, beenActive, total, children }: any) => {
  const cardTotal = Math.min(total, maxCards)
  const indexCards = (cardTotal === maxCards) ? index - (total - cardTotal): index
  const offsetX = 50 * ((indexCards + 1) / cardTotal) ** 3
  const offsetY = 50 * ((indexCards + 1) / cardTotal) ** 1
  const size = 600 * ((indexCards + 1) / cardTotal) ** 3

  if ((size < 50 || total - index > maxCards) || (index < total - 1) && !beenActive) return null
  return (
    <div className="Card-container" style={{
      top: `calc(${offsetY}vh - ${size/2}px)`,
      left: `calc(${offsetX}vw - ${size/2}px)`,
      width: `${size}px`,
      height: `${size}px`
    }}>
    <img key={gif} src={gif} className="Card-img" style={{
      opacity: (size + 50)/600
    }} />
    </div>
  )
}

const QueueStory = ({ contractConfig, story, onSuccess }: any) => {
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
            index,
            storyIndex: story,
            ...s
        }}), story] as any[])
    }
  })

  return null
}


function App() {
  const search = useLocation().search
  const paramStory = new URLSearchParams(search).get('story')
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

  const [story, setStory] = React.useState<number>(
    paramStory && parseInt(paramStory, 10) || 41)
  const [stories, setStories] = React.useState<any[]>([])
  const [active, setActive] = React.useState<number>(0)
  const [pause, setPause] = React.useState<boolean>(false)
  const [beenActive, setBeenActive] = React.useState<any>({})
  const [fetchStories, setFetchStories] = React.useState<boolean>(true)
  const [fetchedStories, setFetchedStories] = React.useState<number[]>([])
  const [noMoreStories, setNoMoreStories] = React.useState<boolean>(false)

  const handleStory = (response: any[]) => {
    const data = response[0]
    const storyIndex = response[1]

    let parsedStories = data.slice() as any[]
    // TODO check stories length from queue
    if (!data.length) {
      setNoMoreStories(true)
      setFetchStories(false)
      return
    }

    if (fetchedStories.indexOf(story) >= 0) {
      return
    }

    if (stories.length) {
      if (storyIndex >= story ) {
        console.log('reverse')
        parsedStories = stories.concat(data.slice(1))
        fetchedStories.unshift(story)
      } else {
        parsedStories = stories.concat(data.slice(1))
        fetchedStories.push(story)
      }
    } else {
      fetchedStories.push(story)
    }

    parsedStories = parsedStories.map((s, index) => {
      s.index = index
      if (!(Object.keys(beenActive).includes(s.uri))) {
        beenActive[s.uri] = false
      }
      return s
    })
    setStories(parsedStories
      .filter(s => !!s.uri)
      .sort((a, b) => {
        if (a.storyIndex === b.storyIndex) return (a.index - b.index)
        return (b.storyIndex - a.storyIndex)
      }))
    setBeenActive(beenActive)
    setFetchedStories(fetchedStories.sort((a, b) => b - a))
    setFetchStories(false)
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

  const handleCardClick = (index: number) => {
    if (index === active && stories[active]){
      beenActive[stories[active].uri] = true
      setBeenActive(beenActive)
      setActive(index + 1)
    }
    else {
      setActive(index)
    }
    stories[index] && setStory(stories[index].storyIndex)
  }

  const handleTabClick = (index: number) => {
    beenActive[stories[active].uri] = true
    setActive(stories.filter(s => s.storyIndex === index)[0].index)
    setStory(index)
  }

  const handleTabMoreClick = (nextStory: number) => {
    if (stories[active]) beenActive[stories[active].uri] = true
    if (!(fetchedStories.indexOf(nextStory) > -1)) {
      setStory(nextStory)
      setFetchStories(true)
      setActive(stories.length)
    }
  }

  React.useEffect(() => {
    const timer = setTimeout(
      () => {
        if (!pause) {
          if (active >= stories.length - 2) {
            console.log(story, fetchedStories)
            if (story && fetchedStories.indexOf(story - 1) === -1) {
              console.log('fetch story', story, fetchedStories.indexOf(story - 1))
              setStory(story - 1)
              setFetchStories(true)
              setActive(active + 1)
              return
            } else {
              console.log('done')
              setActive(0)
            }
          }
          if (!beenActive[stories[active]]) {
            beenActive[stories[active].uri] = true
            setBeenActive(beenActive)
          }
          if (active < stories.length - 2) {
            setActive(active + 1)
            setStory(stories[active].storyIndex)
            new Image().src = stories[active + 2].uri
          }
        }
      }, 3000
    )
    return () => clearTimeout(timer)
  })

  // User has switched back to the tab
  const onFocus = () => {
    setPause(false)
  }

  // User has switched away from the tab (AKA tab is hidden)
  const onBlur = () => {
    setPause(true)
  }

  React.useEffect(() => {
    ReactGA.initialize('G-QY6WEXMEKX')
    ReactGA.pageview(window.location.pathname + window.location.search)

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

  const activeIndex = stories.map(s=>s.index).indexOf(active) || active
  const shiftedStories = stories
    .slice()
    .slice(activeIndex + 1, stories.length)
    .concat(stories.slice(0, activeIndex + 1))
  console.log(active, story)
  return (
    <WagmiConfig client={client}>
      <ConnectKitProvider>
        <div className="App">
          {contractConfig.addressOrName && fetchStories && (
            <QueueStory contractConfig={contractConfig} story={story} onSuccess={handleStory} />
          )}
          <header className="App-header">
            <div className="Tabs-container">
              { !noMoreStories && fetchedStories.length && (
                <div className="Tab-container">
                  <div
                    key={`tab-less`}
                    className={'Tab Tab-less'}
                    onClick={() => handleTabMoreClick(Math.max(...fetchedStories) + 1)}
                  >
                    <div className="Tab-label">next</div>
                  </div>
                </div>
              )}
              {fetchedStories.length > 1 &&
                fetchedStories.map((storyIndex: number) => {
                  return (
                    <div key={`tab-${storyIndex}`}
                      onClick={() => handleTabClick(storyIndex)}
                      className="Tab-container">
                      <div className={`Tab ` + (
                        stories[active] && storyIndex === story ? 'active' : ''
                      )}/>
                      {stories[active]
                        && stories[active].storyIndex
                        && stories.filter(s => s.storyIndex === storyIndex).length ? (
                        <Card
                          gif={stories.filter(s => s.storyIndex === storyIndex)[0].uri}
                          index={storyIndex}
                          beenActive={true}
                          total={1}/>
                        ) : null }
                    </div>
                  )
                })}
              { story > 0 && Math.min(...fetchedStories) > 0 && (
                <div className="Tab-container">
                  <div
                    key={`tab-more`}
                    className={'Tab Tab-more'}
                    onClick={() => handleTabMoreClick(Math.min(...fetchedStories) - 1)}
                  >
                    <div className="Tab-label">prev</div>
                  </div>
                </div>
              )}
            </div>
            <div className="Cards-container">
              {shiftedStories
                .map((s: any, index: number) => (
                  <div className="Card-wrapper"
                    key={s.prompt + s.uri}
                    onClick={() => handleCardClick(s.index)}>
                    <Card
                      gif={s.uri}
                      index={index}
                      beenActive={beenActive[s.uri]}
                      total={stories.length} />
                  </div>
                ))}
              </div>
            {pause && (
              <div className="Control-container">
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
