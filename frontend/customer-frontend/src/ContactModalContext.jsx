import React, { createContext, useState, useContext } from 'react';

const ContactModalContext = createContext();

export const useContactModal = () => {
    const context = useContext(ContactModalContext);
    if (!context) {
        throw new Error('useContactModal must be used within ContactModalProvider');
    }
    return context;
};

export const ContactModalProvider = ({ children }) => {
    const [modalState, setModalState] = useState({
        isOpen: false,
        userData: null,
        presetCategory: null,
        presetSubject: null
    });

    const [inlineFormState, setInlineFormState] = useState({
        isExpanded: false,
        userData: null,
        presetCategory: null,
        presetSubject: null
    });

    const openModal = (options = {}) => {
        setModalState({
            isOpen: true,
            userData: options.userData || null,
            presetCategory: options.presetCategory || null,
            presetSubject: options.presetSubject || null
        });
    };

    const closeModal = () => {
        setModalState(prev => ({ ...prev, isOpen: false }));
    };

    const toggleInlineForm = (options = {}) => {
        setInlineFormState(prev => {
            const isCurrentlyExpanded = prev.isExpanded;
            const newState = !isCurrentlyExpanded;
            
            if (newState) {
                // Opening the form
                return {
                    isExpanded: true,
                    userData: options.userData || null,
                    presetCategory: options.presetCategory || null,
                    presetSubject: options.presetSubject || null
                };
            } else {
                // Closing the form - keep user data for next open
                return {
                    ...prev,
                    isExpanded: false
                };
            }
        });
    };

    const closeInlineForm = () => {
        setInlineFormState(prev => ({ ...prev, isExpanded: false }));
    };

    const value = {
        // Modal state and functions
        isOpen: modalState.isOpen,
        userData: modalState.userData,
        presetCategory: modalState.presetCategory,
        presetSubject: modalState.presetSubject,
        openModal,
        closeModal,
        
        // Inline form state and functions
        isInlineExpanded: inlineFormState.isExpanded,
        inlineUserData: inlineFormState.userData,
        inlinePresetCategory: inlineFormState.presetCategory,
        inlinePresetSubject: inlineFormState.presetSubject,
        toggleInlineForm,
        closeInlineForm
    };

    return (
        <ContactModalContext.Provider value={value}>
            {children}
        </ContactModalContext.Provider>
    );
};