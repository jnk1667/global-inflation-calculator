export async function GET() {
  return new Response('Not Found', { 
    status: 404,
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400'
    }
  })
}

export async function POST() {
  return new Response('Not Found', { 
    status: 404,
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400'
    }
  })
}
