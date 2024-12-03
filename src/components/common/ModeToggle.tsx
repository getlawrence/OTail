import React from 'react';
import { useMode } from '../../context/ModeContext';
import './ThemeToggle.css';

export const ModeToggle: React.FC = () => {
    const { mode, toggleMode } = useMode();

    return (
        <button
            className="mode-toggle"
            onClick={toggleMode}
            aria-label={`Switch to ${mode === 'Edit' ? 'Test' : 'Edit'} mode`}
        >
            {mode === 'Edit' ? 'Test' : 'Edit'}
        </button>
    );
}; 