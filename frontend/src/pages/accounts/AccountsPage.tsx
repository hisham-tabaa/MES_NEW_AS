import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usersAPI, departmentsAPI } from '../../services/api';
import { User, Department, UserRole } from '../../types';
import { useI18n } from '../../contexts/I18nContext';
import { useAuth } from '../../contexts/AuthContext';

const AccountsPage: React.FC = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filters, setFilters] = useState({
    role: '',
    departmentId: '',
    isActive: 'true',
  });

  // Only allow creating supervisors, technicians, and warehouse keeper
  const allowedRoles: UserRole[] = [UserRole.SECTION_SUPERVISOR, UserRole.TECHNICIAN, UserRole.WAREHOUSE_KEEPER];

  const roleLabels: Record<UserRole, string> = {
    COMPANY_MANAGER: t('users.roles.companyManager'),
    DEPUTY_MANAGER: t('users.roles.deputyManager'),
    DEPARTMENT_MANAGER: t('users.roles.departmentManager'),
    SECTION_SUPERVISOR: t('users.roles.sectionSupervisor'),
    TECHNICIAN: t('users.roles.technician'),
    WAREHOUSE_KEEPER: t('users.roles.warehouseKeeper'),
  };

  const loadUsers = useCallback(async () => {
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
  }, [filters]);

  const loadDepartments = async () => {
    try {
      const response = await departmentsAPI.getDepartments();
      setDepartments(response.data?.departments || []);
    } catch (e: any) {
      console.error('Error loading departments:', e);
    }
  };

  useEffect(() => {
    loadUsers();
    loadDepartments();
  }, [loadUsers]);

  const handleToggleActive = async (userId: number, isActive: boolean) => {
    try {
      setLoading(true);
      await usersAPI.updateUser(userId, { isActive: !isActive });
      await loadUsers();
    } catch (e: any) {
      setError(e.message || 'فشل في تحديث حالة المستخدم');
    } finally {
      setLoading(false);
    }
  };


  // Filter users based on current user's department if they're a department manager
  const filteredUsers = user?.role === UserRole.DEPARTMENT_MANAGER 
    ? users.filter(u => u.department?.id === user.department?.id)
    : users;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t('nav.accounts')}</h1>
          <p className="mt-2 text-sm text-gray-700">إدارة حسابات المستخدمين - إنشاء مشرفين وفنيين</p>
        </div>
        <Link to="/accounts/new" className="btn-primary">
          إضافة حساب جديد
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              className="input"
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              title={t('users.filters.role')}
            >
              <option value="">{t('users.filters.allRoles')}</option>
              {allowedRoles.map(role => (
                <option key={role} value={role}>{roleLabels[role]}</option>
              ))}
            </select>
            <select
              className="input"
              value={filters.departmentId}
              onChange={(e) => setFilters({ ...filters, departmentId: e.target.value })}
              title={t('users.filters.department')}
            >
              <option value="">{t('users.filters.allDepartments')}</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            <select
              className="input"
              value={filters.isActive}
              onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
              title={t('users.filters.status')}
            >
              <option value="">{t('users.filters.allStatus')}</option>
              <option value="true">{t('users.filters.active')}</option>
              <option value="false">{t('users.filters.inactive')}</option>
            </select>
            <button
              className="btn"
              onClick={() => setFilters({ role: '', departmentId: '', isActive: 'true' })}
            >
              {t('common.clear')}
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-content">
          {error && <div className="text-red-600 mb-3">{error}</div>}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="th">{t('users.table.name')}</th>
                  <th className="th">{t('users.table.username')}</th>
                  <th className="th">{t('users.table.email')}</th>
                  <th className="th">{t('users.table.role')}</th>
                  <th className="th">{t('users.table.department')}</th>
                  <th className="th">{t('users.table.status')}</th>
                  <th className="th">{t('users.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="td">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="mr-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{user.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="td">
                        <div className="text-sm text-gray-900">{user.username}</div>
                      </td>
                      <td className="td">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="td">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {roleLabels[user.role]}
                        </span>
                      </td>
                      <td className="td">
                        <div className="text-sm text-gray-900">{user.department?.name || '-'}</div>
                      </td>
                      <td className="td">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? t('users.active') : t('users.inactive')}
                        </span>
                      </td>
                      <td className="td">
                        <div className="flex space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-900 text-sm"
                            onClick={() => navigate(`/accounts/${user.id}/edit`)}
                          >
                            {t('common.edit')}
                          </button>
                          <button
                            className={`text-sm ${
                              user.isActive 
                                ? 'text-red-600 hover:text-red-900' 
                                : 'text-green-600 hover:text-green-900'
                            }`}
                            onClick={() => handleToggleActive(user.id, user.isActive)}
                            disabled={loading}
                          >
                            {loading ? <div className="loading-spinner"></div> : (
                              user.isActive ? t('users.deactivate') : t('users.activate')
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="td text-center">
                      <div className="text-gray-500 py-8">
                        {loading ? (
                          <div className="loading-spinner mx-auto mb-4"></div>
                        ) : (
                          <div>
                            <p className="text-lg font-medium">{t('users.noUsersFound')}</p>
                            <p className="text-sm mt-2">{t('users.noUsersFoundDescription')}</p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountsPage;
