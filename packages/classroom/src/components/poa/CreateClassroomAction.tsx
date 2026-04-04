import React from 'react';
import { Plus } from 'lucide-react-native';

export function CreateClassroomAction({ onCreateClassroom }: { onCreateClassroom: () => void }) {
    return (
        <button 
            className="premium-button" 
            style={{ background: 'var(--sanctuary-saffron)', display: 'flex', alignItems: 'center', gap: '8px' }} 
            onClick={onCreateClassroom}
        >
            <Plus size={18} />
            Create Classroom
        </button>
    );
}
