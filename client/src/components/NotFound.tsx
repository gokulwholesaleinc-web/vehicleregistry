import { PageContainer, PageHeader } from './Page';

export function NotFound() {
  return (
    <PageContainer>
      <PageHeader title="Page not found" subtitle="Try searching or go back to the dashboard." />
      <a href="/dashboard" className="inline-flex px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors">
        Back to Dashboard
      </a>
    </PageContainer>
  );
}