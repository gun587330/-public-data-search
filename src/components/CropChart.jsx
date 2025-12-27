import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './Chart.css'

function CropChart({ data, fullWidth = false }) {
  return (
    <div className={`chart-container ${fullWidth ? 'full-width' : ''}`}>
      <h2>작물별 생산량 및 재배면적</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'production') return [`${value.toLocaleString()} kg`, '생산량']
              if (name === 'area') return [`${value.toLocaleString()} ㎡`, '재배면적']
              return [value, name]
            }}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="production" fill="#8884d8" name="생산량 (kg)" />
          <Bar yAxisId="right" dataKey="area" fill="#82ca9d" name="재배면적 (㎡)" />
        </BarChart>
      </ResponsiveContainer>
      
      <div className="chart-table">
        <table>
          <thead>
            <tr>
              <th>작물명</th>
              <th>생산량 (kg)</th>
              <th>재배면적 (㎡)</th>
              <th>평균 가격 (원/kg)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.production.toLocaleString()}</td>
                <td>{item.area.toLocaleString()}</td>
                <td>{item.price.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CropChart

