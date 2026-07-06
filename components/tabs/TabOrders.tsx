'use client'
// components/tabs/TabOrders.tsx
import { useState, useMemo } from 'react'
import type { DashboardData, OrderRow } from '@/lib/sheets'
import { Card, CardTitle, KpiCard, Space } from '../ui'

const STATUS_CONFIG: Record<string, { color: string; icon: string }> = {
  'Đang tuyển': { color: '#FFAA2B', icon: '🔥' },
  'Hoàn thành': { color: '#00E08F', icon: '✅' },
  'Tạm dừng':   { color: '#FF4D6D', icon: '⏸️' },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { color: '#8B949E', icon: '❓' }
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
      background: `${cfg.color}22`, color: cfg.color,
      border: `1px solid ${cfg.color}44`, whiteSpace: 'nowrap',
      display: 'inline-flex', alignItems: 'center', gap: 4,
    }}>
      {cfg.icon} {status || 'Chưa rõ'}
    </span>
  )
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(value / max * 100, 100) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ flex: 1, height: 6, background: 'var(--bg4)', borderRadius: 3, overflow: 'hidden', minWidth: 60 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width .4s' }} />
      </div>
      <span style={{ fontSize: 9, color, fontFamily: 'Space Mono,monospace', fontWeight: 700, width: 28, textAlign: 'right' }}>
        {Math.round(pct)}%
      </span>
    </div>
  )
}

export default function TabOrders({ data }: { data: DashboardData }) {
  const { orders } = data

  const [filterMonth,  setFilterMonth]  = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterTeam,   setFilterTeam]   = useState<string>('all')
  const [search,       setSearch]       = useState('')

  // Danh sách tháng, team unique từ data
  const months  = useMemo(() => [...new Set(orders.map(o => o.thangNum).filter(Boolean))].sort((a,b) => a-b), [orders])
  const teams   = useMemo(() => [...new Set(orders.map(o => o.team).filter(Boolean))].sort(), [orders])
  const statuses = ['Đang tuyển', 'Hoàn thành', 'Tạm dừng']

  // Lọc
  const filtered = useMemo(() => orders.filter(o => {
    if (filterMonth  !== 'all' && String(o.thangNum) !== filterMonth) return false
    if (filterStatus !== 'all' && o.trangThai !== filterStatus)        return false
    if (filterTeam   !== 'all' && o.team !== filterTeam)               return false
    if (search) {
      const q = search.toLowerCase()
      return o.viTri.toLowerCase().includes(q) ||
             o.team.toLowerCase().includes(q)  ||
             o.nguoiDeXuat.toLowerCase().includes(q) ||
             o.lyDoTuyen.toLowerCase().includes(q)
    }
    return true
  }), [orders, filterMonth, filterStatus, filterTeam, search])

  // KPI tổng
  const tongCanTuyen  = filtered.reduce((s, o) => s + o.soLuong,    0)
  const tongDaOffer   = filtered.reduce((s, o) => s + o.daOffer,    0)
  const tongDaNhanViec= filtered.reduce((s, o) => s + o.daNhanViec, 0)
  const tongConLai    = filtered.reduce((s, o) => s + o.conLai,     0)
  const dangTuyen     = filtered.filter(o => o.trangThai === 'Đang tuyển').length
  const hoanThanh     = filtered.filter(o => o.trangThai === 'Hoàn thành').length
  const tamDung       = filtered.filter(o => o.trangThai === 'Tạm dừng').length

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg4)', border: '1px solid var(--border)', borderRadius: 8,
    color: 'var(--text)', padding: '7px 12px', fontSize: 11, fontFamily: 'inherit',
    outline: 'none', cursor: 'pointer',
  }

  if (!orders.length) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ color: 'var(--text2)', fontSize: 14 }}>
            Chưa tải được dữ liệu sheet "1.1 Đơn hàng"
          </div>
          <div style={{ color: 'var(--text3)', fontSize: 11, marginTop: 8 }}>
            Vui lòng kiểm tra GID của sheet hoặc quyền truy cập Google Sheet
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div>
      {/* KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Tổng vị trí',      value: filtered.length, icon: '📋', color: '#33A6FF', sub: `${dangTuyen} đang tuyển` },
          { label: 'Tổng cần tuyển',   value: tongCanTuyen,    icon: '🎯', color: '#B44CFF', sub: `chỉ tiêu` },
          { label: 'Đã offer',          value: tongDaOffer,     icon: '📩', color: '#FFAA2B', sub: `${tongCanTuyen > 0 ? Math.round(tongDaOffer/tongCanTuyen*100) : 0}% chỉ tiêu` },
          { label: 'Đã nhận việc',      value: tongDaNhanViec,  icon: '✅', color: '#00E08F', sub: `còn lại ${tongConLai}` },
        ].map(k => (
          <KpiCard key={k.label} label={k.label} value={k.value} sub={k.sub} color={k.color} icon={k.icon} />
        ))}
      </div>

      {/* STATUS SUMMARY ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Đang tuyển', count: dangTuyen,  color: '#FFAA2B', icon: '🔥' },
          { label: 'Hoàn thành', count: hoanThanh,  color: '#00E08F', icon: '✅' },
          { label: 'Tạm dừng',   count: tamDung,    color: '#FF4D6D', icon: '⏸️' },
        ].map(s => (
          <div key={s.label} className="ui-kpi" style={{
            ['--kpi-c' as string]: s.color,
            background: `linear-gradient(140deg, ${s.color}12, transparent 55%), var(--bg3)`,
            borderRadius: 12, padding: '12px 16px',
            border: `1px solid ${s.color}33`, boxShadow: 'var(--shadow-sm)',
            display: 'flex', alignItems: 'center', gap: 12,
          } as React.CSSProperties}>
            <div style={{ fontSize: 24 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 22, fontWeight: 700, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)' }}>{s.label}</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="48" height="48" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
                  <circle cx="24" cy="24" r="20" fill="none" stroke="var(--bg4)" strokeWidth="4" />
                  <circle cx="24" cy="24" r="20" fill="none" stroke={s.color} strokeWidth="4"
                    strokeDasharray={`${filtered.length > 0 ? s.count/filtered.length*125.6 : 0} 125.6`} />
                </svg>
                <span style={{ fontSize: 9, fontWeight: 700, color: s.color, position: 'relative' }}>
                  {filtered.length > 0 ? Math.round(s.count/filtered.length*100) : 0}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="🔍 Tìm vị trí, team, người đề xuất..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="ui-input"
          style={{ ...inputStyle, flex: 1, minWidth: 200 }}
        />
        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="ui-input" style={inputStyle}>
          <option value="all">📅 Tất cả tháng</option>
          {months.map(m => <option key={m} value={String(m)}>Tháng {m}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="ui-input" style={inputStyle}>
          <option value="all">🏷️ Tất cả trạng thái</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)} className="ui-input" style={inputStyle}>
          <option value="all">👥 Tất cả team</option>
          {teams.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <div style={{ fontSize: 11, color: 'var(--text2)', whiteSpace: 'nowrap' }}>
          <b style={{ color: 'var(--text)' }}>{filtered.length}</b> / {orders.length} đơn hàng
        </div>
      </div>

      {/* TABLE */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ background: 'var(--bg2)', borderBottom: '2px solid var(--border)' }}>
                {['Tháng','Ngày nhận order','Team','Người đề xuất','Vị trí','Lý do tuyển','Trạng thái','Cần tuyển (K)','Đã offer (L)','Đã nhận việc (M)','Còn lại (N)','Tiến độ'].map((h, i) => (
                  <th key={h} style={{
                    padding: '10px 12px', whiteSpace: 'nowrap',
                    textAlign: i >= 7 ? 'center' : 'left',
                    color: 'var(--text3)', fontWeight: 700, fontSize: 9,
                    textTransform: 'uppercase', letterSpacing: '.5px',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>
                    Không có dữ liệu phù hợp
                  </td>
                </tr>
              ) : filtered.map((o, i) => {
                const cfg = STATUS_CONFIG[o.trangThai] || { color: '#8B949E', icon: '❓' }
                const tiendoPct = o.soLuong > 0 ? Math.round(o.daNhanViec / o.soLuong * 100) : 0
                return (
                  <tr key={i} style={{ background: i%2===0 ? 'var(--bg3)' : 'var(--bg4)', borderBottom: '1px solid var(--border)' }}>
                    {/* Tháng */}
                    <td style={{ padding: '10px 12px', color: '#33A6FF', fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700 }}>
                      {o.thangNum ? `T${o.thangNum}` : o.thang || '—'}
                    </td>
                    {/* Ngày nhận order */}
                    <td style={{ padding: '10px 12px', color: 'var(--text2)', fontSize: 10, whiteSpace: 'nowrap', fontFamily: 'Space Mono,monospace' }}>
                      {o.ngayNhanOrder || '—'}
                    </td>
                    {/* Team */}
                    <td style={{ padding: '10px 12px', color: 'var(--text2)' }}>
                      <span style={{
                        background: 'var(--bg4)', padding: '2px 8px', borderRadius: 4,
                        fontSize: 10, fontWeight: 500, color: '#B44CFF', border: '1px solid #B44CFF33',
                      }}>
                        {o.team || '—'}
                      </span>
                    </td>
                    {/* Người đề xuất */}
                    <td style={{ padding: '10px 12px', color: 'var(--text2)', fontSize: 10 }}>{o.nguoiDeXuat || '—'}</td>
                    {/* Vị trí */}
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={o.viTri}>
                      {o.viTri}
                    </td>
                    {/* Lý do tuyển */}
                    <td style={{ padding: '10px 12px', color: 'var(--text2)', fontSize: 10, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={o.lyDoTuyen}>
                      {o.lyDoTuyen || '—'}
                    </td>
                    {/* Trạng thái */}
                    <td style={{ padding: '10px 12px' }}>
                      <StatusBadge status={o.trangThai} />
                    </td>
                    {/* Cần tuyển K */}
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 15, fontWeight: 700, color: '#33A6FF' }}>
                        {o.soLuong || '—'}
                      </span>
                    </td>
                    {/* Đã offer L */}
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 13, fontWeight: 600, color: '#FFAA2B' }}>
                        {o.daOffer || '—'}
                      </span>
                    </td>
                    {/* Đã nhận việc M */}
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 13, fontWeight: 700,
                        color: o.daNhanViec >= o.soLuong && o.soLuong > 0 ? '#00E08F' : o.daNhanViec > 0 ? '#FFD84D' : 'var(--text3)' }}>
                        {o.daNhanViec || '—'}
                      </span>
                    </td>
                    {/* Còn lại N */}
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 13, fontWeight: 700,
                        color: o.conLai > 0 ? '#FF4D6D' : '#00E08F' }}>
                        {o.conLai > 0 ? o.conLai : '✓'}
                      </span>
                    </td>
                    {/* Tiến độ */}
                    <td style={{ padding: '10px 12px', minWidth: 120 }}>
                      <ProgressBar value={o.daNhanViec} max={o.soLuong}
                        color={tiendoPct >= 100 ? '#00E08F' : tiendoPct >= 50 ? '#FFAA2B' : '#FF4D6D'} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
            {/* FOOTER TỔNG */}
            {filtered.length > 0 && (
              <tfoot>
                <tr style={{ background: 'var(--bg2)', borderTop: '2px solid var(--border)' }}>
                  <td colSpan={7} style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text)', fontSize: 11 }}>
                    Tổng cộng ({filtered.length} đơn hàng)
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'Space Mono,monospace', fontWeight: 700, color: '#33A6FF', fontSize: 13 }}>{tongCanTuyen}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'Space Mono,monospace', fontWeight: 700, color: '#FFAA2B', fontSize: 13 }}>{tongDaOffer}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'Space Mono,monospace', fontWeight: 700, color: '#00E08F', fontSize: 13 }}>{tongDaNhanViec}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'Space Mono,monospace', fontWeight: 700, color: tongConLai > 0 ? '#FF4D6D' : '#00E08F', fontSize: 13 }}>{tongConLai}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <ProgressBar value={tongDaNhanViec} max={tongCanTuyen}
                      color={tongCanTuyen > 0 && tongDaNhanViec >= tongCanTuyen ? '#00E08F' : '#FFAA2B'} />
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </Card>
    </div>
  )
}
