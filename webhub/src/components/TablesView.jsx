

const TablesView = ({ tables, handleDataOperation, isAuthReady }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTable, setEditingTable] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Sort tables by number
    const sortedTables = useMemo(() => {
        return [...tables].sort((a, b) => (a.number || 0) - (b.number || 0));
    }, [tables]);


    // CRUD Operations (Mocked)
    const handleSave = async (tableData) => {
        setIsSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            if (editingTable) {
                handleDataOperation('UPDATE', 'tables', tableData);
            } else {
                handleDataOperation('CREATE', 'tables', { ...tableData, id: generateId('table') });
            }
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
            handleDataOperation('DELETE', 'tables', deleteTarget);
            setConfirmDelete(false);
            setDeleteTarget(null);
        } catch (error) {
            console.error("Error deleting table:", error);
        }
    };

    // Actions
    const startAdd = () => { setEditingTable(null); setIsModalOpen(true); };
    const startEdit = (table) => { setEditingTable(table); setIsModalOpen(true); };
    const startDelete = (table) => { setDeleteTarget(table); setConfirmDelete(true); };


    if (!isAuthReady) {
        return <LoaderState message="Loading application..." />;
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Restaurant Tables</h2>
                <button
                    onClick={startAdd}
                    className="px-4 py-2 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition flex items-center shadow-md"
                >
                    <Plus size={20} className="mr-1" /> Add New Table
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {sortedTables.length === 0 ? (
                    <p className="col-span-full text-center text-gray-500 py-4">No tables defined yet.</p>
                ) : (
                    sortedTables.map((table) => (
                        <div key={table.id} className="relative bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-lg transition duration-200">
                            <div className="flex justify-between items-start">
                                <h3 className="text-3xl font-bold text-gray-800 flex items-center">
                                    <Table size={24} className="mr-2 text-pink-500" />
                                    {table.number}
                                </h3>
                                {getTableStatusBadge(table.status)}
                            </div>
                            <p className="text-gray-600 mt-2 text-sm">Capacity: {table.capacity} seats</p>

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
export default TablesView;