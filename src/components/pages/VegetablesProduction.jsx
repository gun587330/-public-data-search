import { useState, useEffect } from 'react'
import axios from 'axios'
import './VegetablesProduction.css'

const API_KEY = import.meta.env.VITE_API_KEY || '0db405d287f1020dccb58c108ac0a1adcbd576b6b0fd43d4e23dcc5c44d237a2'
const BASE_URL = import.meta.env.PROD 
  ? '/.netlify/functions/proxy/openapi'
  : '/openapi'
const VEGETABLES_API_URL = 'Grid_20151029000000000254_1' // 채소류 생산실적 API

function VegetablesProduction({ onBack }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedYear, setSelectedYear] = useState(null)
  const [availableYears, setAvailableYears] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 전체 데이터 가져오기 (최대 1000건)
      const url = `${BASE_URL}/${API_KEY}/json/${VEGETABLES_API_URL}/1/1000`
      
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        responseType: 'json'
      })

      let apiData = []
      const data = response.data

      // 응답 구조 파싱
      if (data[VEGETABLES_API_URL]) {
        const apiResponse = data[VEGETABLES_API_URL]
        if (apiResponse.row) {
          apiData = Array.isArray(apiResponse.row) ? apiResponse.row : [apiResponse.row]
        }
      } else if (data.row) {
        apiData = Array.isArray(data.row) ? data.row : [data.row]
      }

      // 데이터 필터링 및 처리
      const processedData = processData(apiData)
      setData(processedData)

      // 사용 가능한 년도 추출
      const years = [...new Set(processedData.map(item => item.YEAR))].sort((a, b) => b - a)
      setAvailableYears(years)
      if (years.length > 0 && !selectedYear) {
        setSelectedYear(years[0]) // 최신 년도 선택
      }

    } catch (err) {
      console.error('API 호출 오류:', err)
      setError(err.response?.data?.result?.message || err.message || 'API 연결 실패')
    } finally {
      setLoading(false)
    }
  }

  const processData = (rawData) => {
    // 1. 전국 데이터만 필터링 (SE = "전 국")
    // 2. 실제 작물명만 필터링 (VGETBL_CL != "계")
    // 3. 숫자 변환
    const filtered = rawData
      .filter(item => item.SE === '전 국' && item.VGETBL_CL && item.VGETBL_CL !== '계')
      .map(item => ({
        ...item,
        OUTTRN_SM: parseFloat(item.OUTTRN_SM) || 0,
        AR_SM: parseFloat(item.AR_SM) || 0,
        STGCO_SM: parseFloat(item.STGCO_SM) || 0,
        YEAR: parseInt(item.YEAR) || 0,
      }))

    return filtered
  }

  const getRankedData = (data, year) => {
    // 년도별로 필터링하고 생산량 기준 정렬 후 순위 부여
    const yearData = year 
      ? data.filter(item => item.YEAR === year)
      : data
    
    return yearData
      .sort((a, b) => b.OUTTRN_SM - a.OUTTRN_SM) // 생산량 내림차순
      .map((item, index) => ({
        ...item,
        rank: index + 1
      }))
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
        <button onClick={onBack} className="back-button">← 뒤로가기</button>
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

