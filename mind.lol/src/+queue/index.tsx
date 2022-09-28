import { useContractRead } from 'wagmi'

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
            index,
            storyIndex: story,
            show: index < 4,
            ...s
        }}), story] as any[])
    }
  })
  return null
}
