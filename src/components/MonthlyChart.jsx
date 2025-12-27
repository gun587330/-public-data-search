import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './Chart.css'

function MonthlyChart({ data, fullWidth = false }) {
  return (
    <div className={`chart-container ${fullWidth ? 'full-width' : ''}`}>
      <h2>월별 생산량 및 판매액</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'production') return [`${value.toLocaleString()} kg`, '생산량']
              if (name === 'sales') return [`${value.toLocaleString()} 원`, '판매액']
              return [value, name]
            }}
          />
          <Legend />
          <Line 
            yAxisId="left" 
            type="monotone" 
            dataKey="production" 
            stroke="#8884d8" 
            strokeWidth={3}
            name="생산량 (kg)"
            dot={{ r: 6 }}
            activeDot={{ r: 8 }}
          />
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="sales" 
            stroke="#82ca9d" 
            strokeWidth={3}
            name="판매액 (원)"
            dot={{ r: 6 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default MonthlyChart


