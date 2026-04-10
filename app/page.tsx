// app/page.tsx
import { fetchDashboardData } from '@/lib/sheets'
import Dashboard from '@/components/Dashboard'

export const revalidate = 0

export default async function Home() {
  let data = null
  let error = null
  try {
    data = await fetchDashboardData()
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : 'Lỗi không xác định'
  }

  if (error || !data) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', flexDirection:'column', gap:16 }}>
        <div style={{ fontSize:40 }}>⚠️</div>
        <div style={{ color:'#F75454', fontWeight:600, fontSize:15 }}>Không thể tải dữ liệu</div>
        <div style={{ color:'#8B949E', fontSize:12, maxWidth:400, textAlign:'center' }}>{error}</div>
        <div style={{ color:'#6E7681', fontSize:11, maxWidth:400, textAlign:'center', marginTop:8 }}>
          Hãy chắc chắn Google Sheet ở chế độ &quot;Anyone with link can view&quot;
        </div>
      </div>
    )
  }

  return <Dashboard data={data} />
}
