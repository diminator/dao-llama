import React from 'react'
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
    <div className="Card-container">
      <img key={gif} src={gif} className="Card-img" style={{
        top: `calc(${offsetY}vh - ${size/2}px)`,
        left: `calc(${offsetX}vw - ${size/2}px)`,
        width: `${size}px`,
        height: `${size}px`
      }}/>
    </div>
)
}

const QueueStory = ({ contractConfig, onSuccess }: any) => {
  // conditional hook as rendered component
  useContractRead({
    ...contractConfig,
    functionName: 'getPrompts',
    args: [36],
    onSuccess: async (data) => {
      // const metadata = await parseMetadata(data)
      console.log('getPrompts', data)
      data.length && onSuccess(data as string[])
    }
  })

  return null
}


function App() {
  const [stories, setStories] = React.useState<string[]>([])
  const [fetchStories, setFetchStories] = React.useState<boolean>(true)
  const [contractConfig, setContractConfig] = React.useState<ConfigProviderState>({
    addressOrName: supportedContracts.goerli && supportedContracts.mumbai,
    contractInterface: queue.abi
  })

  const handleStory = (data: any[]) => {
    setStories(data)
    setFetchStories(false)
  }

  return (
    <WagmiConfig client={client}>
      <ConnectKitProvider>
        <div className="App">
          {contractConfig.addressOrName && fetchStories && <QueueStory contractConfig={contractConfig} onSuccess={handleStory} />}
          <header className="App-header">
            {stories.map((story, index) => (
              <Card
                key={index}
                gif={story[1]}
                index={index}
                total={stories.length}/>
            ))}
          </header>
        </div>
      </ConnectKitProvider>
    </WagmiConfig>
  )
}

export default App
