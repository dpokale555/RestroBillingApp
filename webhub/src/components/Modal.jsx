import React from 'react';

// Modal receives an onClose function and the content via the 'children' prop
const Modal = ({ children, onClose }) => {
    // Handle background click to close the modal
    const handleBackdropClick = (e) => {
        // Only close if the click is directly on the background (not the modal content)
        if (e.target.id === 'modal-backdrop') {
            onClose();
        }
    };

    return (
        // Backdrop overlay (fixed to cover the entire viewport)
        <div 
            id="modal-backdrop"
            className="fixed inset-0 z-50 bg-gray-900 bg-opacity-50 flex items-center justify-center transition-opacity"
            onClick={handleBackdropClick}
        >
            {/* Modal Content Container */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 transform transition-all overflow-hidden">
                <div className="p-6 relative">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                        aria-label="Close modal"
                    >
                        &times; {/* HTML entity for 'X' */}
                    </button>
                    
                    {/* The content (UserForm) passed from App.jsx */}
                    {children} 
                </div>
            </div>
        </div>
    );
};

export default Modal;