import React, { useState } from 'react';

export default function IncidentForm() {
  const [form, setForm] = useState({ driverId: '', tripId: '', type: 'Accident', severity: 'Low', description: '', date: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/safety/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, createdBy: '' }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed');
      }
      setForm({ driverId: '', tripId: '', type: 'Accident', severity: 'Low', description: '', date: '' });
      // Invalidate queries via react-query in future
    } catch (error: any) {
      alert(error.message || 'Error');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={submit} className="rounded-xl border bg-card p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input placeholder="Driver ID" value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })} className="input" />
        <input placeholder="Trip ID (optional)" value={form.tripId} onChange={(e) => setForm({ ...form, tripId: e.target.value })} className="input" />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input">
          <option>Accident</option>
          <option>Speeding</option>
          <option>Compliance Failure</option>
          <option>Other</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="input">
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input" />
      </div>
      <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" />
      <div>
        <button type="submit" className="rounded-lg bg-indigo-600 px-3 py-2 text-white" disabled={loading}>{loading ? 'Creating...' : 'Create Incident'}</button>
      </div>
    </form>
  );
}
