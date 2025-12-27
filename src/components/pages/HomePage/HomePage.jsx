import SearchInfo from '../../SearchInfo'
import MenuPanel from '../../MenuPanel'
import './HomePage.css'

function HomePage() {
  return (
    <div className="home-page">
      <div className="left-panel">
        <SearchInfo />
      </div>
      <div className="right-panel">
        <MenuPanel />
      </div>
    </div>
  )
}

export default HomePage

