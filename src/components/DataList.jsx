import { useState } from 'react'
import './DataList.css'

function DataList({ data }) {
  const [expandedId, setExpandedId] = useState(null)

  const toggleExpand = (datasetId) => {
    setExpandedId(expandedId === datasetId ? null : datasetId)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return dateStr
  }

  const getProvisionType = (item) => {
    const types = []
    if (item.GRID_PROVD_ENNC === 'Y') types.push('그리드')
    if (item.API_PROVD_ENNC === 'Y') types.push('OpenAPI')
    if (item.FILE_PROVD_ENNC === 'Y') types.push('파일')
    if (item.LINK_PROVD_ENNC === 'Y') types.push('링크')
    if (item.RAW_DATA_PROVD_ENNC === 'Y') types.push('원시데이터')
    if (item.CHART_PROVD_ENNC === 'Y') types.push('차트')
    if (item.MAP_PROVD_ENNC === 'Y') types.push('맵')
    return types.length > 0 ? types.join(', ') : '-'
  }

  return (
    <div className="data-list-container">
      <div className="data-summary">
        <h2>조회 결과: {data.length}건</h2>
      </div>

      <div className="data-cards">
        {data.map((item, index) => {
          // 고유 키 생성: DATA_ID가 있으면 사용, 없으면 DATASET_ID + ROW_NUM 조합
          const uniqueKey = item.DATA_ID || `${item.DATASET_ID}_${item.ROW_NUM || index}`
          
          return (
            <div key={uniqueKey} className="data-card">
              <div className="card-header" onClick={() => toggleExpand(uniqueKey)}>
                <div className="card-title-section">
                  <h3>{item.KOREAN_NM || item.DATA_NM || '데이터셋명 없음'}</h3>
                  <span className="expand-icon">
                    {expandedId === uniqueKey ? '▼' : '▶'}
                  </span>
                </div>
                <div className="card-meta">
                  <span className="badge institution">{item.INSTT_NM || '-'}</span>
                  <span className="badge update-cycle">{item.UPDT_CYCLE || '-'}</span>
                </div>
              </div>

              <div className="card-body">
              <div className="description">
                <strong>설명:</strong> {item.DC || item.DATA_DC || '설명 없음'}
              </div>

              {expandedId === uniqueKey && (
                <div className="card-details">
                  <div className="detail-section">
                    <h4>기본 정보</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">데이터셋 ID:</span>
                        <span className="detail-value">{item.DATASET_ID || '-'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">데이터 ID:</span>
                        <span className="detail-value">{item.DATA_ID || '-'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">데이터명:</span>
                        <span className="detail-value">{item.DATA_NM || '-'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">제공기관:</span>
                        <span className="detail-value">{item.INSTT_NM || '-'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>키워드</h4>
                    <div className="keywords">
                      {item.KWRD_ONE && <span className="keyword">{item.KWRD_ONE}</span>}
                      {item.KWRD_TWO && <span className="keyword">{item.KWRD_TWO}</span>}
                      {item.KWRD_THREE && <span className="keyword">{item.KWRD_THREE}</span>}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>제공 유형</h4>
                    <div className="provision-types">{getProvisionType(item)}</div>
                  </div>

                  <div className="detail-section">
                    <h4>담당자 정보</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">담당자명:</span>
                        <span className="detail-value">{item.JOB_CHARGER_NM || '-'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">전화번호:</span>
                        <span className="detail-value">{item.JOB_CHARGER_TLPHON_NO || '-'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>이용 정보</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">이용허락범위:</span>
                        <span className="detail-value">{item.CCL || '-'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">3자권리포함:</span>
                        <span className="detail-value">{item.THREEMAN_RIGHT_INCLS_ENNC || '-'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">업데이트 주기:</span>
                        <span className="detail-value">{item.UPDT_CYCLE || '-'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>날짜 정보</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">등록일:</span>
                        <span className="detail-value">{formatDate(item.REGIST_DT)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">데이터 수정일:</span>
                        <span className="detail-value">{formatDate(item.UPDT_DT)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">데이터셋 수정일:</span>
                        <span className="detail-value">{formatDate(item.SET_UPDT_DT)}</span>
                      </div>
                    </div>
                  </div>

                  {(item.RM || item.RM2) && (
                    <div className="detail-section">
                      <h4>유의사항</h4>
                      <div className="notice">
                        {item.RM && <p>{item.RM}</p>}
                        {item.RM2 && <p>{item.RM2}</p>}
                      </div>
                    </div>
                  )}

                  {item.URL && (
                    <div className="detail-section">
                      <a 
                        href={item.URL} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="data-link"
                      >
                        🔗 데이터 상세 페이지로 이동
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          )
        })}
      </div>
    </div>
  )
}

export default DataList

