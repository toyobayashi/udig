const BASE = 'http://localhost:8099'

export async function join (id: string): Promise<void> {
  const headers = new Headers()
  headers.set('Authorization', id)
  const res = await (await fetch(`${BASE}/api/v1/join`, {
    method: 'GET',
    headers: headers
  })).json()

  if (!res.data) {
    throw new Error(res.message)
  }
}
