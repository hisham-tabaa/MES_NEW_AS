import React, { useEffect, useState } from 'react';
import { dashboardAPI, exportAPI, downloadBlob } from '../../services/api';
import { useI18n } from '../../contexts/I18nContext';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';

const ReportsPage: React.FC = () => {
  const { t } = useI18n();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await dashboardAPI.getStats();
        setStats(res);
      } catch (e: any) {
        setError(e.message || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleExport = async (exportType: string, filename: string) => {
    try {
      setExportLoading(exportType);
      let blob: Blob;

      switch (exportType) {
        case 'all':
          blob = await exportAPI.exportAllRequests();
          break;
        case 'overdue':
          blob = await exportAPI.exportOverdueRequests();
          break;
        case 'stats':
          blob = await exportAPI.exportDashboardStats();
          break;
        default:
          throw new Error('Unknown export type');
      }

      downloadBlob(blob, filename);
      // يمكن إضافة toast notification هنا
    } catch (e: any) {
      setError(e.message || t('export.error'));
    } finally {
      setExportLoading(null);
    }
  };

  const handleStatusExport = async (status: string) => {
    const statusNames = {
      'NEW': 'الطلبات_الجديدة',
      'ASSIGNED': 'الطلبات_المُعيّنة',
      'UNDER_INSPECTION': 'تحت_الفحص',
      'WAITING_PARTS': 'في_انتظار_القطع',
      'IN_REPAIR': 'قيد_الإصلاح',
      'COMPLETED': 'مكتملة',
      'CLOSED': 'مغلقة',
    };

    try {
      setExportLoading(`status-${status}`);
      const blob = await exportAPI.exportRequestsByStatus(status);
      const filename = `${statusNames[status as keyof typeof statusNames] || status}.xlsx`;
      downloadBlob(blob, filename);
    } catch (e: any) {
      setError(e.message || t('export.error'));
    } finally {
      setExportLoading(null);
    }
  };

  const handleWarrantyExport = async (warrantyStatus: string) => {
    const warrantyNames = {
      'UNDER_WARRANTY': 'ضمن_الكفالة',
      'OUT_OF_WARRANTY': 'خارج_الكفالة',
    };

    try {
      setExportLoading(`warranty-${warrantyStatus}`);
      const blob = await exportAPI.exportRequestsByWarranty(warrantyStatus);
      const filename = `${warrantyNames[warrantyStatus as keyof typeof warrantyNames] || warrantyStatus}.xlsx`;
      downloadBlob(blob, filename);
    } catch (e: any) {
      setError(e.message || t('export.error'));
    } finally {
      setExportLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t('reports.title') || 'Reports & Analytics'}</h1>
        <p className="mt-2 text-sm text-gray-700">{t('reports.subtitle') || 'View performance metrics and generate reports'}</p>
      </div>

      {/* Export Section */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium">{t('export.title')}</h2>
          <p className="text-sm text-gray-600 mt-1">{t('export.subtitle')}</p>
        </div>
        <div className="card-content space-y-6">
          {error && <div className="text-red-600 mb-3">{error}</div>}
          
          {/* Quick Export Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => handleExport('all', 'جميع_الطلبات.xlsx')}
              disabled={exportLoading === 'all'}
              className="flex items-center justify-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DocumentArrowDownIcon className="h-5 w-5 text-blue-600" />
              <div className="text-left">
                <div className="font-medium">{t('export.allRequests')}</div>
                <div className="text-sm text-gray-500">Excel</div>
              </div>
              {exportLoading === 'all' && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
            </button>

            <button
              onClick={() => handleExport('overdue', 'الطلبات_المتأخرة.xlsx')}
              disabled={exportLoading === 'overdue'}
              className="flex items-center justify-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DocumentArrowDownIcon className="h-5 w-5 text-red-600" />
              <div className="text-left">
                <div className="font-medium">{t('export.overdueRequests')}</div>
                <div className="text-sm text-gray-500">Excel</div>
              </div>
              {exportLoading === 'overdue' && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
              )}
            </button>

            <button
              onClick={() => handleExport('stats', 'إحصائيات_لوحة_التحكم.xlsx')}
              disabled={exportLoading === 'stats'}
              className="flex items-center justify-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DocumentArrowDownIcon className="h-5 w-5 text-green-600" />
              <div className="text-left">
                <div className="font-medium">{t('export.dashboardStats')}</div>
                <div className="text-sm text-gray-500">Excel</div>
              </div>
              {exportLoading === 'stats' && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              )}
            </button>
          </div>

          {/* Export by Status */}
          <div>
            <h3 className="text-md font-medium mb-3">{t('export.byStatus')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['NEW', 'ASSIGNED', 'UNDER_INSPECTION', 'WAITING_PARTS', 'IN_REPAIR', 'COMPLETED', 'CLOSED'].map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusExport(status)}
                  disabled={exportLoading === `status-${status}`}
                  className="flex items-center justify-center gap-1 px-3 py-2 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  <DocumentArrowDownIcon className="h-4 w-4" />
                  {status.replace('_', ' ')}
                  {exportLoading === `status-${status}` && (
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-600"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Export by Warranty */}
          <div>
            <h3 className="text-md font-medium mb-3">{t('export.byWarranty')}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleWarrantyExport('UNDER_WARRANTY')}
                disabled={exportLoading === 'warranty-UNDER_WARRANTY'}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                <DocumentArrowDownIcon className="h-4 w-4 text-green-600" />
                ضمن الكفالة
                {exportLoading === 'warranty-UNDER_WARRANTY' && (
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-green-600"></div>
                )}
              </button>
              <button
                onClick={() => handleWarrantyExport('OUT_OF_WARRANTY')}
                disabled={exportLoading === 'warranty-OUT_OF_WARRANTY'}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                <DocumentArrowDownIcon className="h-4 w-4 text-orange-600" />
                خارج الكفالة
                {exportLoading === 'warranty-OUT_OF_WARRANTY' && (
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-orange-600"></div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium">إحصائيات سريعة</h2>
        </div>
        <div className="card-content">
          {loading ? (
            <div className="text-gray-500 py-8 text-center">{t('requests.loading')}</div>
          ) : !stats ? (
            <div className="text-gray-500 py-8 text-center">{t('requests.empty')}</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 bg-gray-50 rounded">
                <div className="text-gray-500">{t('reports.totalRequests') || 'Total Requests'}</div>
                <div className="text-2xl font-semibold">{stats.totalRequests}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <div className="text-gray-500">{t('reports.overdueRequests') || 'Overdue Requests'}</div>
                <div className="text-2xl font-semibold">{stats.overdueRequests}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <div className="text-gray-500">{t('reports.completed') || 'Completed'}</div>
                <div className="text-2xl font-semibold">{stats.completedRequests}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <div className="text-gray-500">{t('reports.onTimePercentage') || 'On-time %'}</div>
                <div className="text-2xl font-semibold">{Math.round((stats.onTimePercentage || 0) * 100) / 100}%</div>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <div className="text-gray-500">{t('reports.avgResolutionHours') || 'Avg. resolution (hrs)'}</div>
                <div className="text-2xl font-semibold">{stats.averageResolutionHours}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
