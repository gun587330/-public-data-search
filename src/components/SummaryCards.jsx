import './SummaryCards.css'

function SummaryCards({ summary }) {
  const cards = [
    {
      title: '전체 농가 수',
      value: summary.totalFarms.toLocaleString(),
      unit: '개',
      icon: '🏠',
      color: '#4facfe',
    },
    {
      title: '총 재배 면적',
      value: (summary.totalArea / 1000).toFixed(1),
      unit: '천 ㎡',
      icon: '🌾',
      color: '#43e97b',
    },
    {
      title: '평균 온도',
      value: summary.avgTemperature.toFixed(1),
      unit: '°C',
      icon: '🌡️',
      color: '#fa709a',
    },
    {
      title: '평균 습도',
      value: summary.avgHumidity.toFixed(1),
      unit: '%',
      icon: '💧',
      color: '#30cfd0',
    },
  ]

  return (
    <div className="summary-cards">
      {cards.map((card, index) => (
        <div key={index} className="summary-card" style={{ '--card-color': card.color }}>
          <div className="card-icon">{card.icon}</div>
          <div className="card-content">
            <h3>{card.title}</h3>
            <div className="card-value">
              <span className="value">{card.value}</span>
              <span className="unit">{card.unit}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default SummaryCards

