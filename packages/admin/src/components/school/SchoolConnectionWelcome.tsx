import { useState } from 'react';
import { ScrollView, Share, TouchableOpacity, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { QRBuilder } from '@repo/core/logic/utils/QRBuilder';
import type { SchoolLevel } from '@repo/core/logic/schemas/school.schema';
import {
  Button,
  Section,
  Surface,
  Text,
  TextField,
  WaitingSign,
} from '@repo/ui/components/native';
import {
  ArrowLeft,
  Building2,
  CircleCheck,
  Compass,
  GraduationCap,
  School,
  Sparkles,
} from '@repo/ui/icons';
import QRCodeGenerator from '@repo/ui/qr/QRCodeGenerator';
import { createSchoolProvisioningActor } from '../../machines/schoolProvisioningMachine';
import type { ProvisionSchoolResult } from '../../machines/schoolProvisioningMachine';

export interface SchoolConnectionWelcomeProps {
  readonly message?: string;
  readonly onConnectRegistry?: () => void;
  readonly onReturnPersonal?: () => void;
  readonly onContactSupport?: () => void;
  readonly onProvisioned?: (result: ProvisionSchoolResult) => void;
}

const SCHOOL_LEVEL_OPTIONS: { label: string; value: SchoolLevel }[] = [
  { label: 'Pre-School / Early Learning', value: 'pre_school' },
  { label: 'Primary School (Grades 1-5)', value: 'primary' },
  { label: 'Secondary School (Grades 6-11)', value: 'secondary' },
  { label: 'Collegiate / A-Levels', value: 'collegiate' },
  { label: 'K-12 Comprehensive School', value: 'k12' },
  { label: 'Tuition Institute / Academy', value: 'tuition_center' },
  { label: 'Higher Education / College', value: 'higher_ed' },
  { label: 'Vocational / Technical', value: 'vocational' },
  { label: 'Learning Sanctuary / Studio', value: 'sanctuary' },
];

export function SchoolConnectionWelcome({
  message,
  onConnectRegistry,
  onReturnPersonal,
  onContactSupport,
  onProvisioned,
}: SchoolConnectionWelcomeProps) {
  const [mode, setMode] = useState<'overview' | 'establish' | 'success'>('overview');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [selectedType, setSelectedType] = useState<SchoolLevel>('k12');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [provisionResult, setProvisionResult] = useState<ProvisionSchoolResult | null>(null);

  const handleNameChange = (text: string) => {
    setName(text);
    // Auto-slug handle if user hasn't explicitly customized it
    const slug = text.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '');
    setHandle(slug);
  };

  const handleStartEstablishment = () => {
    setFormError(null);
    setMode('establish');
  };

  const handleSubmitEstablishment = async () => {
    if (!name.trim()) {
      setFormError('Please enter an institution name.');
      return;
    }
    if (!handle.trim()) {
      setFormError('Please enter a unique URL handle.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const actor = createSchoolProvisioningActor({
        name: name.trim(),
        handle: handle.trim(),
        type: selectedType,
      });

      actor.subscribe((snapshot) => {
        if (snapshot.matches('activated')) {
          const res: ProvisionSchoolResult = {
            schoolId: snapshot.context.schoolId ?? '',
            groupId: snapshot.context.groupId ?? undefined,
            groupFailed: snapshot.context.groupCreationFailed,
          };
          setProvisionResult(res);
          setSubmitting(false);
          setMode('success');
          onProvisioned?.(res);
        } else if (snapshot.matches('error')) {
          setSubmitting(false);
          setFormError(snapshot.context.error ?? 'Provisioning failed. Please try again.');
        } else if (
          snapshot.matches('details') &&
          snapshot.context.error &&
          snapshot.context.error.includes('already claimed')
        ) {
          setSubmitting(false);
          setFormError(snapshot.context.error);
        }
      });

      actor.send({ type: 'SUBMIT' });
    } catch (err) {
      setSubmitting(false);
      setFormError(err instanceof Error ? err.message : 'School creation could not be completed.');
    }
  };

  const handleCopyLink = async (qrUrl: string) => {
    try {
      await Clipboard.setStringAsync(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Non-fatal
    }
  };

  const handleShareFlyer = async (qrUrl: string) => {
    try {
      await Share.share({
        title: `${name} on Gurudevi`,
        message: `Connect with ${name} (@${handle}) on Gurudevi Sanctuary: ${qrUrl}`,
        url: qrUrl,
      });
    } catch {
      await handleCopyLink(qrUrl);
    }
  };

  if (mode === 'success' && provisionResult) {
    const qrUrl = QRBuilder.school(
      provisionResult.schoolId,
      provisionResult.groupId ?? '',
      handle,
    );

    return (
      <ScrollView contentContainerStyle={{ padding: 24, gap: 20 }}>
        {/* Established Header */}
        <Surface tone="raised" style={{ padding: 24, borderRadius: 16 }}>
          <View style={{ alignItems: 'center', gap: 12, paddingVertical: 12 }}>
            <CircleCheck size={44} color="#059669" />
            <Text kind="title">Institution Established</Text>
            <Text kind="body" tone="soft" style={{ textAlign: 'center' }}>
              {name} is active with sovereign ReBAC principal authority and community hub.
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <View
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                  borderRadius: 12,
                  backgroundColor: 'rgba(37,99,235,0.1)',
                }}
              >
                <Text kind="label" style={{ color: '#2563eb', fontWeight: '600' }}>
                  @{handle}
                </Text>
              </View>
              <View
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                  borderRadius: 12,
                  backgroundColor: 'rgba(5,150,105,0.1)',
                }}
              >
                <Text kind="label" style={{ color: '#059669', fontWeight: '600' }}>
                  {selectedType.toUpperCase().replace('_', ' ')}
                </Text>
              </View>
            </View>
          </View>
        </Surface>

        {/* QR Code Presentation Card */}
        <Surface tone="raised" style={{ padding: 20, borderRadius: 16, alignItems: 'center', gap: 16 }}>
          <Text kind="title" style={{ fontSize: 16 }}>School QR Code & Enrollment</Text>
          <Text kind="caption" tone="soft" style={{ textAlign: 'center' }}>
            Faculty, students, and parents can scan this code to join the school sanctuary and community HQ.
          </Text>

          <View
            style={{
              padding: 16,
              borderRadius: 20,
              backgroundColor: '#ffffff',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.08)',
            }}
          >
            <QRCodeGenerator
              value={qrUrl}
              size={180}
              errorCorrectionLevel="M"
              label={name}
              color="#131e27"
              backgroundColor="#ffffff"
              showLotus={true}
            />
          </View>

          {/* Action Row */}
          <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
            <View style={{ flex: 1 }}>
              <Button
                variant="secondary"
                label={copied ? 'Link Copied!' : 'Copy Link'}
                onPress={() => handleCopyLink(qrUrl)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                variant="secondary"
                label="Share Flyer"
                onPress={() => handleShareFlyer(qrUrl)}
              />
            </View>
          </View>
        </Surface>

        {/* Primary Navigation */}
        <Button
          variant="primary"
          onPress={() => onProvisioned?.(provisionResult)}
          label="Enter Workspace"
        />
      </ScrollView>
    );
  }

  if (mode === 'establish') {
    return (
      <ScrollView contentContainerStyle={{ padding: 24, gap: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => setMode('overview')} accessibilityRole="button">
            <ArrowLeft size={24} />
          </TouchableOpacity>
          <Text kind="title">Establish Institution</Text>
        </View>

        <Text kind="body" tone="soft">
          Provision an independent school, collegiate institute, pre-school, or learning studio
          with sovereign ReBAC authority and community hub.
        </Text>

        <Surface tone="raised" style={{ padding: 16, gap: 16, borderRadius: 12 }}>
          <TextField
            label="Institution Name"
            placeholder="e.g. Royal Academy of Colombo"
            value={name}
            onChangeText={handleNameChange}
          />

          <TextField
            label="Unique Handle (@)"
            placeholder="e.g. royal-academy"
            value={handle}
            onChangeText={(text) =>
              setHandle(text.toLowerCase().replace(/[^a-z0-9_-]/g, ''))
            }
            hint="URL slug used for invitations and community QR links."
          />

          <View style={{ gap: 8 }}>
            <Text kind="label">Institution Sector / Level</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {SCHOOL_LEVEL_OPTIONS.map((opt) => {
                const isSelected = selectedType === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setSelectedType(opt.value)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      backgroundColor: isSelected
                        ? 'var(--w-primary, #2563eb)'
                        : 'var(--w-surface-variant, rgba(0,0,0,0.06))',
                    }}
                  >
                    <Text
                      kind="caption"
                      style={{
                        color: isSelected ? '#ffffff' : undefined,
                        fontWeight: isSelected ? '600' : '400',
                      }}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {formError ? (
            <Text kind="body" tone="danger">
              {formError}
            </Text>
          ) : null}

          {submitting ? (
            <View style={{ alignItems: 'center', paddingVertical: 12 }}>
              <WaitingSign size={32} />
              <Text kind="caption" tone="soft" style={{ marginTop: 8 }}>
                Verifying handle and provisioning institution...
              </Text>
            </View>
          ) : (
            <Button
              variant="primary"
              label="Establish Institution"
              onPress={handleSubmitEstablishment}
            />
          )}
        </Surface>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 24, gap: 24 }}>
      {/* Welcome Banner */}
      <Surface tone="raised" style={{ padding: 20, gap: 12, borderRadius: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View
            style={{
              padding: 10,
              borderRadius: 12,
              backgroundColor: 'rgba(37,99,235,0.12)',
            }}
          >
            <School size={28} color="#2563eb" />
          </View>
          <View style={{ flex: 1 }}>
            <Text kind="title">Welcome to Workspace</Text>
            <Text kind="body" tone="soft">
              Connect with an educational institution, school sanctuary, or academic collective.
            </Text>
          </View>
        </View>
        {message ? (
          <Text kind="caption" tone="soft" style={{ fontStyle: 'italic' }}>
            {message}
          </Text>
        ) : null}
      </Surface>

      {/* Pathway 1: Institutional Registry */}
      <Section title="Institutional Schools">
        <Surface tone="raised" style={{ padding: 16, gap: 12, borderRadius: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Building2 size={24} color="#2563eb" />
            <View style={{ flex: 1 }}>
              <Text kind="title">National School Registry</Text>
              <Text kind="caption" tone="soft">
                For government Type 1AB, 1C, Type 2, and Type 3 schools. Search 10,000+ national schools or enter an invitation token.
              </Text>
            </View>
          </View>
          <Button
            variant="secondary"
            label="Find or Join Registered School"
            onPress={onConnectRegistry}
          />
        </Surface>
      </Section>

      {/* Pathway 2: Commercial / Independent Establishment */}
      <Section title="Independent & Studio Establishment">
        <Surface tone="raised" style={{ padding: 16, gap: 12, borderRadius: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <GraduationCap size={24} color="#059669" />
            <View style={{ flex: 1 }}>
              <Text kind="title">Establish School or Studio</Text>
              <Text kind="caption" tone="soft">
                For pre-schools, K-12 private institutions, collegiate academies, tuition centers, or independent learning sanctuaries.
              </Text>
            </View>
          </View>
          <Button
            variant="primary"
            label="Establish New Institution"
            onPress={handleStartEstablishment}
          />
        </Surface>
      </Section>

      {/* Footer Fallbacks */}
      <View style={{ gap: 12, marginTop: 8 }}>
        <TouchableOpacity
          onPress={onReturnPersonal}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 12,
          }}
          accessibilityRole="button"
        >
          <Compass size={18} />
          <Text kind="body">Return to Personal Sanctuary</Text>
        </TouchableOpacity>

        {onContactSupport ? (
          <TouchableOpacity
            onPress={onContactSupport}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              paddingVertical: 6,
            }}
            accessibilityRole="button"
          >
            <Sparkles size={16} />
            <Text kind="caption" tone="faint">
              Need institutional onboarding assistance? Contact Us
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </ScrollView>
  );
}
export default SchoolConnectionWelcome;
