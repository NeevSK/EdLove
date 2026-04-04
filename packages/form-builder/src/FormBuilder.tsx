import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
    VStack, 
    HStack, 
    Box, 
    Button, 
    ButtonText, 
    Icon, 
    Input, 
    InputField, 
    Heading, 
    Text, 
    useThemedColors,
    Theme,
    SanctuaryToast
} from '@repo/ui';
import { Platform, StyleSheet, View, ScrollView, Modal } from 'react-native';
import { 
    Trash2, 
    Plus, 
    GripVertical, 
    Settings2, 
    Edit3, 
    Eye, 
    Download, 
    BarChart3, 
    Clock, 
    Layout, 
    Save,
    Settings,
    ChevronDown,
    ChevronUp,
    Share2,
    Maximize2,
    ArrowLeft,
    QrCode,
    Printer
} from 'lucide-react-native';
import { 
    api, 
    FormHydrator, 
    FormFieldConfig, 
    FormTemplate, 
    formAnalytics, 
    FormResponse, 
    FieldDefinition,
    FormManager
} from '@repo/core';
import { QRCodeGenerator } from '@repo/scanner-kit';
import NativeForm from './NativeForm';

interface FormBuilderProps {
    initialFields?: FieldDefinition[];
    onSave?: (fields: FieldDefinition[]) => void;
    onPublish?: (config: any) => void;
    title?: string;
    description?: string;
    isGuest?: boolean;
}

export const FormBuilder = ({
    initialFields = [],
    onSave,
    onPublish,
    title = "Institutional Form Builder",
    description = "Design dignified, premium data collection experiences.",
    isGuest = false
}: FormBuilderProps) => {
    const colors = useThemedColors();
    const [fields, setFields] = useState<FieldDefinition[]>(
        initialFields.length > 0 ? initialFields : [
            { id: '1', name: 'studentName', label: 'Student Name', type: 'text', placeholder: 'Enter name', required: true }
        ]
    );
    const [previewMode, setPreviewMode] = useState(false);
    const [activeTab, setActiveTab] = useState<'editor' | 'logic' | 'analytics'>('editor');

    const addField = () => {
        const id = Math.random().toString(36).substr(2, 9);
        setFields([...fields, { 
            id, 
            name: `field_${id}`, 
            label: 'New Field', 
            type: 'text', 
            placeholder: 'Enter detail...', 
            required: false 
        }]);
    };

    const removeField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
    };

    const updateField = (id: string, updates: Partial<FieldDefinition>) => {
        setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const formSchema: any = { fields: {} };
    fields.forEach(f => {
        formSchema.fields[f.name] = {
            label: f.label,
            type: f.type,
            placeholder: f.placeholder,
            required: f.required
        };
    });

    const [isSaving, setIsSaving] = useState(false);
    const [templateId, setTemplateId] = useState<string | null>(null);
    const [responses, setResponses] = useState<FormResponse[]>([]);
    const [isFetchingResponses, setIsFetchingResponses] = useState(false);

    // Inject print-friendly styles on web
    useEffect(() => {
        if (Platform.OS !== 'web') return;
        const styleId = 'form-builder-print-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            @media print {
                .no-print { display: none !important; }
                .print-only { display: block !important; }
                .analytics-card { 
                    border: 1px solid #eee !important;
                    break-inside: avoid;
                    margin-bottom: 20px !important;
                    box-shadow: none !important;
                }
                body { background: white !important; }
                .tab-content { padding: 0 !important; }
            }
        `;
        document.head.appendChild(style);
        return () => {
            const el = document.getElementById(styleId);
            if (el) el.remove();
        };
    }, []);

    useEffect(() => {
        if (activeTab === 'analytics' && templateId) {
            fetchResponses();
        }
    }, [activeTab, templateId]);

    const fetchResponses = async () => {
        setIsFetchingResponses(true);
        try {
            const data = await api.forms.getResponses(templateId!);
            setResponses(data);
        } catch (err) {
            console.error('Failed to fetch responses:', err);
        } finally {
            setIsFetchingResponses(false);
        }
    };

    const handleExportCSV = () => {
        const csv = formAnalytics.toCSV(fields, responses);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-responses.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleExportXLSX = () => {
        const xml = formAnalytics.toXLSX(fields, responses);
        const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-responses.xls`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handlePrintReport = () => {
        window.print();
    };

    const previewManager = FormHydrator.hydrate(formSchema, async (values) => {
        alert('Form Submission Successful: ' + JSON.stringify(values, null, 2));
    });

    const handleAction = async (publish: boolean = false) => {
        // - [x] Implementation (Phase 1: Shared Core)
        // - [x] Create `entity-protocol.ts` in `@repo/core`
        // - [x] Implement shared `useEntity` hook
        // - [x] Implementation (Phase 2: UI Parity)
        // - [x] Build `EntityModal.tsx` and `EntityModal.web.tsx`
        // - [x] Build mobile/web orchestrators for `EntityView`
        setIsSaving(true);
        try {
            const { api } = await import('@repo/core');
            const ownerId = await api.identity.getMyInternalId();
            
            if (!ownerId && !isGuest) {
                throw new Error('You must be logged in to save forms.');
            }

            const payload: any = {
                owner_id: ownerId,
                title: title,
                description: description,
                config: fields,
                is_published: publish,
            };

            if (publish && !templateId) {
                payload.slug = `form-${Math.random().toString(36).substr(2, 6)}`;
            }

            let result: any;
            if (templateId) {
                result = await api.forms.update(templateId, payload);
            } else {
                result = await api.forms.create(payload);
                setTemplateId(result.id);
            }

            if (publish) {
                onPublish?.(result);
                alert(`Form Published! Slug: ${result.slug}`);
            } else {
                onSave?.(result.config);
                alert('Form Saved Successfully');
            }
        } catch (err) {
            console.error('FormBuilder Save Error:', err);
            alert(err instanceof Error ? err.message : 'Failed to save form');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSave = () => handleAction(false);
    const handlePublish = () => handleAction(true);

    return (
        <VStack sx={{ 
            flex: 1, 
            backgroundColor: colors.backgroundDark, 
            padding: 40,
            maxWidth: 1200,
            alignSelf: 'center',
            width: '100%',
            gap: 32
        }}>
            {/* Header */}
            <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <VStack sx={{ gap: 4 }}>
                    <Heading size="xl">{title}</Heading>
                    <Text sx={{ color: colors.textSecondary }}>{description}</Text>
                </VStack>
                
                <HStack sx={{ gap: 12 }}>
                    <Button 
                        variant="outline" 
                        onPress={() => setPreviewMode(!previewMode)}
                        style={{ borderRadius: 12 }}
                    >
                        <Icon as={previewMode ? Layout : Eye} sx={{ marginRight: 8 }} />
                        <ButtonText>{previewMode ? 'Back to Editor' : 'Live Preview'}</ButtonText>
                    </Button>
                    <Button 
                        action="primary" 
                        onPress={handlePublish}
                        isDisabled={isSaving}
                        sx={{ backgroundColor: Theme.colors.sanctuarySaffron, borderRadius: 12 }}
                    >
                        <Icon as={Save} color="white" sx={{ marginRight: 8 }} />
                        <ButtonText>{isSaving ? 'Syncing...' : 'Save & Publish'}</ButtonText>
                    </Button>
                </HStack>
            </HStack>

            {/* Sub-navigation */}
            {!previewMode && (
                <HStack sx={{ gap: 24, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 12 }}>
                    {['editor', 'logic', 'analytics'].map((tab) => (
                        <TouchableOpacity key={tab} onPress={() => setActiveTab(tab as any)}>
                            <Text sx={{ 
                                fontWeight: activeTab === tab ? '700' : '400',
                                color: activeTab === tab ? Theme.colors.sanctuarySaffron : colors.textSecondary,
                                textTransform: 'capitalize'
                            }}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </HStack>
            )}

            {previewMode ? (
                <Box sx={{ 
                    backgroundColor: 'white', 
                    borderRadius: 32, 
                    padding: 40, 
                    borderWidth: 1, 
                    borderColor: colors.border,
                    ...Theme.shadows.lg,
                    maxWidth: 600,
                    alignSelf: 'center',
                    width: '100%'
                }}>
                    <Heading size="md" sx={{ marginBottom: 24, textAlign: 'center' }}>Real-time Preview</Heading>
                    <NativeForm manager={previewManager} submitLabel="Register Interaction" />
                </Box>
            ) : activeTab === 'editor' ? (
                <HStack sx={{ gap: 32, flex: 1 }}>
                    <VStack sx={{ flex: 2, gap: 16 }}>
                        {fields.map((field, index) => (
                            <Box 
                                key={field.id}
                                sx={{ 
                                    padding: 24, 
                                    backgroundColor: 'white', 
                                    borderRadius: 24, 
                                    borderWidth: 1, 
                                    borderColor: colors.border,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 16,
                                    ...Theme.shadows.sm
                                }}
                            >
                                <Icon as={GripVertical} color={colors.textTertiary} />
                                
                                <VStack sx={{ flex: 1, gap: 4 }}>
                                    <HStack sx={{ justifyContent: 'space-between' }}>
                                        <Text sx={{ fontSize: 10, fontWeight: '800', color: Theme.colors.sanctuarySaffron, letterSpacing: 1 }}>
                                            FIELD {index + 1} | {field.type.toUpperCase()}
                                        </Text>
                                        <TouchableOpacity onPress={() => removeField(field.id)}>
                                            <Icon as={Trash2} color={Theme.colors.emberRed} size={18} />
                                        </TouchableOpacity>
                                    </HStack>

                                    <HStack sx={{ gap: 16, marginTop: 12 }}>
                                        <VStack sx={{ flex: 1, gap: 6 }}>
                                            <Text sx={{ fontSize: 12, fontWeight: '600' }}>Label</Text>
                                            <input 
                                                value={field.label}
                                                onChange={(e) => updateField(field.id, { label: e.target.value })}
                                                style={{
                                                    padding: '12px 16px',
                                                    borderRadius: '12px',
                                                    border: `1px solid ${colors.border}`,
                                                    outline: 'none',
                                                    fontSize: '14px',
                                                    backgroundColor: colors.tertiary
                                                }}
                                            />
                                        </VStack>
                                        <VStack sx={{ flex: 1, gap: 6 }}>
                                            <Text sx={{ fontSize: 12, fontWeight: '600' }}>Type</Text>
                                            <select 
                                                value={field.type}
                                                onChange={(e) => updateField(field.id, { type: e.target.value as any })}
                                                style={{
                                                    padding: '12px 16px',
                                                    borderRadius: '12px',
                                                    border: `1px solid ${colors.border}`,
                                                    fontSize: '14px',
                                                    backgroundColor: colors.tertiary
                                                }}
                                            >
                                                <option value="text">Text</option>
                                                <option value="number">Number</option>
                                                <option value="email">Email</option>
                                                <option value="textarea">Long Text</option>
                                                <option value="select">Dropdown</option>
                                            </select>
                                        </VStack>
                                    </HStack>
                                </VStack>
                            </Box>
                        ))}

                        <Button 
                            variant="outline" 
                            action="secondary" 
                            onPress={addField}
                            sx={{ 
                                borderStyle: 'dashed', 
                                height: 70, 
                                borderRadius: 24,
                                borderColor: colors.border
                            }}
                        >
                            <Icon as={Plus} sx={{ marginRight: 8 }} />
                            <ButtonText>Add Field to Repository</ButtonText>
                        </Button>
                    </VStack>

                    <VStack sx={{ flex: 1, gap: 16 }}>
                        <Box sx={{ 
                            padding: 24, 
                            backgroundColor: colors.tertiary, 
                            borderRadius: 24,
                            borderWidth: 1,
                            borderColor: colors.border
                        }}>
                            <HStack sx={{ gap: 8, alignItems: 'center', marginBottom: 20 }}>
                                <Icon as={Settings2} size={20} color={colors.text} />
                                <Heading size="sm">Architecture Settings</Heading>
                            </HStack>
                            
                            <VStack sx={{ gap: 16 }}>
                                <VStack sx={{ gap: 8 }}>
                                    <Text sx={{ fontSize: 12, fontWeight: '600' }}>Submission Strategy</Text>
                                    <Text sx={{ fontSize: 12, color: colors.textSecondary }}>
                                        {isGuest ? 'Unlock global sharing by creating an account.' : 'Your forms are automatically synced to the Gurudevi cloud.'}
                                    </Text>
                                </VStack>
                            </VStack>
                        </Box>
                    </VStack>
                </HStack>
            ) : activeTab === 'logic' ? (
                <Box sx={{ padding: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.tertiary, borderRadius: 32, borderStyle: 'dashed', borderWidth: 1, borderColor: colors.border }}>
                    <Icon as={Settings2} size={48} color={colors.textTertiary} />
                    <Heading size="md" sx={{ marginTop: 16 }}>Conditional Branching</Heading>
                    <Text sx={{ textAlign: 'center', maxWidth: 400, marginTop: 8, color: colors.textSecondary }}>
                        Soon you will be able to define complex logic flows (If-Then-Else) based on student and teacher resonance.
                    </Text>
                </Box>
            ) : (
                <VStack sx={{ gap: 24, padding: 20 }}>
                    <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <VStack>
                            <Heading size="md">Performance Dashboard</Heading>
                            <Text sx={{ color: colors.textSecondary }}>{responses.length} Resonance Submissions</Text>
                        </VStack>
                        <HStack sx={{ gap: 8 }}>
                            <Button 
                                variant="outline" 
                                action="secondary" 
                                onPress={handlePrintReport}>
                                <Icon as={Layout} sx={{ marginRight: 8 }} />
                                <ButtonText>Print Report</ButtonText>
                            </Button>
                            <Button 
                                variant="outline" 
                                action="secondary" 
                                onPress={handleExportCSV}
                                isDisabled={responses.length === 0}>
                                <Icon as={Download} sx={{ marginRight: 8 }} />
                                <ButtonText>CSV</ButtonText>
                            </Button>
                            <Button 
                                variant="outline" 
                                action="primary" 
                                onPress={handleExportXLSX}
                                isDisabled={responses.length === 0}
                                sx={{ backgroundColor: Theme.colors.sageGreen, borderColor: Theme.colors.sageGreen }}
                            >
                                <Icon as={Save} color="white" sx={{ marginRight: 8 }} />
                                <ButtonText>XLSX (Excel)</ButtonText>
                            </Button>
                        </HStack>
                    </HStack>

                    {templateId && (
                        <Box 
                            // @ts-ignore
                            className="no-print" 
                            sx={{ 
                                padding: 24, 
                                backgroundColor: 'white', 
                                borderRadius: 24, 
                                borderWidth: 1, 
                                borderColor: Theme.colors.sanctuarySaffron,
                                borderStyle: 'dashed',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 24
                            }}>
                        
                            <Box sx={{ 
                                width: 120, 
                                height: 120, 
                                backgroundColor: 'white', 
                                padding: 8, 
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: colors.border
                            }}>
                                <QRCodeGenerator 
                                    value={`${window.location.origin}/f/${templateId}`} 
                                    size={104} 
                                    backgroundColor="white"
                                    color={Theme.colors.obsidian}
                                />
                            </Box>
                            <VStack sx={{ flex: 1, gap: 8 }}>
                                <Heading size="sm">Physical Distribution</Heading>
                                <Text sx={{ fontSize: 13, color: colors.textSecondary }}>
                                    Display this QR in your classroom or institution for instant resonance gathering.
                                </Text>
                                <Text sx={{ fontSize: 11, fontWeight: '700', color: Theme.colors.sanctuarySaffron }}>
                                    SHORT URL: {window.location.origin}/f/{templateId.substring(0, 8)}
                                </Text>
                            </VStack>
                        </Box>
                    )}

                    {!templateId ? (
                        <Box sx={{ padding: 60, alignItems: 'center', backgroundColor: colors.tertiary, borderRadius: 32, borderStyle: 'dashed', borderWidth: 1, borderColor: colors.border }}>
                            <Icon as={Clock} size={48} color={colors.textTertiary} />
                            <Heading size="sm" sx={{ marginTop: 16 }}>Awaiting Cloud Sync</Heading>
                            <Text sx={{ textAlign: 'center', marginTop: 8, color: colors.textSecondary }}>Save your form to start collecting responses.</Text>
                        </Box>
                    ) : responses.length === 0 && !isFetchingResponses ? (
                        <Box sx={{ padding: 60, alignItems: 'center', backgroundColor: colors.tertiary, borderRadius: 32, borderStyle: 'dashed', borderWidth: 1, borderColor: colors.border }}>
                            <Icon as={BarChart3} size={48} color={colors.textTertiary} />
                            <Heading size="sm" sx={{ marginTop: 16 }}>Listening for Resonance...</Heading>
                            <Text sx={{ textAlign: 'center', marginTop: 8, color: colors.textSecondary }}>Share your form to see real-time student insights.</Text>
                        </Box>
                    ) : (
                        <VStack sx={{ gap: 20 }}>
                            {formAnalytics.aggregate(fields, responses).map((stat, i) => (
                                <Box 
                                    key={i} 
                                    // @ts-ignore
                                    className="analytics-card" 
                                    sx={{ padding: 24, backgroundColor: 'white', borderRadius: 24, borderWidth: 1, borderColor: colors.border }}
                                >
                                    <HStack sx={{ justifyContent: 'space-between', marginBottom: 16 }}>
                                        <Heading size="xs">{stat.label}</Heading>
                                        <Text sx={{ fontSize: 12, color: colors.textTertiary }}>{stat.type.toUpperCase()}</Text>
                                    </HStack>

                                    {stat.type === 'select' ? (
                                        <VStack sx={{ gap: 12 }}>
                                            {Object.entries(stat.data).map(([option, count]: any) => {
                                                const percentage = (count / stat.totalResponses) * 100;
                                                return (
                                                    <VStack key={option} sx={{ gap: 4 }}>
                                                        <HStack sx={{ justifyContent: 'space-between' }}>
                                                            <Text sx={{ fontSize: 13, fontWeight: '500' }}>{option}</Text>
                                                            <Text sx={{ fontSize: 12, color: colors.textSecondary }}>{count} ({Math.round(percentage)}%)</Text>
                                                        </HStack>
                                                        <Box sx={{ height: 8, backgroundColor: colors.tertiary, borderRadius: 4, overflow: 'hidden' }}>
                                                            <Box sx={{ height: '100%', width: `${percentage}%`, backgroundColor: Theme.colors.sageGreen }} />
                                                        </Box>
                                                    </VStack>
                                                );
                                            })}
                                        </VStack>
                                    ) : stat.type === 'number' ? (
                                        <HStack sx={{ gap: 32 }}>
                                            <VStack>
                                                <Text sx={{ fontSize: 12, color: colors.textTertiary }}>AVERAGE</Text>
                                                <Heading size="lg">{stat.data.average.toFixed(1)}</Heading>
                                            </VStack>
                                            <VStack>
                                                <Text sx={{ fontSize: 12, color: colors.textTertiary }}>RANGE</Text>
                                                <Text sx={{ fontWeight: '600' }}>{stat.data.min} - {stat.data.max}</Text>
                                            </VStack>
                                        </HStack>
                                    ) : (
                                        <VStack sx={{ gap: 8 }}>
                                            {(stat.data as string[]).map((entry, idx) => (
                                                <Box key={idx} sx={{ padding: 12, backgroundColor: colors.tertiary, borderRadius: 12 }}>
                                                    <Text sx={{ fontSize: 13 }}>{entry}</Text>
                                                </Box>
                                            ))}
                                        </VStack>
                                    )}
                                </Box>
                            ))}
                        </VStack>
                    )}
                </VStack>
            )}
        </VStack>
    );
};

function TouchableOpacity({ children, onPress, style }: any) {
    return (
        <div onClick={onPress} style={{ cursor: 'pointer', ...style }}>
            {children}
        </div>
    );
}
