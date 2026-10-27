import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService, clientService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import AdminSidebar from '../components/AdminSidebar';
import { useLanguage } from '../hooks/useLanguage';
import { useAdminTheme } from '../contexts/AdminThemeContext';
import useBodyScrollLock from '../hooks/useBodyScrollLock';

export const PERMISSION_SECTIONS = [
    {
        titleAr: 'الصفحة الرئيسية والتقارير العامة',
        titleEn: 'Overview & Main Dashboard',
        permissions: [
            { key: 'view_overview', labelAr: 'رؤية لوحة التحكم والإحصائيات الرئيسية', labelEn: 'View Dashboard & Main Analytics' }
        ]
    },
    {
        titleAr: 'إدارة أوامر العمل وقوائم الفحص (Checklist)',
        titleEn: 'Work Orders & Checklists',
        permissions: [
            { key: 'view_checklists', labelAr: 'رؤية صفحة أوامر العمل وقوائم الفحص', labelEn: 'View Work Orders & Checklists Page' },
            { key: 'view_order_details', labelAr: 'رؤية تفاصيل الطلب والفحص الكامل (زر العين)', labelEn: 'View Full Order Details & Inspection (Eye Icon)' },
            { key: 'create_checklist', labelAr: 'إضافة أمر عمل / قائمة فحص جديدة', labelEn: 'Create New Work Order / Checklist' },
            { key: 'edit_checklist', labelAr: 'تعديل وتحديث أمر العمل وقائمة الفحص', labelEn: 'Edit & Update Work Order / Checklist' },
            { key: 'delete_checklist', labelAr: 'حذف أمر العمل نهائياً', labelEn: 'Permanently Delete Work Order' }
        ]
    },
    {
        titleAr: 'إدارة عروض الأسعار',
        titleEn: 'Price Quotations',
        permissions: [
            { key: 'view_quotations', labelAr: 'رؤية صفحة عروض الأسعار وقائمتها', labelEn: 'View Price Quotations Page' },
            { key: 'create_quotation', labelAr: 'إنشاء عرض سعر جديد', labelEn: 'Create New Price Quotation' },
            { key: 'edit_quotation', labelAr: 'تعديل عرض سعر موجود', labelEn: 'Edit Existing Quotation' },
            { key: 'delete_quotation', labelAr: 'حذف عرض سعر نهائياً', labelEn: 'Permanently Delete Quotation' }
        ]
    },
    {
        titleAr: 'إدارة العملاء و CRM',
        titleEn: 'Clients & CRM',
        permissions: [
            { key: 'view_clients', labelAr: 'رؤية قائمة العملاء', labelEn: 'View Clients List' },
            { key: 'view_client_details', labelAr: 'رؤية صفحة استعلام وتفاصيل العميل الشاملة', labelEn: 'View Client Comprehensive Details & History' },
            { key: 'create_client', labelAr: 'إضافة عميل جديد', labelEn: 'Add New Client' },
            { key: 'edit_client', labelAr: 'تعديل بيانات العميل والسيارات', labelEn: 'Edit Client & Vehicles Data' },
            { key: 'delete_client', labelAr: 'حذف العميل', labelEn: 'Delete Client' }
        ]
    },
    {
        titleAr: 'إدارة الموظفين والفنيين',
        titleEn: 'Employees & Staff',
        permissions: [
            { key: 'view_employees', labelAr: 'رؤية قائمة الموظفين (الأدمن والفنيين)', labelEn: 'View Staff & Technicians List' },
            { key: 'create_employee', labelAr: 'إضافة موظف جديد', labelEn: 'Add New Employee / Tech' },
            { key: 'edit_employee', labelAr: 'تعديل بيانات الموظف والصلاحيات', labelEn: 'Edit Employee Details & Permissions' },
            { key: 'delete_employee', labelAr: 'حذف الموظف', labelEn: 'Delete Employee' }
        ]
    },
    {
        titleAr: 'الشركات والجهات الكبرى',
        titleEn: 'Corporate & Companies',
        permissions: [
            { key: 'view_companies', labelAr: 'رؤية صفحة وقائمة الشركات', labelEn: 'View Corporate Companies Page' },
            { key: 'manage_companies', labelAr: 'إضافة وتعديل الشركات وأسعار الباقات المخصصة', labelEn: 'Manage Corporate Accounts & Custom Pricing' }
        ]
    },
    {
        titleAr: 'الخدمات والباقات',
        titleEn: 'Services & Packages',
        permissions: [
            { key: 'view_packages', labelAr: 'رؤية الخدمات والباقات', labelEn: 'View Services & Packages' },
            { key: 'manage_packages', labelAr: 'إضافة وتعديل الباقات والأسعار الأساسية', labelEn: 'Manage Packages & Base Prices' }
        ]
    },
    {
        titleAr: 'المواعيد والحجوزات',
        titleEn: 'Appointments & Scheduling',
        permissions: [
            { key: 'view_appointments', labelAr: 'رؤية قائمة المواعيد والحجوزات', labelEn: 'View Appointments & Bookings' },
            { key: 'edit_appointment', labelAr: 'تعديل وتحديث بيانات الموعد والحالة', labelEn: 'Update Appointment Details & Status' },
            { key: 'delete_appointment', labelAr: 'حذف الموعد نهائياً', labelEn: 'Delete Appointment' },
            { key: 'view_scheduling', labelAr: 'رؤية جدول الفنيين والجدولة', labelEn: 'View Technicians Scheduling' }
        ]
    },
    {
        titleAr: 'الفواتير والكوبونات والمالية',
        titleEn: 'Billing & Coupons',
        permissions: [
            { key: 'view_billing', labelAr: 'رؤية الفواتير والعمليات المالية', labelEn: 'View Billing & Financial Transactions' },
            { key: 'manage_coupons', labelAr: 'إضافة وتعديل كوبونات الخصم', labelEn: 'Manage Discount Coupons' }
        ]
    },
    {
        titleAr: 'التواصل والتقييمات والذكاء الاصطناعي',
        titleEn: 'Support, Feedback & AI',
        permissions: [
            { key: 'manage_ai', labelAr: 'الوصول لإعدادات وأوامر الذكاء الاصطناعي', labelEn: 'Manage AI Assistant Prompts & Settings' },
            { key: 'view_reviews', labelAr: 'رؤية تقييمات وآراء العملاء', labelEn: 'View Customer Reviews' },
            { key: 'view_contact_requests', labelAr: 'رؤية طلبات التواصل والاستفسارات', labelEn: 'View Contact Requests' }
        ]
    },
    {
        titleAr: 'إدارة الصلاحيات (سوبر أدمن)',
        titleEn: 'Permissions System (Super Admin)',
        permissions: [
            { key: 'manage_permissions', labelAr: 'الوصول لصفحة إدارة الصلاحيات والأدوار', labelEn: 'Access Roles & Permissions Page' }
        ]
    }
];

const AdminPermissions = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { language } = useLanguage();
    const isArabic = language === 'ar';
    const { isLight } = useAdminTheme();

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
            toast.success(res.message || (isArabic ? 'تم حفظ الدور بنجاح' : 'Role saved successfully'));
            queryClient.invalidateQueries({ queryKey: ['rolesList'] });
            handleCloseRoleModal();
        },
        onError: (err) => {
            toast.error(err.message || (isArabic ? 'فشل حفظ الدور' : 'Failed to save role'));
        }
    });

    // Delete Role Mutation
    const deleteRoleMutation = useMutation({
        mutationFn: (id) => roleService.remove(id),
        onSuccess: () => {
            toast.success(isArabic ? 'تم حذف الدور بنجاح' : 'Role deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['rolesList'] });
        },
        onError: (err) => {
            toast.error(err.message || (isArabic ? 'فشل حذف الدور' : 'Failed to delete role'));
        }
    });

    // Save User Permissions Mutation
    const saveUserPermissionsMutation = useMutation({
        mutationFn: (payload) => roleService.updateUserPermissions(selectedUser.id || selectedUser.uuid, payload),
        onSuccess: () => {
            toast.success(isArabic ? 'تم حفظ صلاحيات المستخدم المخصصة بنجاح!' : 'User custom permissions saved successfully!');
            queryClient.invalidateQueries({ queryKey: ['usersListForPermissions'] });
            queryClient.invalidateQueries({ queryKey: ['adminEmployees'] });
            setSelectedUser(prev => prev ? ({ ...prev, permissions: userPermissionsState, role_id: selectedRoleId }) : null);
        },
        onError: (err) => {
            toast.error(err.message || (isArabic ? 'فشل حفظ الصلاحيات' : 'Failed to save permissions'));
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

    if (!isSuperAdmin) {
        return (
            <div className={`flex min-h-screen font-body relative pt-16 md:pt-0 ${isLight ? 'bg-[#F8FAFC] text-gray-900 admin-light-theme' : 'bg-[#000000] text-[#e5e2e1] admin-dark-theme'}`} dir={isArabic ? 'rtl' : 'ltr'}>
                <AdminSidebar />
                <main className="flex-1 flex items-center justify-center p-6 text-center">
                    <div className={`max-w-md rounded-3xl p-8 space-y-4 shadow-2xl border ${isLight ? 'bg-white border-gray-200' : 'bg-white/[0.02] border-white/10'}`}>
                        <span className="material-symbols-outlined text-5xl text-red-500 block">lock_person</span>
                        <h2 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                            {isArabic ? 'غير مصرح بالوصول' : 'Access Denied'}
                        </h2>
                        <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                            {isArabic ? 'صفحة إدارة الصلاحيات والأدوار مخصصة فقط لمدير النظام (السوبر أدمن Super Admin).' : 'Roles & Permissions is restricted to Super Admin.'}
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className={`flex min-h-screen font-body relative pt-16 md:pt-0 ${isLight ? 'bg-[#F8FAFC] text-gray-900 admin-light-theme' : 'bg-[#090A0F] text-white admin-dark-theme'}`} dir={isArabic ? 'rtl' : 'ltr'}>
            <AdminSidebar />

            <main className="flex-1 overflow-y-auto p-6 lg:p-12 space-y-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className={`text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                            <span className="material-symbols-outlined text-[#8B5CF6] text-4xl">admin_panel_settings</span>
                            {isArabic ? 'إدارة الصلاحيات والأدوار' : 'Roles & Permissions Management'}
                        </h1>
                        <p className={`text-xs mt-1 font-bold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                            {isArabic 
                                ? 'لوحة التحكم الإدارية لإنشاء وتعديل الأدوار الصلاحية وتخصيص صلاحيات المستخدمين والموظفين.' 
                                : 'Administrative dashboard to create/modify roles and configure user permissions.'}
                        </p>
                    </div>
                </header>

                {/* Tab Selector */}
                <div className={`flex items-center gap-3 border-b pb-4 ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
                    <button
                        type="button"
                        onClick={() => setActiveTab('roles')}
                        className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'roles'
                            ? 'bg-[#5C24EB] text-white shadow-[0_8px_20px_rgba(92, 36, 235, 0.3)]'
                            : isLight ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-white/5 text-gray-400 hover:text-white'
                            }`}
                    >
                        <span className="material-symbols-outlined text-base">badge</span>
                        {isArabic ? '1. إدارة الأدوار المخصصة (Roles)' : '1. Manage Custom Roles'}
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('user_permissions')}
                        className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'user_permissions'
                            ? 'bg-[#5C24EB] text-white shadow-[0_8px_20px_rgba(92, 36, 235, 0.3)]'
                            : isLight ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-white/5 text-gray-400 hover:text-white'
                            }`}
                    >
                        <span className="material-symbols-outlined text-base">person_search</span>
                        {isArabic ? '2. تخصيص صلاحيات موظف / مستخدم محدد' : '2. Customize User Permissions'}
                    </button>
                </div>

                {/* TAB 1: Roles Management */}
                {activeTab === 'roles' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className={`text-lg font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                                {isArabic ? `قائمة الأدوار المتاحة للنظام (${rolesList.length}):` : `Available Roles (${rolesList.length}):`}
                            </h2>
                            <button
                                type="button"
                                onClick={() => handleOpenRoleModal(null)}
                                className="px-5 py-2.5 bg-[#5C24EB] hover:bg-[#5C24EB]/90 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-base">add_moderator</span>
                                {isArabic ? 'إضافة دور جديد' : 'Add New Role'}
                            </button>
                        </div>

                        {isLoadingRoles ? (
                            <div className="flex justify-center py-12">
                                <div className="w-8 h-8 border-4 border-[#5C24EB] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {rolesList.map((r) => {
                                    const permCount = Object.values(r.permissions || {}).filter(Boolean).length;
                                    const totalPerms = PERMISSION_SECTIONS.reduce((sum, s) => sum + s.permissions.length, 0);

                                    return (
                                        <div key={r.id || r.uuid} className={`rounded-3xl p-6 space-y-4 shadow-xl border transition-all flex flex-col justify-between ${
                                            isLight ? 'bg-white border-gray-200 hover:border-[#5C24EB]/50' : 'bg-white/[0.03] border-white/5 hover:border-[#5C24EB]/30'
                                        }`}>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <h3 className={`text-lg font-black ${isLight ? 'text-gray-900' : 'text-white'}`}>{r.name}</h3>
                                                    <span className="text-[10px] font-bold text-[#8B5CF6] bg-[#5C24EB]/10 px-2.5 py-0.5 rounded-full font-mono">
                                                        {r.slug}
                                                    </span>
                                                </div>
                                                <p className={`text-xs leading-relaxed font-bold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                                                    {r.description || (isArabic ? 'لا يوجد وصف محدد' : 'No description')}
                                                </p>
                                                <div className="pt-2 text-[11px] text-emerald-600 font-bold">
                                                    {isArabic ? `تم تفعيل ${permCount} صلاحيات من أصل ${totalPerms}` : `${permCount} of ${totalPerms} permissions enabled`}
                                                </div>
                                            </div>

                                            <div className={`pt-4 border-t flex items-center justify-end gap-2 ${isLight ? 'border-gray-100' : 'border-white/5'}`}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenRoleModal(r)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                                        isLight ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
                                                    }`}
                                                >
                                                    <span className="material-symbols-outlined text-sm">edit</span>
                                                    {isArabic ? 'تعديل الصلاحيات' : 'Edit'}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (window.confirm(isArabic ? `هل أنت متأكد من حذف الدور (${r.name})؟` : `Delete role (${r.name})?`)) {
                                                            deleteRoleMutation.mutate(r.id || r.uuid);
                                                        }
                                                    }}
                                                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all cursor-pointer"
                                                    title={isArabic ? 'حذف الدور' : 'Delete Role'}
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
                        <div className={`rounded-3xl p-6 sm:p-8 space-y-4 border ${isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/[0.02] border-white/5'}`}>
                            <h2 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                                <span className="material-symbols-outlined text-[#8B5CF6]">person_search</span>
                                {isArabic ? 'ابحث عن موظف أو مستخدم لتخصيص صلاحياته:' : 'Search employee or user to customize permissions:'}
                            </h2>

                            <input
                                type="text"
                                placeholder={isArabic ? 'ابحث بالاسم أو رقم الجوال...' : 'Search by name or phone...'}
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                className={`w-full rounded-2xl px-4 py-3 text-xs font-bold outline-none border transition-colors ${
                                    isLight ? 'bg-white border-gray-300 text-gray-900 focus:border-[#5C24EB]' : 'bg-white/5 border-white/10 text-white focus:border-[#5C24EB]'
                                }`}
                            />

                            {!userSearch.trim() && (
                                <div className={`p-8 text-center border border-dashed rounded-2xl space-y-2 ${isLight ? 'bg-gray-50 border-gray-300' : 'bg-white/[0.01] border-white/10'}`}>
                                    <span className="material-symbols-outlined text-3xl text-gray-400 block">search</span>
                                    <p className={`text-xs font-bold ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                                        {isArabic ? 'اكتب اسم الشخص أو رقم الجوال في مربع البحث لعرض النتائج واختياره لتعديل صلاحياته.' : 'Type a name or phone number in search box to select user.'}
                                    </p>
                                </div>
                            )}

                            {Boolean(userSearch.trim()) && isLoadingUsers && (
                                <div className="flex justify-center py-6">
                                    <div className="w-6 h-6 border-2 border-[#5C24EB] border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}

                            {Boolean(userSearch.trim()) && !isLoadingUsers && usersList.length === 0 && (
                                <p className="text-xs text-amber-500 font-bold p-4 bg-amber-500/10 rounded-xl">
                                    {isArabic ? 'لم يتم العثور على مستخدمين يطابقون كلمة البحث.' : 'No users match your query.'}
                                </p>
                            )}

                            {Boolean(userSearch.trim()) && usersList.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                                    {usersList.map((u) => (
                                        <div
                                            key={u.id || u.uuid}
                                            onClick={() => handleSelectUserForEdit(u)}
                                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-xs font-bold ${selectedUser?.id === u.id || selectedUser?.uuid === u.uuid
                                                ? 'bg-[#5C24EB]/20 border-[#5C24EB] text-white shadow-lg'
                                                : isLight ? 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100' : 'bg-white/[0.02] border-white/5 text-gray-300 hover:bg-white/5'
                                                }`}
                                        >
                                            <div>
                                                <div className={`font-extrabold ${selectedUser?.id === u.id ? 'text-[#8B5CF6]' : isLight ? 'text-gray-900' : 'text-white'}`}>{u.full_name}</div>
                                                <div className="text-gray-400 font-mono text-[11px]">{u.phone}</div>
                                            </div>
                                            <span className={`text-[10px] px-2 py-0.5 rounded uppercase ${isLight ? 'bg-gray-200 text-gray-700' : 'bg-white/10 text-gray-400'}`}>
                                                {u.role || 'client'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedUser && (
                            <div className={`rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border ${isLight ? 'bg-white border-gray-200' : 'bg-white/[0.02] border-white/10'}`}>
                                <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 gap-4 ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
                                    <div>
                                        <h3 className={`text-xl font-extrabold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                                            {isArabic ? `تعديل صلاحيات المستخدم: ${selectedUser.full_name}` : `Edit Permissions: ${selectedUser.full_name}`}
                                        </h3>
                                        <p className="text-xs text-gray-400 font-mono mt-0.5">
                                            {isArabic ? 'رقم الهاتف:' : 'Phone:'} {selectedUser.phone}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <label className={`text-xs font-bold ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                                            {isArabic ? 'اختر الدور (Role):' : 'Select Role:'}
                                        </label>
                                        <select
                                            value={selectedRoleId}
                                            onChange={(e) => handleRoleSelectChange(e.target.value)}
                                            className={`rounded-xl px-3 py-2 text-xs font-bold outline-none border cursor-pointer ${
                                                isLight ? 'bg-white border-gray-300 text-gray-900 focus:border-[#5C24EB]' : 'bg-[#1a1a1a] border-white/10 text-white focus:border-[#5C24EB]'
                                            }`}
                                        >
                                            <option value="" className={isLight ? 'bg-white text-gray-900' : 'bg-[#0f0f0f] text-white'}>
                                                {isArabic ? 'بدون دور مخصص' : 'No Custom Role'}
                                            </option>
                                            {rolesList.map(r => (
                                                <option key={r.id} value={r.id} className={isLight ? 'bg-white text-gray-900' : 'bg-[#0f0f0f] text-white'}>{r.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Granular Checkbox Matrix */}
                                <div className="space-y-6">
                                    {PERMISSION_SECTIONS.map((sec, secIdx) => (
                                        <div key={secIdx} className={`p-4 rounded-2xl border space-y-3 ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/[0.02] border-white/5'}`}>
                                            <h4 className="text-xs font-bold text-[#8B5CF6] flex items-center gap-2 border-b pb-2">
                                                <span className="material-symbols-outlined text-sm">folder_open</span>
                                                {isArabic ? sec.titleAr : sec.titleEn}
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
                                                {sec.permissions.map((p) => {
                                                    const isChecked = Boolean(userPermissionsState[p.key]);
                                                    return (
                                                        <label
                                                            key={p.key}
                                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${isChecked ? 'bg-[#5C24EB]/15 border-[#5C24EB]/40 text-[#8B5CF6]' : isLight ? 'bg-white border-gray-200 text-gray-600' : 'bg-white/[0.02] border-white/5 text-gray-400'
                                                                }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={() => handleToggleUserPermission(p.key)}
                                                                className="w-4 h-4 accent-[#5C24EB] rounded cursor-pointer"
                                                            />
                                                            <span>{isArabic ? p.labelAr : p.labelEn}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className={`pt-4 border-t flex justify-end ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            saveUserPermissionsMutation.mutate({
                                                permissions: userPermissionsState,
                                                role_id: selectedRoleId || null
                                            });
                                        }}
                                        disabled={saveUserPermissionsMutation.isPending}
                                        className="px-6 py-3 bg-[#5C24EB] hover:bg-[#5C24EB]/90 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                                    >
                                        {saveUserPermissionsMutation.isPending && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                        {isArabic ? 'حفظ صلاحيات المستخدم المخصصة' : 'Save Custom Permissions'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Role Add/Edit Modal */}
            {isRoleModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-start justify-center pt-20 sm:pt-24 pb-6 px-4 sm:px-6 overflow-y-auto" dir={isArabic ? 'rtl' : 'ltr'}>
                    <div className={`rounded-3xl max-w-3xl w-full flex flex-col max-h-[calc(100vh-7rem)] relative shadow-2xl overflow-hidden my-auto border ${
                        isLight ? 'bg-white border-gray-200 text-gray-900' : 'bg-[#0f0f0f] border-white/10 text-white'
                    }`}>
                        
                        {/* Modal Header */}
                        <div className={`flex items-center justify-between border-b px-6 py-4 shrink-0 z-10 ${
                            isLight ? 'border-gray-200 bg-white' : 'border-white/10 bg-[#0f0f0f]'
                        }`}>
                            <h3 className={`text-lg font-extrabold flex items-center gap-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                                <span className="material-symbols-outlined text-[#8B5CF6]">badge</span>
                                {editingRole 
                                    ? (isArabic ? `تعديل الدور: ${editingRole.name}` : `Edit Role: ${editingRole.name}`)
                                    : (isArabic ? 'إضافة دور جديد في النظام (Role)' : 'Add New Role')}
                            </h3>
                            <button
                                type="button"
                                onClick={handleCloseRoleModal}
                                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                                    isLight ? 'bg-gray-100 hover:bg-gray-200 text-gray-600' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
                                }`}
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>

                        {/* Modal Form Body */}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (!roleForm.name) {
                                    toast.warning(isArabic ? 'اسم الدور مطلوب' : 'Role name is required');
                                    return;
                                }
                                saveRoleMutation.mutate(roleForm);
                            }}
                            className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-bold custom-scrollbar"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={`block mb-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                                        {isArabic ? 'اسم الدور (مثال: مدير فرع / مشرف فرع) *' : 'Role Name (e.g. Branch Manager) *'}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder={isArabic ? 'مثال: مدير فرع' : 'e.g. Branch Supervisor'}
                                        value={roleForm.name}
                                        onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                                        className={`w-full rounded-xl px-4 py-2.5 outline-none border transition-colors ${
                                            isLight ? 'bg-white border-gray-300 text-gray-900 focus:border-[#5C24EB]' : 'bg-white/5 border-white/10 text-white focus:border-[#5C24EB]'
                                        }`}
                                    />
                                </div>
                                <div>
                                    <label className={`block mb-1 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                                        {isArabic ? 'وصف مختصر للدور' : 'Role Description'}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder={isArabic ? 'صلاحيات العرض فقط بدون تعديل...' : 'View only permissions...'}
                                        value={roleForm.description}
                                        onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                                        className={`w-full rounded-xl px-4 py-2.5 outline-none border transition-colors ${
                                            isLight ? 'bg-white border-gray-300 text-gray-900 focus:border-[#5C24EB]' : 'bg-white/5 border-white/10 text-white focus:border-[#5C24EB]'
                                        }`}
                                    />
                                </div>
                            </div>

                            {/* Permissions Checkbox Grid */}
                            <div className="space-y-5">
                                <h4 className={`text-sm font-black flex items-center gap-2 border-b pb-2 ${isLight ? 'text-gray-900 border-gray-200' : 'text-white border-white/10'}`}>
                                    <span className="material-symbols-outlined text-[#8B5CF6]">checklist</span>
                                    {isArabic ? 'جدول جميع الصلاحيات في النظام:' : 'System Permissions Matrix:'}
                                </h4>

                                {PERMISSION_SECTIONS.map((sec, secIdx) => (
                                    <div key={secIdx} className={`p-4 rounded-2xl border space-y-3 ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/[0.02] border-white/5'}`}>
                                        <h5 className="text-xs font-bold text-[#8B5CF6]">
                                            {isArabic ? sec.titleAr : sec.titleEn}
                                        </h5>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                            {sec.permissions.map((p) => {
                                                const isChecked = Boolean(roleForm.permissions[p.key]);
                                                return (
                                                    <label
                                                        key={p.key}
                                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${isChecked ? 'bg-[#5C24EB]/15 border-[#5C24EB]/40 text-[#8B5CF6]' : isLight ? 'bg-white border-gray-200 text-gray-600' : 'bg-white/[0.02] border-white/5 text-gray-400'
                                                            }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => handleTogglePermission(p.key)}
                                                            className="w-4 h-4 accent-[#5C24EB] rounded cursor-pointer"
                                                        />
                                                        <span>{isArabic ? p.labelAr : p.labelEn}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Modal Footer */}
                            <div className={`pt-4 border-t flex justify-end gap-2 sticky bottom-0 pb-2 z-10 ${
                                isLight ? 'bg-white border-gray-200' : 'bg-[#0f0f0f] border-white/10'
                            }`}>
                                <button
                                    type="button"
                                    onClick={handleCloseRoleModal}
                                    className={`px-4 py-2 rounded-xl cursor-pointer ${
                                        isLight ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-white/5 hover:bg-white/10 text-gray-300'
                                    }`}
                                >
                                    {isArabic ? 'إلغاء' : 'Cancel'}
                                </button>
                                <button
                                    type="submit"
                                    disabled={saveRoleMutation.isPending}
                                    className="px-6 py-2.5 bg-[#5C24EB] hover:bg-[#5C24EB]/90 text-white rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                                >
                                    {saveRoleMutation.isPending && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                    {isArabic ? 'حفظ الدور والتغييرات' : 'Save Role'}
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
