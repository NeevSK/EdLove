import React, { useEffect, useState } from 'react';
import { Icon, sectionsAPI, type SchoolSectionRow } from '../../sections';
import { SkeletonCard } from '@repo/ui';
import { ArrowLeft, Plus } from 'lucide-react-native';

interface HierarchyDashboardProps {
    schoolId: string;
    isPastView: boolean;
    onBack: () => void;
}

export const HierarchyDashboard: React.FC<HierarchyDashboardProps> = { { schoolId, isPastView, onBack }) => {
    const [sections, setSections] = useState<SchoolSectionRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newSectionName, setNewSectionName] = useState('');
    const [newSectionGrade, setNewSectionGrade] = useState('');

    const loadSections = async () => {
        if (!schoolId) return;
        setLoading(true);
        try {
            const data = await sectionsAPI.listSchoolSections(schoolId);
            setSections(data ?? []);
        } finally {
            setLoading(false);
        };

    useEffect(() => {
        loadSections();
    }, [schoolId]);

    const handleCreateSection = async () => {
        if (!newSectionName.trim()) return;
        setSaving(true);
        try {
            const data = await sectionsAPI.createSchoolSection({
                schoolId,
                name: newSectionName,
                grade: newSectionGrade
            });
            setSections(prev => [...prev, data]);
            setNewSectionName(''); 
            setNewSectionGrade('');
        } finally {
            setSaving(false);
        };

    return (
        <div>
            <button 
                onClick={onBack} 
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8, 
                    padding: '8px 14px', 
                    borderRadius: 10, 
                    border: '1px solid var(--border)', 
                    background: 'var(--glass-surface)', 
                    cursor: 'pointer', 
                    fontFamily: 'var(--font-body)', 
                    fontSize: 13, 
                    fontWeight: '600', 
                    marginBottom: 24 
                }}
            >
                <Icon as={ArrowLeft} size={14} /> Back to Dashboard
            </button>
            
            <h2 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: '800' }}>🏛️ System Hierarchy</h2>
            <p style={{ margin: '0 0 24px', color: 'var(--ink-ghost)', fontSize: 14 }}>
                Grades, sections and class structure for your school.
            </p>
            
            <div className="sanctuary-card" style={{ padding: 24, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 14, opacity: isPastView ? 0.6 : 1 }}>
                <h4 style={{ margin: 0, fontSize: 13, fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)' }}>
                    Add Section
                </h4>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <input 
                        value={newSectionGrade} 
                        onChange={e => setNewSectionGrade(e.target.value)} 
                        disabled={isPastView} 
                        placeholder="Grade (e.g. Grade 8)" 
                        style={{ flex: 1, minWidth: 140, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: 14 }} 
                    />
                    <input 
                        value={newSectionName} 
                        onChange={e => setNewSectionName(e.target.value)} 
                        disabled={isPastView} 
                        placeholder="Section name (e.g. 8A)" 
                        style={{ flex: 1, minWidth: 140, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: 14 }} 
                    />
                    <button 
                        onClick={handleCreateSection} 
                        disabled={!newSectionName.trim() || saving || isPastView} 
                        className="premium-button" 
                        style={{ background: 'var(--lotus)', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                        {saving ? '⏳' : <><Icon as={Plus} size={14} /> Add</>}
                    </button>
                </div>
            </div>

            {loading ? <SkeletonCard /> : sections.length === 0 ? (
                <p style={{ color: 'var(--ink-ghost)', fontStyle: 'italic' }}>
                    No sections yet — add one above.
                </p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                    {sections.map(s => (
                        <div key={s.id} className="sanctuary-card" style={{ padding: '18px 20px', borderLeft: '3px solid var(--lotus)' }}>
                            <div style={{ fontWeight: '800', fontSize: 16 }}>{s.name}</div>
                            {s.grade && <div style={{ fontSize: 12, color: 'var(--ink-ghost)', marginTop: 4 }}>{s.grade}</div>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export type { HierarchyDashboardProps };
