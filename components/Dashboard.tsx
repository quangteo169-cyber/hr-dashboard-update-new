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
      root.style.setProperty('--bg',      '#05080F')
      root.style.setProperty('--bg2',     '#0A101C')
      root.style.setProperty('--bg3',     '#0F1728')
      root.style.setProperty('--bg4',     '#16223A')
      root.style.setProperty('--border',  '#1D2B47')
      root.style.setProperty('--border2', '#2D4066')
      root.style.setProperty('--text',    '#E8F1FF')
      root.style.setProperty('--text2',   '#8FA3C7')
      root.style.setProperty('--text3',   '#5D7199')
      root.style.setProperty('--shadow-sm', '0 1px 2px rgba(0,0,0,.35)')
      root.style.setProperty('--shadow',    '0 1px 2px rgba(0,0,0,.4), 0 12px 32px -16px rgba(0,0,0,.7)')
      root.style.setProperty('--shadow-lg', '0 2px 4px rgba(0,0,0,.35), 0 24px 48px -20px rgba(0,0,0,.65)')
      root.style.setProperty('--card-hi',   'rgba(255,255,255,.045)')
      root.style.setProperty('--row-hover', 'rgba(51,166,255,.09)')
      root.style.setProperty('--gridline',  'rgba(51,166,255,.055)')
      root.style.setProperty('--ambient',   'radial-gradient(1100px 480px at 18% -10%, rgba(0,200,255,.15), transparent 62%), radial-gradient(1000px 420px at 82% -8%, rgba(180,76,255,.13), transparent 60%), radial-gradient(700px 320px at 50% 0%, rgba(255,78,205,.06), transparent 65%)')
      document.body.style.background = '#05080F'
    } else {
      root.style.setProperty('--bg',      '#EEF3FA')
      root.style.setProperty('--bg2',     '#FFFFFF')
      root.style.setProperty('--bg3',     '#FFFFFF')
      root.style.setProperty('--bg4',     '#E9EFF9')
      root.style.setProperty('--border',  '#D9E3F2')
      root.style.setProperty('--border2', '#BCCCE4')
      root.style.setProperty('--text',    '#0D1526')
      root.style.setProperty('--text2',   '#52617A')
      root.style.setProperty('--text3',   '#8291A8')
      root.style.setProperty('--shadow-sm', '0 1px 2px rgba(16,24,40,.05)')
      root.style.setProperty('--shadow',    '0 1px 2px rgba(16,24,40,.06), 0 12px 32px -16px rgba(16,24,40,.16)')
      root.style.setProperty('--shadow-lg', '0 2px 4px rgba(16,24,40,.06), 0 24px 48px -20px rgba(16,24,40,.22)')
      root.style.setProperty('--card-hi',   'rgba(255,255,255,.9)')
      root.style.setProperty('--row-hover', 'rgba(51,166,255,.08)')
      root.style.setProperty('--gridline',  'rgba(30,70,140,.05)')
      root.style.setProperty('--ambient',   'radial-gradient(1100px 480px at 18% -10%, rgba(0,200,255,.07), transparent 58%), radial-gradient(1000px 420px at 82% -8%, rgba(180,76,255,.05), transparent 55%), radial-gradient(700px 320px at 50% 0%, rgba(255,78,205,.025), transparent 60%)')
      document.body.style.background = '#EEF3FA'
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
            className={styles.headerBtn}
            style={{ marginRight:10 }}
          >
            {dark ? '☀️ Light' : '🌙 Dark'}
          </button>

          {/* Refresh + countdown */}
          <button
            onClick={fetchData}
            disabled={refreshing}
            title="Cập nhật ngay"
            className={styles.headerBtn}
            style={{ marginRight:16, color:refreshing ? 'var(--text3)' : '#00E08F' }}
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
