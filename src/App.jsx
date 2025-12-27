import { useState } from 'react'
import SearchInfo from './components/SearchInfo'
import MenuPanel from './components/MenuPanel'
import VegetablesProduction from './components/pages/VegetablesProduction'
import './App.css'

function App() {
  const [selectedPage, setSelectedPage] = useState(null)

  const handleSelectPage = (pageId) => {
    setSelectedPage(pageId)
  }

  const handleBack = () => {
    setSelectedPage(null)
  }

  const renderRightPanel = () => {
    switch (selectedPage) {
      case 'vegetables':
        return <VegetablesProduction onBack={handleBack} />
      case 'fruits':
        // 추후 구현
        return <div>과일류 생산량 페이지 (준비 중)</div>
      case 'waste':
        // 추후 구현
        return <div>폐기율 통계 페이지 (준비 중)</div>
      default:
        return <MenuPanel onSelectPage={handleSelectPage} />
    }
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>🌾 농림축산식품 공공데이터 포털</h1>
        <p className="subtitle">농산물 통계 분석 대시보드</p>
      </header>

      <div className="main-container">
        <div className="left-panel">
          <SearchInfo />
        </div>
        <div className="right-panel">
          {renderRightPanel()}
        </div>
      </div>
    </div>
  )
}

export default App
