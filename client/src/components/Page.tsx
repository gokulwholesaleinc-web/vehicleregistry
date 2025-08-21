export function PageContainer({ children }: { children: React.ReactNode }) {
  return <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6">{children}</main>;
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
      {subtitle && <p className="text-slate-600 dark:text-slate-300 mt-1">{subtitle}</p>}
    </header>
  );
}