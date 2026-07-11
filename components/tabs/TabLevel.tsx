'use client'
// components/tabs/TabLevel.tsx
import type { DashboardData } from '@/lib/sheets'
import { Card, CardTitle, Grid, SectionHeader, Space, Table, Badge } from '../ui'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadialBarChart, RadialBar, Legend } from 'recharts'

const p = (n: number, d: number) => d > 0 ? `${(n/d*100).toFixed(1)}%` : '—'
const pNum = (n: number, d: number) => d > 0 ? +(n/d*100).toFixed(1) : 0

export default function TabLevel({ data }: { data: DashboardData }) {
  const { stats: s, levelStats } = data

  // Funnel chuyển đổi giữa các level chính
  const funnelSteps = [
    { from:'L0',  to:'L1',   fi:s.total,     fo:s.hrPass,     label:'CV thu thập → Pass lọc HR',           color:'#00E08F' },
    { from:'L1',  to:'L3',  fi:s.hrPass,    fo:s.dongYPV,    label:'Pass HR → Đồng ý PV',                 color:'#FFAA2B' },
    { from:'L3', to:'L3A',   fi:s.dongYPV,   fo:s.thamGiaPV,  label:'Đồng ý → Tham gia PV',               color:'#B44CFF' },
    { from:'L3A',  to:'L4A',  fi:s.thamGiaPV, fo:s.passPV,     label:'Tham gia PV → Pass PV',               color:'#00E5D0' },
    { from:'L4A', to:'L7',   fi:s.passPV,    fo:s.dongYLam,   label:'Pass PV → Đồng ý nhận việc',          color:'#33A6FF' },
    { from:'L7',  to:'L8',   fi:s.dongYLam,  fo:s.nhanViec,   label:'Đồng ý → Nhận việc ngày đầu',        color:'#00E08F' },
    { from:'L8',  to:'L9',   fi:s.nhanViec,  fo:s.d10,        label:'Ngày đầu → Đủ 10 ngày (Retention)',  color:'#FFD84D' },
  ]

  const chartData = levelStats
    .filter(l => l.count > 0 && !['L3X','L4B'].includes(l.level))
    .map(l => ({ name: l.level, value: l.count, color: l.color }))

  return (
    <div>
      <SectionHeader>🏆 Bộ Level Tuyển Dụng — Số liệu & Tỷ lệ trên tổng {s.total} CV thu thập</SectionHeader>

      {/* BẢNG LEVEL CHÍNH */}
      <Card>
        <CardTitle sub="Số lượng và tỷ lệ % tại mỗi level — tính trên tổng CV thu thập (L0)">
          📊 Phân Bổ Theo Bộ Level
        </CardTitle>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border2)' }}>
                {['Level','Tên Level','Số UV','% / Tổng CV','% / Level Trước','Thanh tiến trình','Trạng thái'].map((h,i) => (
                  <th key={h} style={{
                    padding:'8px 12px', textAlign:i===0?'center':'left',
                    color:'var(--text3)', fontSize:9, fontWeight:700,
                    textTransform:'uppercase', letterSpacing:'0.7px',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {levelStats.map((lv, i) => (
                <tr key={lv.level} style={{ background: i%2===0?'var(--bg3)':'var(--bg4)' }}>
                  {/* Level tag */}
                  <td style={{ padding:'10px 12px', textAlign:'center' }}>
                    <span style={{
                      fontFamily:'Space Mono,monospace', fontSize:11, fontWeight:700,
                      padding:'3px 8px', borderRadius:5, display:'inline-block',
                      color:lv.color, background:`${lv.color}22`,
                      border:`1px solid ${lv.color}44`
                    }}>{lv.level}</span>
                  </td>
                  {/* Tên */}
                  <td style={{ padding:'10px 12px', color:lv.color, fontWeight:500, fontSize:11 }}>
                    {lv.label}
                  </td>
                  {/* Số UV */}
                  <td style={{ padding:'10px 12px', textAlign:'left' }}>
                    <span style={{ fontFamily:'Space Mono,monospace', fontSize:16,
                      fontWeight:700, color:lv.color }}>{lv.count}</span>
                  </td>
                  {/* % / Tổng */}
                  <td style={{ padding:'10px 12px' }}>
                    <span style={{ fontFamily:'Space Mono,monospace', fontSize:13,
                      fontWeight:700, color: lv.pctTotal >= 50 ? '#00E08F' : lv.pctTotal >= 20 ? '#FFAA2B' : 'var(--text2)' }}>
                      {lv.pctTotal}%
                    </span>
                  </td>
                  {/* % / Prev */}
                  <td style={{ padding:'10px 12px' }}>
                    {lv.level === 'L0'
                      ? <span style={{ color:'var(--text3)', fontSize:10 }}>Gốc</span>
                      : <span style={{
                          fontFamily:'Space Mono,monospace', fontSize:12,
                          fontWeight:600,
                          color: lv.pctPrev >= 70 ? '#00E08F' : lv.pctPrev >= 40 ? '#FFAA2B' : '#FF4D6D'
                        }}>{lv.pctPrev}%</span>
                    }
                  </td>
                  {/* Bar */}
                  <td style={{ padding:'10px 12px', minWidth:140 }}>
                    <div style={{ height:6, background:'var(--bg4)', borderRadius:3, overflow:'hidden' }}>
                      <div style={{
                        height:'100%', width:`${Math.min(lv.pctTotal,100)}%`,
                        background:`linear-gradient(90deg,${lv.color},${lv.color}88)`,
                        borderRadius:3, transition:'width .6s ease'
                      }} />
                    </div>
                    <div style={{ fontSize:9, color:'var(--text3)', marginTop:3 }}>
                      {lv.count} / {s.total} UV
                    </div>
                  </td>
                  {/* Status */}
                  <td style={{ padding:'10px 12px' }}>
                    {lv.pctPrev >= 70
                      ? <Badge text="✅ Tốt" color="#00E08F" />
                      : lv.pctPrev >= 40
                      ? <Badge text="⚡ Trung bình" color="#FFAA2B" />
                      : lv.level === 'L0'
                      ? <Badge text="📥 Đầu vào" color="#33A6FF" />
                      : <Badge text="⚠️ Cần cải thiện" color="#FF4D6D" />
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Space h={16} />

      {/* CHARTS */}
      <Grid cols={2} gap={16}>

        {/* Bar chart số lượng */}
        <Card>
          <CardTitle sub="Số UV tại mỗi level (không tính L2B, L4B)">📊 Biểu Đồ Số Lượng Theo Level</CardTitle>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} layout="vertical" margin={{ left:20 }}>
              <XAxis type="number" tick={{ fill:'var(--text2)', fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill:'var(--text2)', fontSize:10, fontFamily:'Space Mono,monospace' }}
                axisLine={false} tickLine={false} width={45} />
              <Tooltip
                contentStyle={{ background:'var(--bg4)', border:'1px solid var(--border2)', borderRadius:8, fontSize:11 }}
                cursor={{ fill:'rgba(255,255,255,0.04)' }}
              />
              <Bar dataKey="value" radius={[0,4,4,0]} name="Số UV">
                {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Phễu chuyển đổi */}
        <Card>
          <CardTitle sub="Tỷ lệ chuyển đổi giữa từng bước trong pipeline">🔄 Phễu Chuyển Đổi Level</CardTitle>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {funnelSteps.map((step) => {
              const rate = step.fi > 0 ? step.fo / step.fi * 100 : 0
              const rateStr = step.fi > 0 ? `${rate.toFixed(1)}%` : '—'
              const rateColor = rate >= 70 ? '#00E08F' : rate >= 40 ? '#FFAA2B' : '#FF4D6D'
              return (
                <div key={step.from+step.to} style={{
                  background:'var(--bg4)', borderRadius:8, padding:'10px 12px'
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                    <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                      <span style={{
                        fontFamily:'Space Mono,monospace', fontSize:9, fontWeight:700,
                        color:step.color, background:`${step.color}22`,
                        padding:'2px 6px', borderRadius:4, border:`1px solid ${step.color}44`
                      }}>{step.from}</span>
                      <span style={{ color:'var(--text3)', fontSize:10 }}>→</span>
                      <span style={{
                        fontFamily:'Space Mono,monospace', fontSize:9, fontWeight:700,
                        color:step.color, background:`${step.color}22`,
                        padding:'2px 6px', borderRadius:4, border:`1px solid ${step.color}44`
                      }}>{step.to}</span>
                    </div>
                    <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                      <span style={{ fontSize:10, color:'var(--text3)' }}>{step.fo} / {step.fi}</span>
                      <span style={{ fontFamily:'Space Mono,monospace', fontSize:14,
                        fontWeight:700, color:rateColor }}>{rateStr}</span>
                    </div>
                  </div>
                  <div style={{ fontSize:9, color:'var(--text3)', marginBottom:4 }}>{step.label}</div>
                  <div style={{ height:3, background:'var(--border)', borderRadius:2 }}>
                    <div style={{ height:'100%', width:`${Math.min(rate,100)}%`,
                      background:rateColor, borderRadius:2 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </Grid>

      <Space h={16} />

      {/* LEVEL THEO THÁNG */}
      <Card>
        <CardTitle sub="Số UV tại mỗi level trong từng tháng">📅 Phân Bổ Level Theo Tháng</CardTitle>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border2)' }}>
                <th style={{ padding:'8px 12px', textAlign:'left', color:'var(--text3)', fontSize:9,
                  fontWeight:700, textTransform:'uppercase' }}>Level</th>
                {data.byMonth.map(m => (
                  <th key={m.month} style={{ padding:'8px 12px', textAlign:'center',
                    color:'var(--text3)', fontSize:9, fontWeight:700, textTransform:'uppercase' }}>
                    {m.label}
                  </th>
                ))}
                <th style={{ padding:'8px 12px', textAlign:'center', color:'#FFAA2B',
                  fontSize:9, fontWeight:700, textTransform:'uppercase' }}>Tổng</th>
              </tr>
            </thead>
            <tbody>
              {levelStats.map((lv, i) => {
                const byMonth = data.byMonth.map(m =>
                  data.candidates.filter(c => c.thang === +m.month && c.level === lv.level).length
                )
                const total = byMonth.reduce((a,b)=>a+b,0)
                return (
                  <tr key={lv.level} style={{ background: i%2===0?'var(--bg3)':'var(--bg4)' }}>
                    <td style={{ padding:'9px 12px' }}>
                      <span style={{
                        fontFamily:'Space Mono,monospace', fontSize:10, fontWeight:700,
                        color:lv.color, background:`${lv.color}22`,
                        padding:'2px 7px', borderRadius:4, marginRight:8
                      }}>{lv.level}</span>
                      <span style={{ fontSize:10, color:'var(--text2)' }}>{lv.label}</span>
                    </td>
                    {byMonth.map((cnt, mi) => (
                      <td key={mi} style={{ padding:'9px 12px', textAlign:'center',
                        fontFamily:'Space Mono,monospace', fontSize:12, fontWeight:600,
                        color: cnt > 0 ? lv.color : 'var(--border)' }}>
                        {cnt > 0 ? cnt : '—'}
                      </td>
                    ))}
                    <td style={{ padding:'9px 12px', textAlign:'center',
                      fontFamily:'Space Mono,monospace', fontSize:13, fontWeight:700,
                      color:total>0?lv.color:'var(--border)' }}>
                      {total > 0 ? total : '—'}
                    </td>
                  </tr>
                )
              })}
              {/* Tổng hàng */}
              <tr style={{ background:'color-mix(in srgb, var(--blue) 14%, var(--bg2))', borderTop:'1px solid var(--border2)' }}>
                <td style={{ padding:'10px 12px', fontWeight:700, color:'var(--text)' }}>
                  TỔNG
                </td>
                {data.byMonth.map(m => (
                  <td key={m.month} style={{ padding:'10px 12px', textAlign:'center',
                    fontFamily:'Space Mono,monospace', fontSize:13, fontWeight:700, color:'#33A6FF' }}>
                    {m.total}
                  </td>
                ))}
                <td style={{ padding:'10px 12px', textAlign:'center',
                  fontFamily:'Space Mono,monospace', fontSize:14, fontWeight:700, color:'#FFD84D' }}>
                  {s.total}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
