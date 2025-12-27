import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './Chart.css'

function SensorChart({ data, fullWidth = false }) {
  return (
    <div className={`chart-container ${fullWidth ? 'full-width' : ''}`}>
      <h2>시간별 센서 데이터 (24시간)</h2>
      <ResponsiveContainer width="100%" height={500}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="hour" 
            label={{ value: '시간', position: 'insideBottom', offset: -5 }}
          />
          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'temperature') return [`${value.toFixed(1)}°C`, '온도']
              if (name === 'humidity') return [`${value.toFixed(1)}%`, '습도']
              if (name === 'co2') return [`${value.toFixed(0)} ppm`, 'CO₂']
              return [value, name]
            }}
            labelFormatter={(label) => `${label}시`}
          />
          <Legend />
          <Area 
            yAxisId="left"
            type="monotone" 
            dataKey="temperature" 
            fill="#8884d8" 
            fillOpacity={0.3}
            stroke="#8884d8"
            strokeWidth={2}
            name="온도 (°C)"
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="humidity" 
            stroke="#82ca9d" 
            strokeWidth={2}
            name="습도 (%)"
            dot={false}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="co2" 
            stroke="#ff7300" 
            strokeWidth={2}
            name="CO₂ (ppm)"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      <div className="sensor-stats">
        <div className="stat-item">
          <span className="stat-label">평균 온도:</span>
          <span className="stat-value">
            {(data.reduce((sum, d) => sum + d.temperature, 0) / data.length).toFixed(1)}°C
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">평균 습도:</span>
          <span className="stat-value">
            {(data.reduce((sum, d) => sum + d.humidity, 0) / data.length).toFixed(1)}%
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">평균 CO₂:</span>
          <span className="stat-value">
            {(data.reduce((sum, d) => sum + d.co2, 0) / data.length).toFixed(0)} ppm
          </span>
        </div>
      </div>
    </div>
  )
}

export default SensorChart


