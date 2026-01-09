'use client';

import { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Database,
  Zap,
  Clock,
  Gauge,
} from 'lucide-react';

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  responseTime: number;
  errorRate: number;
  requestsPerSecond: number;
  lastChecked: string;
}

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  databaseConnections: number;
  redisMemory: number;
  diskSpace: number;
  activeRequests: number;
}

interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  resolved: boolean;
}

export default function MonitoringDashboard() {
  const [services, setServices] = useState<ServiceHealth[]>([
    {
      name: 'API Server',
      status: 'healthy',
      uptime: 99.98,
      responseTime: 145,
      errorRate: 0.02,
      requestsPerSecond: 234,
      lastChecked: new Date().toISOString(),
    },
    {
      name: 'Web Server',
      status: 'healthy',
      uptime: 99.99,
      responseTime: 98,
      errorRate: 0.01,
      requestsPerSecond: 456,
      lastChecked: new Date().toISOString(),
    },
    {
      name: 'Orchestrator',
      status: 'healthy',
      uptime: 99.97,
      responseTime: 87,
      errorRate: 0.03,
      requestsPerSecond: 12,
      lastChecked: new Date().toISOString(),
    },
    {
      name: 'PostgreSQL',
      status: 'healthy',
      uptime: 99.99,
      responseTime: 234,
      errorRate: 0.0,
      requestsPerSecond: 890,
      lastChecked: new Date().toISOString(),
    },
    {
      name: 'Redis Cache',
      status: 'degraded',
      uptime: 99.85,
      responseTime: 12,
      errorRate: 0.15,
      requestsPerSecond: 5600,
      lastChecked: new Date().toISOString(),
    },
  ]);

  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuUsage: 34,
    memoryUsage: 62,
    databaseConnections: 87,
    redisMemory: 1240,
    diskSpace: 45,
    activeRequests: 123,
  });

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      severity: 'warning',
      title: 'Redis Memory Usage High',
      description: 'Redis memory usage is at 78% capacity. Consider cache eviction or scaling.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      resolved: false,
    },
    {
      id: '2',
      severity: 'info',
      title: 'Deployment Successful',
      description: 'API v1.2.3 deployed successfully. 0 errors in health checks.',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      resolved: false,
    },
  ]);

  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // In production, fetch from actual monitoring API
        setMetrics((prev) => ({
          ...prev,
          cpuUsage: Math.max(0, Math.min(100, prev.cpuUsage + (Math.random() - 0.5) * 5)),
          memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + (Math.random() - 0.5) * 3)),
        }));
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusBadge = (status: ServiceHealth['status']) => {
    switch (status) {
      case 'healthy':
        return {
          bg: 'bg-green-100',
          border: 'border-green-300',
          text: 'text-green-800',
          icon: <CheckCircle2 className="w-4 h-4 text-green-600" />,
          label: 'Healthy',
        };
      case 'degraded':
        return {
          bg: 'bg-yellow-100',
          border: 'border-yellow-300',
          text: 'text-yellow-800',
          icon: <AlertTriangle className="w-4 h-4 text-yellow-600" />,
          label: 'Degraded',
        };
      case 'down':
        return {
          bg: 'bg-red-100',
          border: 'border-red-300',
          text: 'text-red-800',
          icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
          label: 'Down',
        };
    }
  };

  const resolveAlert = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true } : a)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">System Monitoring</h1>
            <p className="text-gray-600">Real-time infrastructure health and performance metrics</p>
          </div>
          <label className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-semibold text-gray-700">Auto-refresh</span>
          </label>
        </div>

        {/* System Health Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-8 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Overall System Status</h2>
              <p className="text-gray-600">All critical systems operational</p>
            </div>
            <div className="text-5xl font-bold text-green-600">✓</div>
          </div>
        </div>

        {/* Service Health */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Service Status</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {services.map((service) => {
              const badge = getStatusBadge(service.status);
              return (
                <div
                  key={service.name}
                  className={`bg-white rounded-lg shadow p-4 border-l-4 ${badge.border}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${badge.bg} ${badge.text}`}>
                      {badge.icon}
                      {badge.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-600">Uptime</p>
                      <p className="text-lg font-bold text-gray-900">{service.uptime.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Response Time</p>
                      <p className="text-lg font-bold text-gray-900">{service.responseTime}ms</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Error Rate</p>
                      <p className="text-lg font-bold text-gray-900">{service.errorRate.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Req/Sec</p>
                      <p className="text-lg font-bold text-gray-900">{service.requestsPerSecond}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Metrics */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">System Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">CPU Usage</h3>
                <Gauge className="w-5 h-5 text-blue-600" />
              </div>
              <div className="mb-3">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      metrics.cpuUsage > 80
                        ? 'bg-red-500'
                        : metrics.cpuUsage > 60
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                    }`}
                    style={{ width: `${metrics.cpuUsage}%` }}
                  />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{metrics.cpuUsage.toFixed(1)}%</p>
              <p className="text-xs text-gray-600 mt-1">Current load</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Memory Usage</h3>
                <Database className="w-5 h-5 text-purple-600" />
              </div>
              <div className="mb-3">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      metrics.memoryUsage > 85
                        ? 'bg-red-500'
                        : metrics.memoryUsage > 70
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                    }`}
                    style={{ width: `${metrics.memoryUsage}%` }}
                  />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{metrics.memoryUsage.toFixed(1)}%</p>
              <p className="text-xs text-gray-600 mt-1">Allocated heap</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Disk Space</h3>
                <Zap className="w-5 h-5 text-orange-600" />
              </div>
              <div className="mb-3">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      metrics.diskSpace > 90
                        ? 'bg-red-500'
                        : metrics.diskSpace > 75
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                    }`}
                    style={{ width: `${metrics.diskSpace}%` }}
                  />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{metrics.diskSpace}%</p>
              <p className="text-xs text-gray-600 mt-1">Usage</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">DB Connections</h3>
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{metrics.databaseConnections}</p>
              <p className="text-xs text-gray-600 mt-1">Of 200 available</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Redis Memory</h3>
                <Zap className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{metrics.redisMemory}MB</p>
              <p className="text-xs text-gray-600 mt-1">Of 2000MB available</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Active Requests</h3>
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{metrics.activeRequests}</p>
              <p className="text-xs text-gray-600 mt-1">Current</p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Alerts</h2>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p>No active alerts</p>
              </div>
            ) : (
              alerts.map((alert) => {
                const severityConfig = {
                  critical: {
                    bg: 'bg-red-50',
                    border: 'border-red-300',
                    icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
                  },
                  warning: {
                    bg: 'bg-yellow-50',
                    border: 'border-yellow-300',
                    icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
                  },
                  info: {
                    bg: 'bg-blue-50',
                    border: 'border-blue-300',
                    icon: <Activity className="w-5 h-5 text-blue-600" />,
                  },
                };

                const config = severityConfig[alert.severity];

                return (
                  <div
                    key={alert.id}
                    className={`${config.bg} border border-l-4 ${config.border} rounded-lg p-4 flex items-start justify-between`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      {config.icon}
                      <div>
                        <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                        <p className="text-sm text-gray-700 mt-1">{alert.description}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!alert.resolved && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="ml-4 px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm font-semibold hover:bg-gray-300 transition-colors flex-shrink-0"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* SLA Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">SLA Metrics (30-day)</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'API Uptime', value: '99.97%', target: '99.95%', status: 'good' },
              { label: 'Web Uptime', value: '99.99%', target: '99.99%', status: 'good' },
              { label: 'Avg Response Time', value: '165ms', target: '<300ms', status: 'good' },
              { label: 'Error Rate', value: '0.02%', target: '<0.5%', status: 'good' },
            ].map((metric) => (
              <div key={metric.label} className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">{metric.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                <p className="text-xs text-gray-600 mt-2">Target: {metric.target}</p>
                <div className="mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-semibold text-green-600">Meets SLA</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
