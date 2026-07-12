'use client'
// components/tabs/TabPosition.tsx
import { useState, useMemo } from 'react'
import type { DashboardData, PositionStat } from '@/lib/sheets'
import { Card, CardTitle, PctBar } from '../ui'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const p = (n: number, d: number) => d > 0 ? `${(n/d*100).toFixed(1)}%` : '—'

const tooltipStyle = {
  background: 'var(--bg4)', border: '1px solid var(--border)',
  borderRadius: 8, fontSize: 11,
} as const

// dd/mm/yyyy -> số yyyymmdd để so sánh khoảng thời gian
function dateStrToNum(s: string): number {
  if (!s) return 0
  const parts = s.split('/')
  if (parts.length < 3) return 0
  const d = +parts[0], m = +parts[1], y = +parts[2]
  if (!d || !m || !y) return 0
  return y * 10000 + m * 100 + d
}

// value của <input type="date"> là yyyy-mm-dd
function inputToNum(s: string): number {
  if (!s) return 0
  const parts = s.split('-')
  if (parts.length < 3) return 0
  return +parts[0] * 10000 + +parts[1] * 100 + +parts[2]
}

export default function TabPosition({ data }: { data: DashboardData }) {
  const [filterPos, setFilterPos] = useState<string>('all')
  const [fromDate,  setFromDate]  = useState<string>('')
  const [toDate,    setToDate]    = useState<string>('')

  // Danh sách vị trí đầy đủ (ổn định) cho dropdown
  const allPositions = useMemo(
    () => data.byPosition.map(pos => pos.viTri),
    [data.byPosition]
  )

  // Lọc ứng viên theo khoảng thời gian rồi tính lại thống kê theo vị trí
  const { rows, rangeTotal } = useMemo(() => {
    const from = inputToNum(fromDate)
    const to   = inputToNum(toDate)

    const inRange = data.candidates.filter(c => {
      // Nếu có chọn mốc thời gian mà ứng viên không có ngày hợp lệ -> loại
      if (from || to) {
        const n = dateStrToNum(c.ngay)
        if (!n) return false
        if (from && n < from) return false
        if (to   && n > to)   return false
      }
      return true
    })

    const map = new Map<string, PositionStat>()
    for (const c of inRange) {
      const key = c.viTri || 'Chưa xác định'
      if (!map.has(key)) map.set(key, { viTri: key, total: 0, hrPass: 0, thamGiaPV: 0, nhanViec: 0 })
      const ps = map.get(key)!
      ps.total++
      if (c.hrLocCV === 'Pass')   ps.hrPass++
      if (c.thamGiaPV === 'Có')   ps.thamGiaPV++
      if (c.uvNhanViec === 'Có')  ps.nhanViec++
    }

    let list = [...map.values()].sort((a, b) => b.total - a.total)
    if (filterPos !== 'all') list = list.filter(ps => ps.viTri === filterPos)

    return { rows: list, rangeTotal: inRange.length }
  }, [data.candidates, fromDate, toDate, filterPos])

  const maxCV = rows[0]?.total || 1
  const tongCV = rows.reduce((s, r) => s + r.total, 0)

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg4)', border: '1px solid var(--border)', borderRadius: 8,
    color: 'var(--text)', padding: '7px 12px', fontSize: 11, fontFamily: 'inherit',
    outline: 'none', cursor: 'pointer',
  }

  const hasFilter = filterPos !== 'all' || !!fromDate || !!toDate

  // Top 10 vị trí cho biểu đồ — tính trên dữ liệu đã lọc
  const chartData = rows.slice(0, 10).map(pos => ({
    name: pos.viTri, 'Tổng CV': pos.total, 'Nhận việc': pos.nhanViec,
  }))
  const chartHeight = Math.max(200, chartData.length * 44 + 50)

  return (
    <Card>
      <CardTitle sub="Top vị trí tuyển dụng — lọc theo vị trí và khoảng thời gian tự chọn">💼 Báo Cáo Theo Vị Trí</CardTitle>

      {/* FILTERS */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={filterPos} onChange={e => setFilterPos(e.target.value)} className="ui-input" style={{ ...inputStyle, minWidth: 220, maxWidth: 320 }}>
          <option value="all">💼 Tất cả vị trí</option>
          {allPositions.map(v => <option key={v} value={v}>{v}</option>)}
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text2)' }}>
          📅 Từ
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="ui-input" style={inputStyle} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text2)' }}>
          đến
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="ui-input" style={inputStyle} />
        </label>

        {hasFilter && (
          <button
            onClick={() => { setFilterPos('all'); setFromDate(''); setToDate('') }}
            style={{ ...inputStyle, color: '#FF4D6D', border: '1px solid #FF4D6D44' }}
          >
            ✕ Xoá lọc
          </button>
        )}

        <div style={{ fontSize: 11, color: 'var(--text2)', whiteSpace: 'nowrap', marginLeft: 'auto' }}>
          <b style={{ color: 'var(--text)' }}>{rows.length}</b> vị trí • <b style={{ color: '#33A6FF' }}>{tongCV}</b> CV
          {(fromDate || toDate) && <span style={{ color: 'var(--text3)' }}> trong khoảng</span>}
        </div>
      </div>

      {/* BIỂU ĐỒ TOP VỊ TRÍ — theo bộ lọc hiện tại */}
      {chartData.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', margin: '4px 0 6px',
            textTransform: 'uppercase', letterSpacing: '.5px' }}>
            📊 Top {chartData.length} vị trí — Tổng CV & Nhận việc
          </div>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={chartData} layout="vertical" barGap={2} margin={{ left: 4, right: 34 }}>
              <XAxis type="number" tick={{ fill: 'var(--text2)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" width={150}
                tick={{ fill: 'var(--text2)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                labelStyle={{ color: 'var(--text)', fontWeight: 600 }} itemStyle={{ color: 'var(--text2)' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Tổng CV" fill="#33A6FF" radius={[0, 4, 4, 0]} maxBarSize={12}
                label={{ position: 'right', fill: 'var(--text2)', fontSize: 9 }} />
              <Bar dataKey="Nhận việc" fill="#00E08F" radius={[0, 4, 4, 0]} maxBarSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
          <thead>
            <tr style={{ borderBottom:'1px solid var(--border2)' }}>
              {['#','Vị trí','Tổng CV','% Tổng','HR Pass','Tham gia PV','Nhận việc','Tỷ lệ NV','Bar'].map((h,i) => (
                <th key={h} style={{ padding:'8px 10px', textAlign:i<=1?'left':'center',
                  color:'var(--text3)', fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.6px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding:'40px', textAlign:'center', color:'var(--text3)' }}>
                  Không có dữ liệu phù hợp với bộ lọc
                </td>
              </tr>
            ) : rows.map((pos, i) => (
              <tr key={pos.viTri} style={{ background:i%2===0?'var(--bg3)':'var(--bg4)' }}>
                <td style={{ padding:'9px 10px',
                  color:i<3?['#FFD84D','#C0C0C0','#CD7F32'][i]:'var(--text3)', fontWeight:600 }}>{i+1}</td>
                <td style={{ padding:'9px 10px', color:'var(--text)', fontWeight:500, maxWidth:280,
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={pos.viTri}>
                  {pos.viTri}
                </td>
                <td style={{ padding:'9px 10px', textAlign:'center', fontFamily:'Space Mono,monospace',
                  fontSize:13, fontWeight:700, color:'#33A6FF' }}>{pos.total}</td>
                <td style={{ padding:'9px 10px', textAlign:'center', color:'var(--text2)' }}>
                  {p(pos.total, rangeTotal)}
                </td>
                <td style={{ padding:'9px 10px', textAlign:'center', color:'#00E08F' }}>{pos.hrPass}</td>
                <td style={{ padding:'9px 10px', textAlign:'center', color:'#B44CFF' }}>{pos.thamGiaPV}</td>
                <td style={{ padding:'9px 10px', textAlign:'center',
                  fontFamily:'Space Mono,monospace', fontWeight:700,
                  color:pos.nhanViec>0?'#FFD84D':'var(--border)' }}>{pos.nhanViec||'—'}</td>
                <td style={{ padding:'9px 10px', textAlign:'center',
                  color:pos.nhanViec>2?'#00E08F':pos.nhanViec>0?'#FFAA2B':'var(--text3)' }}>
                  {p(pos.nhanViec, pos.total)}
                </td>
                <td style={{ padding:'9px 10px', minWidth:100 }}>
                  <PctBar value={pos.total} max={maxCV} color="#33A6FF" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
