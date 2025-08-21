import React from 'react';

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { err?: Error }
> {
  state = { err: undefined as Error | undefined };

  static getDerivedStateFromError(err: Error) {
    return { err };
  }

  componentDidCatch(err: Error, info: React.ErrorInfo) {
    console.error('UI error', err, info);
  }

  render() {
    return this.state.err ? (
      <div className="max-w-xl mx-auto p-6 text-red-700 bg-red-50 rounded-xl mt-6">
        <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
        <p className="text-sm">Please refresh the page. If the problem persists, contact support.</p>
      </div>
    ) : this.props.children;
  }
}