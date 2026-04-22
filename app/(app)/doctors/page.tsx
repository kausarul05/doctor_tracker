'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Stethoscope, Mail, Phone, Building2, Edit2, Trash2, Eye, X, ChevronDown } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { format } from 'date-fns';
import Link from 'next/link';

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
}

const SPECIALIZATIONS = [
  'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics',
  'Oncology', 'Dermatology', 'Psychiatry', 'Radiology',
  'Surgery', 'Internal Medicine', 'Gynecology', 'Urology',
];

const emptyForm = { name: '', specialization: '', hospital: '', phone: '', email: '' };

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterSpec, setFilterSpec] = useState('');
  const [filterHospital, setFilterHospital] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Doctor | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page), limit: '10',
        ...(search && { search }),
        ...(filterSpec && { specialization: filterSpec }),
        ...(filterHospital && { hospital: filterHospital }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      });
      const res = await fetch(`/api/doctors?${params}`);
      const data = await res.json();
      setDoctors(data.doctors || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } finally {
      setLoading(false);
    }
  }, [page, search, filterSpec, filterHospital, dateFrom, dateTo]);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const openCreate = () => { setEditDoctor(null); setForm(emptyForm); setFormError(''); setShowModal(true); };
  const openEdit = (d: Doctor) => { setEditDoctor(d); setForm({ name: d.name, specialization: d.specialization, hospital: d.hospital, phone: d.phone, email: d.email }); setFormError(''); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true); setFormError('');
    try {
      const url = editDoctor ? `/api/doctors/${editDoctor._id}` : '/api/doctors';
      const method = editDoctor ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || 'Something went wrong'); return; }
      setShowModal(false);
      fetchDoctors();
    } catch {
      setFormError('Network error. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await fetch(`/api/doctors/${deleteTarget._id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      fetchDoctors();
    } finally {
      setDeleteLoading(false);
    }
  };

  const clearFilters = () => { setFilterSpec(''); setFilterHospital(''); setDateFrom(''); setDateTo(''); setPage(1); };
  const hasFilters = filterSpec || filterHospital || dateFrom || dateTo;

  return (
    <div style={{ maxWidth: '1400px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)' }}>
            Doctors
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            {total} doctor{total !== 1 ? 's' : ''} registered
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} />
          Add Doctor
        </button>
      </div>

      {/* Search + Filter bar */}
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, specialization, hospital, email..."
              className="input-field"
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={hasFilters ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '13px', padding: '10px 16px', whiteSpace: 'nowrap' }}
          >
            <Filter size={14} />
            Filters
            {hasFilters && <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '20px', padding: '1px 6px', fontSize: '11px' }}>{[filterSpec, filterHospital, dateFrom, dateTo].filter(Boolean).length}</span>}
            <ChevronDown size={14} style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </button>
        </div>

        {showFilters && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Specialization</label>
              <select value={filterSpec} onChange={e => { setFilterSpec(e.target.value); setPage(1); }} className="input-field" style={{ cursor: 'pointer' }}>
                <option value="">All</option>
                {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Hospital</label>
              <input value={filterHospital} onChange={e => { setFilterHospital(e.target.value); setPage(1); }} placeholder="Filter by hospital" className="input-field" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Registered From</label>
              <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className="input-field" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Registered To</label>
              <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} className="input-field" />
            </div>
            {hasFilters && (
              <button onClick={clearFilters} style={{ gridColumn: '4', background: 'none', border: 'none', color: 'var(--rose)', fontSize: '13px', cursor: 'pointer', textAlign: 'right', fontFamily: 'var(--font-body)' }}>
                <X size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', flexDirection: 'column', gap: '14px' }}>
            <div className="spinner" style={{ width: '28px', height: '28px' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading doctors...</span>
          </div>
        ) : doctors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Stethoscope size={40} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', fontWeight: '500' }}>No doctors found</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
              {search || hasFilters ? 'Try adjusting your search or filters' : 'Add your first doctor to get started'}
            </p>
            {!search && !hasFilters && (
              <button onClick={openCreate} className="btn-primary" style={{ margin: '20px auto 0', display: 'inline-flex' }}>
                <Plus size={15} /> Add Doctor
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="table-wrapper"><table className="data-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialization</th>
                  <th>Hospital</th>
                  <th>Contact</th>
                  <th>Registered</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((d) => (
                  <tr key={d._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                          background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))',
                          border: '1px solid rgba(59,130,246,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '14px', fontWeight: '600', color: '#60a5fa',
                        }}>
                          {d.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Dr. {d.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{d.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex', padding: '4px 10px', borderRadius: '6px',
                        background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)',
                        fontSize: '12px', fontWeight: '500', color: '#60a5fa',
                      }}>
                        {d.specialization}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                        <Building2 size={13} color="var(--text-muted)" />
                        {d.hospital}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                        <Phone size={13} color="var(--text-muted)" />
                        {d.phone}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                      {format(new Date(d.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <Link href={`/doctors/${d._id}`}>
                          <button title="View" style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: '#60a5fa',
                          }}>
                            <Eye size={14} />
                          </button>
                        </Link>
                        <button onClick={() => openEdit(d)} title="Edit" style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: '#fbbf24',
                        }}>
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteTarget(d)} title="Delete" style={{
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
            <Pagination page={page} totalPages={totalPages} total={total} limit={10} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 28px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {editDoctor ? 'Edit Doctor' : 'Add New Doctor'}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '3px' }}>
                  {editDoctor ? 'Update doctor information' : 'Register a new doctor in the system'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '28px' }}>
              {formError && (
                <div style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '8px', padding: '12px', marginBottom: '20px', fontSize: '13px', color: 'var(--rose)' }}>
                  {formError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Full Name *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Dr. John Smith" required className="input-field" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Specialization *</label>
                  <select value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} required className="input-field" style={{ cursor: 'pointer' }}>
                    <option value="">Select specialization</option>
                    {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Hospital *</label>
                  <input value={form.hospital} onChange={e => setForm({ ...form, hospital: e.target.value })} placeholder="City General Hospital" required className="input-field" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Phone *</label>
                  <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 0100" required className="input-field" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px' }}>Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="doctor@hospital.com" required className="input-field" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" style={{ fontSize: '13px' }}>
                  Cancel
                </button>
                <button type="submit" disabled={formLoading} className="btn-primary" style={{ fontSize: '13px' }}>
                  {formLoading && <div className="spinner" style={{ width: '14px', height: '14px' }} />}
                  {editDoctor ? 'Save Changes' : 'Add Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <ConfirmModal
          title="Delete Doctor"
          message={`Are you sure you want to delete Dr. ${deleteTarget.name}? This will also delete all their patients. This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
