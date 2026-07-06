'use client'
// components/tabs/TabSource.tsx
import type { DashboardData } from '@/lib/sheets'
import { Card, CardTitle, Space, Badge, PctBar } from '../ui'

const p = (n: number, d: number) => d > 0 ? `${(n/d*100).toFixed(1)}%` : '—'

export default function TabSource({ data }: { data: DashboardData }) {
  const maxCV = data.bySource[0]?.total || 1
  return (
    <div>
      <Card>
        <CardTitle sub="Xếp hạng theo số lượng CV — tỷ lệ pass lọc HR">📡 Phân Tích Nguồn CV</CardTitle>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border2)' }}>
                {['#','Nguồn CV','Tổng CV','% Tổng','HR Pass','Tỷ lệ Pass','PV','Nhận việc','Hiệu quả','Bar CV'].map((h,i) => (
                  <th key={h} style={{ padding:'8px 10px', textAlign:i<=1?'left':'center',
                    color:'var(--text3)', fontSize:9, fontWeight:700, textTransform:'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.bySource.map((s, i) => {
                const rate = s.passRate
                const rateColor = rate >= 70 ? '#2ECC8A' : rate >= 50 ? '#F5A623' : '#F75454'
                return (
                  <tr key={s.nguon} style={{ background:i%2===0?'var(--bg3)':'var(--bg4)' }}>
                    <td style={{ padding:'9px 10px', color:i<3?['#FFD700','#C0C0C0','#CD7F32'][i]:'var(--text3)',
                      fontWeight:600, fontSize:11 }}>{i+1}</td>
                    <td style={{ padding:'9px 10px', color:'var(--text)', fontWeight:500 }}>{s.nguon}</td>
                    <td style={{ padding:'9px 10px', textAlign:'center', fontFamily:'Space Mono,monospace',
                      fontSize:14, fontWeight:700, color:'#4F8EF7' }}>{s.total}</td>
                    <td style={{ padding:'9px 10px', textAlign:'center', color:'var(--text2)' }}>
                      {p(s.total, data.stats.total)}
                    </td>
                    <td style={{ padding:'9px 10px', textAlign:'center', fontFamily:'Space Mono,monospace',
                      fontSize:12, fontWeight:600, color:'#2ECC8A' }}>{s.hrPass}</td>
                    <td style={{ padding:'9px 10px', textAlign:'center' }}>
                      <span style={{ fontFamily:'Space Mono,monospace', fontSize:12,
                        fontWeight:700, color:rateColor }}>{rate}%</span>
                    </td>
                    <td style={{ padding:'9px 10px', textAlign:'center', color:'#9B6FF7' }}>{s.thamGiaPV}</td>
                    <td style={{ padding:'9px 10px', textAlign:'center', color:'#FFD700' }}>{s.nhanViec}</td>
                    <td style={{ padding:'9px 10px', textAlign:'center' }}>
                      <Badge
                        text={rate>=70?'⭐ Tốt':rate>=50?'✓ Khá':'↓ Thấp'}
                        color={rateColor}
                      />
                    </td>
                    <td style={{ padding:'9px 10px', minWidth:100 }}>
                      <PctBar value={s.total} max={maxCV} color="#4F8EF7" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
