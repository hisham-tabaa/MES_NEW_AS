import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { departmentsAPI } from '../../services/api';
import { Department, UserRole } from '../../types';
import { useI18n } from '../../contexts/I18nContext';

interface CreateUserForm {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  departmentId: string;
}

const CreateUserPage: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [form, setForm] = useState<CreateUserForm>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'TECHNICIAN' as UserRole,
    departmentId: '',
  });

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const response = await departmentsAPI.getDepartments();
        setDepartments(response.data?.departments || []);
      } catch (e: any) {
        console.error('Error loading departments:', e);
      }
    };
    loadDepartments();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...form,
          departmentId: form.departmentId ? Number(form.departmentId) : null,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'فشل في إنشاء المستخدم');
      }

      navigate('/users');
    } catch (e: any) {
      setError(e.message || 'حدث خطأ في إنشاء المستخدم');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'TECHNICIAN', label: 'فني' },
    { value: 'SECTION_SUPERVISOR', label: 'مشرف قسم' },
    { value: 'DEPARTMENT_MANAGER', label: 'مدير قسم' },
    { value: 'DEPUTY_MANAGER', label: 'نائب المدير' },
    { value: 'COMPANY_MANAGER', label: 'مدير الشركة' },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">إضافة مستخدم جديد</h1>
        <p className="mt-2 text-lg text-gray-600">أدخل بيانات المستخدم الجديد</p>
      </div>

      <div className="card shadow-medium">
        <div className="card-header">
          <h2>معلومات المستخدم</h2>
          <p>يرجى ملء جميع الحقول المطلوبة</p>
        </div>
        <form className="card-content space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-600 text-sm">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label required">الاسم الأول</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className="input-field"
                placeholder="أدخل الاسم الأول"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">اسم العائلة</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className="input-field"
                placeholder="أدخل اسم العائلة"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">اسم المستخدم</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                className="input-field"
                placeholder="أدخل اسم المستخدم"
                required
              />
              <p className="form-help">يجب أن يكون فريداً في النظام</p>
            </div>

            <div className="form-group">
              <label className="form-label required">البريد الإلكتروني</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="input-field"
                placeholder="example@company.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">كلمة المرور</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="input-field"
                placeholder="أدخل كلمة مرور قوية"
                required
                minLength={6}
              />
              <p className="form-help">يجب أن تكون 6 أحرف على الأقل</p>
            </div>

            <div className="form-group">
              <label className="form-label">رقم الهاتف</label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className="input-field"
                placeholder="+963911234567"
              />
            </div>

            <div className="form-group">
              <label className="form-label required">الدور</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="select-field"
                required
              >
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">القسم</label>
              <select
                name="departmentId"
                value={form.departmentId}
                onChange={handleChange}
                className="select-field"
              >
                <option value="">اختر القسم (اختياري)</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <p className="form-help">مطلوب للفنيين والمشرفين</p>
            </div>
          </div>

          <div className="card-footer bg-gradient-to-r from-gray-50 to-white">
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/users')}
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner ml-2"></div>
                    جاري الإنشاء...
                  </>
                ) : (
                  'إنشاء المستخدم'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserPage;
