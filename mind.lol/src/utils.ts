import ethers from 'ethers'
import queue from './artifacts/Queue.sol/Queue.json'

const RPC_URL_GOERLI = "https://eth-goerli.g.alchemy.com/v2/YfqSNmcLyHB78VRlJtgRkipHqG0FGzA5"
const QUEUE_ADDRESS_GOERLI = "0xC99D016178982a20673252DAC158E4dcacD5788B"

export const getQueueGoerliContract = () => {
  // const provider = new ethers.providers.JsonRpcProvider(RPC_URL_GOERLI)
  // const wallet = new ethers.Wallet(BOT_PRIVATE_KEY!, provider)
  return new ethers.Contract(QUEUE_ADDRESS_GOERLI!, queue.abi)
}

export default getQueueGoerliContract
