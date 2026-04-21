'use client';
import { useEffect, useState } from 'react';
import { Stethoscope, Users, TrendingUp, RefreshCw } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface DashboardData {
  totalDoctors: number;
  totalPatients: number;
  avgPatientsPerDoctor: number;
  conditionStats: { name: string; value: number }[];
  patientsPerDoctor: { doctorName: string; specialization: string; count: number }[];
  monthlyAdmissions: { month: string; patients: number }[];
  specializationStats: { name: string; value: number }[];
}

const CONDITION_COLORS: Record<string, string> = {
  Critical: '#f43f5e', Stable: '#10b981', Recovering: '#3b82f6',
  Discharged: '#8b5cf6', 'Under Observation': '#f59e0b',
};
const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#ec4899', '#84cc16'];

function StatCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '90px', height: '90px', borderRadius: '50%', background: `radial-gradient(circle, ${color}15 0%, transparent 70%)` }} />
      <div style={{ width: '42px', height: '42px', borderRadius: '11px', background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
        <Icon size={19} color={color} />
      </div>
      <div style={{ fontSize: '26px', fontWeight: '700', fontFamily: 'var(--font-display)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginTop: '4px' }}>{label}</div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{sub}</div>}
    </div>
  );
}

const ChartCard = ({ title, subtitle, children }: any) => (
  <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '22px' }}>
    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>{title}</h3>
    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>{subtitle}</p>
    {children}
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px' }}>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ fontSize: '14px', fontWeight: '600', color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [data, setData]     = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/dashboard');
      const json = await res.json();
      setData(json);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div className="spinner" style={{ width: '34px', height: '34px', borderWidth: '3px' }} />
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading dashboard...</p>
    </div>
  );

  if (!data) return (
    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
      No data available. Make sure the database is connected.
    </div>
  );

  return (
    <div style={{ maxWidth: '1400px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>Analytics Overview</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Real-time data from your medical database</p>
        </div>
        <button onClick={fetchData} className="btn-secondary" style={{ fontSize: '13px', padding: '8px 14px' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stat cards — responsive via .stat-grid */}
      <div className="stat-grid">
        <StatCard icon={Stethoscope} label="Total Doctors"           value={data.totalDoctors}           sub="Medical staff registered" color="#3b82f6" />
        <StatCard icon={Users}       label="Total Patients"           value={data.totalPatients}          sub="Patients in system"       color="#10b981" />
        <StatCard icon={TrendingUp}  label="Avg Patients / Doctor"    value={data.avgPatientsPerDoctor}   sub="Patient distribution"     color="#8b5cf6" />
      </div>

      {/* Charts row 1 */}
      <div className="chart-grid-2-1">
        <ChartCard title="Monthly Patient Admissions" subtitle="Admission trend over last 12 months">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.monthlyAdmissions}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#4d6380', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4d6380', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="patients" name="Patients" stroke="#3b82f6" strokeWidth={2} fill="url(#grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Patient Conditions" subtitle="Distribution by condition">
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={data.conditionStats} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                {data.conditionStats.map((entry, i) => (
                  <Cell key={i} fill={CONDITION_COLORS[entry.name] || PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '8px' }}>
            {data.conditionStats.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: CONDITION_COLORS[c.name] || PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{c.name}</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>{c.value}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="chart-grid-2">
        <ChartCard title="Top Doctors by Patients" subtitle="Patient load per doctor">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.patientsPerDoctor.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fill: '#4d6380', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="doctorName" width={90} tick={{ fill: '#8fa3c0', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => v.length > 12 ? v.slice(0, 12) + '…' : v} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Patients" radius={[0, 6, 6, 0]} fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Doctors by Specialization" subtitle="Medical specialty distribution">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.specializationStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#4d6380', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => v.length > 8 ? v.slice(0, 8) + '…' : v} />
              <YAxis tick={{ fill: '#4d6380', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Doctors" radius={[6, 6, 0, 0]}>
                {data.specializationStats.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
