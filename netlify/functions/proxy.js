// Netlify Function: API 프록시 서버
// HTTPS 페이지에서 HTTP API를 호출하기 위한 프록시

exports.handler = async (event, context) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  }

  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  // GET 요청만 허용
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    // 경로에서 API 경로 추출
    // 예: /.netlify/functions/proxy/{API_KEY}/{TYPE}/Grid_20210909000000000613_1/{START}/{END}
    const path = event.path.replace('/.netlify/functions/proxy', '')
    
    // API 서버 URL 구성
    const apiUrl = `http://211.237.50.150:7080${path}`
    
    // 쿼리 파라미터 추가
    const queryString = event.queryStringParameters
      ? '?' + new URLSearchParams(event.queryStringParameters).toString()
      : ''
    
    const fullUrl = apiUrl + queryString

    // API 서버로 요청
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.text()
    const contentType = response.headers.get('content-type') || 'application/json'

    return {
      statusCode: response.status,
      headers: {
        ...headers,
        'Content-Type': contentType,
      },
      body: data,
    }
  } catch (error) {
    console.error('Proxy error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', message: error.message }),
    }
  }
}


