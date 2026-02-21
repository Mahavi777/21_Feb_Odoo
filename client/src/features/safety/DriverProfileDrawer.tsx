import React from 'react';
import { Drawer } from '@/components/ui/drawer';
import { Progress } from '@/components/ui/AnimatedProgress';

export default function DriverProfileDrawer({ driver, onClose }: { driver: any; onClose: () => void }) {
  if (!driver) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-card p-6 overflow-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{driver.name}</h2>
          <button onClick={onClose} className="text-muted-foreground">Close</button>
        </div>
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">License</p>
            <p className="font-medium">{driver.licenseNumber}</p>
            <p className="text-sm">Expiry: {new Date(driver.licenseExpiry).toLocaleDateString()}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Safety Score</p>
            <div className="mt-2 w-full">
              <div className="mb-2 font-bold text-xl">{driver.safetyScore}</div>
              <div className="h-3 w-full rounded-full bg-muted">
                <div className={`h-3 rounded-full ${driver.safetyScore < 50 ? 'bg-destructive' : driver.safetyScore < 70 ? 'bg-amber-400' : 'bg-success'}`} style={{ width: `${driver.safetyScore}%` }} />
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Incidents</p>
            <ul className="mt-2 space-y-2">
              {/* Placeholder - in future fetch incident history */}
              <li className="text-sm text-muted-foreground">{driver.totalIncidents} incidents recorded</li>
            </ul>
          </div>

          <div className="pt-4">
            {/* Only safety officer can suspend/reinstate - UI control enabled elsewhere */}
          </div>
        </div>
      </div>
    </div>
  );
}
