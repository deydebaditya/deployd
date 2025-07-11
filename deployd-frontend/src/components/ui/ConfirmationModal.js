import React from 'react';
import Modal from './Modal';
import Button from './Button';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
                <div className="mt-4 text-slate-600 dark:text-slate-400">
                    {children}
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="destructive" onClick={onConfirm}>Confirm</Button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmationModal;
