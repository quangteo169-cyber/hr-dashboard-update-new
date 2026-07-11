'use client'
// components/tabs/TabOverview.tsx
import { useState } from 'react'
import type { DashboardData } from '@/lib/sheets'
import { Card, CardTitle, KpiCard, Grid, Space, FunnelBar } from '../ui'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const p = (n: number, d: number) => d > 0 ? `${(n/d*100).toFixed(1)}%` : '0%'

function filterByMonth(data: DashboardData, month: number | null) {
  if (month === null) return data // cả năm
  const candidates = data.candidates.filter(c => c.thang === month)
  const total      = candidates.length
  const hrPass     = candidates.filter(c => c.hrLocCV      === 'Pass').length
  const dongYPV    = candidates.filter(c => c.ketQuaGoiMoi === 'Đồng ý').length
  const thamGiaPV  = candidates.filter(c => c.thamGiaPV    === 'Có').length
  const passPV     = candidates.filter(c => c.ketQuaPV     === 'Pass').length
  const dongYLam   = candidates.filter(c => c.dongYDiLam   === 'Có').length
  const nhanViec   = candidates.filter(c => c.uvNhanViec   === 'Có').length
  const d10        = candidates.filter(c => c.uvDiLam10Ngay === 'Có').length
  const dropout    = candidates.filter(c => c.uvNhanViec === 'Có' && c.uvDiLam10Ngay !== 'Có').length
  return {
    ...data,
    candidates,
    stats: {
      ...data.stats,
      total, hrPass, dongYPV, thamGiaPV, passPV, dongYLam, nhanViec, d10, dropout,
      hrFail: candidates.filter(c => c.hrLocCV === 'Fail').length,
      tuChoiPV: candidates.filter(c => c.ketQuaGoiMoi === 'Từ chối').length,
      failPV: candidates.filter(c => c.ketQuaPV === 'Fail').length,
    }
  }
}

export default function TabOverview({ data }: { data: DashboardData }) {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const filtered = filterByMonth(data, selectedMonth)
  const { stats: s } = filtered

  // Nguồn CV + NV phụ trách tính lại từ danh sách UV đã lọc theo tháng,
  // để mọi khối trên tab đều nhảy theo bộ lọc (không dùng tổng hợp cả năm)
  const bySource = (() => {
    const map = new Map<string, { nguon: string; total: number; hrPass: number }>()
    for (const c of filtered.candidates) {
      const key = c.nguon || 'Khác'
      if (!map.has(key)) map.set(key, { nguon: key, total: 0, hrPass: 0 })
      const item = map.get(key)!
      item.total++
      if (c.hrLocCV === 'Pass') item.hrPass++
    }
    return [...map.values()].sort((a, b) => b.total - a.total)
  })()

  const byNV = (() => {
    const map = new Map<string, { nvTD: string; total: number; hrPass: number; nhanViec: number }>()
    for (const c of filtered.candidates) {
      const key = c.nvTD || 'Khác'
      if (!map.has(key)) map.set(key, { nvTD: key, total: 0, hrPass: 0, nhanViec: 0 })
      const item = map.get(key)!
      item.total++
      if (c.hrLocCV === 'Pass')  item.hrPass++
      if (c.uvNhanViec === 'Có') item.nhanViec++
    }
    return [...map.values()].sort((a, b) => b.total - a.total)
  })()

  const kpis1 = [
    { label:'Tổng CV Thu Thập', value:s.total,      sub:'L0 — Toàn bộ CV nhận được',            color:'#33A6FF', icon:'📥', pct:100 },
    { label:'CV Pass Lọc HR',   value:s.hrPass,     sub:`${p(s.hrPass,s.total)} tổng CV · L1`,  color:'#00E08F', icon:'✅', pct:s.hrPass/(s.total||1)*100 },
    { label:'Đồng Ý PV',        value:s.dongYPV,    sub:`${p(s.dongYPV,s.total)} tổng CV · L3`, color:'#FFAA2B', icon:'📞', pct:s.dongYPV/(s.total||1)*100 },
    { label:'Tới Phỏng Vấn',    value:s.thamGiaPV,  sub:`${p(s.thamGiaPV,s.total)} tổng CV · L3A`, color:'#B44CFF', icon:'🎤', pct:s.thamGiaPV/(s.total||1)*100 },
  ]
  const kpis2 = [
    { label:'Pass PV V1',          value:s.passPV,   sub:`${p(s.passPV,s.total)} tổng CV · L4A`,  color:'#00E5D0', icon:'🏆', pct:s.passPV/(s.total||1)*100 },
    { label:'Có Lịch Đi Làm',     value:s.dongYLam, sub:`${p(s.dongYLam,s.total)} tổng CV · L7`, color:'#FFAA2B', icon:'📅', pct:s.dongYLam/(s.total||1)*100 },
    { label:'UV Đi Làm Ngày Đầu', value:s.nhanViec, sub:`${p(s.nhanViec,s.total)} tổng CV · L8`, color:'#00E08F', icon:'🚀', pct:s.nhanViec/(s.total||1)*100 },
    { label:'UV Đủ 10 Ngày',      value:s.d10,      sub:`${p(s.d10,s.total)} tổng CV · L9`,      color:'#FFD84D', icon:'⭐', pct:s.d10/(s.total||1)*100 },
  ]

  // Lọc một tháng → biểu đồ chỉ hiện tháng đó; Cả năm → hiện đủ 12 tháng
  const monthChart = data.byMonth
    .filter(m => selectedMonth === null || +m.month === selectedMonth)
    .map(m => ({
      name: m.label,
      'Tổng CV': m.total,
      'HR Pass': m.hrPass,
      'Nhận việc': m.nhanViec,
    }))

  const COLORS = ['#33A6FF', '#00E08F', '#FFD84D']

  const monthLabel = selectedMonth === null ? 'Cả năm 2026' : `Tháng ${selectedMonth}/2026`

  return (
    <div>
      {/* BỘ LỌC THÁNG */}
      <div className="ui-card" style={{
        display:'flex', alignItems:'center', gap:10, marginBottom:16, flexWrap:'wrap',
        padding:'12px 16px', borderRadius:14,
      }}>
        <span style={{
          fontSize:11, fontWeight:700, color:'var(--text2)', marginRight:2,
          display:'inline-flex', alignItems:'center', gap:6,
          textTransform:'uppercase', letterSpacing:'.6px',
        }}>
          <span style={{ width:4, height:14, borderRadius:2, background:'var(--accent-grad)' }} />
          📅 Xem theo
        </span>
        <div style={{ position:'relative', display:'inline-flex' }}>
          <select
            className="ui-input"
            value={selectedMonth === null ? 'all' : String(selectedMonth)}
            onChange={e => setSelectedMonth(e.target.value === 'all' ? null : +e.target.value)}
            style={{
              appearance:'none', WebkitAppearance:'none',
              background:'var(--bg4)', border:'1px solid var(--border2)',
              borderRadius:10, padding:'8px 34px 8px 14px', minWidth:170,
              color:'var(--text)', fontSize:12, fontWeight:600,
              fontFamily:'inherit', outline:'none', cursor:'pointer',
              boxShadow:'var(--shadow-sm)',
            }}
          >
            <option value="all">📅 Cả năm 2026</option>
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
              <option key={m} value={String(m)}>Tháng {m}</option>
            ))}
          </select>
          <span style={{
            position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
            pointerEvents:'none', fontSize:9, color:'var(--text2)',
          }}>▼</span>
        </div>
        <div style={{
          marginLeft:'auto', display:'inline-flex', alignItems:'center', gap:8,
          background:'color-mix(in srgb, var(--blue) 10%, var(--bg4))',
          border:'1px solid color-mix(in srgb, var(--blue) 30%, transparent)',
          borderRadius:999, padding:'6px 14px', whiteSpace:'nowrap',
        }}>
          <span style={{ fontSize:10, color:'var(--text2)' }}>Đang xem</span>
          <span style={{ fontSize:12, fontWeight:700, color:'var(--text)' }}>{monthLabel}</span>
          <span style={{ width:1, height:12, background:'var(--border2)' }} />
          <span style={{ fontFamily:'Space Grotesk,Be Vietnam Pro,sans-serif', fontSize:12, fontWeight:700, color:'var(--blue)' }}>
            {s.total} CV
          </span>
        </div>
      </div>

      {/* KPI ROW 1 */}
      <Grid cols={4}>
        {kpis1.map(k => <KpiCard key={k.label} {...k} />)}
      </Grid>
      <Space h={12} />
      <Grid cols={4}>
        {kpis2.map(k => <KpiCard key={k.label} {...k} />)}
      </Grid>

      <Space h={20} />

      {/* CHARTS ROW */}
      <Grid cols={2} gap={16}>

        {/* Phễu */}
        <Card>
          <CardTitle sub={`${monthLabel} — Tỷ lệ trên tổng CV thu thập`}>📈 Phễu Tuyển Dụng</CardTitle>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <FunnelBar label="L0 — CV thu thập"        count={s.total}     total={s.total}     color="#33A6FF" sublabel="100%" />
            <FunnelBar label="L1 — HR Pass (cột P)"    count={s.hrPass}    total={s.total}     color="#00E08F" />
            <FunnelBar label="L3 — Đồng ý PV (cột Q)" count={s.dongYPV}   total={s.total}     color="#FFAA2B" />
            <FunnelBar label="L3A — Tới PV (cột U)"   count={s.thamGiaPV} total={s.total}     color="#B44CFF" />
            <FunnelBar label="L4A — Pass PV (cột V)"  count={s.passPV}    total={s.total}     color="#00E5D0" />
            <FunnelBar label="L7 — Lịch đi làm (cột X)" count={s.dongYLam} total={s.total}   color="#FFAA2B" />
            <FunnelBar label="L8 — Đi làm (cột Z)"    count={s.nhanViec}  total={s.total}     color="#00E08F" />
            <FunnelBar label="L9 — Đủ 10 ngày (cột AA)" count={s.d10}     total={s.total}     color="#FFD84D" />
          </div>
        </Card>

        {/* Chart tháng */}
        <Card>
          <CardTitle sub={`So sánh CV / Pass HR / Nhận việc — ${monthLabel}`}>📅 Xu Hướng Theo Tháng</CardTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthChart} barGap={4}>
              <XAxis dataKey="name" tick={{ fill:'var(--text2)', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'var(--text2)', fontSize:10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background:'var(--bg4)', border:'1px solid var(--border)', borderRadius:8, fontSize:11 }}
                labelStyle={{ color:'var(--text)', fontWeight:600 }}
                itemStyle={{ color:'var(--text2)' }}
              />
              {['Tổng CV','HR Pass','Nhận việc'].map((key, i) => (
                <Bar key={key} dataKey={key} fill={COLORS[i]} radius={[4,4,0,0]} maxBarSize={60} />
              ))}
            </BarChart>
          </ResponsiveContainer>
          <Space h={12} />

          {/* Tỷ lệ chuyển đổi */}
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {[
              { label:'L0 → L1  CV → HR Pass',           pct: p(s.hrPass,s.total),       color:'#00E08F' },
              { label:'L1 → L3  HR Pass → Đồng ý PV',   pct: p(s.dongYPV,s.hrPass),     color:'#FFAA2B' },
              { label:'L3 → L3A Đồng ý → Tới PV',       pct: p(s.thamGiaPV,s.dongYPV),  color:'#B44CFF' },
              { label:'L3A→ L4A PV → Pass PV',           pct: p(s.passPV,s.thamGiaPV),   color:'#00E5D0' },
              { label:'L4A→ L7  Pass → Lịch đi làm',    pct: p(s.dongYLam,s.passPV),    color:'#FFAA2B' },
              { label:'L7 → L8  Lịch → Đi làm',         pct: p(s.nhanViec,s.dongYLam),  color:'#00E08F' },
              { label:'L8 → L9  Đi làm → Đủ 10 ngày',  pct: p(s.d10,s.nhanViec),       color:'#FFD84D' },
            ].map(r => (
              <div key={r.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'5px 8px', background:'var(--bg4)', borderRadius:6 }}>
                <span style={{ fontSize:10, color:'var(--text2)' }}>{r.label}</span>
                <span style={{ fontFamily:'Space Mono,monospace', fontSize:12,
                  fontWeight:700, color:r.color }}>{r.pct}</span>
              </div>
            ))}
          </div>
        </Card>
      </Grid>

      <Space h={16} />

      {/* Source + NV */}
      <Grid cols={2} gap={16}>
        <Card>
          <CardTitle sub={`Top nguồn CV theo số lượng — ${monthLabel}`}>📡 Nguồn CV</CardTitle>
          {bySource.slice(0,6).map((src, i) => (
            <div key={src.nguon} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
              <div style={{ fontSize:11, color:'var(--text3)', width:18, textAlign:'right' }}>#{i+1}</div>
              <div style={{ flex:1, fontSize:11, color:'var(--text)', fontWeight:500 }}>{src.nguon}</div>
              <div style={{ width:80, height:4, background:'var(--bg4)', borderRadius:2, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${bySource[0]?.total>0?src.total/bySource[0].total*100:0}%`, background:'#33A6FF', borderRadius:2 }} />
              </div>
              <div style={{ fontFamily:'Space Mono,monospace', fontSize:11, color:'#33A6FF', width:30, textAlign:'right' }}>{src.total}</div>
              <div style={{ fontSize:10, color:'#00E08F', width:36, textAlign:'right' }}>{p(src.hrPass,src.total)}</div>
            </div>
          ))}
        </Card>

        <Card>
          <CardTitle sub={`Chuyên viên phụ trách tuyển dụng — ${monthLabel}`}>👤 NV Phụ Trách</CardTitle>
          {byNV.map((n, i) => (
            <div key={n.nvTD} style={{
              background:'var(--bg4)', borderRadius:10, padding:'12px 14px', marginBottom:8,
              border:'1px solid var(--border)'
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:['#B44CFF','#FFAA2B'][i]||'#33A6FF' }}>{n.nvTD}</div>
                  <div style={{ fontSize:9, color:'var(--text3)', marginTop:2 }}>Chuyên viên tuyển dụng</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:'Space Mono,monospace', fontSize:20, fontWeight:700, color:['#B44CFF','#FFAA2B'][i]||'#33A6FF' }}>{n.total}</div>
                  <div style={{ fontSize:9, color:'var(--text3)' }}>CV phụ trách</div>
                </div>
              </div>
              <div style={{ height:3, background:'var(--border)', borderRadius:2 }}>
                <div style={{ height:'100%', width:`${s.total>0?n.total/s.total*100:0}%`, background:['#B44CFF','#FFAA2B'][i]||'#33A6FF', borderRadius:2 }} />
              </div>
              <div style={{ display:'flex', gap:12, marginTop:8, fontSize:10, color:'var(--text3)' }}>
                <span>Pass HR: <b style={{ color:'#00E08F' }}>{n.hrPass}</b></span>
                <span>Nhận việc: <b style={{ color:'#FFD84D' }}>{n.nhanViec}</b></span>
                <span>Tỷ lệ: <b style={{ color:'#00E5D0' }}>{p(n.nhanViec,n.total)}</b></span>
              </div>
            </div>
          ))}
        </Card>
      </Grid>
    </div>
  )
}
