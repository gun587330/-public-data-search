import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchVegetablesData, getRankedData } from './api'
import './VegetablesProduction.css'

function VegetablesProduction() {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedYear, setSelectedYear] = useState(null)
  const [availableYears, setAvailableYears] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const processedData = await fetchVegetablesData()
      setData(processedData)

      // 사용 가능한 년도 추출
      const years = [...new Set(processedData.map(item => item.YEAR))].sort((a, b) => b - a)
      setAvailableYears(years)
      if (years.length > 0 && !selectedYear) {
        setSelectedYear(years[0]) // 최신 년도 선택
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num) => {
    if (!num || num === 0) return '0'
    return Math.round(num).toLocaleString()
  }

  const formatTon = (num) => {
    if (!num || num === 0) return '0 톤'
    return `${formatNumber(num)} 톤`
  }

  const formatArea = (num) => {
    if (!num || num === 0) return '0 ha'
    return `${formatNumber(num)} ha`
  }

  const filteredData = getRankedData(data, selectedYear)

  if (loading) {
    return (
      <div className="vegetables-loading">
        <div className="spinner"></div>
        <p>데이터를 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="vegetables-production">
      <div className="vegetables-header">
        <button onClick={() => navigate('/')} className="back-button">← 뒤로가기</button>
        <h2>🥬 채소류 생산량 통계</h2>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {availableYears.length > 0 && (
        <div className="year-filter">
          <label>
            년도 선택:
            <select 
              value={selectedYear || ''} 
              onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">전체</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}년</option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="vegetables-summary">
        <p>총 {filteredData.length}개 품목</p>
      </div>

      <div className="vegetables-table-container">
        <table className="vegetables-table">
          <thead>
            <tr>
              <th>순위</th>
              <th>작물명</th>
              <th>분류</th>
              <th>생산량</th>
              <th>면적</th>
              <th>단수</th>
              <th>년도</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr key={`${item.YEAR}-${item.VGETBL_CL}-${index}`}>
                  <td className="rank-cell">{item.rank}</td>
                  <td className="crop-name">{item.VGETBL_CL}</td>
                  <td className="category">{item.VGETBL_BUNDLE_CL || '-'}</td>
                  <td className="production">{formatTon(item.OUTTRN_SM)}</td>
                  <td className="area">{formatArea(item.AR_SM)}</td>
                  <td className="yield">{item.STGCO_SM > 0 ? `${formatNumber(item.STGCO_SM)} kg/ha` : '-'}</td>
                  <td className="year">{item.YEAR}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">데이터가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default VegetablesProduction

