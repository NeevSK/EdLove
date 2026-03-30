import React, { useEffect, useState } from 'react';
import { sectionsAPI, type SchoolSectionRow } from '../../sections';
import { SkeletonCard } from '@repo/ui';
import { ArrowLeft, Plus } from 'lucide-react-native';

interface HierarchyDashboardProps {
    schoolId: string;
    isPastView: boolean;
    onBack: () => void;
}

export const HierarchyDashboard: React.FC<HierarchyDashboardProps> = ({ schoolId, isPastView, onBack }) => {
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
        }
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
        }
    };

    return (
        <div
            <button >onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--glass-surface)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: '600', marginBottom: '24px' }}>
                <ArrowLeft size={14} /> Back to Dashboard
            </button>
            <h2 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: '800' }}>\uD83C\uDFDB\uFE0F System Hierarchy</h2
            <p style={{ margin: '0 0 24px', color: 'var(--ink-ghost)', fontSize: '14px' }}>Grades, sections and class structure for your school.</p
            
            <div className="sanctuary-card" style={{ padding: '24px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '14px', opacity: isPastView ? 0.6 : 1 }}
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)' }}>Add Section</h4
                ><div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}
                    <input 
                        value={newSectionGrade} 
                        onChange={e => setNewSectionGrade(e.target.value)} 
                        disabled={isPastView} 
                        placeholder="Grade (e.g. Grade 8)" 
                        style={{ flex: 1, minWidth: '140px', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '14px' }} 
                    /
                    ><input 
                        value={newSectionName} 
                        onChange={e => setNewSectionName(e.target.value)} 
                        disabled={isPastView} 
                        placeholder="Section name (e.g. 8A)" 
                        style={{ flex: 1, minWidth: '140px', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '14px' }} 
                    /
                    ><button 
                        onClick={handleCreateSection} 
                        disabled={!newSectionName.trim() || saving || isPastView} 
                        className="premium-button" 
                        style={{ background: 'var(--lotus)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    
                        {saving ? '\u23F3' : <><Plus size={14} /> Add</>}
                    </button>
                </div>
            </div>

            {loading ? <SkeletonCard /> : sections.length === 0 ? (
                <p style={{ color: 'var(--ink-ghost)', fontStyle: 'italic' }}>No sections yet \u2014 add one above.</p
            >) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}
                    {sections.map(s => (
                        <div key={s.id} className="sanctuary-card" style={{ padding: '18px 20px', borderLeft: '3px solid var(--lotus)' }}
                            <div style={{ fontWeight: '800', fontSize: '16px' }}>{s.name}</div
                            >{s.grade && <div style={{ fontSize: '12px', color: 'var(--ink-ghost)', marginTop: '4px' }}>{s.grade}</div>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export type { HierarchyDashboardProps };
