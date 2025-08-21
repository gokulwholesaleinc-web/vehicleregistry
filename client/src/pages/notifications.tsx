import AppHeader from "@/components/AppHeader";

export default function Notifications() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-slate-900 mb-4">Notifications</h1>
        <p className="text-slate-600">This is a placeholder. Hook up your real notifications feed here.</p>
      </div>
    </div>
  );
}