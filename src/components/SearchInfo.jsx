import { useState, useEffect } from 'react'
import axios from 'axios'
import DataList from './DataList'
import './SearchInfo.css'

const API_KEY = import.meta.env.VITE_API_KEY || '0db405d287f1020dccb58c108ac0a1adcbd576b6b0fd43d4e23dcc5c44d237a2'
const BASE_URL = import.meta.env.PROD 
  ? '/.netlify/functions/proxy/openapi'
  : '/openapi'
const API_URL = 'Grid_20210909000000000613_1'
const USE_SAMPLE = false

function SearchInfo() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    startIndex: 1,
    endIndex: 10,
    dataType: 'json',
    koreanNm: '',
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
    
    const totalCntElement = rootElement.querySelector('totalCnt')
    const totalCnt = totalCntElement ? parseInt(totalCntElement.textContent) : 0
    setTotalCount(totalCnt)
    
    const rows = rootElement.querySelectorAll('row')
    const data = Array.from(rows).map((row, index) => {
      const obj = {}
      Array.from(row.children).forEach(child => {
        const tagName = child.tagName
        const textContent = child.textContent || ''
        if (textContent.trim() !== '') {
          obj[tagName] = textContent
        }
      })
      if (!obj.ROW_NUM) {
        obj.ROW_NUM = index + 1
      }
      return obj
    })
    
    const uniqueData = []
    const seen = new Set()
    data.forEach(item => {
      const key = `${item.DATASET_ID}_${item.DATA_ID}_${item.ROW_NUM}`
      if (!seen.has(key)) {
        seen.add(key)
        uniqueData.push(item)
      }
    })
    
    if (filters.koreanNm && filters.koreanNm.trim() !== '') {
      const searchTerm = filters.koreanNm.trim().toLowerCase()
      return uniqueData.filter(item => {
        const koreanNm = (item.KOREAN_NM || '').toLowerCase()
        return koreanNm.includes(searchTerm)
      })
    }
    
    return uniqueData
  }

  const fetchData = async (page = currentPage, size = pageSize) => {
    try {
      setLoading(true)
      setError(null)
      
      const maxEndIndex = USE_SAMPLE ? 5 : filters.endIndex
      const startIdx = USE_SAMPLE ? 1 : ((page - 1) * size + 1)
      const endIdx = USE_SAMPLE ? 5 : Math.min(page * size, totalCount || filters.endIndex)
      
      const apiPath = USE_SAMPLE ? 'sample' : API_KEY
      
      let fetchStartIdx = startIdx
      let fetchEndIdx = endIdx
      
      if (filters.koreanNm && filters.koreanNm.trim() !== '') {
        fetchStartIdx = 1
        fetchEndIdx = totalCount > 0 ? Math.min(1000, totalCount) : 1000
      }
      
      const url = `${BASE_URL}/${apiPath}/${filters.dataType}/${API_URL}/${fetchStartIdx}/${fetchEndIdx}`
      const params = {}
      
      const response = await axios.get(url, {
        params: params,
        headers: {
          'Content-Type': filters.dataType === 'json' ? 'application/json' : 'application/xml',
        },
        responseType: filters.dataType === 'json' ? 'json' : 'text'
      })

      let apiData = []
      
      if (filters.dataType === 'xml') {
        apiData = parseXML(response.data)
        if (filters.koreanNm && filters.koreanNm.trim() !== '') {
          setTotalCount(apiData.length)
        }
      } else {
        const data = response.data
        
        let apiResponse = null
        
        if (data[API_URL]) {
          apiResponse = data[API_URL]
        } else if (data.totalCnt !== undefined || data.row !== undefined) {
          apiResponse = data
        }
        
        if (apiResponse) {
          if (apiResponse.totalCnt) {
            setTotalCount(parseInt(apiResponse.totalCnt))
          }
          
          if (apiResponse.row) {
            if (Array.isArray(apiResponse.row)) {
              apiData = apiResponse.row
            } else {
              apiData = [apiResponse.row]
            }
          }
        } else {
          if (Array.isArray(data)) {
            apiData = data
          }
        }
        
        const uniqueData = []
        const seen = new Set()
        apiData.forEach((item, index) => {
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
        
        if (filters.koreanNm && filters.koreanNm.trim() !== '') {
          const searchTerm = filters.koreanNm.trim().toLowerCase()
          apiData = apiData.filter(item => {
            const koreanNm = (item.KOREAN_NM || '').toLowerCase()
            return koreanNm.includes(searchTerm)
          })
          setTotalCount(apiData.length)
        }
      }

      if (filters.dataType === 'json' && response.data.result && response.data.result.code !== 'INFO-000') {
        throw new Error(response.data.result.message || 'API 오류가 발생했습니다.')
      }

      let finalData = apiData
      if (filters.koreanNm && filters.koreanNm.trim() !== '') {
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

  const totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1

  return (
    <div className="search-info">

      <div className="search-filters">
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
          {!USE_SAMPLE && (
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
            데이터셋명 검색:
            <input
              type="text"
              name="koreanNm"
              value={filters.koreanNm}
              onChange={handleFilterChange}
              placeholder="예: 가공업체"
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
                setFilters(prev => ({ ...prev, koreanNm: '' }))
                setCurrentPage(1)
                setTimeout(() => fetchData(1, pageSize), 100)
              }} 
              className="clear-button"
            >
              필터 초기화
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>데이터를 불러오는 중...</p>
        </div>
      ) : (
        <>
          {totalCount > 0 && (
            <div className="search-info-section">
              <div className="total-count">
                전체 {totalCount.toLocaleString()}건
                {!USE_SAMPLE && (
                  <span> | 페이지 {currentPage} / {totalPages}</span>
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

          {error && <div className="error-banner">{error}</div>}

          {data && data.length > 0 && <DataList data={data} totalCount={totalCount} />}
          {data && data.length === 0 && !loading && (
            <div className="no-data">데이터가 없습니다.</div>
          )}
        </>
      )}
    </div>
  )
}

export default SearchInfo

