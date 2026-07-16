import { AnalyticsEngine as formAnalytics } from '@intuitui-labs/form-builder-engine/analytics';
import { exportToStaticReact } from '@intuitui-labs/form-builder-engine/codegen';
import { FormHydrator, type HydrationPayload } from '@intuitui-labs/form-builder-engine/hydration';
import type {
  FieldDefinition,
  FormResponse,
  FormSchema,
} from '@intuitui-labs/form-builder-engine/schema';
import { useThemedColors } from '@repo/ui/hooks';
import {
  ChartColumn,
  Clock,
  Download,
  Eye,
  GripVertical,
  PanelsTopLeft,
  Plus,
  Save,
  Settings2,
  Trash2,
} from '@repo/ui/icons';
import {
  Box,
  Button,
  ButtonText,
  FlatList,
  Heading,
  HStack,
  Icon,
  Input,
  InputField,
  Pressable,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import NativeForm from './NativeForm';
import { defaultFormBuilderServices, type FormBuilderServices } from './services';

interface FormBuilderProps {
  initialFields?: FieldDefinition[];
  onSave?: (fields: FieldDefinition[]) => void;
  onPublish?: (config: FormSchema) => void;
  onClose?: () => void;
  title?: string;
  description?: string;
  isGuest?: boolean;
  services?: Partial<FormBuilderServices>;
}
const FormFieldItem = memo(
  ({
    field,
    index,
    onRemove,
    onUpdate,
    colors,
  }: {
    field: FieldDefinition;
    index: number;
    onRemove: (id: string) => void;
    onUpdate: (id: string, updates: Partial<FieldDefinition>) => void;
    colors: ReturnType<typeof useThemedColors>;
  }) => {
    return (
      <Box className="p-6 bg-white rounded-3xl border border-border flex-row items-center gap-4 shadow-sm mb-4">
        <Icon as={GripVertical} color={colors.textTertiary} />

        <VStack className="flex-1 gap-1">
          <HStack className="justify-between">
            <Text
              className="text-[10px] font-extrabold tracking-widest"
              sx={{ color: Theme.colors.sanctuarySaffron }}
            >
              FIELD {index + 1} | {field.type.toUpperCase()}
            </Text>
            <Pressable onPress={() => onRemove(field.id)}>
              <Icon as={Trash2} color={Theme.colors.emberRed} size={18} />
            </Pressable>
          </HStack>

          <HStack className="gap-4 mt-3">
            <VStack className="flex-1 gap-2">
              <Text className="text-xs font-semibold">Label</Text>
              <Input className="h-12 rounded-xl bg-phase-surface border-border">
                <InputField
                  value={field.label}
                  onChangeText={(val) => onUpdate(field.id, { label: val })}
                  className="text-sm"
                />
              </Input>
            </VStack>
            <VStack className="flex-1 gap-2">
              <Text className="text-xs font-semibold">Type</Text>
              <Box className="h-12 rounded-xl bg-phase-surface border border-border px-3 justify-center">
                <Text className="text-sm capitalize">{field.type}</Text>
              </Box>
            </VStack>
          </HStack>
        </VStack>
      </Box>
    );
  },
);
export const FormBuilder = ({
  initialFields = [],
  onSave,
  onPublish,
  title = 'Institutional Form Builder',
  description = 'Design dignified, premium data collection experiences.',
  isGuest = false,
  services: servicesOverride,
}: FormBuilderProps) => {
  const colors = useThemedColors();
  const services = useMemo(
    () => ({ ...defaultFormBuilderServices, ...servicesOverride }),
    [servicesOverride],
  );
  const FeatureGate = services.featureGuard;
  const QRCodeGen = services.qrCodeGenerator;
  const [fields, setFields] = useState<FieldDefinition[]>(
    initialFields.length > 0
      ? initialFields
      : [
          {
            id: '1',
            name: 'studentName',
            label: 'Student Name',
            type: 'text',
            placeholder: 'Enter name',
            required: true,
          },
        ],
  );
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'logic' | 'analytics' | 'code'>('editor');
  const fieldCounterRef = useRef(0);
  const addField = useCallback(() => {
    const id = `f-${fieldCounterRef.current++}-${Date.now().toString(36)}`;
    setFields((prev) => [
      ...prev,
      {
        id,
        name: `field_${id}`,
        label: 'New Field',
        type: 'text',
        placeholder: 'Enter detail...',
        required: false,
      },
    ]);
  }, []);
  const removeField = useCallback((id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  }, []);
  const updateField = useCallback((id: string, updates: Partial<FieldDefinition>) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  }, []);
  const [isSaving, setIsSaving] = useState(false);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [isFetchingResponses, setIsFetchingResponses] = useState(false);
  // Inject print-friendly styles on web
  useEffect(() => {
    if (services.runtime.device.getMetadata().platform !== 'web') return;
    const styleId = 'form-builder-print-styles';
    if (typeof document === 'undefined') return;
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
  }, [services.runtime.device]);
  // Auto-save logic
  useEffect(() => {
    if (fields.length > 0) {
      services.storage.set(services.storageKeys.DRAFT_FORM, JSON.stringify(fields));
    }
  }, [fields, services]);

  // Restore draft on mount
  useEffect(() => {
    const saved = services.storage.getString(services.storageKeys.DRAFT_FORM);
    if (saved && fields.length <= 1) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // We could show a prompt, but for "Sovereign" resilience, we auto-restore
          // if the current state is empty/default.
          setFields(parsed);
        }
      } catch (e) {
        console.error('Failed to restore form draft:', e);
      }
    }
  }, [fields.length, services]);

  const fetchResponses = useCallback(async () => {
    setIsFetchingResponses(true);
    try {
      const data = await services.api.forms.getResponses(templateId!);
      setResponses(data);
    } catch (err) {
      console.error('Failed to fetch responses:', err);
    } finally {
      setIsFetchingResponses(false);
    }
  }, [services.api.forms, templateId]);

  useEffect(() => {
    if (activeTab === 'analytics' && templateId) {
      void fetchResponses();
    }
  }, [activeTab, templateId, fetchResponses]);
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
    if (services.runtime.device.getMetadata().platform === 'web') {
      window.print();
    }
  };
  const previewPayload = useMemo<HydrationPayload>(
    () => ({
      fields: fields.map((f) => ({
        name: f.name,
        type: f.type,
        label: f.label,
        placeholder: f.placeholder,
        validate: f.required ? 'nonEmpty' : undefined,
      })),
    }),
    [fields],
  );

  const previewManager = FormHydrator.hydrate(
    previewPayload,
    async (values: Record<string, unknown>) => {
      console.log('Form Submission Successful:', values);
    },
  );
  const handleAction = async (publish: boolean = false) => {
    setIsSaving(true);
    try {
      const ownerId = await services.api.identity.getMyInternalId();
      if (!ownerId && !isGuest) {
        throw new Error('You must be logged in to save forms.');
      }
      const payload: {
        owner_id: string | null;
        title: string;
        description: string;
        config: FieldDefinition[];
        is_published: boolean;
        slug?: string;
      } = {
        owner_id: ownerId,
        title: title,
        description: description,
        config: fields,
        is_published: publish,
      };
      if (publish && !templateId) {
        payload.slug = `form-${Date.now().toString(36)}-${fieldCounterRef.current++}`;
      }
      let result: { id: string };
      if (templateId) {
        result = await services.api.forms.update(templateId, payload);
      } else {
        result = await services.api.forms.create(payload);
        setTemplateId(result.id);
      }
      console.log(publish ? 'Form Published!' : 'Form Saved Successfully');
    } catch (err) {
      console.error('FormBuilder Save Error:', err);
    } finally {
      setIsSaving(false);
    }
  };
  const _handleSave = () => handleAction(false);
  const handlePublish = () => handleAction(true);
  return (
    <FeatureGate feature="isDevelopingFormBuilder">
      <VStack
        className="flex-1 self-center w-full max-w-[1200px] gap-8 p-10"
        sx={{ backgroundColor: colors.backgroundDark }}
      >
        {/* Header */}
        <HStack className="justify-between items-center">
          <VStack className="gap-1">
            <Heading size="xl">{title}</Heading>
            <Text className="text-sm" sx={{ color: colors.textSecondary }}>
              {description}
            </Text>
          </VStack>

          <HStack className="gap-3">
            <Button
              variant="outline"
              onPress={() => setPreviewMode(!previewMode)}
              className="rounded-xl"
            >
              <Icon as={previewMode ? PanelsTopLeft : Eye} className="mr-2" />
              <ButtonText>{previewMode ? 'Back to Editor' : 'Live Preview'}</ButtonText>
            </Button>
            <Button
              action="primary"
              onPress={() => void handlePublish()}
              isDisabled={isSaving}
              className="rounded-xl"
              sx={{ backgroundColor: Theme.colors.sanctuarySaffron }}
            >
              <Icon as={Save} color="white" className="mr-2" />
              <ButtonText>{isSaving ? 'Syncing...' : 'Save & Publish'}</ButtonText>
            </Button>
          </HStack>
        </HStack>

        {/* Sub-navigation */}
        {!previewMode && (
          <HStack className="gap-6 border-b border-border pb-3">
            {(['editor', 'logic', 'analytics', 'code'] as const).map((tab) => (
              <Pressable key={tab} onPress={() => setActiveTab(tab)}>
                <Text
                  className={`capitalize ${activeTab === tab ? 'font-bold' : 'font-normal'}`}
                  sx={{
                    color: activeTab === tab ? Theme.colors.sanctuarySaffron : colors.textSecondary,
                  }}
                >
                  {tab}
                </Text>
              </Pressable>
            ))}
          </HStack>
        )}

        {previewMode ? (
          <Box className="bg-white rounded-[32px] p-10 border border-border shadow-lg max-w-[600px] self-center w-full">
            <Heading size="md" className="mb-6 text-center">
              Real-time Preview
            </Heading>
            <NativeForm manager={previewManager} submitLabel="Register Interaction" />
          </Box>
        ) : activeTab === 'editor' ? (
          <HStack className="gap-8 flex-1">
            <VStack className="flex-[2]">
              <FlatList
                data={fields}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                  <FormFieldItem
                    field={item}
                    index={index}
                    onRemove={removeField}
                    onUpdate={updateField}
                    colors={colors}
                  />
                )}
                ListFooterComponent={
                  <Button
                    variant="outline"
                    action="secondary"
                    onPress={addField}
                    className="border-dashed h-[70px] rounded-3xl mt-4"
                    sx={{ borderColor: colors.border }}
                  >
                    <Icon as={Plus} className="mr-2" />
                    <ButtonText>Add Field to Repository</ButtonText>
                  </Button>
                }
                showsVerticalScrollIndicator={false}
              />
            </VStack>

            <VStack className="flex-1 gap-4">
              <Box className="bg-white rounded-3xl p-6 border border-border shadow-sm mb-4">
                <Heading size="sm" className="mb-4 text-center">
                  Live Preview
                </Heading>
                <NativeForm manager={previewManager} submitLabel="Test Submission" />
              </Box>

              <Box
                className="p-6 rounded-3xl border border-border"
                sx={{ backgroundColor: colors.tertiary }}
              >
                <HStack className="gap-2 items-center mb-5">
                  <Icon as={Settings2} size={20} color={colors.text} />
                  <Heading size="sm">Architecture Settings</Heading>
                </HStack>

                <VStack className="gap-4">
                  <VStack className="gap-2">
                    <Text className="text-xs font-semibold">Submission Strategy</Text>
                    <Text className="text-xs" sx={{ color: colors.textSecondary }}>
                      {isGuest
                        ? 'Unlock global sharing by creating an account.'
                        : 'Your forms are automatically synced to the Gurudevi cloud.'}
                    </Text>
                  </VStack>
                </VStack>
              </Box>
            </VStack>
          </HStack>
        ) : activeTab === 'logic' ? (
          <Box
            className="p-10 items-center justify-center rounded-[32px] border border-dashed border-border"
            sx={{ backgroundColor: colors.tertiary }}
          >
            <Icon as={Settings2} size={48} color={colors.textTertiary} />
            <Heading size="md" className="mt-4">
              Conditional Branching
            </Heading>
            <Text className="text-center max-w-[400px] mt-2" sx={{ color: colors.textSecondary }}>
              Soon you will be able to define complex logic flows (If-Then-Else) based on student
              and teacher resonance.
            </Text>
          </Box>
        ) : activeTab === 'code' ? (
          <Box className="bg-white rounded-[32px] p-8 border border-border shadow-lg flex-1">
            <HStack className="justify-between items-center mb-6">
              <Heading size="md">Generated React Component</Heading>
              <Button
                variant="outline"
                action="secondary"
                onPress={() => {
                  if (typeof navigator !== 'undefined') {
                    void navigator.clipboard.writeText(
                      exportToStaticReact(title, fields, description),
                    );
                  }
                }}
              >
                <ButtonText>Copy to Clipboard</ButtonText>
              </Button>
            </HStack>
            <Box className="bg-gray-50 p-6 rounded-2xl border border-gray-100 overflow-x-auto">
              <pre className="text-xs font-mono text-gray-800">
                {exportToStaticReact(title, fields, description)}
              </pre>
            </Box>
          </Box>
        ) : (
          <VStack className="gap-6 p-5">
            <HStack className="justify-between items-center">
              <VStack>
                <Heading size="md">Performance Dashboard</Heading>
                <Text sx={{ color: colors.textSecondary }}>
                  {responses.length} Resonance Submissions
                </Text>
              </VStack>
              <HStack className="gap-2">
                <Button variant="outline" action="secondary" onPress={handlePrintReport}>
                  <Icon as={PanelsTopLeft} className="mr-2" />
                  <ButtonText>Print Report</ButtonText>
                </Button>
                <Button
                  variant="outline"
                  action="secondary"
                  onPress={handleExportCSV}
                  isDisabled={responses.length === 0}
                >
                  <Icon as={Download} className="mr-2" />
                  <ButtonText>CSV</ButtonText>
                </Button>
                <Button
                  variant="outline"
                  action="primary"
                  onPress={handleExportXLSX}
                  isDisabled={responses.length === 0}
                  className="border-none"
                  sx={{ backgroundColor: Theme.colors.sageGreen }}
                >
                  <Icon as={Save} color="white" className="mr-2" />
                  <ButtonText>XLSX (Excel)</ButtonText>
                </Button>
              </HStack>
            </HStack>

            {templateId && (
              <Box
                className="no-print p-6 bg-white rounded-3xl border border-dashed flex-row items-center gap-6"
                sx={{ borderColor: Theme.colors.sanctuarySaffron }}
              >
                <Box className="w-[120px] h-[120px] bg-white p-2 rounded-xl border border-border">
                  <QRCodeGen
                    value={
                      services.getPublicFormUrl?.(templateId) ??
                      `${window.location.origin}/f/${templateId}`
                    }
                    size={104}
                    backgroundColor="white"
                    color={Theme.colors.obsidian}
                  />
                </Box>
                <VStack className="flex-1 gap-2">
                  <Heading size="sm">Physical Distribution</Heading>
                  <Text className="text-[13px]" sx={{ color: colors.textSecondary }}>
                    Display this QR in your classroom or institution for instant resonance
                    gathering.
                  </Text>
                  <Text
                    className="text-[11px] font-bold"
                    sx={{ color: Theme.colors.sanctuarySaffron }}
                  >
                    SHORT URL:{' '}
                    {services
                      .getPublicFormUrl?.(templateId)
                      ?.replace(templateId, templateId.substring(0, 8)) ??
                      `${window.location.origin}/f/${templateId.substring(0, 8)}`}
                  </Text>
                </VStack>
              </Box>
            )}

            {!templateId ? (
              <Box
                className="p-14 items-center rounded-[32px] border border-dashed border-border"
                sx={{ backgroundColor: colors.tertiary }}
              >
                <Icon as={Clock} size={48} color={colors.textTertiary} />
                <Heading size="sm" className="mt-4">
                  Awaiting Cloud Sync
                </Heading>
                <Text className="text-center mt-2" sx={{ color: colors.textSecondary }}>
                  Save your form to start collecting responses.
                </Text>
              </Box>
            ) : responses.length === 0 && !isFetchingResponses ? (
              <Box
                className="p-14 items-center rounded-[32px] border border-dashed border-border"
                sx={{ backgroundColor: colors.tertiary }}
              >
                <Icon as={ChartColumn} size={48} color={colors.textTertiary} />
                <Heading size="sm" className="mt-4">
                  Listening for Resonance...
                </Heading>
                <Text className="text-center mt-2" sx={{ color: colors.textSecondary }}>
                  Share your form to see real-time student insights.
                </Text>
              </Box>
            ) : (
              <VStack className="gap-5">
                {formAnalytics.aggregate(fields, responses).map((stat, i) => (
                  <Box
                    key={i}
                    className="analytics-card p-6 bg-white rounded-3xl border border-border"
                  >
                    <HStack className="justify-between mb-4">
                      <Heading size="xs">{stat.label}</Heading>
                      <Text className="text-[12px]" sx={{ color: colors.textTertiary }}>
                        {stat.type.toUpperCase()}
                      </Text>
                    </HStack>

                    {stat.type === 'select' ? (
                      <VStack className="gap-3">
                        {Object.entries(stat.data as Record<string, number>).map(
                          ([option, count]) => {
                            const percentage = (count / stat.totalResponses) * 100;
                            return (
                              <VStack key={option} className="gap-1">
                                <HStack className="justify-between">
                                  <Text className="text-[13px] font-medium">{option}</Text>
                                  <Text
                                    className="text-[12px]"
                                    sx={{ color: colors.textSecondary }}
                                  >
                                    {count} ({Math.round(percentage)}%)
                                  </Text>
                                </HStack>
                                <Box
                                  className="h-2 rounded-full overflow-hidden"
                                  sx={{ backgroundColor: colors.tertiary }}
                                >
                                  <Box
                                    className="h-full bg-sage-green"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </Box>
                              </VStack>
                            );
                          },
                        )}
                      </VStack>
                    ) : stat.type === 'number' ? (
                      <HStack className="gap-8">
                        <VStack>
                          <Text className="text-[12px]" sx={{ color: colors.textTertiary }}>
                            AVERAGE
                          </Text>
                          <Heading size="lg">
                            {(stat.data as { average: number }).average.toFixed(1)}
                          </Heading>
                        </VStack>
                        <VStack>
                          <Text className="text-[12px]" sx={{ color: colors.textTertiary }}>
                            RANGE
                          </Text>
                          <Text className="font-semibold">
                            {(stat.data as { min: number; max: number }).min} -{' '}
                            {(stat.data as { min: number; max: number }).max}
                          </Text>
                        </VStack>
                      </HStack>
                    ) : (
                      <VStack className="gap-2">
                        {((stat.data as string[]) ?? []).map((entry, idx) => (
                          <Box
                            key={idx}
                            className="p-3 rounded-xl"
                            sx={{ backgroundColor: colors.tertiary }}
                          >
                            <Text className="text-sm">{entry}</Text>
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
    </FeatureGate>
  );
};
