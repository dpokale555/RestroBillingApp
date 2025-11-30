
const UsersView = ({ users, handleDataOperation, isAuthReady }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // CRUD Operations (Mocked)
    const handleSave = async (userData) => {
        setIsSaving(true);
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const dataToSave = { ...userData };

            if (editingUser) {
                // Update: password_hash is ignored if empty during edit
                if (!dataToSave.password_hash) {
                    delete dataToSave.password_hash;
                }
                handleDataOperation('UPDATE', 'users', dataToSave);
            } else {
                // Create
                handleDataOperation('CREATE', 'users', { ...dataToSave, id: generateId('user') });
            }
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
            handleDataOperation('DELETE', 'users', deleteTarget);
            setConfirmDelete(false);
            setDeleteTarget(null);
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    // Actions
    const startAdd = () => { setEditingUser(null); setIsModalOpen(true); };
    const startEdit = (user) => {
        // Clear password_hash when starting edit for security, as we don't read it back
        setEditingUser({ ...user, password_hash: '' });
        setIsModalOpen(true);
    };
    const startDelete = (user) => { setDeleteTarget(user); setConfirmDelete(true); };

    if (!isAuthReady) {
        return <LoaderState message="Loading application..." />;
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Staff List</h2>
                <button
                    onClick={startAdd}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center shadow-md"
                >
                    <Plus size={20} className="mr-1" /> Add New Staff
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
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No staff users found.</td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.first_name} {user.last_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {getRoleBadge(user.role)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => startEdit(user)} className="text-blue-600 hover:text-blue-900 transition mr-3 p-1">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => startDelete(user)} className="text-red-600 hover:text-red-900 transition p-1">
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

export default UsersView;