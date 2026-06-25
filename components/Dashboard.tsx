'use client'
// components/Dashboard.tsx
import { useState, useEffect, useCallback } from 'react'
import type { DashboardData } from '@/lib/sheets'
import styles from './Dashboard.module.css'
import TabOverview  from './tabs/TabOverview'
import TabLevel     from './tabs/TabLevel'
import TabFunnel    from './tabs/TabFunnel'
import TabSource    from './tabs/TabSource'
import TabPosition  from './tabs/TabPosition'
import TabMonthly   from './tabs/TabMonthly'
import TabRaw       from './tabs/TabRaw'
import TabOrders    from './tabs/TabOrders'
import TabPersonnel from './tabs/TabPersonnel'

const TABS = [
  { id:'overview', icon:'📊', label:'Tổng Quan'       },
  { id:'personnel',icon:'👥', label:'Tổng Quan Nhân Sự' },
  { id:'orders',   icon:'📋', label:'Đơn Hàng'        },
  { id:'level',    icon:'🏆', label:'Bộ Level'         },
  { id:'funnel',   icon:'🎯', label:'Phễu Tuyển Dụng' },
  { id:'monthly',  icon:'🗓️', label:'Theo Tháng'      },
  { id:'source',   icon:'📡', label:'Nguồn & Kênh'    },
  { id:'position', icon:'💼', label:'Vị Trí'           },
  { id:'raw',      icon:'📋', label:'Raw Data'         },
]

const REFRESH_SEC = 60

export default function Dashboard({ data: initialData }: { data: DashboardData }) {
  const [tab, setTab]         = useState('overview')
  const [dark, setDark]       = useState(true)
  const [data, setData]       = useState(initialData)
  const [countdown, setCountdown] = useState(REFRESH_SEC)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(initialData.updatedAt)

  // Fetch dữ liệu mới từ API
  const fetchData = useCallback(async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/data', { cache: 'no-store' })
      if (res.ok) {
        const newData = await res.json()
        setData(newData)
        setLastUpdated(newData.updatedAt)
      }
    } catch (e) {
      console.error('Refresh failed:', e)
    } finally {
      setRefreshing(false)
      setCountdown(REFRESH_SEC)
    }
  }, [])

  // Auto-refresh mỗi 60 giây
  useEffect(() => {
    const interval = setInterval(fetchData, REFRESH_SEC * 1000)
    return () => clearInterval(interval)
  }, [fetchData])

  // Đếm ngược countdown
  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown(c => c <= 1 ? REFRESH_SEC : c - 1)
    }, 1000)
    return () => clearInterval(tick)
  }, [])

  // Apply dark/light theme
  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.style.setProperty('--bg',      '#0B0E14')
      root.style.setProperty('--bg2',     '#11151D')
      root.style.setProperty('--bg3',     '#161B26')
      root.style.setProperty('--bg4',     '#1E2430')
      root.style.setProperty('--border',  '#262D3A')
      root.style.setProperty('--border2', '#343D4D')
      root.style.setProperty('--text',    '#EAF0F7')
      root.style.setProperty('--text2',   '#93A0B4')
      root.style.setProperty('--text3',   '#66718A')
      root.style.setProperty('--shadow-sm', '0 1px 2px rgba(0,0,0,.35)')
      root.style.setProperty('--shadow',    '0 1px 2px rgba(0,0,0,.4), 0 12px 32px -16px rgba(0,0,0,.7)')
      root.style.setProperty('--card-hi',   'rgba(255,255,255,.045)')
      root.style.setProperty('--ambient',   'radial-gradient(1200px 460px at 50% -8%, rgba(79,142,247,.12), rgba(155,111,247,.06) 38%, transparent 68%)')
      document.body.style.background = '#0B0E14'
    } else {
      root.style.setProperty('--bg',      '#F1F4F9')
      root.style.setProperty('--bg2',     '#FFFFFF')
      root.style.setProperty('--bg3',     '#FFFFFF')
      root.style.setProperty('--bg4',     '#EDF1F7')
      root.style.setProperty('--border',  '#E2E8F2')
      root.style.setProperty('--border2', '#CDD6E4')
      root.style.setProperty('--text',    '#0F1729')
      root.style.setProperty('--text2',   '#5B6678')
      root.style.setProperty('--text3',   '#8A93A6')
      root.style.setProperty('--shadow-sm', '0 1px 2px rgba(16,24,40,.05)')
      root.style.setProperty('--shadow',    '0 1px 2px rgba(16,24,40,.06), 0 12px 32px -16px rgba(16,24,40,.16)')
      root.style.setProperty('--card-hi',   'rgba(255,255,255,.9)')
      root.style.setProperty('--ambient',   'radial-gradient(1200px 460px at 50% -8%, rgba(79,142,247,.10), rgba(155,111,247,.04) 38%, transparent 70%)')
      document.body.style.background = '#F1F4F9'
    }
  }, [dark])

  return (
    <div className={styles.shell}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>👥</div>
          <div>
            <div className={styles.title}>DASHBOARD BÁO CÁO TUYỂN DỤNG</div>
            <div className={styles.subtitle}>HQ Group — Phòng Nhân Sự & Tuyển Dụng</div>
          </div>
        </div>
        <div className={styles.headerRight}>
          {/* Dark/Light toggle */}
          <button
            onClick={() => setDark(d => !d)}
            title={dark ? 'Chuyển sang Light Mode' : 'Chuyển sang Dark Mode'}
            style={{
              marginRight:10, padding:'6px 13px', borderRadius:10,
              border:'1px solid var(--border)', background:'var(--bg3)',
              color:'var(--text)', fontSize:11, fontWeight:500, cursor:'pointer',
              boxShadow:'var(--shadow-sm)',
              display:'flex', alignItems:'center', gap:6, fontFamily:'inherit',
              transition:'border-color .15s, background .15s',
            }}
          >
            {dark ? '☀️ Light' : '🌙 Dark'}
          </button>

          {/* Refresh + countdown */}
          <button
            onClick={fetchData}
            disabled={refreshing}
            title="Cập nhật ngay"
            style={{
              marginRight:16, padding:'6px 13px', borderRadius:10,
              border:'1px solid var(--border)', background:'var(--bg3)',
              color:refreshing ? 'var(--text3)' : '#2ECC8A',
              fontSize:11, fontWeight:500, cursor:refreshing?'default':'pointer',
              boxShadow:'var(--shadow-sm)',
              display:'flex', alignItems:'center', gap:6, fontFamily:'inherit',
              transition:'border-color .15s, background .15s',
            }}
          >
            {refreshing ? '⏳ Đang tải...' : `🔄 ${countdown}s`}
          </button>

          <div>
            <div className={styles.period}>2026</div>
            <div className={styles.updated}>
              <span className={styles.dot} />
              {lastUpdated}
            </div>
          </div>
        </div>
      </header>

      {/* TABS */}
      <nav className={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </nav>

      {/* CONTENT */}
      <main className={styles.content}>
        {tab === 'overview'  && <TabOverview  data={data} />}
        {tab === 'personnel' && <TabPersonnel data={data} />}
        {tab === 'orders'    && <TabOrders    data={data} />}
        {tab === 'level'     && <TabLevel     data={data} />}
        {tab === 'funnel'    && <TabFunnel    data={data} />}
        {tab === 'monthly'   && <TabMonthly   data={data} />}
        {tab === 'source'    && <TabSource    data={data} />}
        {tab === 'position'  && <TabPosition  data={data} />}
        {tab === 'raw'       && <TabRaw       data={data} />}
      </main>
    </div>
  )
}
