'use client'
// components/tabs/TabSource.tsx
import type { DashboardData } from '@/lib/sheets'
import { Card, CardTitle, Space, Badge, PctBar } from '../ui'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const p = (n: number, d: number) => d > 0 ? `${(n/d*100).toFixed(1)}%` : '—'

const tooltipStyle = {
  background: 'var(--bg4)', border: '1px solid var(--border)',
  borderRadius: 8, fontSize: 11,
} as const

export default function TabSource({ data }: { data: DashboardData }) {
  const maxCV = data.bySource[0]?.total || 1

  // Top 8 nguồn cho biểu đồ so sánh Tổng CV / HR Pass
  const chartData = data.bySource.slice(0, 8).map(s => ({
    name: s.nguon, 'Tổng CV': s.total, 'HR Pass': s.hrPass,
  }))
  const chartHeight = Math.max(200, chartData.length * 44 + 50)

  return (
    <div>
      {chartData.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <CardTitle sub="Top 8 nguồn theo số CV — so sánh tổng CV thu thập và CV pass lọc HR">
            📊 Biểu Đồ Nguồn CV
          </CardTitle>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={chartData} layout="vertical" barGap={2} margin={{ left: 4, right: 34 }}>
              <XAxis type="number" tick={{ fill: 'var(--text2)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" width={110}
                tick={{ fill: 'var(--text2)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                labelStyle={{ color: 'var(--text)', fontWeight: 600 }} itemStyle={{ color: 'var(--text2)' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Tổng CV" fill="#33A6FF" radius={[0, 4, 4, 0]} maxBarSize={12}
                label={{ position: 'right', fill: 'var(--text2)', fontSize: 9 }} />
              <Bar dataKey="HR Pass" fill="#00E08F" radius={[0, 4, 4, 0]} maxBarSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

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
                const rateColor = rate >= 70 ? '#00E08F' : rate >= 50 ? '#FFAA2B' : '#FF4D6D'
                return (
                  <tr key={s.nguon} style={{ background:i%2===0?'var(--bg3)':'var(--bg4)' }}>
                    <td style={{ padding:'9px 10px', color:i<3?['#FFD84D','#C0C0C0','#CD7F32'][i]:'var(--text3)',
                      fontWeight:600, fontSize:11 }}>{i+1}</td>
                    <td style={{ padding:'9px 10px', color:'var(--text)', fontWeight:500 }}>{s.nguon}</td>
                    <td style={{ padding:'9px 10px', textAlign:'center', fontFamily:'Space Mono,monospace',
                      fontSize:14, fontWeight:700, color:'#33A6FF' }}>{s.total}</td>
                    <td style={{ padding:'9px 10px', textAlign:'center', color:'var(--text2)' }}>
                      {p(s.total, data.stats.total)}
                    </td>
                    <td style={{ padding:'9px 10px', textAlign:'center', fontFamily:'Space Mono,monospace',
                      fontSize:12, fontWeight:600, color:'#00E08F' }}>{s.hrPass}</td>
                    <td style={{ padding:'9px 10px', textAlign:'center' }}>
                      <span style={{ fontFamily:'Space Mono,monospace', fontSize:12,
                        fontWeight:700, color:rateColor }}>{rate}%</span>
                    </td>
                    <td style={{ padding:'9px 10px', textAlign:'center', color:'#B44CFF' }}>{s.thamGiaPV}</td>
                    <td style={{ padding:'9px 10px', textAlign:'center', color:'#FFD84D' }}>{s.nhanViec}</td>
                    <td style={{ padding:'9px 10px', textAlign:'center' }}>
                      <Badge
                        text={rate>=70?'⭐ Tốt':rate>=50?'✓ Khá':'↓ Thấp'}
                        color={rateColor}
                      />
                    </td>
                    <td style={{ padding:'9px 10px', minWidth:100 }}>
                      <PctBar value={s.total} max={maxCV} color="#33A6FF" />
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
