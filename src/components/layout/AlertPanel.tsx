import { X, AlertTriangle, AlertCircle, Info, CheckCircle, Bell } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppStore } from '../../store/appStore';
import { formatDistanceToNow } from 'date-fns';
import type { Alert } from '../../types';

const icons = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
};

const colors = {
  error: 'text-rose-400 bg-rose-500/10',
  warning: 'text-amber-400 bg-amber-500/10',
  info: 'text-blue-400 bg-blue-500/10',
  success: 'text-emerald-400 bg-emerald-500/10',
};

function AlertItem({ alert }: { alert: Alert }) {
  const { markAlertRead } = useAppStore();
  const Icon = icons[alert.severity];
  return (
    <div
      onClick={() => markAlertRead(alert.id)}
      className={clsx(
        'px-4 py-3 hover:bg-surface-800/50 cursor-pointer transition-colors border-l-2',
        !alert.read ? 'bg-surface-800/30 border-l-primary-500' : 'border-l-transparent'
      )}
    >
      <div className="flex gap-3">
        <div className={clsx('p-1.5 rounded-lg flex-shrink-0 mt-0.5', colors[alert.severity])}>
          <Icon size={14} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white truncate">{alert.title}</span>
            {!alert.read && <span className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />}
          </div>
          <p className="text-xs text-surface-400 mt-0.5 leading-relaxed">{alert.message}</p>
          <span className="text-xs text-surface-500 mt-1 block">
            {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
}

export function AlertPanel({ onClose }: { onClose: () => void }) {
  const { alerts, markAllAlertsRead } = useAppStore();
  const unread = alerts.filter((a) => !a.read).length;

  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute right-0 top-12 w-96 bg-surface-900 border border-surface-700 rounded-xl shadow-2xl z-40 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-800">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-primary-400" />
            <span className="font-semibold text-white text-sm">Alerts & Notifications</span>
            {unread > 0 && (
              <span className="px-1.5 py-0.5 text-xs font-bold bg-rose-500 text-white rounded-full">{unread}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <button onClick={markAllAlertsRead} className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                Mark all read
              </button>
            )}
            <button onClick={onClose} className="text-surface-400 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Alert List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-surface-800/50">
          {alerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} />
          ))}
        </div>

        <div className="px-4 py-2 border-t border-surface-800 text-center">
          <button className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
            View all notifications
          </button>
        </div>
      </div>
    </>
  );
}
