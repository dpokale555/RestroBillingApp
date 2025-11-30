
const MenuItemsForm = ({ initialData, onSave, onCancel, isSaving }) => {
    const [item, setItem] = useState({
        name: '',
        price: 0,
        category: '',
        description: '',
        isAvailable: true,
        ...initialData
    });
    const isEdit = !!initialData;

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
                    value={item.price.toFixed(2)}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                    type="text"
                    name="category"
                    placeholder="Category (e.g., Appetizer, Main)"
                    value={item.category}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
                <textarea
                    name="description"
                    placeholder="Description"
                    value={item.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 col-span-2"
                />
                <div className="col-span-2 flex items-center">
                    <input
                        id="isAvailable"
                        type="checkbox"
                        name="isAvailable"
                        checked={item.isAvailable}
                        onChange={handleChange}
                        className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="isAvailable" className="ml-3 text-gray-700">Available</label>
                </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition" disabled={isSaving}>
                    Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-md disabled:bg-indigo-400 flex items-center">
                    {isSaving ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                    {isSaving ? (isEdit ? 'Updating...' : 'Adding...') : (isEdit ? 'Update Item' : 'Add Item')}
                </button>
            </div>
        </form>
    );
};

const TableForm = ({ initialData, onSave, onCancel, isSaving }) => {
    const [table, setTable] = useState({
        number: initialData?.number || 1,
        capacity: initialData?.capacity || 2,
        status: initialData?.status || 'Available',
        ...initialData
    });
    const isEdit = !!initialData;

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setTable(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 1 : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(table);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4">
                <div>
                    <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700">Table Number</label>
                    <input
                        id="tableNumber"
                        type="number"
                        name="number"
                        placeholder="Table Number (e.g., 1, 15)"
                        value={table.number}
                        onChange={handleChange}
                        required
                        min="1"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                    />
                </div>
                <div>
                    <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">Capacity</label>
                    <input
                        id="capacity"
                        type="number"
                        name="capacity"
                        placeholder="Capacity (Seats)"
                        value={table.capacity}
                        onChange={handleChange}
                        required
                        min="1"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                    />
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
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
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition shadow-md disabled:bg-pink-400 flex items-center">
                    {isSaving ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                    {isSaving ? (isEdit ? 'Updating...' : 'Adding...') : (isEdit ? 'Update Table' : 'Add Table')}
                </button>
            </div>
        </form>
    );
};
export default MenuItemsForm;