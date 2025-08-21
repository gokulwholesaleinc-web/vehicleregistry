import { useEffect, useState } from 'react';
import { listNotifications, markRead, unreadCount } from './api';
import { Bell } from 'lucide-react';

export default function BellDropdown() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [next, setNext] = useState<string | undefined>();
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    unreadCount()
      .then(r => setCount(r.count || 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!open || items.length) return;
    setLoading(true);
    listNotifications()
      .then(r => {
        setItems(r.data || []);
        setNext(r.nextCursor);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open, items.length]);

  async function loadMore() {
    if (!next || loading) return;
    setLoading(true);
    try {
      const r = await listNotifications(next);
      setItems(prev => [...prev, ...(r.data || [])]);
      setNext(r.nextCursor);
    } catch (error) {
      console.error('Failed to load more notifications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function markAll() {
    const ids = items.filter(i => !i.readAt).map(i => i.id);
    if (ids.length) {
      try {
        await markRead(ids);
        setItems(prev => prev.map(i => ({ ...i, readAt: i.readAt || new Date().toISOString() })));
        setCount(0);
      } catch (error) {
        console.error('Failed to mark notifications as read:', error);
      }
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="relative inline-grid place-items-center h-9 w-9 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
        data-testid="button-notifications"
      >
        <Bell className="h-4 w-4 text-slate-700 dark:text-slate-300" />
        {count > 0 && (
          <span 
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] leading-[18px] text-center"
            data-testid="text-notification-count"
          >
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>
      
      {open && (
        <div className="absolute right-0 mt-2 w-[360px] max-h-[420px] overflow-auto rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800 z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-slate-700">
            <div className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</div>
            <button
              onClick={markAll}
              className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              data-testid="button-mark-all-read"
            >
              Mark all read
            </button>
          </div>
          
          {loading && items.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
              Loading notifications...
            </div>
          ) : items.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
              No notifications yet
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-700">
              {items.map(n => (
                <li
                  key={n.id}
                  className={`px-3 py-3 ${n.readAt ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-700'}`}
                  data-testid={`notification-${n.id}`}
                >
                  {n.link ? (
                    <a href={n.link} className="block">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{n.title}</div>
                      {n.body && <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{n.body}</div>}
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </a>
                  ) : (
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{n.title}</div>
                      {n.body && <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{n.body}</div>}
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
          
          <div className="p-2 grid">
            {next ? (
              <button
                onClick={loadMore}
                disabled={loading}
                className="text-sm rounded-xl border border-slate-300 py-1.5 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700 disabled:opacity-50"
                data-testid="button-load-more"
              >
                {loading ? 'Loading...' : 'Load more'}
              </button>
            ) : (
              <span className="text-xs text-slate-400 dark:text-slate-500 text-center">No more</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}