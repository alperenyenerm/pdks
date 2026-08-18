import React, { useState, useEffect } from 'react';
import { Database, RefreshCw } from 'lucide-react';

export const MySQLStatusBadge: React.FC = () => {
  const [dbStatus, setDbStatus] = useState<{
    status: string;
    mysqlConnected: boolean;
    database: string;
    host: string;
    port: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    try {
      let res;
      try {
        res = await fetch('/api/status');
      } catch (err) {
        res = await fetch('http://localhost:5000/api/status');
      }
      const data = await res.json();
      setDbStatus(data);
    } catch (err) {
      setDbStatus({
        status: 'OFFLINE',
        mysqlConnected: false,
        database: 'ynr_puantaj',
        host: 'localhost',
        port: 3306,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs shadow-inner">
      <Database className={`w-3.5 h-3.5 ${dbStatus?.mysqlConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
      
      <div className="flex items-center space-x-1.5 font-mono">
        <span className="text-slate-300 font-semibold">MySQL:</span>
        {dbStatus?.mysqlConnected ? (
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Bağlı ({dbStatus.database})
          </span>
        ) : (
          <span className="text-amber-400 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Yerel Önbellek (Offline)
          </span>
        )}
      </div>

      <button
        onClick={checkStatus}
        disabled={loading}
        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
        title="MySQL Bağlantısını Yeniden Kontrol Et"
      >
        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};
