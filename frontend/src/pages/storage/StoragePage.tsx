import React, { useCallback, useEffect, useState } from 'react';
import { storageAPI, departmentsAPI } from '../../services/api';
import { SparePart, CreateSparePartForm, StorageFilters, Department, UserRole } from '../../types';
import { useI18n } from '../../contexts/I18nContext';
import { useAuth } from '../../contexts/AuthContext';

const StoragePage: React.FC = () => {
  const { t } = useI18n();
  const { hasRole } = useAuth();
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);
  const [form, setForm] = useState<CreateSparePartForm>({
    name: '',
    partNumber: '',
    unitPrice: 0,
    quantity: 0,
    currency: 'SYP',
    description: '',
    departmentId: undefined,
  });

  const [filters, setFilters] = useState<StorageFilters>({
    search: '',
    category: '',
    lowStock: false,
    page: 1,
    limit: 20,
  });

  const loadSpareParts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await storageAPI.getSpareParts(filters);
      setSpareParts((response as any).data?.spareParts || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load spare parts');
    } finally {
      setLoading(false);
    }
  }, [filters]);


  const loadDepartments = async () => {
    try {
      const response = await departmentsAPI.getDepartments();
      console.log('Departments response:', response);
      setDepartments((response as any).data?.departments || []);
    } catch (e: any) {
      console.error('Failed to load departments:', e);
    }
  };

  useEffect(() => {
    loadSpareParts();
    loadDepartments();
  }, [filters, loadSpareParts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Ensure required backend fields exist
      const payload: CreateSparePartForm = {
        ...form,
        quantity: typeof form.quantity === 'number' ? form.quantity : 0,
      };
      
      // Validate required fields
      if (!payload.name || !payload.partNumber) {
        setError('Name and part number are required');
        setLoading(false);
        return;
      }
      
      if (editingPart) {
        await storageAPI.updateSparePart(editingPart.id, payload);
      } else {
        await storageAPI.createSparePart(payload);
      }
      setShowForm(false);
      setEditingPart(null);
      setForm({
        name: '',
        partNumber: '',
        unitPrice: 0,
        quantity: 0,
        currency: 'SYP',
        description: '',
        departmentId: undefined,
      });
      await loadSpareParts();
    } catch (e: any) {
      setError(e.message || 'Failed to save spare part');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (part: SparePart) => {
    setEditingPart(part);
    setForm({
      name: part.name,
      partNumber: part.partNumber,
      unitPrice: part.unitPrice,
      quantity: part.quantity,
      currency: part.currency || 'SYP',
      description: part.description || '',
      departmentId: (part as any).departmentId || undefined,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('storage.confirmDelete'))) return;
    try {
      setLoading(true);
      await storageAPI.deleteSparePart(id);
      await loadSpareParts();
    } catch (e: any) {
      setError(e.message || 'Failed to delete spare part');
    } finally {
      setLoading(false);
    }
  };


  const canEdit = hasRole([UserRole.WAREHOUSE_KEEPER]);
  const canView = hasRole([UserRole.COMPANY_MANAGER, UserRole.DEPUTY_MANAGER, UserRole.DEPARTMENT_MANAGER, UserRole.SECTION_SUPERVISOR, UserRole.WAREHOUSE_KEEPER]);

  // If user doesn't have view permissions, show access denied
  if (!canView) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">{t('common.accessDenied')}</h1>
          <p className="text-gray-600">{t('storage.noAccess')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t('storage.title')}</h1>
          <p className="mt-2 text-sm text-gray-700">{t('storage.subtitle')}</p>
        </div>
        {canEdit && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            {t('storage.add')}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              className="input"
              placeholder={t('common.search') + ' by name or part number...'}
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            />
            <select
              className="input"
              value={filters.category || ''}
              onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              <option value="GENERAL">General</option>
              <option value="ELECTRICAL">Electrical</option>
              <option value="MECHANICAL">Mechanical</option>
              <option value="ELECTRONIC">Electronic</option>
            </select>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.lowStock || false}
                onChange={(e) => setFilters({ ...filters, lowStock: e.target.checked, page: 1 })}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Low Stock Only</span>
            </label>
            <button
              className="btn"
              onClick={() => setFilters({ search: '', category: '', lowStock: false, page: 1, limit: 20 })}
            >
              {t('common.clear')}
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && canEdit && (
        <div className="card">
          <div className="card-content">
            <h3 className="text-lg font-medium mb-4">
              {editingPart ? t('storage.edit') : t('storage.add')}
            </h3>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
              <input
                className="input"
                placeholder={t('storage.name')}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                className="input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]+"
                placeholder={t('storage.partNumber')}
                value={form.partNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setForm({ ...form, partNumber: value });
                }}
                required
              />
              <input
                className="input"
                type="text"
                inputMode="decimal"
                pattern="[0-9]+(\.[0-9]{1,2})?"
                placeholder={t('storage.unitPrice')}
                value={form.unitPrice || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.]/g, '');
                  const numValue = parseFloat(value) || 0;
                  setForm({ ...form, unitPrice: numValue });
                }}
                required
              />
              <div>
                <label htmlFor="currency" className="block text-sm text-gray-700 mb-1">
                  {t('storage.currency')}
                </label>
                <select
                  id="currency"
                  name="currency"
                  className="input w-full"
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  required
                >
                  <option value="SYP">SYP - Syrian Pound</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
              <input
                className="input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]+"
                placeholder={t('storage.quantity')}
                value={form.quantity || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  const numValue = parseInt(value) || 0;
                  setForm({ ...form, quantity: numValue });
                }}
                required
              />
              <div className="md:col-span-2">
                <label htmlFor="departmentId" className="block text-sm text-gray-700 mb-1">
                  {t('products.department')}
                </label>
                <select
                  id="departmentId"
                  name="departmentId"
                  className="input w-full"
                  value={form.departmentId ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      departmentId: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  aria-label={t('products.department')}
                >
                  <option value="">{t('common.select')}</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                {departments.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">Loading departments...</p>
                )}
              </div>
              <textarea
                className="input md:col-span-2"
                placeholder={t('storage.description')}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
              <div className="md:col-span-2 flex gap-2">
                <button className="btn-primary" type="submit" disabled={loading}>
                  {loading ? t('common.loading') : (editingPart ? t('storage.update') : t('storage.save'))}
                </button>
                <button
                  className="btn"
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPart(null);
                    setForm({
                      name: '',
                      partNumber: '',
                      unitPrice: 0,
                      quantity: 0,
                      currency: 'SYP',
                      description: '',
                      departmentId: undefined,
                    });
                  }}
                >
                  {t('storage.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div className="card-content">
          {error && <div className="text-red-600 mb-3">{error}</div>}
          
          {/* Summary Stats */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Total Parts</div>
              <div className="text-2xl font-bold text-blue-900">{spareParts.length}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm text-green-600 font-medium">In Stock</div>
              <div className="text-2xl font-bold text-green-900">
                {spareParts.filter(p => p.quantity > 10).length}
              </div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-sm text-red-600 font-medium">Low Stock</div>
              <div className="text-2xl font-bold text-red-900">
                {spareParts.filter(p => p.quantity <= 5).length}
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="th">{t('storage.name')}</th>
                  <th className="th">{t('storage.partNumber')}</th>
                  <th className="th">{t('storage.unitPrice')}</th>
                  <th className="th">{t('storage.currency')}</th>
                  <th className="th">{t('storage.quantity')}</th>
                  <th className="th">{t('storage.description')}</th>
                  <th className="th">{t('products.department')}</th>
                  <th className="th">{t('storage.actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      {t('storage.loading')}
                    </td>
                  </tr>
                ) : spareParts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      {filters.search ? 
                        `No spare parts found matching "${filters.search}"` : 
                        t('storage.empty')
                      }
                    </td>
                  </tr>
                ) : (
                  spareParts.map((part) => {
                    return (
                      <tr key={part.id} className="hover:bg-gray-50">
                        <td className="td font-medium">{part.name}</td>
                        <td className="td font-mono text-sm">{part.partNumber}</td>
                        <td className="td text-right font-medium">{part.unitPrice.toLocaleString()}</td>
                        <td className="td text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {part.currency || 'SYP'}
                          </span>
                        </td>
                        <td className="td text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            part.quantity <= 5 ? 'bg-red-100 text-red-800' : 
                            part.quantity <= 10 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {part.quantity}
                          </span>
                        </td>
                        <td className="td text-sm text-gray-600">{part.description || '-'}</td>
                        <td className="td text-sm">{part.department?.name || '-'}</td>
                        <td className="td">
                          <div className="flex gap-2">
                            {canEdit && (
                              <button
                                className="text-blue-600 hover:text-blue-800"
                                onClick={() => handleEdit(part)}
                              >
                                {t('storage.edit')}
                              </button>
                            )}
                            {canEdit && (
                              <button
                                className="text-red-600 hover:text-red-800"
                                onClick={() => handleDelete(part.id)}
                              >
                                {t('storage.delete')}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoragePage;
