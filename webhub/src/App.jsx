import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Users, LayoutDashboard, Utensils, Table, Loader2, Edit, Trash2, Plus, X, AlertTriangle, CheckCircle, Clock, Menu } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3000/api';

// --- HELPER FUNCTIONS ---
//const generateId = (prefix = 'id') => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;

// --- MOCK DATABASE SETUP ---
// Simulate initial data structure
// const initialMockData = {
//     // Private user data (simulated with unique IDs)
//     users: [ 
//         { id: 'user-001', username: 'admin_user', first_name: 'Super', last_name: 'Admin', role: 'Admin' },
//         { id: 'user-002', username: 'manager_smith', first_name: 'Jane', last_name: 'Smith', role: 'Manager' },
//         { id: 'user-003', username: 'staff_alice', first_name: 'Alice', last_name: 'Brown', role: 'Staff' },
//     ],
//     // Public menu item data (using public ID concept)
//     menu_items: [
//         { id: 'item-001', name: 'Classic Burger', price: 12.99, category: 'Main Courses', description: 'Beef patty, lettuce, tomato, special sauce.', isAvailable: true },
//         { id: 'item-002', name: 'Caesar Salad', price: 8.50, category: 'Appetizers', description: 'Romaine, croutons, parmesan, Caesar dressing.', isAvailable: true },
//         { id: 'item-003', name: 'Fries', price: 3.50, category: 'Sides', description: 'Crispy golden fries.', isAvailable: true },
//         { id: 'item-004', name: 'Chocolate Lava Cake', price: 6.99, category: 'Desserts', description: 'Warm cake with a molten center.', isAvailable: true },
//     ],
//     // Public table data
//     tables: [
//         { id: 'table-101', number: 1, capacity: 4, status: 'Available' },
//         { id: 'table-102', number: 2, capacity: 2, status: 'Occupied' },
//         { id: 'table-103', number: 3, capacity: 6, status: 'Reserved' },
//     ],
// };




// --- CORE COMPONENTS & HELPERS ---

// A simple placeholder for the Loader2 icon if you don't have an icon library
const LoaderSpinner = ({ className, size }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

// Modal Component
const Modal = ({ children, onClose, isOpen, title }) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target.id === 'modal-backdrop') {
            onClose();
        }
    };

    return (
        <div 
            id="modal-backdrop"
            className="fixed inset-0 z-50 bg-gray-900 bg-opacity-75 flex items-center justify-center transition-opacity p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-auto transform transition-all scale-100 overflow-hidden">
                <div className="p-6 relative">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">{title}</h2>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-50"
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                    
                    {children} 
                </div>
            </div>
        </div>
    );
};

// ConfirmationDialog Component
const ConfirmationDialog = ({ message, onConfirm, onCancel, isOpen }) => {
    if (!isOpen) return null;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onCancel} 
            title="Confirm Action"
        >
            <div className="p-2">
                <div className="flex items-center space-x-3 mb-6">
                    <AlertTriangle className="text-yellow-500" size={24} />
                    <p className="text-gray-700">{message}</p>
                </div>
                
                <div className="flex justify-end space-x-3">
                    <button 
                        onClick={onCancel} 
                        className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition shadow-md"
                    >
                        Confirm Delete
                    </button>
                </div>
            </div>
        </Modal>
    );
};


// --- API UTILITY FUNCTION ---
const apiCall = async (endpoint, method = 'GET', data = null) => {
    const url = `${API_BASE_URL}/${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            // **NOTE:** Add Authorization header here if needed (e.g., JWT token)
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`, 
        },
    };

    if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            // Handle HTTP error codes (4xx, 5xx)
            const errorBody = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorBody.message || `HTTP error! Status: ${response.status}`);
        }
        
        // Handle case where API returns a 204 No Content
        if (response.status === 204) {
            return null; 
        }

        return await response.json();
    } catch (error) {
        console.error(`API Error on ${method} ${url}:`, error);
        throw error; // Re-throw to be handled by the caller (e.g., in a View component)
    }
};


// --- FORMS ---

// UserForm Component
const UserForm = ({ initialData, onSave, onCancel, isSaving }) => {
    const isEdit = !!initialData?.id;
    const [user, setUser] = useState(() => ({
        first_name: '',
        last_name: '',
        username: '',
        role: 'Staff',
        password_hash: '', // Only needed for creation or password reset
        ...initialData
    }));

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(user);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    type="text"
                    name="first_name"
                    placeholder="First Name"
                    value={user.first_name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
                <input
                    type="text"
                    name="last_name"
                    placeholder="Last Name"
                    value={user.last_name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={user.username}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white col-span-2"
                />
                <input
                    type="password"
                    name="password_hash"
                    placeholder={isEdit ? 'Leave blank to keep current password' : 'Password (Required for new user)'}
                    value={user.password_hash || ''}
                    onChange={handleChange}
                    required={!isEdit}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white col-span-2"
                />
                <select
                    id="role"
                    name="role"
                    value={user.role}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white col-span-2"
                >
                    <option value="Staff">Staff</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                </select>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
                <button 
                    type="button" 
                    onClick={onCancel} 
                    className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition" 
                    disabled={isSaving}
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={isSaving || !user.first_name || !user.last_name || !user.username || (!isEdit && !user.password_hash)} 
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-md disabled:bg-blue-400 flex items-center"
                >
                    {/* Display spinner when saving */}
                    {isSaving ? <LoaderSpinner className="animate-spin mr-2" size={18} /> : null}
                    {isSaving ? (isEdit ? 'Updating...' : 'Adding...') : (isEdit ? 'Update User' : 'Add User')}
                </button>
            </div>
        </form>
    );
};

// ItemForm Component
const ItemForm = ({ initialData, onSave, onCancel, isSaving }) => {
    const isEdit = !!initialData?.id;
    const [item, setItem] = useState(() => ({
        name: '',
        price: 0,
        category: '',
        description: '',
        isAvailable: true,
        ...initialData
    }));

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setItem(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (name === 'price' ? parseFloat(value) || 0 : value)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(item);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    type="text"
                    name="name"
                    placeholder="Item Name"
                    value={item.name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 col-span-2"
                />
                <input
                    type="number"
                    name="price"
                    placeholder="Price (e.g., 9.99)"
                    value={item.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
                 <input
                    type="text"
                    name="category"
                    placeholder="Category (e.g., Main Courses)"
                    value={item.category}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
                <textarea
                    name="description"
                    placeholder="Short Description"
                    value={item.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 col-span-2"
                />
                
                <div className="flex items-center mt-2 col-span-2">
                    <input
                        type="checkbox"
                        id="isAvailable"
                        name="isAvailable"
                        checked={item.isAvailable}
                        onChange={handleChange}
                        className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="isAvailable" className="ml-3 text-sm font-medium text-gray-700">
                        Available for order
                    </label>
                </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition" disabled={isSaving}>
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={isSaving || !item.name || !item.category} 
                    className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-md disabled:bg-indigo-400 flex items-center"
                >
                    {isSaving ? <LoaderSpinner className="animate-spin mr-2" size={18} /> : null}
                    {isSaving ? (isEdit ? 'Updating...' : 'Adding...') : (isEdit ? 'Update Item' : 'Add Item')}
                </button>
            </div>
        </form>
    );
};


// TableForm Component (based on ItemForm structure)
const TableForm = ({ initialData, onSave, onCancel, isSaving }) => {
    const isEdit = !!initialData?.id;
    const [table, setTable] = useState(() => ({
        number: 0,
        capacity: 2,
        status: 'Available',
        ...initialData
    }));

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setTable(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(table);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    type="number"
                    name="number"
                    placeholder="Table Number"
                    value={table.number}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                />
                <input
                    type="number"
                    name="capacity"
                    placeholder="Capacity (e.g., 4)"
                    value={table.capacity}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                />
                <div className="col-span-2">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                        id="status"
                        name="status"
                        value={table.status}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 bg-white"
                    >
                        <option value="Available">Available</option>
                        <option value="Occupied">Occupied</option>
                        <option value="Reserved">Reserved</option>
                        <option value="Cleaning">Cleaning</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition" disabled={isSaving}>
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={isSaving || !table.number || !table.capacity} 
                    className="px-4 py-2 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition shadow-md disabled:bg-pink-400 flex items-center"
                >
                    {isSaving ? <LoaderSpinner className="animate-spin mr-2" size={18} /> : null}
                    {isSaving ? (isEdit ? 'Updating...' : 'Adding...') : (isEdit ? 'Update Table' : 'Add Table')}
                </button>
            </div>
        </form>
    );
};


// --- VIEWS ---

// DashboardView Component
const DashboardView = ({ mockData }) => {
    const totalUsers = mockData.users.length;
    const totalMenuItems = mockData.menu_items.length;
    const totalTables = mockData.tables.length;
    const availableTables = mockData.tables.filter(t => t.status === 'Available').length;
    const occupiedTables = totalTables - availableTables;
    const availableItems = mockData.menu_items.filter(i => i.isAvailable).length;

    const statCards = [
        { label: "Total Staff", value: totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
        { label: "Total Menu Items", value: totalMenuItems, icon: Utensils, color: "text-indigo-500", bg: "bg-indigo-50" },
        { label: "Total Tables", value: totalTables, icon: Table, color: "text-pink-500", bg: "bg-pink-50" },
        { label: "Tables Occupied", value: occupiedTables, icon: Clock, color: "text-red-500", bg: "bg-red-50" },
        { label: "Items Available", value: availableItems, icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
        { label: "Available Tables", value: availableTables, icon: CheckCircle, color: "text-purple-500", bg: "bg-purple-50" },
    ];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((card, index) => (
                    <div key={index} className={`p-6 rounded-xl shadow-lg ${card.bg} border border-gray-100 transition-shadow hover:shadow-xl`}>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">{card.label}</span>
                            <card.icon size={24} className={card.color} />
                        </div>
                        <p className="mt-1 text-3xl font-bold text-gray-900">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Operational Status Overview</h2>
                <ul className="space-y-3">
                    <li className="flex justify-between items-center text-gray-700">
                        <span>Staff with Admin role:</span>
                        <span className="font-semibold text-blue-600">{mockData.users.filter(u => u.role === 'Admin').length}</span>
                    </li>
                    <li className="flex justify-between items-center text-gray-700">
                        <span>Table 1 Status:</span>
                        <span className="font-semibold text-red-600">{mockData.tables.find(t => t.number === 1)?.status || 'N/A'}</span>
                    </li>
                    <li className="flex justify-between items-center text-gray-700">
                        <span>Menu Items Unavailable:</span>
                        <span className="font-semibold text-orange-600">{mockData.menu_items.filter(i => !i.isAvailable).length}</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

// UsersView Component
const UsersView = ({ users, onSave, onDelete, isAuthReady }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const startEdit = (user) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const startDelete = (user) => {
        setDeleteTarget(user);
        setConfirmDelete(true);
    };

    // CRUD Operations (Mocked)
    const handleSave = async (userData) => {
        setIsSaving(true);
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const dataToSave = { ...userData };

            // if (editingUser) {
            //     // Update: password_hash is ignored if empty during edit
            //     if (!dataToSave.password_hash) {
            //         delete dataToSave.password_hash;
            //     }
            //     handleDataOperation('UPDATE', 'users', dataToSave);
            // } else {
            //     // Create
            //     handleDataOperation('CREATE', 'users', { ...dataToSave, id: generateId('user') });
            // }

            await onSave(userData);

            setEditingUser(null);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving user:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await new Promise(resolve => setTimeout(resolve, 300));

           // handleDataOperation('DELETE', 'users', deleteTarget);

            await onDelete(deleteTarget);

            setConfirmDelete(false);
            setDeleteTarget(null);
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    if (!isAuthReady) {
        return <div className="text-center p-8"><LoaderSpinner className="animate-spin mx-auto" size={32} /> Loading Users...</div>;
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-end mb-6">
                <button 
                    onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
                >
                    <Plus size={20} className="mr-2" /> Add New Staff
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">No staff members found.</td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.first_name} {user.last_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            user.role === 'Admin' ? 'bg-red-100 text-red-800' :
                                            user.role === 'Manager' ? 'bg-green-100 text-green-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end space-x-2">
                                        <button onClick={() => startEdit(user)} className="text-blue-600 hover:text-blue-900 transition p-1" title="Edit User">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => startDelete(user)} className="text-red-600 hover:text-red-900 transition p-1" title="Delete User">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                title={editingUser ? "Edit Staff Details" : "Add New Staff"}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                <UserForm
                    initialData={editingUser}
                    onSave={handleSave}
                    onCancel={() => setIsModalOpen(false)}
                    isSaving={isSaving}
                />
            </Modal>

            <ConfirmationDialog
                message={`Are you sure you want to delete staff member "${deleteTarget?.username}"? This action cannot be undone.`}
                onConfirm={handleDelete}
                onCancel={() => setConfirmDelete(false)}
                isOpen={confirmDelete}
            />
        </div>
    );
};

// MenuItemsView Component
const MenuItemsView = ({ items, onSave, onDelete, isAuthReady }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Group items by category for display
    const groupedItems = useMemo(() => {
        // FIX: Ensure 'items' is an array before calling reduce
        if (!items || !Array.isArray(items)) {
            return {};
        }

        return items.reduce((groups, item) => {
            const category = item.category || 'Uncategorized';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(item);
            return groups;
        }, {});
    }, [items]);

    const startEdit = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const startDelete = (item) => {
        setDeleteTarget(item);
        setConfirmDelete(true);
    };

    // CRUD Operations (Mocked)
    const handleSave = async (itemData) => {
        setIsSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            // if (editingItem) {
            //     handleDataOperation('UPDATE', 'menu_items', itemData);
            // } else {
            //     handleDataOperation('CREATE', 'menu_items', { ...itemData, id: generateId('item') });
            // }

            await onSave(itemData);

            setEditingItem(null);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving menu item:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
           // handleDataOperation('DELETE', 'menu_items', deleteTarget);

            await onDelete(deleteTarget);

            setConfirmDelete(false);
            setDeleteTarget(null);
        } catch (error) {
            console.error("Error deleting menu item:", error);
        }
    };

    if (!isAuthReady) {
        return <div className="text-center p-8"><LoaderSpinner className="animate-spin mx-auto" size={32} /> Loading Menu Items...</div>;
    }
    
    const categories = Object.keys(groupedItems).sort();

    return (
        <div className="space-y-8">
            <div className="flex justify-end">
                <button 
                    onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
                >
                    <Plus size={20} className="mr-2" /> Add Menu Item
                </button>
            </div>

            {categories.length === 0 && items?.length === 0 ? (
                <div className="text-center p-8 bg-white rounded-xl shadow-lg">No menu items defined. Click "Add Menu Item" to get started.</div>
            ) : (
                categories.map(category => (
                    <div key={category} className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2 text-indigo-700">{category}</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {groupedItems[category].map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{item.description}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{/* Safely parse price and display. Use 'N/A' if it's not a number > 0 */}${(parseFloat(item.price) || 0).toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {item.isAvailable ? 'Available' : 'Unavailable'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end space-x-2">
                                                <button onClick={() => startEdit(item)} className="text-indigo-600 hover:text-indigo-900 transition p-1" title="Edit Item">
                                                    <Edit size={18} />
                                                </button>
                                                <button onClick={() => startDelete(item)} className="text-red-600 hover:text-red-900 transition p-1" title="Delete Item">
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))
            )}

            <Modal
                title={editingItem ? "Edit Menu Item" : "Add New Menu Item"}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                <ItemForm
                    initialData={editingItem}
                    onSave={handleSave}
                    onCancel={() => setIsModalOpen(false)}
                    isSaving={isSaving}
                />
            </Modal>

            <ConfirmationDialog
                message={`Are you sure you want to delete item "${deleteTarget?.name}"? This action cannot be undone.`}
                onConfirm={handleDelete}
                onCancel={() => setConfirmDelete(false)}
                isOpen={confirmDelete}
            />
        </div>
    );
};

// TablesView Component
const TablesView = ({ tables, onSave, onDelete, isAuthReady }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTable, setEditingTable] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Sort tables by number
    const sortedTables = useMemo(() => {
        // Safe access check
        if (!tables || !Array.isArray(tables)) {
            return [];
        }
        return [...tables].sort((a, b) => (a.number || 0) - (b.number || 0));
    }, [tables]);


    const startEdit = (table) => {
        setEditingTable(table);
        setIsModalOpen(true);
    };

    const startDelete = (table) => {
        setDeleteTarget(table);
        setConfirmDelete(true);
    };

    // CRUD Operations (Mocked)
    const handleSave = async (tableData) => {
        setIsSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            // if (editingTable) {
            //     handleDataOperation('UPDATE', 'tables', tableData);
            // } else {
            //     handleDataOperation('CREATE', 'tables', { ...tableData, id: generateId('table') });
            // }

            await onSave(tableData);

            setEditingTable(null);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving table:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            //handleDataOperation('DELETE', 'tables', deleteTarget);
            
            await onDelete(deleteTarget);
            
            setConfirmDelete(false);
            setDeleteTarget(null);
        } catch (error) {
            console.error("Error deleting table:", error);
        }
    };

    if (!isAuthReady) {
        return <div className="text-center p-8"><LoaderSpinner className="animate-spin mx-auto" size={32} /> Loading Tables...</div>;
    }

    const statusClasses = {
        'Available': 'bg-green-100 text-green-800',
        'Occupied': 'bg-red-100 text-red-800',
        'Reserved': 'bg-yellow-100 text-yellow-800',
        'Cleaning': 'bg-blue-100 text-blue-800',
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button 
                    onClick={() => { setEditingTable(null); setIsModalOpen(true); }}
                    className="flex items-center px-4 py-2 bg-pink-600 text-white font-semibold rounded-lg shadow-md hover:bg-pink-700 transition"
                >
                    <Plus size={20} className="mr-2" /> Add New Table
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sortedTables.length === 0 ? (
                    <div className="col-span-full text-center p-8 bg-white rounded-xl shadow-lg text-gray-500">No tables defined.</div>
                ) : (
                    sortedTables.map((table) => (
                        <div key={table.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col justify-between transition-transform hover:scale-[1.02]">
                            <div>
                                <h3 className="text-3xl font-extrabold text-gray-900 mb-2">Table {table.number}</h3>
                                <p className="text-gray-500 mb-3">Capacity: <span className="font-semibold">{table.capacity} Guests</span></p>
                                <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${statusClasses[table.status] || 'bg-gray-100 text-gray-800'}`}>
                                    {table.status}
                                </span>
                            </div>
                            <div className="mt-4 flex justify-end space-x-2">
                                <button onClick={() => startEdit(table)} className="text-pink-600 hover:text-pink-800 transition p-1 rounded-full hover:bg-pink-50" title="Edit Table">
                                    <Edit size={18} />
                                </button>
                                <button onClick={() => startDelete(table)} className="text-red-600 hover:text-red-800 transition p-1 rounded-full hover:bg-red-50" title="Delete Table">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal
                title={editingTable ? "Edit Table Details" : "Add New Table"}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                <TableForm
                    initialData={editingTable}
                    onSave={handleSave}
                    onCancel={() => setIsModalOpen(false)}
                    isSaving={isSaving}
                />
            </Modal>

            <ConfirmationDialog
                message={`Are you sure you want to delete Table ${deleteTarget?.number}? This action cannot be undone.`}
                onConfirm={handleDelete}
                onCancel={() => setConfirmDelete(false)}
                isOpen={confirmDelete}
            />
        </div>
    );
};


// Sidebar Component (used inside App)
const Sidebar = ({ activeTab, setActiveTab, onSignOut }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'users', label: 'Staff Users', icon: Users },
        { id: 'menu-items', label: 'Menu Items', icon: Utensils },
        { id: 'tables', label: 'Tables', icon: Table },
    ];

    return (
        <div className="h-full flex flex-col bg-gray-800 text-white">
            <div className="p-6 border-b border-gray-700">
                <h2 className="text-3xl font-extrabold text-white tracking-wider">Restaurant Admin</h2>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 font-medium ${
                            activeTab === item.id 
                                ? 'bg-indigo-600 text-white shadow-lg' 
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                    >
                        <item.icon size={20} className="mr-3" />
                        {item.label}
                    </button>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={onSignOut}
                    className="w-full text-left flex items-center p-3 rounded-xl transition-all duration-200 text-red-300 hover:bg-gray-700 hover:text-red-400 font-medium"
                >
                    <X size={20} className="mr-3" /> Sign Out (Mock)
                </button>
            </div>
        </div>
    );
};


// --- MAIN APP COMPONENT ---

const App = () => {
    // --- Mock Firebase/Auth State ---
    const [isAuthReady, setIsAuthReady] = useState(true); // Simulate ready state
    //const [mockData, setMockData] = useState(initialMockData);

    const [users, setUsers] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [tables, setTables] = useState([]);

    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile menu

    const [isLoading, setIsLoading] = useState(true); // New state for overall loading

    // --- Mock Authentication Handlers ---
    const handleSignOut = () => {
        console.log("Mock Sign Out: User session ended.");
        // In a real app, you'd call Firebase signOut()
        // For this mock, we just log and stay put.
    };
    
    // // --- Mock CRUD Handler ---
    // const handleDataOperation = useCallback((operation, collectionName, data) => {
    //     setMockData(prevData => {
    //         const collection = prevData[collectionName] || [];
    //         let newCollection;

    //         switch (operation) {
    //             case 'CREATE':
    //                 newCollection = [...collection, data];
    //                 break;
    //             case 'UPDATE':
    //                 newCollection = collection.map(item => 
    //                     item.id === data.id ? { ...item, ...data } : item
    //                 );
    //                 break;
    //             case 'DELETE':
    //                 newCollection = collection.filter(item => item.id !== data.id);
    //                 break;
    //             default:
    //                 newCollection = collection;
    //         }

    //         console.log(`Mock Operation: ${operation} on ${collectionName}`, data);
    //         return { ...prevData, [collectionName]: newCollection };
    //     });
    // }, []);


//******User CRUD Helpers***********/
// Function to handle creating or updating a User
const saveUser = useCallback(async (user) => {
    const isEdit = !!user.id;
    const endpoint = isEdit ? `users/${user.id}` : 'users';
    const method = isEdit ? 'PUT' : 'POST'; // Assuming PUT/PATCH for update

    // API Call
    const savedUser = await apiCall(endpoint, method, user);
    
    // State Update
    setUsers(prev => {
        if (isEdit) {
            // Replace the old user data with the new, confirmed data from the server
            return prev.map(u => u.id === savedUser.id ? savedUser : u);
        } else {
            // Add the new user to the list
            return [...prev, savedUser];
        }
    });
}, []);

// Function to handle deleting a User
const deleteUser = useCallback(async (user) => {
    // API Call
    await apiCall(`users/${user.id}`, 'DELETE');
    
    // State Update
    setUsers(prev => prev.filter(u => u.id !== user.id));
}, []);


//******Menu Item CRUD Helpers***********/
// Function to handle creating or updating a Menu Item
const saveMenuItem = useCallback(async (item) => {
    const isEdit = !!item.id;
    const endpoint = isEdit ? `menu-items/${item.id}` : 'menu-items';
    const method = isEdit ? 'PUT' : 'POST';

    const savedItem = await apiCall(endpoint, method, item);
    
    setMenuItems(prev => {
        if (isEdit) {
            return prev.map(i => i.id === savedItem.id ? savedItem : i);
        } else {
            return [...prev, savedItem];
        }
    });
}, []);

// Function to handle deleting a Menu Item
const deleteMenuItem = useCallback(async (item) => {
    await apiCall(`menu-items/${item.id}`, 'DELETE');
    setMenuItems(prev => prev.filter(i => i.id !== item.id));
}, []);


//******Table CRUD Helpers***********/
// Function to handle creating or updating a Table
const saveTable = useCallback(async (table) => {
    const isEdit = !!table.id;
    const endpoint = isEdit ? `tables/${table.id}` : 'tables';
    const method = isEdit ? 'PUT' : 'POST';

    const savedTable = await apiCall(endpoint, method, table);
    
    setTables(prev => {
        if (isEdit) {
            return prev.map(t => t.id === savedTable.id ? savedTable : t);
        } else {
            return [...prev, savedTable];
        }
    });
}, []);

// Function to handle deleting a Table
const deleteTable = useCallback(async (table) => {
    await apiCall(`tables/${table.id}`, 'DELETE');
    setTables(prev => prev.filter(t => t.id !== table.id));
}, []);


useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch all data concurrently
            const [usersData, itemsData, tablesData] = await Promise.all([
                apiCall('users'),     // Assumes API endpoint is /api/users
                apiCall('items'), // Assumes API endpoint is /api/menu-items
                apiCall('tables'),    // Assumes API endpoint is /api/tables
            ]);

            // --- NEW Data Cleaning Step ---
            const parsedItemsData = itemsData.map(item => ({
            ...item,
    // Ensure price is a number, falling back to 0 if null/undefined/invalid string
            price: parseFloat(item.price) || 0
            }));
// --- END NEW Step ---

            setUsers(usersData);
            setMenuItems(parsedItemsData);
            setTables(tablesData);
        } catch (error) {
            console.error("Failed to fetch initial data:", error);
            // Handle error state (e.g., display a failure message)
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
}, []); // Empty dependency array means it runs once on mount

    // --- Content Renderer ---
    const renderContent = () => {
        // 1. ADD: Check for initial loading state
    if (isLoading) {
        return <div className="text-center p-8"><LoaderSpinner className="animate-spin mx-auto" size={32} /> Loading Application Data...</div>;
    }

        switch (activeTab) {
        case 'dashboard':
            // 2. UPDATE: Reconstruct the data object for DashboardView
            const aggregatedData = { users, menu_items: menuItems, tables };
            return <DashboardView mockData={aggregatedData} isAuthReady={isAuthReady} />;
        case 'users':
            // 3. UPDATE: Pass users and the new specific handlers
            return <UsersView 
                users={users} 
                onSave={saveUser} 
                onDelete={deleteUser} 
                isAuthReady={isAuthReady} 
            />;
        case 'menu-items':
            // 4. UPDATE: Pass menuItems and the new specific handlers
            return <MenuItemsView 
                items={menuItems} 
                onSave={saveMenuItem} 
                onDelete={deleteMenuItem} 
                isAuthReady={isAuthReady} 
            />;
        case 'tables':
            // 5. UPDATE: Pass tables and the new specific handlers
            return <TablesView 
                tables={tables} 
                onSave={saveTable} 
                onDelete={deleteTable} 
                isAuthReady={isAuthReady} 
            />;
        default:
            return <div className="text-gray-500 p-8">Select a navigation item from the sidebar.</div>;
    }
};

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'users', label: 'Staff Users', icon: Users },
        { id: 'menu-items', label: 'Menu Items', icon: Utensils },
        { id: 'tables', label: 'Tables', icon: Table },
    ];

    return (
        <div className="flex h-screen bg-gray-50 font-sans antialiased">
            
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex lg:w-64 flex-shrink-0">
                <Sidebar 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab} 
                    onSignOut={handleSignOut}
                />
            </div>

            {/* Mobile Sidebar (Modal/Overlay) */}
            {isSidebarOpen && (
                 <div 
                    className="fixed inset-0 z-40 bg-gray-900 bg-opacity-75 lg:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                 >
                     <div className="fixed inset-y-0 left-0 w-64 bg-gray-800 transform translate-x-0 transition-transform duration-300" onClick={(e) => e.stopPropagation()}>
                         <Sidebar 
                            activeTab={activeTab} 
                            setActiveTab={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); }}
                            onSignOut={handleSignOut}
                         />
                     </div>
                 </div>
             )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="bg-white shadow-md p-4 flex justify-between items-center lg:hidden z-20">
                    <h1 className="text-xl font-bold text-gray-800">
                        {activeTab === 'dashboard' ? 'Dashboard' : navItems.find(i => i.id === activeTab)?.label}
                    </h1>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
                        aria-label="Open menu"
                    >
                        <Menu size={24} />
                    </button>
                </header>
                
                {/* Desktop Content Header */}
                <div className="hidden lg:block bg-white shadow-sm p-6 border-b border-gray-100 z-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 capitalize">
                        {activeTab === 'dashboard' ? 'Dashboard' : navItems.find(i => i.id === activeTab)?.label}
                    </h1>
                    {/* <p className="text-gray-500 mt-1">
                        Management running on **In-Memory Mock Data**. Full CRUD functionality is simulated locally.
                    </p>  */}
                </div>


                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {/* Content is rendered here based on activeTab */}
                    {renderContent()}
                </main>
            </div>

        </div>
    );
};

export default App;