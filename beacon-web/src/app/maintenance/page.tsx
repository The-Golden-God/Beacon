import { Wrench } from "lucide-react";
import { BeaconLogo } from "@/components/beacon-logo";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-10">
        <BeaconLogo href="" size="lg" />
      </div>

      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-6">
        <Wrench className="text-slate-500" size={24} />
      </div>

      <h1 className="text-2xl font-semibold text-slate-900 mb-2">
        Beacon is down for maintenance
      </h1>
      <p className="text-slate-500 mb-1">We're making improvements. We'll be back shortly.</p>
      <p className="text-sm text-slate-400">Estimated completion: soon</p>
    </div>
  );
}
