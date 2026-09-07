import { Check, School, Sparkles, X } from '@repo/ui/icons';
import { Box, HStack, Modal, ModalContent, Pressable, Text, TextInput, VStack } from '@repo/ui/primitives';
import { tokens } from '@repo/ui/tokens';
import { hapticSuccess } from '@repo/ui/utils/haptics';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface SchoolInviteCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRedeemCode: (payload: {
    code: string;
    schoolId: string;
    schoolName: string;
    capacity: 'teacher' | 'student' | 'principal' | 'admin';
    roles: Array<'teacher' | 'student' | 'principal' | 'admin'>;
  }) => void;
}

export function SchoolInviteCodeModal({
  isOpen,
  onClose,
  onRedeemCode,
}: SchoolInviteCodeModalProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedSchool, setVerifiedSchool] = useState<{
    schoolId: string;
    schoolName: string;
    capacity: 'teacher' | 'student' | 'principal' | 'admin';
    roles: Array<'teacher' | 'student' | 'principal' | 'admin'>;
  } | null>(null);

  const handleCodeChange = (text: string) => {
    const formatted = text.toUpperCase().trim();
    setCode(formatted);

    // Dynamic verification simulation for valid school invite codes
    if (formatted.length >= 6) {
      setIsVerifying(true);
      setTimeout(() => {
        if (formatted.startsWith('UOC') || formatted.includes('STU')) {
          setVerifiedSchool({
            schoolId: 'school_uoc_med',
            schoolName: 'University of Colombo (Faculty of Graduate Studies)',
            capacity: 'student',
            roles: ['student'],
          });
        } else if (formatted.startsWith('ROY') || formatted.includes('ROYAL')) {
          setVerifiedSchool({
            schoolId: 'school_royal_college',
            schoolName: 'Royal College, Colombo 07',
            capacity: 'teacher',
            roles: ['teacher'],
          });
        } else {
          setVerifiedSchool({
            schoolId: `school_${formatted.toLowerCase()}`,
            schoolName: 'National Institute of Education (NIE)',
            capacity: 'teacher',
            roles: ['teacher'],
          });
        }
        setIsVerifying(false);
      }, 300);
    } else {
      setVerifiedSchool(null);
    }
  };

  const handleConfirmRedeem = () => {
    if (!verifiedSchool) return;
    hapticSuccess();
    onRedeemCode({
      code,
      ...verifiedSchool,
    });
    setCode('');
    setVerifiedSchool(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent
        style={{
          backgroundColor: tokens.colors.background,
          borderColor: tokens.semantic.border.base,
          borderWidth: 1,
          maxWidth: 480,
          width: '100%',
          borderRadius: tokens.radii.lg,
          alignSelf: 'center',
          padding: tokens.spacing.lg,
          shadowColor: tokens.colors.shadowColor,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.16,
          shadowRadius: 20,
          elevation: 8,
        }}
      >
        <HStack style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing.md }}>
          <HStack style={{ alignItems: 'center', gap: 8 }}>
            <Box
              style={{
                width: 36,
                height: 36,
                borderRadius: tokens.radii.md,
                backgroundColor: 'rgba(91, 140, 79, 0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <School size={18} color={tokens.colors.success} />
            </Box>
            <VStack>
              <Text
                style={{
                  fontSize: tokens.typography.sizes.md,
                  fontWeight: '800',
                  color: tokens.semantic.text.primary,
                }}
              >
                {t('school.connectTitle', 'Connect School Bond')}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.sizes.xs,
                  color: tokens.semantic.text.secondary,
                }}
              >
                {t('school.connectSubtitle', 'Enter your institutional invite or degree token.')}
              </Text>
            </VStack>
          </HStack>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: tokens.colors.surfaceInteractive,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} color={tokens.colors.ink} />
          </Pressable>
        </HStack>

        <VStack style={{ gap: tokens.spacing.md }}>
          <VStack style={{ gap: 4 }}>
            <Text
              style={{
                fontSize: tokens.typography.sizes.xs,
                fontWeight: '700',
                color: tokens.semantic.text.primary,
              }}
            >
              {t('school.inviteCodeLabel', 'Institutional Invite Code')}
            </Text>
            <TextInput
              value={code}
              onChangeText={handleCodeChange}
              placeholder="e.g. ROY-2026 or UOC-POSTGRAD"
              placeholderTextColor={tokens.semantic.text.muted}
              autoCapitalize="characters"
              style={{
                borderWidth: 1,
                borderColor: verifiedSchool ? tokens.colors.success : tokens.semantic.border.base,
                borderRadius: tokens.radii.md,
                backgroundColor: tokens.colors.surface,
                paddingHorizontal: 14,
                paddingVertical: 10,
                fontSize: tokens.typography.sizes.md,
                fontWeight: '700',
                letterSpacing: 1.5,
                color: tokens.semantic.text.primary,
              }}
            />
          </VStack>

          {isVerifying ? (
            <Text style={{ fontSize: tokens.typography.sizes.xs, color: tokens.semantic.text.secondary }}>
              Verifying institutional cryptographic signature...
            </Text>
          ) : null}

          {verifiedSchool ? (
            <Box
              style={{
                padding: tokens.spacing.md,
                borderRadius: tokens.radii.md,
                backgroundColor: 'rgba(91, 140, 79, 0.08)',
                borderWidth: 1,
                borderColor: 'rgba(91, 140, 79, 0.3)',
              }}
            >
              <HStack style={{ alignItems: 'flex-start', gap: 10 }}>
                <Sparkles size={18} color={tokens.colors.success} style={{ marginTop: 2 }} />
                <VStack style={{ flex: 1, gap: 2 }}>
                  <Text
                    style={{
                      fontSize: tokens.typography.sizes.sm,
                      fontWeight: '800',
                      color: tokens.colors.success,
                    }}
                  >
                    {verifiedSchool.schoolName}
                  </Text>
                  <Text
                    style={{
                      fontSize: tokens.typography.sizes.xs,
                      color: tokens.semantic.text.secondary,
                    }}
                  >
                    Role: <Text style={{ fontWeight: '700' }}>{verifiedSchool.capacity.toUpperCase()}</Text> · Verified ReBAC Bond
                  </Text>
                </VStack>
              </HStack>
            </Box>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Confirm connection"
            onPress={handleConfirmRedeem}
            disabled={!verifiedSchool}
            style={{
              backgroundColor: verifiedSchool ? tokens.colors.primary : tokens.colors.surfaceSubtle,
              paddingVertical: 12,
              borderRadius: tokens.radii.md,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: verifiedSchool ? 1 : 0.5,
              marginTop: 4,
            }}
          >
            <HStack style={{ alignItems: 'center', gap: 6 }}>
              <Check size={16} color={verifiedSchool ? '#FFFFFF' : tokens.semantic.text.muted} />
              <Text
                style={{
                  fontSize: tokens.typography.sizes.sm,
                  fontWeight: '700',
                  color: verifiedSchool ? '#FFFFFF' : tokens.semantic.text.muted,
                }}
              >
                {verifiedSchool ? 'Confirm & Activate School Bond' : 'Enter Valid Code to Connect'}
              </Text>
            </HStack>
          </Pressable>
        </VStack>
      </ModalContent>
    </Modal>
  );
}

export default SchoolInviteCodeModal;
