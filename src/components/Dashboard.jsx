import { useState } from 'react'
import SummaryCards from './SummaryCards'
import CropChart from './CropChart'
import MonthlyChart from './MonthlyChart'
import SensorChart from './SensorChart'
import './Dashboard.css'

function Dashboard({ data }) {
  const [selectedView, setSelectedView] = useState('overview')

  return (
    <div className="dashboard">
      <div className="dashboard-nav">
        <button
          className={selectedView === 'overview' ? 'active' : ''}
          onClick={() => setSelectedView('overview')}
        >
          📊 개요
        </button>
        <button
          className={selectedView === 'crops' ? 'active' : ''}
          onClick={() => setSelectedView('crops')}
        >
          🌾 작물별 통계
        </button>
        <button
          className={selectedView === 'monthly' ? 'active' : ''}
          onClick={() => setSelectedView('monthly')}
        >
          📅 월별 통계
        </button>
        <button
          className={selectedView === 'sensors' ? 'active' : ''}
          onClick={() => setSelectedView('sensors')}
        >
          🌡️ 센서 데이터
        </button>
      </div>

      <div className="dashboard-content">
        {selectedView === 'overview' && (
          <>
            <SummaryCards summary={data.summary} />
            <div className="charts-grid">
              <CropChart data={data.cropData} />
              <MonthlyChart data={data.monthlyData} />
            </div>
          </>
        )}
        {selectedView === 'crops' && <CropChart data={data.cropData} fullWidth />}
        {selectedView === 'monthly' && <MonthlyChart data={data.monthlyData} fullWidth />}
        {selectedView === 'sensors' && <SensorChart data={data.sensorData} fullWidth />}
      </div>
    </div>
  )
}

export default Dashboard

