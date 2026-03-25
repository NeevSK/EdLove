import React from 'react';
import { ClipboardList } from 'lucide-react-native';

export function MyEchoesAction() {
    return (
        <button className="secondary-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardList size={18} />
            My Echoes
        </button>
    );
}
