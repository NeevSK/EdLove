import React from 'react';
import { ScanLine } from 'lucide-react-native';

export function ScanQRAction() {
    return (
        <button className="secondary-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ScanLine size={18} />
            Scan QR
        </button>
    );
}
