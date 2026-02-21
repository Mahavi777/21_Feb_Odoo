import React, { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="rounded-2xl border bg-card/60 backdrop-blur-sm shadow-xl p-6 sm:p-8">
      <form onSubmit={submit} className="space-y-6">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider block">Driver ID</label>
            <input 
              required
              placeholder="e.g. 64b73..." 
              value={form.driverId} 
              onChange={(e) => setForm({ ...form, driverId: e.target.value })} 
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-muted-foreground/50" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider block">Trip ID <span className="text-[10px] text-muted-foreground/60">(Optional)</span></label>
            <input 
              placeholder="e.g. 64b74..." 
              value={form.tripId} 
              onChange={(e) => setForm({ ...form, tripId: e.target.value })} 
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-muted-foreground/50" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider block">Severity</label>
            <select 
              value={form.severity} 
              onChange={(e) => setForm({ ...form, severity: e.target.value })} 
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            >
              <option value="Low">🟢 Low</option>
              <option value="Medium">🟡 Medium</option>
              <option value="High">🔴 High</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider block">Date</label>
            <input 
              required
              type="date" 
              value={form.date} 
              onChange={(e) => setForm({ ...form, date: e.target.value })} 
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5 lg:col-span-1">
            <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider block">Incident Type</label>
            <select 
              value={form.type} 
              onChange={(e) => setForm({ ...form, type: e.target.value })} 
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 h-[120px]"
              multiple={false}
              size={4}
            >
              <option value="Accident" className="p-2 my-1 rounded-md hover:bg-muted cursor-pointer">Collision / Accident</option>
              <option value="Speeding" className="p-2 my-1 rounded-md hover:bg-muted cursor-pointer">Speeding Violation</option>
              <option value="Compliance Failure" className="p-2 my-1 rounded-md hover:bg-muted cursor-pointer">Compliance Failure</option>
              <option value="Other" className="p-2 my-1 rounded-md hover:bg-muted cursor-pointer">Other Incident</option>
            </select>
          </div>

          <div className="space-y-1.5 lg:col-span-3">
            <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider block">Detailed Report</label>
            <textarea 
              required
              placeholder="Describe the incident, involved parties, damages, and conditions..." 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
              className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-muted-foreground/40 resize-none h-[120px]" 
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <motion.button 
            type="submit" 
            disabled={loading}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition-all hover:bg-rose-500 hover:shadow-rose-500/40 disabled:opacity-70 disabled:pointer-events-none"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {loading ? 'Submitting Report...' : 'File Official Report'}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
