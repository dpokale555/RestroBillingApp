

const MenuItemsView = ({ items, handleDataOperation, isAuthReady }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // CRUD Operations (Mocked)
    const handleSave = async (itemData) => {
        setIsSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            if (editingItem) {
                handleDataOperation('UPDATE', 'menu_items', itemData);
            } else {
                handleDataOperation('CREATE', 'menu_items', { ...itemData, id: generateId('item') });
            }
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
            handleDataOperation('DELETE', 'menu_items', deleteTarget);
            setConfirmDelete(false);
            setDeleteTarget(null);
        } catch (error) {
            console.error("Error deleting menu item:", error);
        }
    };

    // Actions
    const startAdd = () => { setEditingItem(null); setIsModalOpen(true); };
    const startEdit = (item) => { setEditingItem(item); setIsModalOpen(true); };
    const startDelete = (item) => { setDeleteTarget(item); setConfirmDelete(true); };

    // Group items by category for display
    const groupedItems = useMemo(() => {
        return items.reduce((acc, item) => {
            const category = item.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        }, {});
    }, [items]);


    if (!isAuthReady) {
        return <LoaderState message="Loading application..." />;
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Menu Item List</h2>
                <button
                    onClick={startAdd}
                    className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition flex items-center shadow-md"
                >
                    <Plus size={20} className="mr-1" /> Add New Item
                </button>
            </div>

            {Object.keys(groupedItems).sort().map(category => (
                <div key={category} className="mb-8 border-b pb-4">
                    <h3 className="text-xl font-bold text-indigo-700 mb-4 sticky top-0 bg-white pt-2">{category}</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {groupedItems[category].map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {item.name}
                                            <p className="text-xs text-gray-500 truncate max-w-xs pt-1">{item.description}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">${parseFloat(item.price).toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {getAvailabilityBadge(item.isAvailable)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => startEdit(item)} className="text-indigo-600 hover:text-indigo-900 transition mr-3 p-1">
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => startDelete(item)} className="text-red-600 hover:text-red-900 transition p-1">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}

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
export default MenuItemsView;