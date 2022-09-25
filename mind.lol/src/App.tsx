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


const Card = ({ gif, index, total }: any) => {
  const offsetX = 50 * ((index + 1) / total) ** 3
  const offsetY = 50 * ((index + 1) / total) ** 1
  const size = 600 * ((index + 1) / total) ** 4
  return (
    <div className="Card-container" style={{
      top: `calc(${offsetY}vh - ${size/2}px)`,
      left: `calc(${offsetX}vw - ${size/2}px)`,
      width: `${size}px`,
      height: `${size}px`
    }}>
      <img key={gif} src={gif} className="Card-img"/>
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
        data.map((story: string[], index: number) => [index, ...story]) as any[])
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
    paramStory && parseInt(paramStory, 10) || 36)
  const [stories, setStories] = React.useState<string[]>([])
  const [active, setActive] = React.useState<number>(0)
  const [fetchStories, setFetchStories] = React.useState<boolean>(true)
  const [fetchedStories, setFetchedStories] = React.useState<number[]>([])


  const handleStory = (data: any[]) => {
    if (stories.length) {
      const parsedStories = data.concat(stories).map((story, index) => {
        console.log(index, stories.length, story[0])
        if (index >= data.length)
          story[0] += data.length
        return story
      })
      setStories(parsedStories)
      setActive(0)
    } else {
      setStories(data)
      setActive(0)
    }
    fetchedStories.push(story)
    setFetchedStories(fetchedStories)
    setFetchStories(false)
  }

  const handleCardClick = (e: any, storyIndex: number, activeIndex:number) => {
    console.log(activeIndex, storyIndex, activeIndex/stories.length)
    if ( activeIndex / stories.length < 0.5) {
      setStory(story - 1)
      setFetchStories(true)
    }
    setActive(storyIndex)
  }

  React.useEffect(() => {
    const timer = setTimeout(
      () => {
          if (active === stories.length - 1) {
            setActive(0)
            console.log(active)
          }
          else setActive(active + 1)
      }, 3000
    )
    return () => clearTimeout(timer)
  })

  const shiftedStories = active ? stories
      .slice(active + 1, stories.length)
      .concat(stories.slice(0, active + 1)) : stories
  console.log(stories, shiftedStories, active)
  return (
    <WagmiConfig client={client}>
      <ConnectKitProvider>
        <div className="App">
          {contractConfig.addressOrName && fetchStories && (
            <QueueStory contractConfig={contractConfig} story={story} onSuccess={handleStory} />
          )}
          <header className="App-header">
            {
              shiftedStories.reverse().map((story: any, index: number) => (
              <div key={story[1]+story[2]} onClick={e => handleCardClick(e, story[0], index)}>
                <Card
                  gif={story[2]}
                  index={index}
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
