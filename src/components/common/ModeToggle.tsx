import React from 'react';
import { useMode } from '../../context/ModeContext';
import './ModeToggle.css';

export const ModeToggle: React.FC = () => {
    const { mode, toggleMode } = useMode();

    return (
        <div className="mode-toggle-container">
            <div
                className="mode-toggle-switch"
                onClick={toggleMode}
            >
                <div
                    className={`mode-toggle-background ${mode === 'Test' ? 'test-mode' : ''}`}
                />
                <div
                    className={`
                        mode-toggle-label 
                        edit-label 
                        ${mode === 'Edit' ? 'active' : 'inactive'}
                    `}
                >
                    Edit
                </div>
                <div
                    className={`
                        mode-toggle-label 
                        test-label 
                        ${mode === 'Test' ? 'active' : 'inactive'}
                    `}
                >
                    Test
                </div>
            </div>
        </div>
    );
};