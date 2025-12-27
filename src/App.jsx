import { Routes, Route } from 'react-router-dom'
import HomePage from './components/pages/HomePage/HomePage'
import VegetablesProduction from './components/pages/VegetablesProductionPage/VegetablesProduction'
import './App.css'

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1>🌾 농림축산식품 공공데이터 포털</h1>
        <p className="subtitle">농산물 통계 분석 대시보드</p>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/vegetables" element={<VegetablesProduction />} />
        {/* 추후 추가될 라우트들 */}
        {/* <Route path="/fruits" element={<FruitsProduction />} /> */}
        {/* <Route path="/waste" element={<WasteStatistics />} /> */}
      </Routes>
    </div>
  )
}

export default App
