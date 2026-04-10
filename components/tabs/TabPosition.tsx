'use client'
// components/tabs/TabPosition.tsx
import type { DashboardData } from '@/lib/sheets'
import { Card, CardTitle, PctBar } from '../ui'

const p = (n: number, d: number) => d > 0 ? `${(n/d*100).toFixed(1)}%` : '—'

export default function TabPosition({ data }: { data: DashboardData }) {
  const maxCV = data.byPosition[0]?.total || 1
  return (
    <Card>
      <CardTitle sub="Top vị trí tuyển dụng — sắp xếp theo số lượng CV">💼 Báo Cáo Theo Vị Trí</CardTitle>
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
          <thead>
            <tr style={{ borderBottom:'1px solid #30363D' }}>
              {['#','Vị trí','Tổng CV','% Tổng','HR Pass','Tham gia PV','Nhận việc','Tỷ lệ NV','Bar'].map((h,i) => (
                <th key={h} style={{ padding:'8px 10px', textAlign:i<=1?'left':'center',
                  color:'var(--text3)', fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.6px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.byPosition.map((pos, i) => (
              <tr key={pos.viTri} style={{ background:i%2===0?'var(--bg3)':'var(--bg4)' }}>
                <td style={{ padding:'9px 10px',
                  color:i<3?['#FFD700','#C0C0C0','#CD7F32'][i]:'var(--text3)', fontWeight:600 }}>{i+1}</td>
                <td style={{ padding:'9px 10px', color:'var(--text)', fontWeight:500, maxWidth:280,
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {pos.viTri}
                </td>
                <td style={{ padding:'9px 10px', textAlign:'center', fontFamily:'Space Mono,monospace',
                  fontSize:13, fontWeight:700, color:'#4F8EF7' }}>{pos.total}</td>
                <td style={{ padding:'9px 10px', textAlign:'center', color:'var(--text2)' }}>
                  {p(pos.total, data.stats.total)}
                </td>
                <td style={{ padding:'9px 10px', textAlign:'center', color:'#2ECC8A' }}>{pos.hrPass}</td>
                <td style={{ padding:'9px 10px', textAlign:'center', color:'#9B6FF7' }}>{pos.thamGiaPV}</td>
                <td style={{ padding:'9px 10px', textAlign:'center',
                  fontFamily:'Space Mono,monospace', fontWeight:700,
                  color:pos.nhanViec>0?'#FFD700':'var(--border)' }}>{pos.nhanViec||'—'}</td>
                <td style={{ padding:'9px 10px', textAlign:'center',
                  color:pos.nhanViec>2?'#2ECC8A':pos.nhanViec>0?'#F5A623':'var(--text3)' }}>
                  {p(pos.nhanViec, pos.total)}
                </td>
                <td style={{ padding:'9px 10px', minWidth:100 }}>
                  <PctBar value={pos.total} max={maxCV} color="#4F8EF7" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
