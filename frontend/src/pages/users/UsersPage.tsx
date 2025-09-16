import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI, departmentsAPI } from '../../services/api';
import { User, Department, UserRole } from '../../types';
import { useI18n } from '../../contexts/I18nContext';

const UsersPage: React.FC = () => {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filters, setFilters] = useState({
    role: '',
    departmentId: '',
    isActive: 'true',
  });

  const roleLabels: Record<UserRole, string> = {
    COMPANY_MANAGER: 'مدير الشركة',
    DEPUTY_MANAGER: 'نائب المدير',
    DEPARTMENT_MANAGER: 'مدير قسم',
    SECTION_SUPERVISOR: 'مشرف قسم',
    TECHNICIAN: 'فني',
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        ...filters,
        departmentId: filters.departmentId || undefined,
        role: filters.role || undefined,
      };
      const response = await usersAPI.getUsers(params);
      setUsers(response.data?.users || []);
    } catch (e: any) {
      setError(e.message || 'فشل في تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await departmentsAPI.getDepartments();
      setDepartments(response.data?.departments || []);
    } catch (e: any) {
      console.error('Error loading departments:', e);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const handleToggleActive = async (userId: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'فشل في تحديث المستخدم');
      }

      // Reload users
      loadUsers();
    } catch (e: any) {
      setError(e.message || 'حدث خطأ في تحديث المستخدم');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">إدارة المستخدمين</h1>
          <p className="mt-2 text-sm text-gray-700">عرض وإدارة مستخدمي النظام</p>
        </div>
        <Link to="/users/new" className="btn-primary">
          إضافة مستخدم جديد
        </Link>
      </div>

      <div className="card shadow-medium">
        <div className="card-header">
          <h2>قائمة المستخدمين</h2>
          <p>البحث والتصفية في المستخدمين</p>
        </div>
        <div className="card-content space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label">الدور</label>
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className="select-field"
              >
                <option value="">جميع الأدوار</option>
                {Object.entries(roleLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">القسم</label>
              <select
                value={filters.departmentId}
                onChange={(e) => setFilters({ ...filters, departmentId: e.target.value })}
                className="select-field"
              >
                <option value="">جميع الأقسام</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">الحالة</label>
              <select
                value={filters.isActive}
                onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
                className="select-field"
              >
                <option value="">الجميع</option>
                <option value="true">نشط</option>
                <option value="false">غير نشط</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="text-blue-800">
                <span className="font-semibold">{users.length}</span> مستخدم
              </div>
              {loading && <div className="loading-spinner"></div>}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-800">{error}</div>
            </div>
          )}

          {/* Users List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-gray-500">جاري تحميل المستخدمين...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl text-gray-300 mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد مستخدمون</h3>
              <p className="text-gray-500 mb-4">لم يتم العثور على مستخدمين يطابقون المعايير المحددة</p>
              <Link to="/users/new" className="btn-primary">
                إضافة مستخدم جديد
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الاسم</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">اسم المستخدم</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">البريد الإلكتروني</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الدور</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">القسم</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الحالة</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          {user.phone && (
                            <div className="text-sm text-gray-500">{user.phone}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-700">{user.username}</td>
                        <td className="px-6 py-4 text-gray-700">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {roleLabels[user.role as UserRole]}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {user.department?.name || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'نشط' : 'غير نشط'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleActive(user.id, user.isActive)}
                            className={`text-sm px-3 py-1 rounded ${
                              user.isActive
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                          >
                            {user.isActive ? 'إلغاء تنشيط' : 'تنشيط'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {users.map(user => (
                  <div
                    key={user.id}
                    className="block p-4 rounded-lg border bg-white border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-600">@{user.username}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                      <div className="text-left">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                          {roleLabels[user.role as UserRole]}
                        </span>
                        {user.department && (
                          <span className="text-gray-500">{user.department.name}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleToggleActive(user.id, user.isActive)}
                        className={`text-sm px-3 py-1 rounded ${
                          user.isActive
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {user.isActive ? 'إلغاء تنشيط' : 'تنشيط'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersPage;