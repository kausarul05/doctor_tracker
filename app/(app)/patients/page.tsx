'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Users, Edit2, Trash2, X, ChevronDown, Calendar, Plus, Stethoscope } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';
import ConditionBadge from '@/components/ui/ConditionBadge';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { format } from 'date-fns';

interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  diagnosis: string;
  phone: string;
  email?: string;
  address?: string;
  admittedAt: string;
  doctorId: { _id: string; name: string; specialization: string; hospital: string } | null;
}

interface Doctor { _id: string; name: string; specialization: string; hospital: string; }

const CONDITIONS = ['Critical', 'Stable', 'Recovering', 'Discharged', 'Under Observation'];
const emptyForm = { name: '', age: '', gender: 'Male', condition: 'Stable', diagnosis: '', phone: '', email: '', address: '', admittedAt: '', doctorId: '' };

// ── Form modal used for both Add and Edit ──
function PatientModal({
  title, subtitle, form, setForm, onSubmit, onClose, loading, error, doctors, showDoctorField,
}: {
  title: string; subtitle: string;
  form: any; setForm: (f: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  loading: boolean; error: string;
  doctors: Doctor[];
  showDoctorField: boolean;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 26px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>{title}</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>{subtitle}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}><X size={20} /></button>
        </div>

        <form onSubmit={onSubmit} style={{ padding: '24px 26px' }}>
          {error && (
            <div style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '8px', padding: '11px 14px', marginBottom: '18px', fontSize: '13px', color: 'var(--rose)' }}>
              {error}
            </div>
          )}

          <div className="form-grid-2">
            {/* Full Name */}
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Full Name *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Patient full name" required className="input-field" />
            </div>

            {/* Age */}
            <div>
              <label style={labelStyle}>Age *</label>
              <input type="number" min="0" max="150" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} placeholder="35" required className="input-field" />
            </div>

            {/* Gender */}
            <div>
              <label style={labelStyle}>Gender *</label>
              <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className="input-field" style={{ cursor: 'pointer' }}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>

            {/* Condition */}
            <div>
              <label style={labelStyle}>Condition *</label>
              <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })} className="input-field" style={{ cursor: 'pointer' }}>
                {CONDITIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Phone */}
            <div>
              <label style={labelStyle}>Phone *</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+880 1700 000000" required className="input-field" />
            </div>

            {/* Diagnosis */}
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Diagnosis *</label>
              <input value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} placeholder="Primary diagnosis" required className="input-field" />
            </div>

            {/* Assign Doctor — only when adding from Patients page */}
            {showDoctorField && (
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Assign Doctor *</label>
                <select value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })} required className="input-field" style={{ cursor: 'pointer' }}>
                  <option value="">— Select a doctor —</option>
                  {doctors.map(d => (
                    <option key={d._id} value={d._id}>
                      Dr. {d.name} · {d.specialization} · {d.hospital}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Email */}
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="patient@email.com" className="input-field" />
            </div>

            {/* Admitted date */}
            <div>
              <label style={labelStyle}>Admission Date</label>
              <input type="date" value={form.admittedAt} onChange={e => setForm({ ...form, admittedAt: e.target.value })} className="input-field" />
            </div>

            {/* Address */}
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Address</label>
              <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Patient address" className="input-field" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '22px' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ fontSize: '13px', padding: '9px 18px' }}>Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary" style={{ fontSize: '13px', padding: '9px 18px' }}>
              {loading && <div className="spinner" style={{ width: '14px', height: '14px' }} />}
              {title.startsWith('Add') ? 'Add Patient' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '12px', fontWeight: '500',
  color: 'var(--text-secondary)', marginBottom: '6px',
};

// ── Main Page ──
export default function PatientsPage() {
  const [patients, setPatients]     = useState<Patient[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]       = useState(true);
  const [doctors, setDoctors]       = useState<Doctor[]>([]);

  // Filters
  const [search, setSearch]               = useState('');
  const [filterCondition, setFilterCondition] = useState('');
  const [filterGender, setFilterGender]   = useState('');
  const [dateFrom, setDateFrom]           = useState('');
  const [dateTo, setDateTo]               = useState('');
  const [showFilters, setShowFilters]     = useState(false);

  // Modals
  const [showAdd, setShowAdd]         = useState(false);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [addForm, setAddForm]         = useState<any>(emptyForm);
  const [editForm, setEditForm]       = useState<any>({});
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError]     = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch all doctors for the dropdown
  const fetchDoctors = async () => {
    try {
      const res  = await fetch('/api/doctors?limit=200');
      const data = await res.json();
      setDoctors(data.doctors || []);
    } catch {}
  };

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page), limit: '10',
        ...(search          && { search }),
        ...(filterCondition && { condition: filterCondition }),
        ...(filterGender    && { gender: filterGender }),
        ...(dateFrom        && { dateFrom }),
        ...(dateTo          && { dateTo }),
      });
      const res  = await fetch(`/api/patients?${params}`);
      const data = await res.json();
      setPatients(data.patients   || []);
      setTotal(data.total         || 0);
      setTotalPages(data.totalPages || 1);
    } finally { setLoading(false); }
  }, [page, search, filterCondition, filterGender, dateFrom, dateTo]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);
  useEffect(() => { fetchDoctors(); }, []);

  // ── Add patient ──
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true); setFormError('');
    try {
      const res  = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || 'Error adding patient'); return; }
      setShowAdd(false);
      setAddForm(emptyForm);
      fetchPatients();
    } catch { setFormError('Network error. Please try again.'); }
    finally   { setFormLoading(false); }
  };

  // ── Edit patient ──
  const openEdit = (p: Patient) => {
    setEditPatient(p);
    setEditForm({
      name: p.name, age: p.age, gender: p.gender,
      condition: p.condition, diagnosis: p.diagnosis,
      phone: p.phone, email: p.email || '', address: p.address || '',
      admittedAt: p.admittedAt ? format(new Date(p.admittedAt), 'yyyy-MM-dd') : '',
    });
    setFormError('');
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPatient) return;
    setFormLoading(true); setFormError('');
    try {
      const res  = await fetch(`/api/patients/${editPatient._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || 'Error updating patient'); return; }
      setEditPatient(null);
      fetchPatients();
    } catch { setFormError('Network error.'); }
    finally   { setFormLoading(false); }
  };

  // ── Delete patient ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await fetch(`/api/patients/${deleteTarget._id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      fetchPatients();
    } finally { setDeleteLoading(false); }
  };

  const clearFilters = () => { setFilterCondition(''); setFilterGender(''); setDateFrom(''); setDateTo(''); setPage(1); };
  const hasFilters   = filterCondition || filterGender || dateFrom || dateTo;
  const activeFilterCount = [filterCondition, filterGender, dateFrom, dateTo].filter(Boolean).length;

  return (
    <div style={{ maxWidth: '1400px' }}>
      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)' }}>
            Patients
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            {total} patient{total !== 1 ? 's' : ''} in system
          </p>
        </div>
        <button onClick={() => { setAddForm(emptyForm); setFormError(''); setShowAdd(true); }} className="btn-primary">
          <Plus size={16} /> Add Patient
        </button>
      </div>

      {/* ── Search + Filter bar ── */}
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, diagnosis, phone..."
              className="input-field"
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={hasFilters ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '13px', padding: '10px 14px' }}
          >
            <Filter size={14} />
            Filters
            {hasFilters && (
              <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '20px', padding: '1px 7px', fontSize: '11px', fontWeight: '700' }}>
                {activeFilterCount}
              </span>
            )}
            <ChevronDown size={14} style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </button>
        </div>

        {showFilters && (
          <div className="filter-grid">
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Condition</label>
              <select value={filterCondition} onChange={e => { setFilterCondition(e.target.value); setPage(1); }} className="input-field" style={{ cursor: 'pointer' }}>
                <option value="">All Conditions</option>
                {CONDITIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Gender</label>
              <select value={filterGender} onChange={e => { setFilterGender(e.target.value); setPage(1); }} className="input-field" style={{ cursor: 'pointer' }}>
                <option value="">All Genders</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Admitted From</label>
              <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className="input-field" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Admitted To</label>
              <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} className="input-field" />
            </div>
            {hasFilters && (
              <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: 'var(--rose)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--font-body)' }}>
                  <X size={13} /> Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', flexDirection: 'column', gap: '14px' }}>
            <div className="spinner" style={{ width: '28px', height: '28px' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading patients...</span>
          </div>
        ) : patients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Users size={40} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', fontWeight: '500' }}>No patients found</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
              {search || hasFilters ? 'Try adjusting your search or filters' : 'Add your first patient to get started'}
            </p>
            {!search && !hasFilters && (
              <button onClick={() => { setAddForm(emptyForm); setFormError(''); setShowAdd(true); }} className="btn-primary" style={{ margin: '20px auto 0', display: 'inline-flex' }}>
                <Plus size={15} /> Add Patient
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Age / Gender</th>
                    <th>Condition</th>
                    <th>Diagnosis</th>
                    <th>Doctor</th>
                    <th>Admitted</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', color: '#34d399' }}>
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: '500', fontSize: '14px' }}>{p.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '13px', whiteSpace: 'nowrap' }}>{p.age} · {p.gender}</td>
                      <td><ConditionBadge condition={p.condition} /></td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '160px' }}>
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.diagnosis}</span>
                      </td>
                      <td>
                        {p.doctorId ? (
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Dr. {p.doctorId.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.doctorId.specialization}</div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Calendar size={12} />
                          {format(new Date(p.admittedAt), 'MMM d, yyyy')}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button onClick={() => openEdit(p)} title="Edit" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fbbf24' }}>
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => setDeleteTarget(p)} title="Delete" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--rose)' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} total={total} limit={10} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* ── Add Patient Modal ── */}
      {showAdd && (
        <PatientModal
          title="Add New Patient"
          subtitle="Register a new patient and assign a doctor"
          form={addForm} setForm={setAddForm}
          onSubmit={handleAdd} onClose={() => setShowAdd(false)}
          loading={formLoading} error={formError}
          doctors={doctors} showDoctorField={true}
        />
      )}

      {/* ── Edit Patient Modal ── */}
      {editPatient && (
        <PatientModal
          title="Edit Patient"
          subtitle={`Update information for ${editPatient.name}`}
          form={editForm} setForm={setEditForm}
          onSubmit={handleEdit} onClose={() => setEditPatient(null)}
          loading={formLoading} error={formError}
          doctors={doctors} showDoctorField={false}
        />
      )}

      {/* ── Delete Confirm ── */}
      {deleteTarget && (
        <ConfirmModal
          title="Delete Patient"
          message={`Are you sure you want to delete ${deleteTarget.name}? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
