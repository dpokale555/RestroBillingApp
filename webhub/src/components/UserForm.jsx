import React, { useState } from 'react';
// ⚠️ NOTE: You'll need to install and import the icon (e.g., from 'lucide-react' or similar icon library)
// If you don't have lucide-react installed, replace <Loader2 ... /> with a simple <span>Loading...</span>
// import { Loader2 } from 'lucide-react'; // Assuming you use an icon library for the spinner

// --- Configuration ---
const API_BASE_URL = 'http://localhost:3000/api';

// A simple placeholder for the Loader2 icon if you don't have an icon library
const Loader2 = ({ className, size }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);


// =================================================================
// ## Parent Component (Container for Logic)
// =================================================================

const ParentComponent = () => {
    const [isSaving, setIsSaving] = useState(false);
    // State for initialData can be managed here if you were implementing Edit functionality
    const initialUserData = null; // Set to null for creation mode

    // 💡 It's a good practice to handle API calls in the parent component
    // and pass the saving function down to the form.
    const handleSaveUser = async (userData) => {
        setIsSaving(true);
        try {
            // 1. Construct the data payload.
            // NOTE: The 'password' field will be present OR removed by the form's handleSubmit logic.
            const payload = {
                username: userData.username,
                password: userData.password, // 👈 CRITICAL FIX: Send the plain password
                first_name: userData.first_name,
                last_name: userData.last_name,
                role: userData.role
            };

            // 2. Determine the request details (POST for create, PUT/PATCH for update)
            const isEditMode = !!initialUserData;
            const method = isEditMode ? 'PUT' : 'POST';
            // Adjust the URL if you were doing an update (e.g., /Users/{id})
            const url = `${API_BASE_URL}/Users`;

            // 3. Perform the API request
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    // Include authorization headers (e.g., JWT) if required
                    // 'Authorization': `Bearer ${yourAuthToken}`
                },
                body: JSON.stringify(payload),
            });

            // 4. Handle non-OK response
            if (!response.ok) {
                let errorDetail = 'Unknown error';
                try {
                    // Try to read the error body as JSON
                    const errorData = await response.json();
                    errorDetail = errorData.message || JSON.stringify(errorData);
                } catch (e) {
                    // Fallback to status text if the response body isn't JSON
                    errorDetail = response.statusText || 'Non-JSON error response';
                }
                throw new Error(`Failed to save user: ${response.status} - ${errorDetail}`);
            }

            // 5. Success
            const savedUser = await response.json();
            console.log('User saved successfully:', savedUser);

            // You would typically call a function here to close the form/modal
            // or refresh a list of users.
            // closeModalOrRefreshList();

        } catch (error) {
            console.error('Error saving user:', error.message);
            // In a real app, you would show a user-friendly error message here
        } finally {
            setIsSaving(false);
        }
    };

    // Placeholder for a cancel handler
    const handleCancel = () => {
        console.log('Form submission cancelled.');
        // Logic to close modal or navigate away
    };

    // 6. Render the form
    return (
        <div className="p-8 max-w-lg mx-auto bg-white shadow-lg rounded-xl">
            <h2 className="text-2xl font-bold mb-6">{initialUserData ? 'Edit User' : 'Add New User'}</h2>
            <UserForm
                initialData={initialUserData}
                onSave={handleSaveUser}
                onCancel={handleCancel}
                isSaving={isSaving}
            />
        </div>
    );
};

// =================================================================
// --- Form Component (UI & Local State) ---
// =================================================================

const UserForm = ({ initialData, onSave, onCancel, isSaving }) => {
    // 💡 CRITICAL FIX: Changed 'password_hash' to 'password'
    const [user, setUser] = useState({
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'Staff',
        ...initialData
    });
    const isEdit = !!initialData;

    // Handle change for all inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // 1. Start with the current state data
        const dataToSend = { ...user };

        // 2. CRITICAL IMPROVEMENT: In edit mode, if the password field is left blank,
        // DO NOT send it to the API. This prevents accidentally overwriting the
        // existing password hash with an empty string.
        if (isEdit && dataToSend.password === '') {
            delete dataToSend.password;
        }

        // 3. Call the parent handler
        onSave(dataToSend);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4">
                {/* Username Input */}
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={user.username}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />

                {/* Password Input */}
                <input
                    type="password"
                    name="password" // 👈 CRITICAL FIX: Changed name to 'password'
                    placeholder={isEdit ? "New Password (leave blank to keep old)" : "Password (must be set)"}
                    value={user.password}
                    onChange={handleChange}
                    // Only require password if NOT in edit mode
                    required={!isEdit}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />

                {/* First Name Input */}
                <input
                    type="text"
                    name="first_name"
                    placeholder="First Name"
                    value={user.first_name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />

                {/* Last Name Input */}
                <input
                    type="text"
                    name="last_name"
                    placeholder="Last Name"
                    value={user.last_name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />

                {/* Role Select */}
                <select
                    name="role"
                    value={user.role}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
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
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-md disabled:bg-blue-400 flex items-center"
                >
                    {/* Display spinner when saving */}
                    {isSaving ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                    {isSaving ? (isEdit ? 'Updating...' : 'Adding...') : (isEdit ? 'Update User' : 'Add User')}
                </button>
            </div>
        </form>
    );
};

// Export the component(s)
export default UserForm;
// export { ParentComponent, UserForm }; // If you prefer named exports