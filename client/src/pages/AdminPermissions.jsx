import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService, clientService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import AdminSidebar from '../components/AdminSidebar';
import useBodyScrollLock from '../hooks/useBodyScrollLock';

export const PERMISSION_SECTIONS = [
    {
        title: 'الصفحة الرئيسية والتقارير العامة (Overview & Dashboard)',
        permissions: [
            { key: 'view_overview', label: 'رؤية لوحة التحكم والإحصائيات الرئيسية' }
        ]
    },
    {
        title: 'إدارة أوامر العمل والـ Check List',
        permissions: [
            { key: 'view_checklists', label: 'رؤية صفحة أوامر العمل والـ Check List' },
            { key: 'view_order_details', label: 'رؤية تفاصيل الطلب والـ Check List الكامل (زر العين)' },
            { key: 'create_checklist', label: 'إضافة أمر عمل / Check List جديد' },
            { key: 'edit_checklist', label: 'تعديل وتحديث أمر العمل والـ Check List' },
            { key: 'delete_checklist', label: 'حذف أمر العمل نهائياً' }
        ]
    },
    {
        title: 'إدارة عروض الأسعار (Price Quotations)',
        permissions: [
            { key: 'view_quotations', label: 'رؤية صفحة عروض الأسعار وقائمتها' },
            { key: 'create_quotation', label: 'إنشاء عرض سعر جديد' },
            { key: 'edit_quotation', label: 'تعديل عرض سعر موجود' },
            { key: 'delete_quotation', label: 'حذف عرض سعر نهائياً' }
        ]
    },
    {
        title: 'إدارة العملاء (Clients Management)',
        permissions: [
            { key: 'view_clients', label: 'رؤية قائمة العملاء' },
            { key: 'view_client_details', label: 'رؤية صفحة استعلام وتفاصيل العميل الشاملة' },
            { key: 'create_client', label: 'إضافة عميل جديد' },
            { key: 'edit_client', label: 'تعديل بيانات العميل والسيارات' },
            { key: 'delete_client', label: 'حذف العميل' }
        ]
    },
    {
        title: 'إدارة الموظفين (Employees Management)',
        permissions: [
            { key: 'view_employees', label: 'رؤية قائمة الموظفين (الأدمن والفنيين)' },
            { key: 'create_employee', label: 'إضافة موظف جديد' },
            { key: 'edit_employee', label: 'تعديل بيانات الموظف والصلاحيات' },
            { key: 'delete_employee', label: 'حذف الموظف' }
        ]
    },
    {
        title: 'إدارة الشركات والجهات الكبرى (Companies & Corporate)',
        permissions: [
            { key: 'view_companies', label: 'رؤية صفحة وقائمة الشركات' },
            { key: 'manage_companies', label: 'إضافة وتعديل الشركات وأسعار الباقات المخصصة' }
        ]
    },
    {
        title: 'إدارة الباقات والخدمات (Packages & Services)',
        permissions: [
            { key: 'view_packages', label: 'رؤية الخدمات والباقات' },
            { key: 'manage_packages', label: 'إضافة وتعديل الباقات والأسعار الأساسية' }
        ]
    },
    {
        title: 'إدارة المواعيد والحجوزات (Appointments & Scheduling)',
        permissions: [
            { key: 'view_appointments', label: 'رؤية قائمة المواعيد والحجوزات' },
            { key: 'edit_appointment', label: 'تعديل وتحديث بيانات الموعد والحالة (Update)' },
            { key: 'delete_appointment', label: 'حذف الموعد نهائياً (Delete)' },
            { key: 'view_scheduling', label: 'رؤية جدول الفنيين والجدولة' }
        ]
    },
    {
        title: 'إدارة الكوبونات والدفع (Coupons & Billing)',
        permissions: [
            { key: 'view_billing', label: 'رؤية الفواتير والعمليات المالية' },
            { key: 'manage_coupons', label: 'إضافة وتعديل كوبونات الخصم' }
        ]
    },
    {
        title: 'التواصل والتقييمات والذكاء الاصطناعي (Support & AI)',
        permissions: [
            { key: 'manage_ai', label: 'الوصول لإعدادات وأوامر الذكاء الاصطناعي' },
            { key: 'view_reviews', label: 'رؤية تقييمات وآراء العملاء' },
            { key: 'view_contact_requests', label: 'رؤية طلبات التواصل والاستفسارات' }
        ]
    },
    {
        title: 'إدارة الصلاحيات (Permissions System)',
        permissions: [
            { key: 'manage_permissions', label: 'الوصول لصفحة إدارة الصلاحيات والأدوار (سوبر أدمن)' }
        ]
    }
];

const AdminPermissions = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const isSuperAdmin = Boolean(
        user?.is_super_admin === 1 ||
        user?.is_super_admin === true ||
        user?.role === 'super_admin' ||
        user?.role === 'admin'
    );

    const [activeTab, setActiveTab] = useState('roles'); // 'roles' or 'user_permissions'

    // Roles modal state
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    useBodyScrollLock(isRoleModalOpen);
    const [editingRole, setEditingRole] = useState(null);
    const [roleForm, setRoleForm] = useState({
        name: '',
        description: '',
        permissions: {}
    });

    // User permission tab state
    const [userSearch, setUserSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [userPermissionsState, setUserPermissionsState] = useState({});
    const [selectedRoleId, setSelectedRoleId] = useState('');

    // Fetch all roles
    const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
        queryKey: ['rolesList'],
        queryFn: () => roleService.getAll()
    });
    const rolesList = rolesData?.data || [];

    // Fetch users for user tab
    const { data: usersData, isLoading: isLoadingUsers } = useQuery({
        queryKey: ['usersListForPermissions', userSearch],
        queryFn: () => clientService.getAll({ search: userSearch, limit: 15 }),
        enabled: activeTab === 'user_permissions' && Boolean(userSearch.trim())
    });
    const usersList = usersData?.data || [];

    // Create / Update Role Mutation
    const saveRoleMutation = useMutation({
        mutationFn: (payload) => {
            if (editingRole) {
                return roleService.update(editingRole.id || editingRole.uuid, payload);
            }
            return roleService.create(payload);
        },
        onSuccess: (res) => {
            toast.success(res.message || 'تم حفظ الدور بنجاح');
            queryClient.invalidateQueries({ queryKey: ['rolesList'] });
            handleCloseRoleModal();
        },
        onError: (err) => {
            toast.error(err.message || 'فشل حفظ الدور');
        }
    });

    // Delete Role Mutation
    const deleteRoleMutation = useMutation({
        mutationFn: (id) => roleService.remove(id),
        onSuccess: () => {
            toast.success('تم حذف الدور بنجاح');
            queryClient.invalidateQueries({ queryKey: ['rolesList'] });
        },
        onError: (err) => {
            toast.error(err.message || 'فشل حذف الدور');
        }
    });

    // Save User Permissions Mutation
    const saveUserPermissionsMutation = useMutation({
        mutationFn: (payload) => roleService.updateUserPermissions(selectedUser.id || selectedUser.uuid, payload),
        onSuccess: () => {
            toast.success('تم حفظ صلاحيات المستخدم المخصصة بنجاح!');
            queryClient.invalidateQueries({ queryKey: ['usersListForPermissions'] });
            queryClient.invalidateQueries({ queryKey: ['adminEmployees'] });
            setSelectedUser(prev => prev ? ({ ...prev, permissions: userPermissionsState, role_id: selectedRoleId }) : null);
        },
        onError: (err) => {
            toast.error(err.message || 'فشل حفظ الصلاحيات');
        }
    });

    const handleOpenRoleModal = (role = null) => {
        if (role) {
            setEditingRole(role);
            setRoleForm({
                name: role.name || '',
                description: role.description || '',
                permissions: role.permissions || {}
            });
        } else {
            setEditingRole(null);
            // Default initial view-only permissions
            const initPerms = {};
            PERMISSION_SECTIONS.forEach(sec => {
                sec.permissions.forEach(p => {
                    initPerms[p.key] = p.key.startsWith('view_');
                });
            });
            setRoleForm({
                name: '',
                description: '',
                permissions: initPerms
            });
        }
        setIsRoleModalOpen(true);
    };

    const handleCloseRoleModal = () => {
        setIsRoleModalOpen(false);
        setEditingRole(null);
    };

    const handleTogglePermission = (permKey) => {
        setRoleForm(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [permKey]: !prev.permissions[permKey]
            }
        }));
    };

    const handleSelectUserForEdit = (userObj) => {
        setSelectedUser(userObj);
        const matchedRole = rolesList.find(r => r.id === userObj.role_id || r.slug === userObj.role || r.name === userObj.role);
        const roleId = userObj.role_id || matchedRole?.id || '';
        setSelectedRoleId(roleId);

        const rolePerms = matchedRole?.permissions || {};
        let customPerms = {};
        if (userObj.permissions) {
            try {
                customPerms = typeof userObj.permissions === 'string' ? JSON.parse(userObj.permissions) : userObj.permissions;
            } catch (e) { customPerms = {}; }
        }

        // Merge role default permissions with custom user overrides so role permissions are checked by default
        const combinedPerms = { ...rolePerms, ...customPerms };
        setUserPermissionsState(combinedPerms);
    };

    const handleRoleSelectChange = (newRoleId) => {
        setSelectedRoleId(newRoleId);
        const matchedRole = rolesList.find(r => String(r.id) === String(newRoleId));
        const newRolePerms = matchedRole?.permissions || {};
        setUserPermissionsState(prev => ({
            ...newRolePerms,
            ...prev
        }));
    };

    const handleToggleUserPermission = (permKey) => {
        setUserPermissionsState(prev => ({
            ...prev,
            [permKey]: !prev[permKey]
        }));
    };

    // If non super admin tries to access
    if (!isSuperAdmin) {
        return (
            <div className="flex bg-[#000000] min-h-screen font-body text-[#e5e2e1] relative pt-16 md:pt-0">
                <AdminSidebar />
                <main className="flex-1 flex items-center justify-center p-6 text-center" dir="rtl">
                    <div className="max-w-md bg-white/[0.02] border border-white/10 rounded-3xl p-8 space-y-4 shadow-2xl">
                        <span className="material-symbols-outlined text-5xl text-red-500 block">lock_person</span>
                        <h2 className="text-xl font-bold text-white">غير مصرح بالوصول</h2>
                        <p className="text-xs text-gray-400">صفحة إدارة الصلاحيات والأدوار مخصصة فقط لمدير النظام (السوبر أدمن Super Admin).</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex bg-[#000000] min-h-screen font-body text-[#e5e2e1] relative pt-16 md:pt-0">
            <AdminSidebar />

            <main className="flex-1 overflow-y-auto p-6 lg:p-12 space-y-8" dir="rtl">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                            <span className="material-symbols-outlined text-[#FF5C35] text-4xl">admin_panel_settings</span>
                            صفحة إدارة الصلاحيات والأدوار (Roles & Permissions)
                        </h1>
                        <p className="text-xs text-gray-400 mt-1 font-bold">
                            لوحة التحكم الإدارية للسوبر أدمن لإنشاء وتعديل الأدوار الصلاحية وتخصيص صلاحيات المستخدمين والعملاء.
                        </p>
                    </div>
                </header>

                {/* Tab Selector */}
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                    <button
                        type="button"
                        onClick={() => setActiveTab('roles')}
                        className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'roles'
                            ? 'bg-[#FF5C35] text-white shadow-[0_8px_20px_rgba(255,92,53,0.3)]'
                            : 'bg-white/5 text-gray-400 hover:text-white'
                            }`}
                    >
                        <span className="material-symbols-outlined text-base">badge</span>
                        1. إدارة الأدوار المخصصة (Roles)
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('user_permissions')}
                        className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'user_permissions'
                            ? 'bg-[#FF5C35] text-white shadow-[0_8px_20px_rgba(255,92,53,0.3)]'
                            : 'bg-white/5 text-gray-400 hover:text-white'
                            }`}
                    >
                        <span className="material-symbols-outlined text-base">person_search</span>
                        2. تخصيص صلاحيات عميل / مستخدم محدد
                    </button>
                </div>

                {/* TAB 1: Roles Management */}
                {activeTab === 'roles' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white">قائمة الأدوار المتاحة للنظام ({rolesList.length}):</h2>
                            <button
                                type="button"
                                onClick={() => handleOpenRoleModal(null)}
                                className="px-5 py-2.5 bg-[#FF5C35] hover:bg-[#FF5C35]/90 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-base">add_moderator</span>
                                إضافة دور جديد (Role)
                            </button>
                        </div>

                        {isLoadingRoles ? (
                            <div className="flex justify-center py-12">
                                <div className="w-8 h-8 border-4 border-[#FF5C35] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {rolesList.map((r) => {
                                    const permCount = Object.values(r.permissions || {}).filter(Boolean).length;
                                    return (
                                        <div key={r.id || r.uuid} className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 space-y-4 shadow-xl hover:border-[#FF5C35]/30 transition-all flex flex-col justify-between">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-lg font-black text-white">{r.name}</h3>
                                                    <span className="text-[10px] font-bold text-[#FF5C35] bg-[#FF5C35]/10 px-2.5 py-0.5 rounded-full font-mono">
                                                        {r.slug}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400 leading-relaxed font-bold">{r.description || 'لا يوجد وصف محدد'}</p>
                                                <div className="pt-2 text-[11px] text-emerald-400 font-bold">
                                                    تم تفعيل {permCount} صلاحيات من أصل {PERMISSION_SECTIONS.reduce((sum, s) => sum + s.permissions.length, 0)}
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenRoleModal(r)}
                                                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined text-sm">edit</span>
                                                    تعديل الصلاحيات
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (window.confirm(`هل أنت تأكد من حذف الدور (${r.name})؟`)) {
                                                            deleteRoleMutation.mutate(r.id || r.uuid);
                                                        }
                                                    }}
                                                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all cursor-pointer"
                                                    title="حذف الدور"
                                                >
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: Individual User Permission Customization */}
                {activeTab === 'user_permissions' && (
                    <div className="space-y-6">
                        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8 space-y-4">
                            <h2 className="text-base font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#FF5C35]">person_search</span>
                                ابحث عن عميل أو مستخدم لتخصيص صلاحياته:
                            </h2>

                            <input
                                type="text"
                                placeholder="ابحث بالاسم أو رقم الجوال..."
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-[#FF5C35]"
                            />

                            {!userSearch.trim() && (
                                <div className="p-8 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-2xl space-y-2">
                                    <span className="material-symbols-outlined text-3xl text-gray-500 block">search</span>
                                    <p className="text-xs text-gray-400 font-bold">اكتب اسم الشخص أو رقم الجوال في مربع البحث لعرض النتائج واختياره لتعديل صلاحياته.</p>
                                </div>
                            )}

                            {Boolean(userSearch.trim()) && isLoadingUsers && (
                                <div className="flex justify-center py-6">
                                    <div className="w-6 h-6 border-2 border-[#FF5C35] border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}

                            {Boolean(userSearch.trim()) && !isLoadingUsers && usersList.length === 0 && (
                                <p className="text-xs text-amber-400 font-bold p-4 bg-amber-500/10 rounded-xl">لم يتم العثور على مستخدمين يطابقون كلمة البحث.</p>
                            )}

                            {Boolean(userSearch.trim()) && usersList.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                                    {usersList.map((u) => (
                                        <div
                                            key={u.id || u.uuid}
                                            onClick={() => handleSelectUserForEdit(u)}
                                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-xs font-bold ${selectedUser?.id === u.id || selectedUser?.uuid === u.uuid
                                                ? 'bg-[#FF5C35]/20 border-[#FF5C35] text-white shadow-lg'
                                                : 'bg-white/[0.02] border-white/5 text-gray-300 hover:bg-white/5'
                                                }`}
                                        >
                                            <div>
                                                <div className="text-white font-extrabold">{u.full_name}</div>
                                                <div className="text-gray-400 font-mono text-[11px]">{u.phone}</div>
                                            </div>
                                            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-400 uppercase">
                                                {u.role || 'client'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedUser && (
                            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
                                    <div>
                                        <h3 className="text-xl font-extrabold text-white">تعديل صلاحيات العميل: {selectedUser.full_name}</h3>
                                        <p className="text-xs text-gray-400 font-mono mt-0.5">رقم الهاتف: {selectedUser.phone}</p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <label className="text-xs font-bold text-gray-300">اختر الدور (Role):</label>
                                        <select
                                            value={selectedRoleId}
                                            onChange={(e) => handleRoleSelectChange(e.target.value)}
                                            className="bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-bold outline-none focus:border-[#FF5C35]"
                                        >
                                            <option value="">بدون دور مخصص (عميل عادي)</option>
                                            {rolesList.map(r => (
                                                <option key={r.id} value={r.id}>{r.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Granular Checkbox Matrix */}
                                <div className="space-y-6">
                                    {PERMISSION_SECTIONS.map((sec, secIdx) => (
                                        <div key={secIdx} className="space-y-3 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                            <h4 className="text-xs font-bold text-[#FF5C35] flex items-center gap-2 border-b border-white/5 pb-2">
                                                <span className="material-symbols-outlined text-sm">folder_open</span>
                                                {sec.title}
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
                                                {sec.permissions.map((p) => {
                                                    const isChecked = Boolean(userPermissionsState[p.key]);
                                                    return (
                                                        <label
                                                            key={p.key}
                                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${isChecked ? 'bg-[#FF5C35]/15 border-[#FF5C35]/40 text-white' : 'bg-white/[0.02] border-white/5 text-gray-400'
                                                                }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={() => handleToggleUserPermission(p.key)}
                                                                className="w-4 h-4 accent-[#FF5C35] rounded cursor-pointer"
                                                            />
                                                            <span>{p.label}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 border-t border-white/10 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            saveUserPermissionsMutation.mutate({
                                                permissions: userPermissionsState,
                                                role_id: selectedRoleId || null
                                            });
                                        }}
                                        disabled={saveUserPermissionsMutation.isPending}
                                        className="px-6 py-3 bg-[#FF5C35] hover:bg-[#FF5C35]/90 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                                    >
                                        {saveUserPermissionsMutation.isPending && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                        حفظ صلاحيات العميل المخصصة
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </main>

            {/* Role Add/Edit Modal */}
            {isRoleModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-start justify-center pt-20 sm:pt-24 pb-6 px-4 sm:px-6 overflow-y-auto">
                    <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl max-w-3xl w-full flex flex-col max-h-[calc(100vh-7rem)] relative shadow-2xl overflow-hidden my-auto" dir="rtl">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 shrink-0 bg-[#0f0f0f] z-10">
                            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#FF5C35]">badge</span>
                                {editingRole ? `تعديل الدور: ${editingRole.name}` : 'إضافة دور جديد في النظام (Role)'}
                            </h3>
                            <button
                                type="button"
                                onClick={handleCloseRoleModal}
                                className="p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>

                        {/* Modal Form Body */}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (!roleForm.name) {
                                    toast.warning('اسم الدور مطلوب');
                                    return;
                                }
                                saveRoleMutation.mutate(roleForm);
                            }}
                            className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-bold custom-scrollbar"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-300 mb-1">اسم الدور (مثال: مدير فرع / مشرف فرع) *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="مثال: مدير فرع"
                                        value={roleForm.name}
                                        onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#FF5C35]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-1">وصف مختصر للدور</label>
                                    <input
                                        type="text"
                                        placeholder="صلاحيات العرض فقط بدون تعديل..."
                                        value={roleForm.description}
                                        onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#FF5C35]"
                                    />
                                </div>
                            </div>

                            {/* Permissions Checkbox Grid grouped by Section */}
                            <div className="space-y-5">
                                <h4 className="text-sm font-black text-white flex items-center gap-2 border-b border-white/10 pb-2">
                                    <span className="material-symbols-outlined text-[#FF5C35]">checklist</span>
                                    جدول جميع الصلاحيات والميزات في الموقع (علم بجانب الصلاحية لمنحها):
                                </h4>

                                {PERMISSION_SECTIONS.map((sec, secIdx) => (
                                    <div key={secIdx} className="space-y-3 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                        <h5 className="text-xs font-bold text-[#FF5C35]">{sec.title}</h5>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                            {sec.permissions.map((p) => {
                                                const isChecked = Boolean(roleForm.permissions[p.key]);
                                                return (
                                                    <label
                                                        key={p.key}
                                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${isChecked ? 'bg-[#FF5C35]/15 border-[#FF5C35]/40 text-white' : 'bg-white/[0.02] border-white/5 text-gray-400'
                                                            }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => handleTogglePermission(p.key)}
                                                            className="w-4 h-4 accent-[#FF5C35] rounded cursor-pointer"
                                                        />
                                                        <span>{p.label}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Modal Footer */}
                            <div className="pt-4 border-t border-white/10 flex justify-end gap-2 sticky bottom-0 bg-[#0f0f0f] pb-2 z-10">
                                <button
                                    type="button"
                                    onClick={handleCloseRoleModal}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl cursor-pointer"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={saveRoleMutation.isPending}
                                    className="px-6 py-2.5 bg-[#FF5C35] hover:bg-[#FF5C35]/90 text-white rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                                >
                                    {saveRoleMutation.isPending && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                    حفظ الدور والتغييرات
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminPermissions;
