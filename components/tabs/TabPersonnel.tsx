'use client'
// components/tabs/TabPersonnel.tsx
import type { DashboardData, PersonnelItem } from '@/lib/sheets'
import { Card, CardTitle, KpiCard, Grid, SectionHeader, Space } from '../ui'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, ComposedChart, Line, CartesianGrid,
} from 'recharts'

const pct = (n: number, d: number) => d > 0 ? `${(n / d * 100).toFixed(1)}%` : '—'

const tooltipStyle = {
  background: 'var(--bg4)', border: '1px solid var(--border)',
  borderRadius: 8, fontSize: 11, color: 'var(--text)',
} as const

// Biểu đồ cột ngang dùng lại cho Cấp bậc / Khối / Bộ phận
function BarBlock({ title, sub, data, color }: {
  title: string; sub: string; data: PersonnelItem[]; color: string
}) {
  const rows = data.filter(d => d.value > 0).sort((a, b) => b.value - a.value)
  const chartData = rows.map(d => ({ name: d.label, value: d.value }))
  const height = Math.max(180, chartData.length * 34 + 30)
  return (
    <Card>
      <CardTitle sub={sub}>{title}</CardTitle>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 28 }}>
          <XAxis type="number" tick={{ fill: 'var(--text2)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis dataKey="name" type="category" width={150}
            tick={{ fill: 'var(--text2)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="value" radius={[0, 5, 5, 0]} name="Số lượng" label={{ position: 'right', fill: 'var(--text2)', fontSize: 10 }}>
            {chartData.map((_, i) => <Cell key={i} fill={color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}

// Donut + chú thích kèm số lượng và %
function DonutBlock({ title, sub, data, colors, total }: {
  title: string; sub: string; data: PersonnelItem[]; colors: string[]; total: number
}) {
  const chartData = data.map((d, i) => ({ name: d.label, value: d.value, color: colors[i % colors.length] }))
  const sum = total || chartData.reduce((s, d) => s + d.value, 0)
  return (
    <Card>
      <CardTitle sub={sub}>{title}</CardTitle>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px', minWidth: 200 }}>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name"
                innerRadius={55} outerRadius={85} paddingAngle={2} stroke="none">
                {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {chartData.map(e => (
            <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: e.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: 'var(--text2)', flex: 1 }}>{e.name}</span>
              <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 13, fontWeight: 700, color: e.color }}>{e.value}</span>
              <span style={{ fontSize: 10, color: 'var(--text3)', width: 48, textAlign: 'right' }}>{pct(e.value, sum)}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

export default function TabPersonnel({ data }: { data: DashboardData }) {
  const p = data.personnel
  const mLabel = p.reportMonth ? `T${p.reportMonth}` : ''

  if (!p || p.total === 0) {
    return (
      <SectionHeader>👥 Tổng Quan Nhân Sự — chưa tải được dữ liệu từ sheet &quot;Tổng quan nhân sự&quot;</SectionHeader>
    )
  }

  const genderData = [
    { label: 'Nhân sự Nam', value: p.male },
    { label: 'Nhân sự Nữ', value: p.female },
  ]
  const flowData = p.flow.map(f => ({
    name: `T${f.month}`, 'Nhận việc': f.hires, 'Nghỉ việc': f.leaves, 'Tăng ròng': f.hires - f.leaves,
  }))

  return (
    <div>
      <SectionHeader>
        👥 Tổng Quan Nhân Sự{p.reportMonth ? ` — Tháng ${p.reportMonth}/${p.reportYear}` : ''} • {p.total} nhân sự đang làm
      </SectionHeader>

      {/* KPI */}
      <Grid cols={5} gap={12}>
        <KpiCard label="Tổng nhân sự" value={p.total} sub="đang làm việc" color="#4F8EF7" icon="👥" />
        <KpiCard label="Full time" value={p.fullTime} sub={pct(p.fullTime, p.fullTime + p.partTime) + ' tổng FT+PT'} color="#2ECC8A" icon="⏱️" />
        <KpiCard label="Part time" value={p.partTime} sub={pct(p.partTime, p.fullTime + p.partTime) + ' tổng FT+PT'} color="#1ACFCF" icon="⏳" />
        <KpiCard label={`Nhận việc ${mLabel}`} value={p.hiresThisMonth} sub="trong tháng" color="#F5A623" icon="📥" />
        <KpiCard label={`Đã nghỉ ${mLabel}`} value={p.leavesThisMonth} sub="trong tháng" color="#F75454" icon="📤" />
      </Grid>

      <Space h={16} />

      {/* Giới tính + Độ tuổi */}
      <Grid cols={2} gap={16}>
        <DonutBlock title="🧑‍🤝‍🧑 Cơ Cấu Giới Tính" sub="Tỷ lệ nam / nữ trên tổng nhân sự"
          data={genderData} colors={['#4F8EF7', '#9B6FF7']} total={p.male + p.female} />
        <DonutBlock title="🎂 Cơ Cấu Độ Tuổi" sub="Phân bổ nhân sự theo nhóm tuổi"
          data={p.byAge} colors={['#4F8EF7', '#F75454', '#FFD700']} total={p.total} />
      </Grid>

      <Space h={16} />

      {/* Cấp bậc + Khối */}
      <Grid cols={2} gap={16}>
        <BarBlock title="🏅 Nhân Sự Theo Cấp Bậc" sub="Số lượng theo từng cấp bậc" data={p.byLevel} color="#4F8EF7" />
        <BarBlock title="🏢 Nhân Sự Theo Khối Chức Năng" sub="Số lượng theo khối" data={p.byDivision} color="#1ACFCF" />
      </Grid>

      <Space h={16} />

      {/* Bộ phận */}
      <BarBlock title="🗂️ Nhân Sự Theo Bộ Phận" sub="Số lượng theo từng bộ phận (ẩn bộ phận = 0)" data={p.byDepartment} color="#9B6FF7" />

      <Space h={16} />

      {/* Biến động theo tháng */}
      <Card>
        <CardTitle sub="Số nhân sự nhận việc và nghỉ việc theo từng tháng, kèm mức tăng ròng">
          📈 Biến Động Nhân Sự Theo Tháng
        </CardTitle>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={flowData} margin={{ left: 0, right: 10, top: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: 'var(--text2)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text2)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Nhận việc" fill="#2ECC8A" radius={[4, 4, 0, 0]} barSize={14} />
            <Bar dataKey="Nghỉ việc" fill="#F75454" radius={[4, 4, 0, 0]} barSize={14} />
            <Line type="monotone" dataKey="Tăng ròng" stroke="#F5A623" strokeWidth={2} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
