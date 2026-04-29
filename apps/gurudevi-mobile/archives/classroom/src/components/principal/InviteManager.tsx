/**
 * INVITE MANAGER COMPONENT
 *
 * Manage invite codes for staff and students to join the school.
 * Features:
 * - Generate Teacher Code button
 * - Generate Student Code button
 * - List of active codes with copy functionality
 *
 * Mission 04: Principal's Office
 */

import { handleAPIError, type InviteCode, type UserRole } from '@repo/core';
import { api } from '@repo/core/api';

import { QRBuilder, QRCodeGenerator } from '@repo/scanner-kit';
import { Spinner } from '@repo/ui/gluestack';
import { Box, Button, ButtonText, Heading, HStack, Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalHeader, Heading as ModalHeading, Text, Toast, ToastTitle, useToast, VStack } from '@repo/ui';;
import { ScrollView } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';

import * as Clipboard from 'expo-clipboard';
import { Copy, QrCode } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface InviteManagerProps {
  schoolId: string;
  userId: string;
  onBack: () => void;
}

export default function InviteManager({ schoolId, userId, onBack }: InviteManagerProps) {
  const { t } = useTranslation();
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const [qrCodeData, setQrCodeData] = useState<{ code: string; role: string } | null>(null);

  useEffect(() => {
    loadInviteCodes();
  }, [loadInviteCodes]);

  const loadInviteCodes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const codes = await api.school.getInviteCodes(schoolId);
      setInviteCodes(codes);
    } catch (err: any) {
      const apiError = handleAPIError(err, true);
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCode = async (role: UserRole) => {
    setIsGenerating(true);
    setError(null);
    try {
      await api.school.generateInviteCode(schoolId, role, userId);
      await loadInviteCodes();
    } catch (err: any) {
      const apiError = handleAPIError(err, true);
      setError(apiError.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await Clipboard.setStringAsync(code);
      toast.show({
        placement: 'top',
        render: ({ id }: { id: string }) => {
          return (
            <Toast nativeID={id} action="success" variant="solid" sx={{}}>
              <ToastTitle>{t('principal.invites.copied') || 'Copied!'}</ToastTitle>
            </Toast>
          );
        },
      });
    } catch (err) {
      handleAPIError(err);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'teacher':
        return Theme.colors.sageGreen;
      case 'student':
        return Theme.colors.sanctuarySaffron;
      case 'principal':
        return Theme.colors.twilightBlue;
      default:
        return Theme.colors.mistGray;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'teacher':
        return '👨‍🏫';
      case 'student':
        return '👨‍🎓';
      case 'principal':
        return '👔';
      default:
        return '👤';
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        backgroundColor: Theme.colors.ink,
      }}
    >
      <ScrollView>
        <VStack space="lg" sx={{ padding: Theme.spacing.lg }}>
          {/* Header */}
          <HStack
            sx={{
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Heading color={Theme.colors.sanctuarySaffron} sx={{ fontSize: 32 }}>
              {t('principal.invites.title') || 'Invite Codes'}
            </Heading>

            <Button
              variant="outline"
              size="sm"
              sx={{
                borderColor: Theme.colors.starlightGray,
              }}
              onPress={onBack}
            >
              <ButtonText color={Theme.colors.sacredWhite}>{t('common.back') || 'Back'}</ButtonText>
            </Button>
          </HStack>

          {/* Description */}
          <Text color={Theme.colors.starlightGray}>
            {t('principal.invites.description') ||
              'Generate invite codes for teachers and students to join your school.'}
          </Text>

          {/* Generate Buttons */}
          <VStack space="md">
            <Button
              sx={{
                backgroundColor: Theme.colors.twilightBlue,
                padding: Theme.spacing.lg,
                marginBottom: Theme.spacing.xs,
              }}
              onPress={() => handleGenerateCode('principal')}
              disabled={isGenerating}
            >
              <ButtonText color={Theme.colors.sacredWhite}>
                {isGenerating
                  ? t('common.generating') || 'Generating...'
                  : t('principal.invites.generatePrincipal') || '👔 Generate Principal Code'}
              </ButtonText>
            </Button>

            <Button
              sx={{
                backgroundColor: Theme.colors.sageGreen,
                padding: Theme.spacing.lg,
              }}
              onPress={() => handleGenerateCode('teacher')}
              disabled={isGenerating}
            >
              <ButtonText color={Theme.colors.sacredWhite}>
                {isGenerating
                  ? t('common.generating') || 'Generating...'
                  : t('principal.invites.generateTeacher') || '👨‍🏫 Generate Teacher Code'}
              </ButtonText>
            </Button>

            <HStack space="md">
              <Button
                sx={{
                  flex: 1,
                  backgroundColor: Theme.colors.twilightBlue,
                  padding: Theme.spacing.lg,
                }}
                onPress={() => handleGenerateCode('section_head')}
                disabled={isGenerating}
              >
                <ButtonText color={Theme.colors.sacredWhite}>
                  {t('principal.invites.generateSectionHead') || '+ Section Head'}
                </ButtonText>
              </Button>

              <Button
                sx={{
                  flex: 1,
                  backgroundColor: Theme.colors.twilightBlue,
                  padding: Theme.spacing.lg,
                }}
                onPress={() => handleGenerateCode('grade_head')}
                disabled={isGenerating}
              >
                <ButtonText color={Theme.colors.sacredWhite}>
                  {t('principal.invites.generateGradeHead') || '+ Grade Head'}
                </ButtonText>
              </Button>
            </HStack>

            <Button
              sx={{
                backgroundColor: Theme.colors.sanctuarySaffron,
                padding: Theme.spacing.lg,
              }}
              onPress={() => handleGenerateCode('student')}
              disabled={isGenerating}
            >
              <ButtonText color={Theme.colors.sacredWhite}>
                {isGenerating
                  ? t('common.generating') || 'Generating...'
                  : t('principal.invites.generateStudent') || '👨‍🎓 Generate Student Code'}
              </ButtonText>
            </Button>
          </VStack>

          {/* Loading State */}
          {isLoading && (
            <Box
              sx={{
                padding: Theme.spacing.xl,
                alignItems: 'center',
              }}
            >
              <Spinner color={Theme.colors.sanctuarySaffron} />
            </Box>
          )}

          {/* Error State */}
          {error && (
            <Box
              sx={{
                padding: Theme.spacing.md,
                backgroundColor: Theme.colors.emberRed,
                borderRadius: Theme.corners.comfortable,
              }}
            >
              <Text color={Theme.colors.sacredWhite}>{error}</Text>
            </Box>
          )}

          {/* Active Codes List */}
          {!isLoading && inviteCodes.length > 0 && (
            <VStack space="md">
              <Text
                color={Theme.colors.starlightGray}
                sx={{
                  fontWeight: '600',
                  marginTop: Theme.spacing.md,
                  fontSize: 18,
                }}
              >
                {t('principal.invites.activeCodesTitle') || 'Active Invite Codes'}
              </Text>

              {inviteCodes.map((invite) => (
                <Box
                  key={invite.code}
                  sx={{
                    padding: Theme.spacing.md,
                    backgroundColor: Theme.colors.ink,
                    borderRadius: Theme.corners.comfortable,
                    borderLeftWidth: 4,
                    borderLeftColor: getRoleBadgeColor(invite.role),
                  }}
                >
                  <HStack
                    sx={{
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <VStack space="xs" sx={{ flex: 1 }}>
                      {/* Code */}
                      <HStack space="sm" sx={{ alignItems: 'center' }}>
                        <Text
                          color={Theme.colors.sacredWhite}
                          sx={{
                            fontWeight: '700',
                            fontSize: 20,
                            fontFamily: 'monospace',
                          }}
                        >
                          {invite.code}
                        </Text>
                        <HStack space="xs">
                          <Button
                            size="xs"
                            variant="link"
                            action="secondary"
                            onPress={() => handleCopyCode(invite.code)}
                            sx={{}}
                          >
                            <Copy size={14} color={Theme.colors.mistGray} />
                          </Button>
                          <Button
                            size="xs"
                            variant="link"
                            action="secondary"
                            onPress={() => setQrCodeData({ code: invite.code, role: invite.role })}
                            sx={{}}
                          >
                            <QrCode size={14} color={Theme.colors.mistGray} />
                          </Button>
                        </HStack>
                      </HStack>

                      {/* Role Badge */}
                      <HStack space="sm" sx={{ alignItems: 'center' }}>
                        <Box
                          sx={{
                            paddingHorizontal: Theme.spacing.sm,
                            paddingVertical: Theme.spacing.xs,
                            backgroundColor: getRoleBadgeColor(invite.role),
                            borderRadius: Theme.corners.tight,
                          }}
                        >
                          <Text
                            color={Theme.colors.sacredWhite}
                            sx={{ fontWeight: '600', fontSize: 12 }}
                          >
                            {getRoleIcon(invite.role)} {invite.role.toUpperCase()}
                          </Text>
                        </Box>

                        {/* Status */}
                        <Text color={Theme.colors.mistGray} sx={{ fontSize: 12 }}>
                          {invite.used
                            ? t('principal.invites.used') || 'Used'
                            : t('principal.invites.active') || 'Active'}
                        </Text>
                      </HStack>

                      {/* Created Date */}
                      <Text color={Theme.colors.mistGray} sx={{ fontSize: 12 }}>
                        {t('principal.invites.createdAt') || 'Created:'}{' '}
                        {new Date(invite.created_at).toLocaleDateString()}
                      </Text>
                    </VStack>

                    {/* Copy Hint */}
                    <Text color={Theme.colors.mistGray} sx={{ fontSize: 12 }}>
                      {t('principal.invites.tapToCopy') || 'Tap to copy'}
                    </Text>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}

          {/* Empty State */}
          {!isLoading && inviteCodes.length === 0 && (
            <Box
              sx={{
                padding: Theme.spacing.xl,
                alignItems: 'center',
              }}
            >
              <Text color={Theme.colors.starlightGray} textAlign="center" sx={{ fontSize: 18 }}>
                {t('principal.invites.noCodes') ||
                  'No active invite codes. Generate your first code to get started!'}
              </Text>
            </Box>
          )}
        </VStack>
      </ScrollView>

      {/* QR Code Modal — shows invite QR when principal taps the QR icon */}
      <Modal isOpen={qrCodeData !== null} onClose={() => setQrCodeData(null)}>
        <ModalBackdrop />
        <ModalContent
          sx={{
            backgroundColor: Theme.colors.ink,
            borderRadius: Theme.corners.generous,
            padding: Theme.spacing.xl,
            alignItems: 'center',
            maxWidth: 320,
          }}
        >
          <ModalHeader>
            <ModalHeading
              color={Theme.colors.sanctuarySaffron}
              sx={{ textAlign: 'center', fontSize: 18, fontWeight: '600' }}
            >
              {qrCodeData
                ? `${getRoleIcon(qrCodeData.role)} ${qrCodeData.role.toUpperCase()} INVITE`
                : 'Invite QR'}
            </ModalHeading>
            <ModalCloseButton onPress={() => setQrCodeData(null)} />
          </ModalHeader>
          <ModalBody sx={{ alignItems: 'center', paddingVertical: Theme.spacing.lg }}>
            {qrCodeData && (
              <>
                <QRCodeGenerator
                  value={QRBuilder.invite(qrCodeData.code, schoolId, qrCodeData.role)}
                  size={220}
                  color={Theme.colors.ink}
                  backgroundColor={Theme.colors.sacredWhite}
                  label={qrCodeData.code}
                  errorCorrectionLevel="H"
                  borderRadius={12}
                  padding={16}
                />
                <Text
                  color={Theme.colors.starlightGray}
                  sx={{ marginTop: Theme.spacing.md, textAlign: 'center', fontSize: 13 }}
                >
                  Scan to join as {qrCodeData.role}
                </Text>
                <Text
                  color={Theme.colors.mistGray}
                  sx={{
                    marginTop: Theme.spacing.xs,
                    textAlign: 'center',
                    fontSize: 12,
                    fontFamily: 'monospace',
                  }}
                >
                  Code: {qrCodeData.code}
                </Text>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
