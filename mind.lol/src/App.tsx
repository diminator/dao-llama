import React from 'react'
import {useLocation} from 'react-router-dom'
import { chain, useNetwork, createClient, useContractRead, WagmiConfig } from 'wagmi'
import { ConnectKitProvider, getDefaultClient } from 'connectkit'
import queue from './artifacts/Queue.sol/Queue.json'
import './App.scss'

const alchemyId = process.env.REACT_APP_ALCHEMY_ID
const chains = [chain.polygonMumbai, chain.goerli]

const client = createClient(
  getDefaultClient({
    appName: 'Nevermined AI Prompt',
    alchemyId,
    chains
  })
)

interface ConfigProviderState {
  addressOrName?: string
  contractInterface?: any
}
export const supportedContracts = JSON.parse(process.env.REACT_APP_QUEUE_ADDRESS!)


const Card = ({ gif, index, beenActive, total }: any) => {
  const offsetX = 50 * ((index + 1) / total) ** 3
  const offsetY = 50 * ((index + 1) / total) ** 1
  const size = 600 * ((index + 1) / total) ** 3
  if (size < 50 || (index < total - 1) && !beenActive) return <div/>
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
      console.log('getPrompts', data)
      data.length && onSuccess(
        data.map((s: any[], index: number) => {
          return {
            index,
            storyIndex: story,
            ...s
        }}) as any[])
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

  const [story, setStory] = React.useState<number>(
    paramStory && parseInt(paramStory, 10) || 41)
  const [stories, setStories] = React.useState<any[]>([])
  const [active, setActive] = React.useState<number>(0)
  const [beenActive, setBeenActive] = React.useState<any>({})
  const [fetchStories, setFetchStories] = React.useState<boolean>(true)
  const [fetchedStories, setFetchedStories] = React.useState<number[]>([])


  const handleStory = (data: any[]) => {
    let parsedStories = data.slice()
    if (stories.length) {
      parsedStories = stories.concat(data.slice(1))
    }

    parsedStories = parsedStories.map((s, index) => {
      if (index >= stories.length)
        s.index += stories.length
      if (!(Object.keys(beenActive).includes(s.uri))) {
        beenActive[s.uri] = false
      }
      return s
    })

    setActive(stories.length ? stories.length - 1 : 0)
    setStories(parsedStories.filter(s => !!s.uri))
    fetchedStories.push(story)
    setBeenActive(beenActive)
    setFetchedStories(fetchedStories)
    setFetchStories(false)
  }

  const handleCardClick = (index: number) => {
    setActive(index - 1)
  }

  const handleTabClick = (index: number) => {
    setActive(stories.filter(s => s.storyIndex === index)[0].index)
  }

  const handleTabMoreClick = () => {
    setStory(story - 1)
    setFetchStories(true)
  }

  React.useEffect(() => {
    const timer = setTimeout(
      () => {
          console.log(active)
          if (active >= stories.length - 2) {
            setStory(story - 1)
            setFetchStories(true)
          }
          setActive(active + 1)

          if (!beenActive[stories[active + 1]]) {
            beenActive[stories[active].uri] = true
            setBeenActive(beenActive)
          }
          if (active < stories.length - 2)
            new Image().src = stories[active + 2].uri

      }, 3000
    )
    return () => clearTimeout(timer)
  })

  const shiftedStories = stories
      .slice()
      .slice(active + 1, stories.length)
      .concat(stories.slice(0, active + 1))
      
  return (
    <WagmiConfig client={client}>
      <ConnectKitProvider>
        <div className="App">
          {contractConfig.addressOrName && fetchStories && (
            <QueueStory contractConfig={contractConfig} story={story} onSuccess={handleStory} />
          )}
          <header className="App-header">
            <div className="Tabs-container">
              {fetchedStories.length > 1 &&
                fetchedStories.map((storyIndex: number) => {
                  return (
                    <div
                      key={`tab-${storyIndex}`}
                      className={`Tab ` + (stories[active].storyIndex === storyIndex ? 'active' : '')}
                      onClick={() => handleTabClick(storyIndex)}
                    />
                  )
                })}
                <div
                  key={`tab-more`}
                  className={'Tab Tab-more'}
                  onClick={handleTabMoreClick}
                >
                  <div className="Tab-more-label">next story</div>
                </div>
            </div>
            {
              shiftedStories
                .map((s: any, index: number) => (
              <div className="Card-wrapper"
                key={s.prompt + s.uri}
                onClick={() => handleCardClick(s.index)}>
                <Card
                  gif={s.uri}
                  index={index}
                  beenActive={beenActive[s.uri]}
                  total={stories.length}/>
              </div>
            ))}
          </header>
        </div>
      </ConnectKitProvider>
    </WagmiConfig>
  )
}

export default App
