import { useState, useEffect } from 'react'
import axios from 'axios'
import DataList from './components/DataList'
import './App.css'

// 환경 변수에서 API 키 가져오기 (Vite는 VITE_ 접두사 필요)
const API_KEY = import.meta.env.VITE_API_KEY || '0db405d287f1020dccb58c108ac0a1adcbd576b6b0fd43d4e23dcc5c44d237a2'
// 농림축산식품 공공데이터 포털 API 엔드포인트
// 샘플: /openapi/sample/{TYPE}/Grid_20210909000000000613_1/{START_INDEX}/{END_INDEX} (최대 5건)
// 실제: /openapi/{API_KEY}/{TYPE}/Grid_20210909000000000613_1/{START_INDEX}/{END_INDEX}
// 개발 환경: Vite 프록시 사용, 프로덕션: Netlify Functions 프록시 사용
const BASE_URL = import.meta.env.PROD 
  ? '/.netlify/functions/proxy/openapi'  // 프로덕션: Netlify Functions 프록시 (HTTPS)
  : '/openapi'  // 개발: Vite 프록시 사용
const API_URL = 'Grid_20210909000000000613_1'
const USE_SAMPLE = false // 샘플 API 사용 여부 (true: 최대 5건, false: 전체 조회 가능)

function App() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    startIndex: 1,
    endIndex: 10, // 기본값을 10으로 설정 (실제 API 사용 시)
    dataType: 'json', // 'json' or 'xml'
    koreanNm: '', // 데이터셋명 검색 (부분 일치)
  })
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    fetchData()
  }, [])

  const parseXML = (xmlString) => {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml')
    const rootElement = xmlDoc.documentElement
    
    // totalCnt 추출
    const totalCntElement = rootElement.querySelector('totalCnt')
    const totalCnt = totalCntElement ? parseInt(totalCntElement.textContent) : 0
    setTotalCount(totalCnt)
    
    // row 요소들 추출 (명세서에 따르면 <row> 태그가 여러 개)
    const rows = rootElement.querySelectorAll('row')
    const data = Array.from(rows).map((row, index) => {
      const obj = {}
      Array.from(row.children).forEach(child => {
        const tagName = child.tagName
        const textContent = child.textContent || ''
        // 빈 값이 아닌 경우에만 추가
        if (textContent.trim() !== '') {
          obj[tagName] = textContent
        }
      })
      // ROW_NUM이 없으면 인덱스로 추가 (중복 체크용)
      if (!obj.ROW_NUM) {
        obj.ROW_NUM = index + 1
      }
      return obj
    })
    
    // 중복 제거 (DATASET_ID와 DATA_ID 조합으로)
    const uniqueData = []
    const seen = new Set()
    data.forEach(item => {
      const key = `${item.DATASET_ID}_${item.DATA_ID}_${item.ROW_NUM}`
      if (!seen.has(key)) {
        seen.add(key)
        uniqueData.push(item)
      }
    })
    
    return uniqueData
  }

  const fetchData = async (page = currentPage, size = pageSize) => {
    try {
      setLoading(true)
      setError(null)
      
      // 샘플 API는 최대 5건만 가능
      const maxEndIndex = USE_SAMPLE ? 5 : filters.endIndex
      const startIdx = USE_SAMPLE ? 1 : ((page - 1) * size + 1)
      const endIdx = USE_SAMPLE ? 5 : Math.min(page * size, totalCount || filters.endIndex)
      
      // URL 구성
      // 샘플: /openapi/sample/{TYPE}/Grid_20210909000000000613_1/{START_INDEX}/{END_INDEX}
      // 실제: /openapi/{API_KEY}/{TYPE}/Grid_20210909000000000613_1/{START_INDEX}/{END_INDEX}
      // 주의: API가 부분 일치 검색을 지원하지 않으므로, 전체 데이터를 가져온 후 클라이언트에서 필터링
      const apiPath = USE_SAMPLE ? 'sample' : API_KEY
      
      // 검색어가 있으면 더 많은 데이터를 가져와서 클라이언트에서 필터링
      // 검색어가 없으면 페이지네이션대로 가져옴
      let fetchStartIdx = startIdx
      let fetchEndIdx = endIdx
      
      if (filters.koreanNm && filters.koreanNm.trim() !== '') {
        // 검색 시에는 더 많은 데이터를 가져와서 클라이언트에서 필터링
        // totalCount가 0이거나 없으면 일단 1000건을 가져옴
        fetchStartIdx = 1
        fetchEndIdx = totalCount > 0 ? Math.min(1000, totalCount) : 1000
      }
      
      const url = `${BASE_URL}/${apiPath}/${filters.dataType}/${API_URL}/${fetchStartIdx}/${fetchEndIdx}`
      
      // API 파라미터는 사용하지 않음 (부분 일치 검색 미지원)
      const params = {}
      
      const response = await axios.get(url, {
        params: params, // 쿼리 파라미터로 추가
        headers: {
          'Content-Type': filters.dataType === 'json' ? 'application/json' : 'application/xml',
        },
        responseType: filters.dataType === 'json' ? 'json' : 'text'
      })

      let apiData = []
      
      if (filters.dataType === 'xml') {
        // XML 파싱
        apiData = parseXML(response.data)
        
        // XML 응답도 클라이언트 사이드 필터링 적용
        if (filters.koreanNm && filters.koreanNm.trim() !== '') {
          const searchTerm = filters.koreanNm.trim().toLowerCase()
          apiData = apiData.filter(item => {
            const koreanNm = (item.KOREAN_NM || '').toLowerCase()
            return koreanNm.includes(searchTerm)
          })
          
          // 필터링 후 totalCount 업데이트 (검색 결과 개수)
          setTotalCount(apiData.length)
        }
      } else {
        // JSON 응답 처리 (명세서에 따르면 응답 구조 확인 필요)
        const data = response.data
        console.log('API 응답 데이터:', data) // 디버깅용
        
        // 응답 구조에 따라 데이터 추출
        // 가능한 구조:
        // 1. { "Grid_20210909000000000613_1": { totalCnt, result, row: [...] } }
        // 2. { totalCnt, result, row: [...] }
        let apiResponse = null
        
        if (data[API_URL]) {
          // 구조 1: API_URL을 키로 가진 객체
          apiResponse = data[API_URL]
        } else if (data.totalCnt !== undefined || data.row !== undefined) {
          // 구조 2: 직접 totalCnt나 row가 있는 경우
          apiResponse = data
        }
        
        if (apiResponse) {
          // totalCnt 추출
          if (apiResponse.totalCnt) {
            setTotalCount(parseInt(apiResponse.totalCnt))
          }
          
          // row 데이터 추출 (명세서에 따르면 row는 배열)
          if (apiResponse.row) {
            if (Array.isArray(apiResponse.row)) {
              apiData = apiResponse.row
            } else {
              // 단일 객체인 경우 배열로 변환
              apiData = [apiResponse.row]
            }
          }
        } else {
          // 예상치 못한 구조
          console.warn('예상치 못한 응답 구조:', data)
          if (Array.isArray(data)) {
            apiData = data
          }
        }
        
        // 중복 제거 (DATASET_ID와 DATA_ID 조합으로)
        const uniqueData = []
        const seen = new Set()
        apiData.forEach((item, index) => {
          // ROW_NUM이 없으면 인덱스로 추가
          if (!item.ROW_NUM) {
            item.ROW_NUM = index + 1
          }
          const key = `${item.DATASET_ID || ''}_${item.DATA_ID || ''}_${item.ROW_NUM || index}`
          if (!seen.has(key)) {
            seen.add(key)
            uniqueData.push(item)
          }
        })
        apiData = uniqueData
        
        // 클라이언트 사이드 필터링 (API가 부분 일치 검색을 지원하지 않음)
        if (filters.koreanNm && filters.koreanNm.trim() !== '') {
          const searchTerm = filters.koreanNm.trim().toLowerCase()
          apiData = apiData.filter(item => {
            const koreanNm = (item.KOREAN_NM || '').toLowerCase()
            return koreanNm.includes(searchTerm)
          })
          
          // 필터링 후 totalCount 업데이트 (검색 결과 개수)
          setTotalCount(apiData.length)
        }
      }

      // 에러 응답 체크
      if (filters.dataType === 'json' && response.data.result && response.data.result.code !== 'INFO-000') {
        throw new Error(response.data.result.message || 'API 오류가 발생했습니다.')
      }

      // 검색어가 있으면 필터링된 결과에 페이지네이션 적용
      let finalData = apiData
      if (filters.koreanNm && filters.koreanNm.trim() !== '') {
        // 검색 결과에 페이지네이션 적용
        const paginationStart = (currentPage - 1) * pageSize
        const paginationEnd = paginationStart + pageSize
        finalData = apiData.slice(paginationStart, paginationEnd)
      }
      
      if (finalData.length === 0) {
        setData([])
        setError(filters.koreanNm && filters.koreanNm.trim() !== '' 
          ? `"${filters.koreanNm}" 검색 결과가 없습니다.` 
          : '조회된 데이터가 없습니다.')
      } else {
        setData(finalData)
        setError(null)
      }
    } catch (err) {
      console.error('API 호출 오류:', err)
      setData([])
      setError(err.response?.data?.result?.message || err.message || 'API 연결 실패')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value)
    setPageSize(newSize)
    setCurrentPage(1)
    fetchData(1, newSize)
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    fetchData(newPage, pageSize)
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchData(1, pageSize)
  }

  // 페이지네이션 계산
  // 검색어가 있으면 필터링된 결과의 개수로 계산
  const displayTotalCount = filters.koreanNm && filters.koreanNm.trim() !== '' 
    ? totalCount  // 필터링된 결과 개수
    : totalCount  // 전체 개수
  const totalPages = displayTotalCount > 0 ? Math.ceil(displayTotalCount / pageSize) : 1
  const maxEndIndex = USE_SAMPLE ? 5 : displayTotalCount

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>데이터를 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>🌾 농림축산식품 공공데이터 포털</h1>
        <p className="subtitle">개방데이터 목록 조회</p>
        {error && <div className="error-banner">{error}</div>}
      </header>
      
      <div className="filter-section">
        <div className="filter-group">
          <label>
            데이터 형식:
            <select
              name="dataType"
              value={filters.dataType}
              onChange={handleFilterChange}
            >
              <option value="json">JSON</option>
              <option value="xml">XML</option>
            </select>
          </label>
          {USE_SAMPLE ? (
            <>
              <label>
                시작 인덱스 (1-5):
                <input
                  type="number"
                  name="startIndex"
                  value={filters.startIndex}
                  onChange={handleFilterChange}
                  min="1"
                  max="5"
                />
              </label>
              <label>
                종료 인덱스 (1-5):
                <input
                  type="number"
                  name="endIndex"
                  value={Math.min(filters.endIndex, 5)}
                  onChange={handleFilterChange}
                  min="1"
                  max="5"
                />
              </label>
            </>
          ) : (
            <label>
              페이지당 항목 수:
              <select value={pageSize} onChange={handlePageSizeChange}>
                <option value="10">10개</option>
                <option value="20">20개</option>
                <option value="50">50개</option>
                <option value="100">100개</option>
              </select>
            </label>
          )}
          <label>
            데이터셋명 검색 (부분 일치):
            <input
              type="text"
              name="koreanNm"
              value={filters.koreanNm}
              onChange={handleFilterChange}
              placeholder="예: 가공업체, 가축통계 등"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
            />
          </label>
          <button onClick={handleSearch} className="search-button">
            검색
          </button>
          {filters.koreanNm && (
            <button 
              onClick={() => {
                setFilters(prev => ({
                  ...prev,
                  koreanNm: ''
                }))
                setCurrentPage(1)
                setTimeout(() => fetchData(1, pageSize), 100)
              }} 
              className="clear-button"
            >
              필터 초기화
            </button>
          )}
        </div>
        {totalCount > 0 && (
          <div className="info-section">
            <div className="total-count">
              전체 {totalCount.toLocaleString()}건
              {!USE_SAMPLE && (
                <span> | 페이지 {currentPage} / {totalPages} | 표시: {((currentPage - 1) * pageSize + 1)}-{Math.min(currentPage * pageSize, totalCount)}건</span>
              )}
            </div>
            {!USE_SAMPLE && totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => handlePageChange(1)} 
                  disabled={currentPage === 1}
                  className="page-button"
                >
                  처음
                </button>
                <button 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="page-button"
                >
                  이전
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`page-button ${currentPage === pageNum ? 'active' : ''}`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="page-button"
                >
                  다음
                </button>
                <button 
                  onClick={() => handlePageChange(totalPages)} 
                  disabled={currentPage === totalPages}
                  className="page-button"
                >
                  마지막
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {data && data.length > 0 && <DataList data={data} totalCount={totalCount} />}
      {data && data.length === 0 && (
        <div className="no-data">데이터가 없습니다.</div>
      )}
    </div>
  )
}

export default App

