'use client'
// components/tabs/TabFunnel.tsx
import type { DashboardData } from '@/lib/sheets'
import { Card, CardTitle, Grid, Space, FunnelBar, Table } from '../ui'

const p = (n: number, d: number) => d > 0 ? `${(n/d*100).toFixed(1)}%` : '—'

export default function TabFunnel({ data }: { data: DashboardData }) {
  const { stats: s } = data
  const stages = [
    { lv:'L0',  name:'CV thu thập được',        cnt:s.total,      color:'#33A6FF' },
    { lv:'L1',  name:'CV pass lọc HR',           cnt:s.hrPass,     color:'#00E08F' },
    { lv:'L1F', name:'CV fail lọc HR',           cnt:s.hrFail,     color:'#FF4D6D' },
    { lv:'L3', name:'UV đồng ý phỏng vấn',      cnt:s.dongYPV,    color:'#FFAA2B' },
    { lv:'L3X', name:'UV từ chối phỏng vấn',     cnt:s.tuChoiPV,   color:'#FF4D6D' },
    { lv:'L4',  name:'UV tham gia PV V1',         cnt:s.thamGiaPV,  color:'#B44CFF' },
    { lv:'L4A', name:'UV pass PV V1',             cnt:s.passPV,     color:'#00E5D0' },
    { lv:'L4B', name:'UV fail PV V1',             cnt:s.failPV,     color:'#FF4D6D' },
    { lv:'L7',  name:'UV đồng ý nhận việc',       cnt:s.dongYLam,   color:'#FFAA2B' },
    { lv:'L8',  name:'UV đi làm ngày đầu',        cnt:s.nhanViec,   color:'#00E08F' },
    { lv:'L9',  name:'UV đi làm đủ 10 ngày ✨',  cnt:s.d10,        color:'#FFD84D' },
  ]
  const monthRows = data.byMonth.map(m => [
    m.label, m.total, m.hrPass, p(m.hrPass,m.total),
    m.thamGiaPV, m.passPV, m.nhanViec, m.d10,
    p(m.thamGiaPV,m.total), p(m.nhanViec,m.total)
  ])

  return (
    <div>
      <Grid cols={2} gap={16}>
        <Card>
          <CardTitle sub="Số lượng tại mỗi stage — tỷ lệ trên tổng CV">📈 Phễu Chi Tiết</CardTitle>
          <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
            {stages.filter(s=>s.cnt>0).map(st => (
              <FunnelBar key={st.lv} label={`${st.lv} — ${st.name}`}
                count={st.cnt} total={s.total} color={st.color} />
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle sub="Tỷ lệ drop-off tại từng bước">📉 Drop-off Analysis</CardTitle>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              { step:'L0→L1', label:'Lọc CV HR', inp:s.total,     out:s.hrPass,    drop:s.hrFail   },
              { step:'L1→L3', label:'Liên hệ PV', inp:s.hrPass,   out:s.dongYPV,   drop:s.tuChoiPV },
              { step:'L3→L3A', label:'Show up PV', inp:s.dongYPV,  out:s.thamGiaPV, drop:s.dongYPV-s.thamGiaPV },
              { step:'L4→L4A',label:'Pass PV',    inp:s.thamGiaPV,out:s.passPV,    drop:s.failPV   },
              { step:'L4A→L7',label:'Nhận offer', inp:s.passPV,   out:s.dongYLam,  drop:s.passPV-s.dongYLam },
              { step:'L7→L8', label:'Onboard',    inp:s.dongYLam, out:s.nhanViec,  drop:s.dongYLam-s.nhanViec },
              { step:'L8→L9', label:'Retention',  inp:s.nhanViec, out:s.d10,       drop:s.dropout  },
            ].map(r => {
              const dropPct = r.inp > 0 ? r.drop/r.inp*100 : 0
              const passPct = r.inp > 0 ? r.out/r.inp*100 : 0
              return (
                <div key={r.step} style={{
                  background:'var(--bg4)', borderRadius:8, padding:'10px 12px',
                  display:'flex', alignItems:'center', gap:10
                }}>
                  <div style={{ fontFamily:'Space Mono,monospace', fontSize:9,
                    color:'#33A6FF', width:60 }}>{r.step}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:10, color:'var(--text)', marginBottom:4 }}>{r.label}</div>
                    <div style={{ height:4, background:'var(--border)', borderRadius:2, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${passPct}%`,
                        background: passPct>=70?'#00E08F':passPct>=40?'#FFAA2B':'#FF4D6D', borderRadius:2 }} />
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontFamily:'Space Mono,monospace', fontSize:12, fontWeight:700,
                      color:passPct>=70?'#00E08F':passPct>=40?'#FFAA2B':'#FF4D6D' }}>
                      {passPct.toFixed(0)}%
                    </div>
                    {r.drop > 0 && <div style={{ fontSize:9, color:'#FF4D6D' }}>-{r.drop} UV</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </Grid>

      <Space h={16} />
      <Card>
        <CardTitle sub="So sánh các chỉ số chính theo từng tháng">📅 Phễu Theo Tháng</CardTitle>
        <Table
          headers={['Tháng','Tổng CV','HR Pass','Pass%','Tham gia PV','Pass PV','Nhận việc','10 ngày','CV→PV%','CV→NV%']}
          rows={monthRows}
          colColors={[undefined,'#33A6FF','#00E08F','#00E08F','#B44CFF','#00E5D0','#00E08F','#FFD84D','#FFAA2B','#FFAA2B']}
        />
      </Card>
    </div>
  )
}
