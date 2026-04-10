// app/api/data/route.ts
import { fetchDashboardData } from '@/lib/sheets'
import { NextResponse } from 'next/server'

export const revalidate = 0 // không cache — luôn fetch mới

export async function GET() {
  try {
    const data = await fetchDashboardData()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      }
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
