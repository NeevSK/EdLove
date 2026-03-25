import { Plus, ScanLine } from 'lucide-react-native';
import { FeatureGuard } from '@repo/core';

export function TeacherPrimaryActions({ onCreateClassroom }: { onCreateClassroom: () => void }) {
    return (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <FeatureGuard action="create" subject="Classroom">
                <button 
                    className="premium-button" 
                    style={{ background: 'var(--sanctuary-saffron)', display: 'flex', alignItems: 'center', gap: '8px' }} 
                    onClick={onCreateClassroom}
                >
                    <Plus size={18} />
                    Create Classroom
                </button>
            </FeatureGuard>
            <FeatureGuard action="read" subject="Classroom">
                <button className="secondary-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ScanLine size={18} />
                    Scan QR
                </button>
            </FeatureGuard>
        </div>
    );
}
