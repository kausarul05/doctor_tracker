'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Stethoscope, Mail, Phone, Building2, Plus, Trash2, Users, Calendar, X } from 'lucide-react';
import ConditionBadge from '@/components/ui/ConditionBadge';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { format } from 'date-fns';

const CONDITIONS = ['Critical', 'Stable', 'Recovering', 'Discharged', 'Under Observation'];
const emptyPatient = { name: '', age: '', gender: 'Male', condition: 'Stable', diagnosis: '', phone: '', email: '', address: '', admittedAt: '' };

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [doctor, setDoctor] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<any>(emptyPatient);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/doctors/${params.id}`);
      const data = await res.json();
      if (!res.ok) { router.push('/doctors'); return; }
      setDoctor(data.doctor);
      setPatients(data.patients);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [params.id]);

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true); setFormError('');
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, doctorId: params.id }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || 'Error adding patient'); return; }
      setShowModal(false);
      setForm(emptyPatient);
      fetchData();
    } catch { setFormError('Network error'); }
    finally { setFormLoading(false); }
  };

  const handleDeletePatient = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await fetch(`/api/patients/${deleteTarget._id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      fetchData();
    } finally { setDeleteLoading(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div className="spinner" style={{ width: '32px', height: '32px' }} />
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</p>
    </div>
  );

  if (!doctor) return null;

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Back */}
      <button onClick={() => router.back()} style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-secondary)', fontSize: '13px', fontFamily: 'var(--font-body)',
        marginBottom: '24px', padding: 0,
      }}>
        <ArrowLeft size={16} />
        Back to Doctors
      </button>

      {/* Doctor Card */}
      <div style={{
        background: 'var(--bg-2)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '28px', marginBottom: '24px',
        display: 'flex', alignItems: 'flex-start', gap: '24px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, right: 0, width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          width: '72px', height: '72px', borderRadius: '18px', flexShrink: 0,
          background: 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(139,92,246,0.25))',
          border: '1px solid rgba(59,130,246,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '26px', fontWeight: '700', color: '#60a5fa',
          fontFamily: 'var(--font-display)',
        }}>
          {doctor.name.charAt(0).toUpperCase()}
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
            Dr. {doctor.name}
          </h2>
          <span style={{
            display: 'inline-flex', padding: '4px 12px', borderRadius: '6px',
            background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
            fontSize: '12px', fontWeight: '600', color: '#60a5fa', marginBottom: '20px',
          }}>
            {doctor.specialization}
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { icon: Building2, label: 'Hospital', value: doctor.hospital },
              { icon: Phone, label: 'Phone', value: doctor.phone },
              { icon: Mail, label: 'Email', value: doctor.email },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'var(--bg-3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={15} color="var(--text-muted)" />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>{label}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px', background: 'var(--bg-3)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <Users size={20} color="var(--brand)" />
          <div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{patients.length}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Patients</div>
          </div>
        </div>
      </div>

      {/* Patients */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>
          Patients
        </h3>
        <button onClick={() => { setForm(emptyPatient); setFormError(''); setShowModal(true); }} className="btn-primary" style={{ fontSize: '13px', padding: '9px 16px' }}>
          <Plus size={15} />
          Add Patient
        </button>
      </div>

      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        {patients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Users size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '6px' }}>No patients assigned</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Add the first patient for Dr. {doctor.name}</p>
          </div>
        ) : (
          <div className="table-wrapper"><table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Age / Gender</th>
                <th>Diagnosis</th>
                <th>Condition</th>
                <th>Admitted</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div style={{ fontWeight: '500' }}>{p.name}</div>
                    {p.phone && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.phone}</div>}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{p.age} · {p.gender}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '180px' }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.diagnosis}</span>
                  </td>
                  <td><ConditionBadge condition={p.condition} /></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    {format(new Date(p.admittedAt), 'MMM d, yyyy')}
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={() => setDeleteTarget(p)} style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'var(--rose)',
                      }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>

      {/* Add Patient Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 26px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>Add Patient</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>Assign a new patient to Dr. {doctor.name}</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddPatient} style={{ padding: '26px' }}>
              {formError && <div style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '8px', padding: '10px', marginBottom: '16px', fontSize: '13px', color: 'var(--rose)' }}>{formError}</div>}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Full Name *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Patient name" required className="input-field" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Age *</label>
                  <input type="number" min="0" max="150" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} placeholder="35" required className="input-field" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Gender *</label>
                  <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className="input-field" style={{ cursor: 'pointer' }}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Condition *</label>
                  <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })} className="input-field" style={{ cursor: 'pointer' }}>
                    {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Phone *</label>
                  <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 0100" required className="input-field" />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Diagnosis *</label>
                  <input value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} placeholder="Primary diagnosis" required className="input-field" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="patient@email.com" className="input-field" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Admitted Date</label>
                  <input type="date" value={form.admittedAt} onChange={e => setForm({ ...form, admittedAt: e.target.value })} className="input-field" />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '6px' }}>Address</label>
                  <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Patient address" className="input-field" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" style={{ fontSize: '13px' }}>Cancel</button>
                <button type="submit" disabled={formLoading} className="btn-primary" style={{ fontSize: '13px' }}>
                  {formLoading && <div className="spinner" style={{ width: '14px', height: '14px' }} />}
                  Add Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Remove Patient"
          message={`Remove ${deleteTarget.name} from Dr. ${doctor.name}'s patient list? This cannot be undone.`}
          onConfirm={handleDeletePatient}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
