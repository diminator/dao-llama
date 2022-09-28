import React from 'react'
import Card from '../+cards/Cards'
import './Tabs.scss'

const Tabs = ({ stories, active, noMoreStories, onClick }: any) => {
  if (!stories || !stories.length) return null

  const fetchedStories = [...new Set(stories.map((s:any) => s.storyIndex))] as number[]
  const story = stories[active] && stories[active].storyIndex
  return (
    <div className="Tabs-container">
      { stories.length && !noMoreStories && (
        <div className="Tab-container">
          <div
            key={`tab-less`}
            className={'Tab Tab-less'}
            onClick={() => onClick(Math.max(...fetchedStories) + 1)}
          >
            <div className="Tab-label">next</div>
          </div>
        </div>
      )}
      {fetchedStories.length > 1 &&
        fetchedStories.map((index: number) => {
          const firstOfStory = stories.find((s: any) => s.storyIndex === index)
          console.log(firstOfStory)
          return (
            <div key={`tab-${index}`}
              onClick={() => onClick(index)}
              className="Tab-container">
              <div className={`Tab ` + (
                index === story ? 'active' : ''
              )}/>
                <Card
                  gif={firstOfStory.uri}
                  index={index}
                  show={true}
                  total={1}/>
            </div>
          )
        })}
      { story > 0 && Math.min(...fetchedStories) > 0 && (
        <div className="Tab-container">
          <div
            key={`tab-more`}
            className={'Tab Tab-more'}
            onClick={() => onClick(Math.min(...fetchedStories) - 1)}
          >
            <div className="Tab-label">prev</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Tabs
