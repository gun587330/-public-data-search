import { Link } from 'react-router-dom'
import './MenuPanel.css'

function MenuPanel() {
  const menuItems = [
    {
      id: 'vegetables',
      path: '/vegetables',
      title: '🥬 채소류 생산량',
      description: '채소류 품목별 생산량 통계',
      available: true,
    },
    {
      id: 'fruits',
      path: '/fruits',
      title: '🍎 과일류 생산량',
      description: '과일류 품목별 생산량 통계',
      available: false,
    },
    {
      id: 'waste',
      path: '/waste',
      title: '🗑️ 폐기율 통계',
      description: '품목별 못난이 농산물 폐기 비율',
      available: false,
    },
    {
      id: 'comparison',
      path: '/comparison',
      title: '📊 생산량 비교',
      description: '다양한 품목의 생산량 비교 분석',
      available: false,
    },
  ]

  return (
    <div className="menu-panel">
      <div className="menu-header">
        <h2>📊 통계 메뉴</h2>
        <p>원하는 통계를 선택하세요</p>
      </div>

      <div className="menu-grid">
        {menuItems.map((item) => {
          const emoji = item.title.split(' ')[0]
          const titleText = item.title.split(' ').slice(1).join(' ')
          
          const content = (
            <div className="menu-item-content">
              <h3>
                <span className="menu-item-icon">{emoji}</span>
                {titleText}
              </h3>
              <p>{item.description}</p>
              {!item.available && (
                <span className="coming-soon-badge">준비 중</span>
              )}
            </div>
          )

          return item.available ? (
            <Link
              key={item.id}
              to={item.path}
              className="menu-item available"
            >
              {content}
            </Link>
          ) : (
            <div
              key={item.id}
              className="menu-item coming-soon"
            >
              {content}
            </div>
          )
        })}
      </div>

      <div className="menu-footer">
        <p className="menu-note">
          💡 왼쪽 검색 영역에서 데이터셋을 검색할 수 있습니다.
        </p>
      </div>
    </div>
  )
}

export default MenuPanel

