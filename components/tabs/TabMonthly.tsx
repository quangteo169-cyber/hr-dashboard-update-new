'use client'
// components/tabs/TabMonthly.tsx
import type { DashboardData } from '@/lib/sheets'
import { Card, CardTitle, Space } from '../ui'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const p = (n: number, d: number) => d > 0 ? `${(n/d*100).toFixed(1)}%` : '—'

export default function TabMonthly({ data }: { data: DashboardData }) {
  // Only show months with data
  const activeMonths = data.byMonth.filter(m => m.total > 0)

  const chartData = data.byMonth.map(m => ({
    name: m.label,
    'Tổng CV':    m.total,
    'L1 HR Pass': m.hrPass,
    'L3A Tới PV': m.thamGiaPV,
    'L8 Nhận việc': m.nhanViec,
    'L9 10 ngày': m.d10,
  }))

  return (
    <div>
      <Card style={{ marginBottom:16 }}>
        <CardTitle sub="Xu hướng các chỉ số qua các tháng">📈 Biểu Đồ Theo Tháng</CardTitle>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fill:'var(--text2)', fontSize:11 }} axisLine={false} />
            <YAxis tick={{ fill:'var(--text2)', fontSize:10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background:'var(--bg4)', border:'1px solid var(--border)', borderRadius:8, fontSize:11 }} />
            <Legend wrapperStyle={{ fontSize:11, paddingTop:12 }} />
            <Line type="monotone" dataKey="Tổng CV"      stroke="#4F8EF7" strokeWidth={2} dot={{ r:4 }} />
            <Line type="monotone" dataKey="L1 HR Pass"   stroke="#2ECC8A" strokeWidth={2} dot={{ r:4 }} />
            <Line type="monotone" dataKey="L3A Tới PV"   stroke="#9B6FF7" strokeWidth={2} dot={{ r:4 }} />
            <Line type="monotone" dataKey="L8 Nhận việc" stroke="#FFD700" strokeWidth={2} dot={{ r:4 }} />
            <Line type="monotone" dataKey="L9 10 ngày"   stroke="#1ACFCF" strokeWidth={2} dot={{ r:4 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16 }}>
        {activeMonths.map(m => (
          <Card key={m.month}>
            <CardTitle sub={`Tháng ${m.month} / 2026`}>{m.label} — Chi Tiết</CardTitle>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[
                { label:'L0  CV thu thập',       val:m.total,     color:'#6B7280', pct:p(m.total, data.stats.total) + ' cả năm' },
                { label:'L1  HR Pass (cột P)',    val:m.hrPass,    color:'#4F8EF7', pct:p(m.hrPass, m.total)         },
                { label:'L3  Đồng ý PV (cột Q)', val:m.dongYPV,   color:'#F5A623', pct:p(m.dongYPV, m.hrPass)       },
                { label:'L3A Tới PV (cột U)',     val:m.thamGiaPV, color:'#9B6FF7', pct:p(m.thamGiaPV, m.dongYPV)   },
                { label:'L4A Pass PV (cột V)',    val:m.passPV,    color:'#1ACFCF', pct:p(m.passPV, m.thamGiaPV)    },
                { label:'L7  Lịch đi làm (cột X)',val:m.dongYLam, color:'#F5A623', pct:p(m.dongYLam, m.passPV)     },
                { label:'L8  Đi làm (cột Z)',     val:m.nhanViec,  color:'#2ECC8A', pct:p(m.nhanViec, m.dongYLam)   },
                { label:'L9  Đủ 10 ngày (cột AA)',val:m.d10,       color:'#FFD700', pct:p(m.d10, m.nhanViec)        },
              ].map(row => (
                <div key={row.label} style={{ display:'flex', justifyContent:'space-between',
                  alignItems:'center', padding:'6px 10px', background:'var(--bg4)', borderRadius:6 }}>
                  <span style={{ fontSize:10, color:'var(--text2)' }}>{row.label}</span>
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <span style={{ fontSize:10, color:'var(--text3)' }}>{row.pct}</span>
                    <span style={{ fontFamily:'Space Mono,monospace', fontSize:14,
                      fontWeight:700, color:row.color }}>{row.val}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
