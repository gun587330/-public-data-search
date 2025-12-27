import axios from 'axios'

const API_KEY = import.meta.env.VITE_API_KEY || '0db405d287f1020dccb58c108ac0a1adcbd576b6b0fd43d4e23dcc5c44d237a2'
const BASE_URL = import.meta.env.PROD 
  ? '/.netlify/functions/proxy/openapi'
  : '/openapi'
const VEGETABLES_API_URL = 'Grid_20151029000000000254_1' // 채소류 생산실적 API

/**
 * 채소류 생산량 데이터를 가져옵니다
 * @returns {Promise<Array>} 처리된 데이터 배열
 */
export const fetchVegetablesData = async () => {
  try {
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
    return processData(apiData)
  } catch (err) {
    console.error('API 호출 오류:', err)
    throw new Error(err.response?.data?.result?.message || err.message || 'API 연결 실패')
  }
}

/**
 * 원시 데이터를 처리합니다
 * @param {Array} rawData - 원시 API 데이터
 * @returns {Array} 처리된 데이터 배열
 */
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

/**
 * 년도별로 필터링하고 생산량 기준으로 정렬한 후 순위를 부여합니다
 * @param {Array} data - 처리된 데이터 배열
 * @param {number|null} year - 선택된 년도 (null이면 전체)
 * @returns {Array} 순위가 부여된 데이터 배열
 */
export const getRankedData = (data, year) => {
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

