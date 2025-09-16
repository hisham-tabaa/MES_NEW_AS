import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customersAPI, productsAPI, requestsAPI } from '../../services/api';
import { CreateRequestForm, Customer, ExecutionMethod, Product, RequestPriority, WarrantyStatus, EXECUTION_METHOD_LABELS, PRIORITY_LABELS, WARRANTY_STATUS_LABELS } from '../../types';
import { useI18n } from '../../contexts/I18nContext';
import { SYRIAN_CITIES } from '../../utils/currency';

const CreateRequestPage: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [form, setForm] = useState<CreateRequestForm>({
    customerId: '',
    productId: undefined,
    issueDescription: '',
    executionMethod: 'ON_SITE',
    warrantyStatus: 'UNDER_WARRANTY',
    purchaseDate: '',
    priority: 'NORMAL',
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [custResp, prodResp] = await Promise.all([
          customersAPI.getCustomers({ limit: 100 }),
          productsAPI.getProducts({ limit: 100 }),
        ]);
        setCustomers(custResp.data.customers || []);
        setProducts(prodResp.data.products || []);
      } catch (e: any) {
        setError(e.message || t('error.failedToLoad'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value } as any));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const payload = {
        ...form,
        customerId: Number(form.customerId),
        productId: form.productId ? Number(form.productId) : undefined,
        purchaseDate: form.purchaseDate || undefined,
      };
      const resp = await requestsAPI.createRequest(payload as any);
      const newId = resp.request?.id;
      navigate(newId ? `/requests/${newId}` : '/requests');
    } catch (e: any) {
      setError(e.message || t('error.failedToCreate'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">{t('create.title') || 'إنشاء طلب جديد'}</h1>
        <p className="mt-2 text-lg text-gray-600">{t('create.subtitle') || 'أدخل تفاصيل الطلب الجديد'}</p>
      </div>

      <div className="card shadow-medium">
        <div className="card-header">
          <h2>معلومات الطلب</h2>
          <p>يرجى ملء جميع الحقول المطلوبة</p>
        </div>
        <form className="card-content space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="text-red-600 text-sm">{error}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label required">{t('create.customer') || 'العميل'}</label>
              <select name="customerId" value={form.customerId} onChange={handleChange} className="select-field" required>
                <option value="" disabled>اختر العميل...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t('create.product') || 'المنتج'}</label>
              <select name="productId" value={form.productId || ''} onChange={handleChange} className="select-field">
                <option value="">اختر المنتج (اختياري)...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} — {p.model}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label required">{t('create.executionMethod') || 'طريقة التنفيذ'}</label>
              <select name="executionMethod" value={form.executionMethod} onChange={handleChange} className="select-field" required>
                <option value="ON_SITE">زيارة موقعية</option>
                <option value="WORKSHOP">ورشة</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label required">{t('create.warrantyStatus') || 'حالة الكفالة'}</label>
              <select name="warrantyStatus" value={form.warrantyStatus} onChange={handleChange} className="select-field" required>
                <option value="UNDER_WARRANTY">ضمن الكفالة</option>
                <option value="OUT_OF_WARRANTY">خارج الكفالة</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label required">{t('create.priority') || 'الأولوية'}</label>
              <select name="priority" value={form.priority} onChange={handleChange} className="select-field" required>
                <option value="LOW">منخفضة</option>
                <option value="NORMAL">عادية</option>
                <option value="HIGH">عالية</option>
                <option value="URGENT">عاجلة</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t('create.purchaseDate') || 'تاريخ الشراء'}</label>
              <input type="date" name="purchaseDate" value={form.purchaseDate} onChange={handleChange} className="input-field" />
              <p className="form-help">تاريخ شراء المنتج (اختياري)</p>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required">{t('create.issue') || 'وصف المشكلة'}</label>
            <textarea name="issueDescription" value={form.issueDescription} onChange={handleChange} className="textarea-field" rows={5} required placeholder="اشرح المشكلة بالتفصيل..." />
            <p className="form-help">وصف مفصل للمشكلة أو الخدمة المطلوبة</p>
          </div>

          <div className="card-footer bg-gradient-to-r from-gray-50 to-white">
            <div className="flex gap-4 justify-end">
              <button type="button" className="btn-secondary" onClick={() => navigate('/requests')}>
                {t('create.cancel') || 'إلغاء'}
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <div className="loading-spinner ml-2"></div>
                    جاري الإنشاء...
                  </>
                ) : (
                  t('create.submit') || 'إنشاء الطلب'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRequestPage;
