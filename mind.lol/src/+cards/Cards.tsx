import React from 'react'
import './Cards.scss'

const maxCards = 30

const Card = ({ gif, index, show, total }: any) => {
  const cardTotal = Math.min(total, maxCards)
  const indexCards = (cardTotal === maxCards) ? index - (total - cardTotal): index

  const offsetX = 50 * ((indexCards + 1) / cardTotal) ** 3
  const offsetY = 50 * ((indexCards + 1) / cardTotal) ** 1
  const size = 600 * ((indexCards + 1) / cardTotal) ** 3

  if ((size < 50 || total - index > maxCards) || !show) return null
  return (
    <div className="Card-container" style={{
      top: `calc(${offsetY}vh - ${size/2}px)`,
      left: `calc(${offsetX}vw - ${size/2}px)`,
      width: `${size}px`,
      height: `${size}px`
    }}>
      <img key={gif} src={gif} alt="click or press space" className="Card-img" style={{
        opacity: (size + 50)/600
      }}/>
    </div>
  )
}

export default Card
