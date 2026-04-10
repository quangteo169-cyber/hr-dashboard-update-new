'use client'
// components/tabs/TabOrders.tsx
import { useState, useMemo } from 'react'
import type { DashboardData, OrderRow } from '@/lib/sheets'
import { Card, CardTitle, Space } from '../ui'

const STATUS_CONFIG: Record<string, { color: string; icon: string }> = {
  'Đang tuyển': { color: '#F5A623', icon: '🔥' },
  'Hoàn thành': { color: '#2ECC8A', icon: '✅' },
  'Tạm dừng':   { color: '#F75454', icon: '⏸️' },
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
             o.nguoiDeXuat.toLowerCase().includes(q)
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
          { label: 'Tổng vị trí',      value: filtered.length, icon: '📋', color: '#4F8EF7', sub: `${dangTuyen} đang tuyển` },
          { label: 'Tổng cần tuyển',   value: tongCanTuyen,    icon: '🎯', color: '#9B6FF7', sub: `chỉ tiêu` },
          { label: 'Đã offer',          value: tongDaOffer,     icon: '📩', color: '#F5A623', sub: `${tongCanTuyen > 0 ? Math.round(tongDaOffer/tongCanTuyen*100) : 0}% chỉ tiêu` },
          { label: 'Đã nhận việc',      value: tongDaNhanViec,  icon: '✅', color: '#2ECC8A', sub: `còn lại ${tongConLai}` },
        ].map(k => (
          <div key={k.label} style={{
            background: 'var(--bg3)', borderRadius: 12, padding: '16px 18px',
            border: `1px solid ${k.color}33`, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${k.color},transparent)` }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.6px' }}>{k.label}</div>
              <div style={{ fontSize: 18 }}>{k.icon}</div>
            </div>
            <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 28, fontWeight: 700, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* STATUS SUMMARY ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Đang tuyển', count: dangTuyen,  color: '#F5A623', icon: '🔥' },
          { label: 'Hoàn thành', count: hoanThanh,  color: '#2ECC8A', icon: '✅' },
          { label: 'Tạm dừng',   count: tamDung,    color: '#F75454', icon: '⏸️' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--bg3)', borderRadius: 10, padding: '12px 16px',
            border: `1px solid ${s.color}33`,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
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
          style={{ ...inputStyle, flex: 1, minWidth: 200 }}
        />
        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={inputStyle}>
          <option value="all">📅 Tất cả tháng</option>
          {months.map(m => <option key={m} value={String(m)}>Tháng {m}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={inputStyle}>
          <option value="all">🏷️ Tất cả trạng thái</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)} style={inputStyle}>
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
                {['Tháng','Team','Người đề xuất','Vị trí','Trạng thái','Cần tuyển (K)','Đã offer (L)','Đã nhận việc (M)','Còn lại (N)','Tiến độ'].map((h, i) => (
                  <th key={h} style={{
                    padding: '10px 12px', whiteSpace: 'nowrap',
                    textAlign: i >= 5 ? 'center' : 'left',
                    color: 'var(--text3)', fontWeight: 700, fontSize: 9,
                    textTransform: 'uppercase', letterSpacing: '.5px',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>
                    Không có dữ liệu phù hợp
                  </td>
                </tr>
              ) : filtered.map((o, i) => {
                const cfg = STATUS_CONFIG[o.trangThai] || { color: '#8B949E', icon: '❓' }
                const tiendoPct = o.soLuong > 0 ? Math.round(o.daNhanViec / o.soLuong * 100) : 0
                return (
                  <tr key={i} style={{ background: i%2===0 ? 'var(--bg3)' : 'var(--bg4)', borderBottom: '1px solid var(--border)' }}>
                    {/* Tháng */}
                    <td style={{ padding: '10px 12px', color: '#4F8EF7', fontFamily: 'Space Mono,monospace', fontSize: 11, fontWeight: 700 }}>
                      {o.thangNum ? `T${o.thangNum}` : o.thang || '—'}
                    </td>
                    {/* Team */}
                    <td style={{ padding: '10px 12px', color: 'var(--text2)' }}>
                      <span style={{
                        background: 'var(--bg4)', padding: '2px 8px', borderRadius: 4,
                        fontSize: 10, fontWeight: 500, color: '#9B6FF7', border: '1px solid #9B6FF733',
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
                    {/* Trạng thái */}
                    <td style={{ padding: '10px 12px' }}>
                      <StatusBadge status={o.trangThai} />
                    </td>
                    {/* Cần tuyển K */}
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 15, fontWeight: 700, color: '#4F8EF7' }}>
                        {o.soLuong || '—'}
                      </span>
                    </td>
                    {/* Đã offer L */}
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 13, fontWeight: 600, color: '#F5A623' }}>
                        {o.daOffer || '—'}
                      </span>
                    </td>
                    {/* Đã nhận việc M */}
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 13, fontWeight: 700,
                        color: o.daNhanViec >= o.soLuong && o.soLuong > 0 ? '#2ECC8A' : o.daNhanViec > 0 ? '#FFD700' : 'var(--text3)' }}>
                        {o.daNhanViec || '—'}
                      </span>
                    </td>
                    {/* Còn lại N */}
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 13, fontWeight: 700,
                        color: o.conLai > 0 ? '#F75454' : '#2ECC8A' }}>
                        {o.conLai > 0 ? o.conLai : '✓'}
                      </span>
                    </td>
                    {/* Tiến độ */}
                    <td style={{ padding: '10px 12px', minWidth: 120 }}>
                      <ProgressBar value={o.daNhanViec} max={o.soLuong}
                        color={tiendoPct >= 100 ? '#2ECC8A' : tiendoPct >= 50 ? '#F5A623' : '#F75454'} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
            {/* FOOTER TỔNG */}
            {filtered.length > 0 && (
              <tfoot>
                <tr style={{ background: 'var(--bg2)', borderTop: '2px solid var(--border)' }}>
                  <td colSpan={5} style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text)', fontSize: 11 }}>
                    Tổng cộng ({filtered.length} đơn hàng)
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'Space Mono,monospace', fontWeight: 700, color: '#4F8EF7', fontSize: 13 }}>{tongCanTuyen}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'Space Mono,monospace', fontWeight: 700, color: '#F5A623', fontSize: 13 }}>{tongDaOffer}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'Space Mono,monospace', fontWeight: 700, color: '#2ECC8A', fontSize: 13 }}>{tongDaNhanViec}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: 'Space Mono,monospace', fontWeight: 700, color: tongConLai > 0 ? '#F75454' : '#2ECC8A', fontSize: 13 }}>{tongConLai}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <ProgressBar value={tongDaNhanViec} max={tongCanTuyen}
                      color={tongCanTuyen > 0 && tongDaNhanViec >= tongCanTuyen ? '#2ECC8A' : '#F5A623'} />
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
