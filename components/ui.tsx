// components/ui.tsx
import React from 'react'

/* ── CARD ─────────────────────────────────────────────────── */
export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background:'var(--bg3)', border:'1px solid var(--border)',
      borderRadius:12, padding:'18px 20px', ...style
    }}>
      {children}
    </div>
  )
}

/* ── CARD TITLE ───────────────────────────────────────────── */
export function CardTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div style={{ marginBottom: sub ? 4 : 14 }}>
      <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{children}</div>
      {sub && <div style={{ fontSize:11, color:'var(--text3)', marginTop:2, marginBottom:12 }}>{sub}</div>}
    </div>
  )
}

/* ── KPI CARD ─────────────────────────────────────────────── */
export function KpiCard({
  label, value, sub, color, pct, icon
}: {
  label: string; value: string | number; sub?: string
  color?: string; pct?: number; icon?: string
}) {
  const c = color || '#4F8EF7'
  return (
    <div style={{
      background:'var(--bg3)', border:`1px solid ${c}44`,
      borderRadius:12, padding:'16px 18px', position:'relative', overflow:'hidden'
    }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2,
        background:`linear-gradient(90deg,${c},transparent)` }} />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
        <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase',
          letterSpacing:'0.8px', color:'var(--text2)' }}>
          {label}
        </div>
        {icon && (
          <div style={{ width:28, height:28, borderRadius:7,
            background:`${c}22`, display:'flex', alignItems:'center',
            justifyContent:'center', fontSize:14 }}>
            {icon}
          </div>
        )}
      </div>
      <div style={{ fontFamily:'Space Mono,monospace', fontSize:30,
        fontWeight:700, color:c, lineHeight:1, marginBottom:6 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize:10, color:'var(--text3)' }}>{sub}</div>}
      {pct !== undefined && (
        <div style={{ marginTop:10, height:3, background:'var(--bg4)', borderRadius:2 }}>
          <div style={{ height:'100%', width:`${Math.min(pct,100)}%`,
            background:c, borderRadius:2, transition:'width .8s ease' }} />
        </div>
      )}
    </div>
  )
}

/* ── GRID ─────────────────────────────────────────────────── */
export function Grid({ cols, gap, children }: {
  cols?: number; gap?: number; children: React.ReactNode
}) {
  return (
    <div style={{
      display:'grid',
      gridTemplateColumns: `repeat(${cols||4}, minmax(0,1fr))`,
      gap: gap || 12,
    }}>
      {children}
    </div>
  )
}

/* ── SECTION HEADER ───────────────────────────────────────── */
export function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background:'var(--bg2)', borderRadius:8, padding:'10px 16px',
      fontSize:12, fontWeight:600, color:'var(--text)',
      marginBottom:12, borderLeft:'3px solid #4F8EF7'
    }}>
      {children}
    </div>
  )
}

/* ── PCT BAR ──────────────────────────────────────────────── */
export function PctBar({ value, max, color }: { value: number; max: number; color?: string }) {
  const w = max > 0 ? Math.round(value / max * 100) : 0
  return (
    <div style={{ height:4, background:'var(--bg4)', borderRadius:2, overflow:'hidden', minWidth:60 }}>
      <div style={{ height:'100%', width:`${w}%`,
        background:color||'#4F8EF7', borderRadius:2 }} />
    </div>
  )
}

/* ── TABLE ────────────────────────────────────────────────── */
export function Table({ headers, rows, colColors }: {
  headers: string[]
  rows: (string | number | React.ReactNode)[][]
  colColors?: (string | undefined)[]
}) {
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{
                padding:'8px 10px', textAlign: i===0 ? 'left' : 'center',
                color:'var(--text3)', fontWeight:600, fontSize:9,
                textTransform:'uppercase', letterSpacing:'0.6px',
                borderBottom:'1px solid var(--border)', whiteSpace:'nowrap',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{
              background: ri % 2 === 0 ? 'var(--bg3)' : 'var(--bg4)',
              transition:'background .1s'
            }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{
                  padding:'9px 10px',
                  textAlign: ci===0 ? 'left' : 'center',
                  color: colColors?.[ci] || 'var(--text2)',
                  borderBottom:'1px solid var(--border)',
                  fontFamily: typeof cell === 'number' ? 'Space Mono,monospace' : undefined,
                  fontWeight: ci===0 ? 500 : undefined,
                  fontSize: typeof cell === 'number' ? 12 : 11,
                }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── FUNNEL BAR ───────────────────────────────────────────── */
export function FunnelBar({ label, count, total, color, sublabel }: {
  label: string; count: number; total: number; color: string; sublabel?: string
}) {
  const w = total > 0 ? count / total * 100 : 0
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{ width:160, fontSize:10, color:'var(--text2)', textAlign:'right', flexShrink:0 }}>
        {label}
      </div>
      <div style={{ flex:1, height:28, background:'var(--bg4)', borderRadius:6, overflow:'hidden', position:'relative' }}>
        <div style={{
          position:'absolute', inset:0, width:`${w}%`,
          background:`linear-gradient(90deg,${color}cc,${color}88)`,
          borderRadius:6, display:'flex', alignItems:'center',
          paddingLeft:8, minWidth: count > 0 ? 40 : 0,
        }}>
          {count > 0 && (
            <span style={{ fontSize:10, fontWeight:700, color:'#fff',
              fontFamily:'Space Mono,monospace', whiteSpace:'nowrap' }}>
              {count}
            </span>
          )}
        </div>
      </div>
      <div style={{ width:90, textAlign:'right', flexShrink:0 }}>
        <div style={{ fontFamily:'Space Mono,monospace', fontSize:13,
          fontWeight:700, color }}>
          {count}
        </div>
        <div style={{ fontSize:9, color:'var(--text3)' }}>
          {sublabel || (total > 0 ? `${(w).toFixed(1)}%` : '—')}
        </div>
      </div>
    </div>
  )
}

/* ── BADGE ────────────────────────────────────────────────── */
export function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span style={{
      display:'inline-block', padding:'2px 8px', borderRadius:4,
      fontSize:9, fontWeight:700,
      background:`${color}22`, color, border:`1px solid ${color}44`
    }}>
      {text}
    </span>
  )
}

/* ── SPACE ────────────────────────────────────────────────── */
export function Space({ h = 16 }: { h?: number }) {
  return <div style={{ height: h }} />
}
