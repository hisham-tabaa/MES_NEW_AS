import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { requestsAPI, usersAPI } from '../../services/api';
import { AddCostForm, CloseRequestForm, CostType, Request, RequestStatus, REQUEST_STATUS_LABELS } from '../../types';
import { useI18n } from '../../contexts/I18nContext';
import { formatCurrency, getCurrentCurrency } from '../../utils/currency';
import { useCurrency } from '../../hooks/useCurrency';

const RequestDetailsPage: React.FC = () => {
  const { t } = useI18n();
  const { id } = useParams();
  const requestId = Number(id);
  const { getCurrencySymbol: getCurrencySymbolHook } = useCurrency();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [request, setRequest] = useState<Request | null>(null);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [assignId, setAssignId] = useState<string>('');
  const [statusTo, setStatusTo] = useState<RequestStatus>('UNDER_INSPECTION');
  const [statusComment, setStatusComment] = useState('');
  const [costForm, setCostForm] = useState<AddCostForm>({ description: '', amount: 0, costType: 'PARTS', currency: getCurrentCurrency() });
  const [closeForm, setCloseForm] = useState<CloseRequestForm>({ finalNotes: '', customerSatisfaction: undefined });

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await requestsAPI.getRequestById(requestId);
      setRequest(data.request);
    } catch (e: any) {
      setError(e.message || t('error.failedToLoad'));
    } finally {
      setLoading(false);
    }
  }, [requestId, t]);

  useEffect(() => {
    if (!requestId) return;
    reload();
  }, [requestId, reload]);

  useEffect(() => {
    const loadTechs = async () => {
      try {
        const resp = await usersAPI.getUsers({ role: 'TECHNICIAN', departmentId: request?.department?.id });
        setTechnicians(resp.data?.users || []);
      } catch {}
    };
    if (request?.department?.id) loadTechs();
  }, [request?.department?.id]);

  const statusOptions: RequestStatus[] = useMemo(() => (
    ['UNDER_INSPECTION','WAITING_PARTS','IN_REPAIR','COMPLETED','CLOSED'] as RequestStatus[]
  ), []);

  const handleAssign = async () => {
    if (!assignId) return;
    try {
      setLoading(true);
      await requestsAPI.assignTechnician(requestId, Number(assignId));
      setAssignId('');
      await reload();
    } catch (e: any) {
      setError(e.message || t('error.failedToUpdate'));
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async () => {
    try {
      setLoading(true);
      await requestsAPI.updateRequestStatus(requestId, { status: statusTo, comment: statusComment || undefined });
      setStatusComment('');
      await reload();
    } catch (e: any) {
      setError(e.message || t('error.failedToUpdate'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddCost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await requestsAPI.addCost(requestId, costForm);
      setCostForm({ description: '', amount: 0, costType: 'PARTS', currency: getCurrentCurrency() });
      await reload();
    } catch (e: any) {
      setError(e.message || t('error.failedToSave'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await requestsAPI.closeRequest(requestId, closeForm);
      navigate('/requests');
    } catch (e: any) {
      setError(e.message || t('error.failedToUpdate'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
      <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t('details.title')}</h1>
          <p className="mt-2 text-sm text-gray-700">{t('details.subtitle')}</p>
        </div>
        <Link to="/requests" className="btn">{t('details.back')}</Link>
      </div>

      {error && <div className="text-red-600">{error}</div>}

      {!request ? (
        <div className="card"><div className="card-content py-12 text-center text-gray-500">{loading ? t('requests.loading') : t('requests.empty')}</div></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="card-header">{t('details.overview')}</div>
              <div className="card-content space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">{t('details.number')}:</span> {request.requestNumber}</div>
                  <div><span className="text-gray-500">{t('details.status')}:</span> {REQUEST_STATUS_LABELS[request.status]}</div>
                  <div><span className="text-gray-500">{t('details.customer')}:</span> {request.customer?.name}</div>
                  <div><span className="text-gray-500">{t('details.department')}:</span> {request.department?.name}</div>
                  <div><span className="text-gray-500">{t('details.technician')}:</span> {request.assignedTechnician ? `${request.assignedTechnician.firstName} ${request.assignedTechnician.lastName}` : '-'}</div>
                  <div><span className="text-gray-500">{t('details.priority')}:</span> {request.priority}</div>
                  <div className="col-span-2"><span className="text-gray-500">{t('details.issue')}:</span> {request.issueDescription}</div>
                </div>
              </div>
      </div>

      <div className="card">
              <div className="card-header">{t('details.activities')}</div>
        <div className="card-content">
                <div className="space-y-3">
                  {/* Show request received info first */}
                  <div className="border-l-4 border-green-200 pl-4 py-2 bg-green-50 rounded">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 font-medium">تم استلام الطلب</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                          <span className="font-medium">{request.receivedBy.firstName} {request.receivedBy.lastName}</span>
                          <span>(موظف الاستقبال)</span>
                          <span>•</span>
                          <span>{new Date(request.createdAt).toLocaleString('ar-EG')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Show activities */}
                  {request.activities && request.activities.length > 0 ? (
                    request.activities.map(activity => (
                      <div key={activity.id} className="border-l-4 border-blue-200 pl-4 py-2 rounded">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 font-medium">{activity.description}</p>
                            {activity.oldValue && activity.newValue && (
                              <p className="text-xs text-gray-600 mt-1">
                                <span className="text-red-600">من: {activity.oldValue}</span>
                                {' → '}
                                <span className="text-green-600">إلى: {activity.newValue}</span>
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                              <span className="font-medium">{activity.user.firstName} {activity.user.lastName}</span>
                              <span>({activity.user.role?.replace('_', ' ') || 'Unknown Role'})</span>
                              <span>•</span>
                              <span>{new Date(activity.createdAt).toLocaleString('ar-EG')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-sm">{t('details.activities.empty')}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>{t('details.costs') || 'التكاليف'}</h3>
                <p>إضافة وإدارة تكاليف الطلب</p>
              </div>
              <div className="card-content space-y-6">
                <form className="space-y-4" onSubmit={handleAddCost}>
                  <div className="form-group">
                    <label className="form-label required">وصف التكلفة</label>
                    <input className="input-field" placeholder="مثال: قطع غيار، عمالة..." value={costForm.description} onChange={(e)=>setCostForm(f=>({...f, description: e.target.value}))} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label required">المبلغ ({getCurrencySymbolHook()})</label>
                      <input className="input-field" type="number" step="0.01" placeholder="0.00" value={costForm.amount} onChange={(e)=>setCostForm(f=>({...f, amount: Number(e.target.value)}))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">نوع التكلفة</label>
                      <select className="select-field" value={costForm.costType} onChange={(e)=>setCostForm(f=>({...f, costType: e.target.value as CostType}))}>
                        <option value="PARTS">قطع غيار</option>
                        <option value="LABOR">عمالة</option>
                        <option value="TRANSPORTATION">مواصلات</option>
                        <option value="OTHER">أخرى</option>
                      </select>
                    </div>
                  </div>
                  <button className="btn-primary w-full" type="submit" disabled={loading}>
                    {loading ? <div className="loading-spinner ml-2"></div> : null}
                    {t('details.costs.add') || 'إضافة تكلفة'}
                  </button>
                </form>
                
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">قائمة التكاليف</h4>
                  <div className="space-y-3">
                    {request.costs && request.costs.length > 0 ? request.costs.map(c => (
                      <div key={c.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{c.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {c.costType === 'PARTS' ? 'قطع غيار' : c.costType === 'LABOR' ? 'عمالة' : c.costType === 'TRANSPORTATION' ? 'مواصلات' : 'أخرى'}
                              </span>
                            </p>
                          </div>
                          <div className="text-left">
                            <p className="text-lg font-semibold text-gray-900">{formatCurrency(c.amount, c.currency as any)}</p>
                            <p className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString('ar-SY')}</p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>لا توجد تكاليف مضافة بعد</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: actions */}
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h3>{t('details.assign') || 'تعيين فني'}</h3>
                <p>اختر الفني المناسب لهذا الطلب</p>
              </div>
              <div className="card-content space-y-4">
                <div className="form-group">
                  <label className="form-label">الفني المختص</label>
                  <select className="select-field" value={assignId} onChange={(e)=>setAssignId(e.target.value)}>
                    <option value="">اختر الفني...</option>
                    {technicians.map(ti => (
                      <option key={ti.id} value={ti.id}>{ti.firstName} {ti.lastName}</option>
                    ))}
                  </select>
                </div>
                <button className="btn-primary w-full" disabled={!assignId || loading} onClick={handleAssign}>
                  {loading ? <div className="loading-spinner ml-2"></div> : null}
                  {t('details.assign') || 'تعيين الفني'}
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>{t('details.updateStatus') || 'تحديث الحالة'}</h3>
                <p>قم بتغيير حالة الطلب وإضافة ملاحظات</p>
              </div>
              <div className="card-content space-y-4">
                <div className="form-group">
                  <label className="form-label">الحالة الجديدة</label>
                  <select className="select-field" value={statusTo} onChange={(e)=>setStatusTo(e.target.value as RequestStatus)}>
                    {statusOptions.map(s => <option key={s} value={s}>{REQUEST_STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">ملاحظات (اختياري)</label>
                  <textarea className="textarea-field" rows={3} placeholder="أضف أي ملاحظات حول تحديث الحالة..." value={statusComment} onChange={(e)=>setStatusComment(e.target.value)} />
                </div>
                <button className="btn-primary w-full" onClick={handleStatus} disabled={loading}>
                  {loading ? <div className="loading-spinner ml-2"></div> : null}
                  {t('common.update') || 'تحديث الحالة'}
                </button>
              </div>
            </div>

            {request.status === 'COMPLETED' && (
              <div className="card border-green-200">
                <div className="card-header bg-gradient-to-r from-green-50 to-emerald-50">
                  <h3 className="text-green-800">{t('details.close') || 'إغلاق الطلب'}</h3>
                  <p className="text-green-600">إنهاء الطلب وتقييم رضا العميل</p>
                </div>
                <form className="card-content space-y-4" onSubmit={handleClose}>
                  <div className="form-group">
                    <label className="form-label">الملاحظات النهائية</label>
                    <textarea className="textarea-field" rows={4} placeholder="أضف أي ملاحظات نهائية حول الطلب..." value={closeForm.finalNotes || ''} onChange={(e)=>setCloseForm(f=>({...f, finalNotes: e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">تقييم رضا العميل</label>
                    <select className="select-field" value={closeForm.customerSatisfaction || ''} onChange={(e)=>setCloseForm(f=>({...f, customerSatisfaction: e.target.value ? Number(e.target.value) : undefined}))}>
                      <option value="">اختر التقييم...</option>
                      <option value="5">ممتاز (5 نجوم)</option>
                      <option value="4">جيد جداً (4 نجوم)</option>
                      <option value="3">جيد (3 نجوم)</option>
                      <option value="2">مقبول (2 نجمة)</option>
                      <option value="1">ضعيف (1 نجمة)</option>
                    </select>
                  </div>
                  <button className="btn-primary w-full bg-green-600 hover:bg-green-700" type="submit" disabled={loading}>
                    {loading ? <div className="loading-spinner ml-2"></div> : null}
                    {t('common.close') || 'إغلاق الطلب نهائياً'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestDetailsPage;
