'use client'
// components/tabs/TabRaw.tsx
import { useState, useMemo } from 'react'
import type { DashboardData } from '@/lib/sheets'
import { Card, CardTitle, Badge } from '../ui'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const LEVEL_COLORS: Record<string, string> = {
  L0:'#6B7280', L1:'#33A6FF', L3:'#FFAA2B', L3X:'#FF4D6D',
  L3A:'#B44CFF', L4A:'#00E5D0', L4B:'#FF4D6D',
  L7:'#FFAA2B', L8:'#00E08F', L9:'#FFD84D',
}

const LEVEL_ORDER = ['L0','L1','L3','L3X','L3A','L4A','L4B','L7','L8','L9']

export default function TabRaw({ data }: { data: DashboardData }) {
  const [search, setSearch]           = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [filterNguon, setFilterNguon] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [page, setPage]               = useState(1)
  const PER_PAGE = 50

  const levels = Array.from(new Set(data.candidates.map(c => c.level))).sort()
  const nguons = Array.from(new Set(data.candidates.map(c => c.nguon))).sort()

  const filtered = useMemo(() => {
    return data.candidates.filter(c => {
      if (filterLevel && c.level !== filterLevel) return false
      if (filterNguon && c.nguon !== filterNguon) return false
      if (filterMonth && String(c.thang) !== filterMonth) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          c.tenUV.toLowerCase().includes(q) ||
          c.viTri.toLowerCase().includes(q) ||
          c.nvTD.toLowerCase().includes(q) ||
          c.nguon.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [data.candidates, search, filterLevel, filterNguon, filterMonth])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE)

  // Phân bố level của tập UV đã lọc — mỗi level giữ đúng màu định danh
  const levelDist = useMemo(() => {
    const counts = new Map<string, number>()
    for (const c of filtered) counts.set(c.level, (counts.get(c.level) || 0) + 1)
    return LEVEL_ORDER
      .filter(lv => (counts.get(lv) || 0) > 0)
      .map(lv => ({ name: lv, value: counts.get(lv)! }))
  }, [filtered])
  const distHeight = Math.max(150, levelDist.length * 28 + 40)

  const inputStyle: React.CSSProperties = {
    background:'var(--bg4)', border:'1px solid var(--border)', borderRadius:6,
    color:'var(--text)', padding:'6px 10px', fontSize:11, fontFamily:'inherit',
    outline:'none',
  }
  const selectStyle: React.CSSProperties = { ...inputStyle, cursor:'pointer' }

  const headers = [
    '#','Ngày (L0)','NVTD','Nguồn','Cấp bậc','Vị trí','Tên UV','Team',
    'L1 HR (P)','L3 Gọi mời (Q)','L3A Tới PV (U)','Ngày PV (T)',
    'L4A PV (V)','L7 Lịch đi làm (X)','L8 Nhận việc (Z)','Ngày hẹn (Y)',
    'L9 10 ngày (AA)','Ngày 10ng (AB)','Level'
  ]

  return (
    <div>
      {/* FILTERS */}
      <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
        <input
          placeholder="🔍 Tìm tên UV, vị trí, NV tuyển..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }} className="ui-input"
          style={{ ...inputStyle, flex:1, minWidth:200 }}
        />
        <select value={filterLevel} onChange={e => { setFilterLevel(e.target.value); setPage(1) }} className="ui-input" style={selectStyle}>
          <option value="">Tất cả Level</option>
          {levels.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={filterNguon} onChange={e => { setFilterNguon(e.target.value); setPage(1) }} className="ui-input" style={selectStyle}>
          <option value="">Tất cả Nguồn</option>
          {nguons.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <select value={filterMonth} onChange={e => { setFilterMonth(e.target.value); setPage(1) }} className="ui-input" style={selectStyle}>
          <option value="">Tất cả Tháng</option>
          {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <option key={m} value={m}>Tháng {m}</option>)}
        </select>
        <div style={{ fontSize:11, color:'var(--text2)', whiteSpace:'nowrap' }}>
          Hiển thị <b style={{ color:'var(--text)' }}>{filtered.length}</b> / {data.candidates.length} UV
        </div>
      </div>

      {/* PHÂN BỐ LEVEL — theo bộ lọc hiện tại */}
      {levelDist.length > 0 && (
        <Card style={{ marginBottom:14 }}>
          <CardTitle sub="Số UV tại mỗi level trong tập dữ liệu đang lọc">📊 Phân Bố Level</CardTitle>
          <ResponsiveContainer width="100%" height={distHeight}>
            <BarChart data={levelDist} layout="vertical" margin={{ left: 4, right: 34 }}>
              <XAxis type="number" tick={{ fill:'var(--text2)', fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" width={48}
                tick={{ fill:'var(--text2)', fontSize:10, fontFamily:'Space Mono,monospace' }}
                axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill:'rgba(255,255,255,0.04)' }}
                contentStyle={{ background:'var(--bg4)', border:'1px solid var(--border)', borderRadius:8, fontSize:11 }}
                labelStyle={{ color:'var(--text)', fontWeight:600 }} itemStyle={{ color:'var(--text2)' }} />
              <Bar dataKey="value" name="Số UV" radius={[0, 4, 4, 0]} maxBarSize={14}
                label={{ position:'right', fill:'var(--text2)', fontSize:10 }}>
                {levelDist.map(d => <Cell key={d.name} fill={LEVEL_COLORS[d.name] || '#6B7280'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <Card style={{ padding:0, overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:10 }}>
            <thead>
              <tr style={{ background:'var(--bg2)', borderBottom:'2px solid var(--border)' }}>
                {headers.map((h, i) => (
                  <th key={h} style={{
                    padding:'8px 10px', whiteSpace:'nowrap',
                    textAlign: i <= 1 ? 'center' : 'left',
                    color:'var(--text3)', fontWeight:700, fontSize:9,
                    textTransform:'uppercase', letterSpacing:'0.5px',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((c, i) => (
                <tr key={c.stt} style={{
                  background: i%2===0 ? 'var(--bg3)' : 'var(--bg4)',
                  borderBottom:'1px solid var(--border)'
                }}>
                  <td style={{ padding:'7px 10px', textAlign:'center', color:'var(--text3)', fontSize:9 }}>{c.stt}</td>
                  <td style={{ padding:'7px 10px', color:'var(--text2)', whiteSpace:'nowrap', fontFamily:'Space Mono,monospace', fontSize:10 }}>{c.ngay}</td>
                  <td style={{ padding:'7px 10px', color:'#B44CFF', fontWeight:500 }}>{c.nvTD}</td>
                  <td style={{ padding:'7px 10px', color:'var(--text2)' }}>{c.nguon}</td>
                  <td style={{ padding:'7px 10px', color:'var(--text2)' }}>{c.capBac}</td>
                  <td style={{ padding:'7px 10px', color:'var(--text)', maxWidth:180, overflow:'hidden',
                    textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={c.viTri}>{c.viTri}</td>
                  <td style={{ padding:'7px 10px', color:'var(--text)', fontWeight:500, whiteSpace:'nowrap' }}>{c.tenUV}</td>
                  <td style={{ padding:'7px 10px', color:'var(--text2)' }}>{c.team}</td>
                  {/* L1 — cột P */}
                  <td style={{ padding:'7px 10px', textAlign:'center' }}>
                    {c.hrLocCV && <span style={{
                      fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:3,
                      background:c.hrLocCV==='Pass'?'rgba(0,224,143,.2)':'rgba(255,77,109,.2)',
                      color:c.hrLocCV==='Pass'?'#00E08F':'#FF4D6D'
                    }}>{c.hrLocCV}</span>}
                  </td>
                  {/* L3 — cột Q */}
                  <td style={{ padding:'7px 10px', whiteSpace:'nowrap',
                    color:c.ketQuaGoiMoi==='Đồng ý'?'#FFAA2B':c.ketQuaGoiMoi==='Từ chối'?'#FF4D6D':'var(--text2)',
                    fontSize:10 }}>{c.ketQuaGoiMoi}</td>
                  {/* L3A — cột U */}
                  <td style={{ padding:'7px 10px', textAlign:'center', color:c.thamGiaPV==='Có'?'#B44CFF':'var(--border2)' }}>
                    {c.thamGiaPV==='Có' ? '✓' : ''}
                  </td>
                  {/* Ngày PV — cột T */}
                  <td style={{ padding:'7px 10px', color:'var(--text3)', fontSize:9, whiteSpace:'nowrap' }}>{c.ngayPV}</td>
                  {/* L4A — cột V */}
                  <td style={{ padding:'7px 10px', textAlign:'center' }}>
                    {c.ketQuaPV && <span style={{
                      fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:3,
                      background:c.ketQuaPV==='Pass'?'rgba(0,229,208,.2)':'rgba(255,77,109,.2)',
                      color:c.ketQuaPV==='Pass'?'#00E5D0':'#FF4D6D'
                    }}>{c.ketQuaPV}</span>}
                  </td>
                  {/* L7 — cột X */}
                  <td style={{ padding:'7px 10px', textAlign:'center', color:c.dongYDiLam==='Có'?'#FFAA2B':'var(--border2)' }}>
                    {c.dongYDiLam==='Có' ? '✓' : ''}
                  </td>
                  {/* L8 — cột Z */}
                  <td style={{ padding:'7px 10px', textAlign:'center', color:c.uvNhanViec==='Có'?'#00E08F':'var(--border2)' }}>
                    {c.uvNhanViec==='Có' ? '✓' : ''}
                  </td>
                  {/* Ngày hẹn đi làm — cột Y */}
                  <td style={{ padding:'7px 10px', color:'var(--text3)', fontSize:9, whiteSpace:'nowrap' }}>{c.ngayHenLamViec}</td>
                  {/* L9 — cột AA */}
                  <td style={{ padding:'7px 10px', textAlign:'center', color:c.uvDiLam10Ngay==='Có'?'#FFD84D':'var(--border2)' }}>
                    {c.uvDiLam10Ngay==='Có' ? '⭐' : ''}
                  </td>
                  {/* Ngày đủ 10 ngày — cột AB */}
                  <td style={{ padding:'7px 10px', color:'var(--text3)', fontSize:9, whiteSpace:'nowrap' }}>{c.ngayDiLam10}</td>
                  {/* Level badge */}
                  <td style={{ padding:'7px 10px', textAlign:'center' }}>
                    <span style={{
                      fontFamily:'Space Mono,monospace', fontSize:9, fontWeight:700,
                      padding:'2px 7px', borderRadius:4,
                      color:LEVEL_COLORS[c.level]||'#8B949E',
                      background:`${LEVEL_COLORS[c.level]||'#8B949E'}22`,
                      border:`1px solid ${LEVEL_COLORS[c.level]||'#8B949E'}44`
                    }}>{c.level}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div style={{ display:'flex', justifyContent:'center', alignItems:'center',
            gap:8, padding:'12px 16px', borderTop:'1px solid var(--border)' }}>
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
              style={{ background:'var(--bg4)', border:'1px solid var(--border)', borderRadius:5,
                color:page===1?'var(--border2)':'var(--text2)', padding:'4px 10px',
                cursor:page===1?'default':'pointer', fontSize:11, fontFamily:'inherit' }}>
              ← Trước
            </button>
            <span style={{ fontSize:11, color:'var(--text2)' }}>
              Trang {page} / {totalPages} &nbsp;·&nbsp; {filtered.length} ứng viên
            </span>
            <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
              style={{ background:'var(--bg4)', border:'1px solid var(--border)', borderRadius:5,
                color:page===totalPages?'var(--border2)':'var(--text2)', padding:'4px 10px',
                cursor:page===totalPages?'default':'pointer', fontSize:11, fontFamily:'inherit' }}>
              Sau →
            </button>
          </div>
        )}
      </Card>
    </div>
  )
}
