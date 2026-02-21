import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import TopNavbar from '@/components/layout/TopNavbar';
import { Search, Users, ShieldCheck, Filter, AlertTriangle } from 'lucide-react';

interface DriverParams {
  status?: string;
  licenseCategory?: string;
  region?: string;
  notSuspended?: boolean;
  validLicense?: boolean;
}

export default function DispatcherDrivers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<DriverParams>({
    status: '',
    licenseCategory: '',
    region: '',
    notSuspended: false,
    validLicense: false,
  });
  
  const [showFilters, setShowFilters] = useState(false);

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.licenseCategory) params.append('licenseCategory', filters.licenseCategory);
    if (filters.region) params.append('region', filters.region);
    if (filters.notSuspended) params.append('notSuspended', 'true');
    if (filters.validLicense) params.append('validLicense', 'true');
    return params.toString();
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['dispatcher-drivers', filters],
    queryFn: async () => {
      const qs = buildQueryString();
      const res = await fetch(`http://localhost:5000/api/users/drivers${qs ? `?${qs}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('fleetflow_token')}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch drivers');
      return res.json();
    },
  });

  const drivers = data?.data || [];

  const searchedDrivers = useMemo(() => {
    return drivers.filter((d: any) => 
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (d.licenseNumber && d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [drivers, searchTerm]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'onDuty': return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30';
      case 'offDuty': return 'bg-slate-500/15 text-slate-500 border-slate-500/30';
      case 'suspended': return 'bg-destructive/15 text-destructive border-destructive/30';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const isLicenseExpired = (expiryStr: string) => {
    if (!expiryStr) return true;
    const expiry = new Date(expiryStr);
    return expiry < new Date();
  };

  return (
    <>
      <TopNavbar title="Available Drivers" />
      <main className="flex-1 overflow-y-auto p-6 animate-fade-in space-y-6">
        
        {/* Header & Controls */}
        <div className="flex flex-col gap-4 bg-card p-4 rounded-xl shadow-sm border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search drivers or licenses..." 
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${showFilters ? 'bg-primary/10 border-primary text-primary' : 'bg-background hover:bg-muted text-foreground'}`}
            >
              <Filter className="h-4 w-4" /> Filter Options {Object.values(filters).some(v => v !== '' && v !== false) && <span className="flex h-2 w-2 rounded-full bg-primary ml-1"></span>}
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="pt-4 border-t grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-top-2">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Status</label>
                <select 
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-background outline-none"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  <option value="">Any Status</option>
                  <option value="offDuty">Off Duty</option>
                  <option value="onDuty">On Duty</option>
                </select>
              </div>
              <div>
                 <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">License Type</label>
                 <select 
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-background outline-none"
                  value={filters.licenseCategory}
                  onChange={(e) => setFilters({...filters, licenseCategory: e.target.value})}
                >
                  <option value="">All Categories</option>
                  <option value="Standard">Standard</option>
                  <option value="Commercial">Commercial (CDL)</option>
                  <option value="Heavy">Heavy Goods (HGV)</option>
                  <option value="Motorcycle">Motorcycle</option>
                </select>
              </div>
              <div className="flex flex-col justify-end space-y-2">
                 <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded border-input text-primary focus:ring-primary"
                      checked={filters.notSuspended}
                      onChange={(e) => setFilters({...filters, notSuspended: e.target.checked})}
                    /> 
                    Exclude Suspended
                 </label>
                 <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded border-input text-primary focus:ring-primary"
                      checked={filters.validLicense}
                      onChange={(e) => setFilters({...filters, validLicense: e.target.checked})}
                    /> 
                    Valid License Only
                 </label>
              </div>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm font-medium">{(error as Error).message || 'Failed to load drivers'}</p>
          </div>
        )}

        {/* Table */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">Driver Details</th>
                  <th className="px-6 py-4 font-semibold">License Info</th>
                  <th className="px-6 py-4 font-semibold">Status & Safety</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-muted-foreground animate-pulse">Loading available drivers...</td></tr>
                ) : searchedDrivers.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">No drivers found matching criteria.</td></tr>
                ) : (
                  searchedDrivers.map((d: any) => {
                    const expired = isLicenseExpired(d.licenseExpiry);
                    return (
                    <tr key={d._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-primary/10 rounded-lg text-primary">
                             <Users className="h-5 w-5" />
                           </div>
                           <div>
                             <p className="font-semibold text-foreground flex items-center gap-2">
                               {d.name}
                               {d.complianceStatus === 'Suspended' && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-destructive/20 text-destructive uppercase">Suspended</span>}
                             </p>
                             <p className="text-xs text-muted-foreground">{d.region || 'Global'} Region</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="space-y-1">
                          <p className="font-mono text-sm">{d.licenseNumber || 'UNASSIGNED'}</p>
                          <div className="flex items-center gap-2">
                             <span className="text-xs text-muted-foreground">{d.licenseCategory}</span>
                             {expired && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-destructive/20 text-destructive">EXPIRED</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex flex-col gap-2 items-start">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(d.status)}`}>
                              {d.status === 'onDuty' ? 'On Duty' : d.status === 'offDuty' ? 'Off Duty' : 'Suspended'}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs">
                              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                              <span className={d.safetyScore < 70 ? 'text-destructive font-medium' : 'text-muted-foreground'}>{d.safetyScore} Safety Score</span>
                            </div>
                         </div>
                      </td>
                    </tr>
                  )})
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </>
  );
}
