import { useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiXCircle, FiX } from 'react-icons/fi';

const icons = {
  success: <FiCheckCircle className="text-green-400 text-xl" />,
  error: <FiXCircle className="text-red-400 text-xl" />,
  warning: <FiAlertCircle className="text-yellow-400 text-xl" />,
};

const colors = {
  success: 'border-green-500/30 bg-green-500/10',
  error: 'border-red-500/30 bg-red-500/10',
  warning: 'border-yellow-500/30 bg-yellow-500/10',
};

const textColors = {
  success: 'text-green-400',
  error: 'text-red-400',
  warning: 'text-yellow-400',
};

export default function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          removeToast={removeToast}
        />
      ))}
    </div>
  );
}

function ToastItem({ toast, removeToast }) {
  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-xl min-w-72 max-w-sm animate-fade-in ${colors[toast.type]}`}>
      {icons[toast.type]}
      <div className="flex-1">
        {toast.title && (
          <p className={`font-semibold text-sm ${textColors[toast.type]}`}>
            {toast.title}
          </p>
        )}
        <p className="text-white text-sm">{toast.message}</p>
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-gray-400 hover:text-white transition"
      >
        <FiX />
      </button>
    </div>
  );
}