/**
 * QRHandlerScreen — Modal screen that executes an incoming QR action
 *
 * Mounted as a modal in RootStack.Navigator. Receives a QRPayload via route params
 * (injected by useQRDeepLink) and executes the appropriate action with visual feedback.
 *
 * Handles:
 *   join_school   → joins school + community group, navigates to Classroom tab
 *   join_class    → joins classroom, navigates to Classroom tab
 *   join_group    → joins community group, navigates to Community tab
 *   claim_invite  → claims role-specific school invite
 *   user_invite   → stores attribution, navigates to Auth if needed
 *   thuthimal_gift → navigated from here to ThuthimalClaimScreen
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Heading,
  Spinner,
  ScreenWrapper,
  Theme,
} from '@repo/ui';
import { useThemedColors } from '@repo/ui';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { supabase, api } from '@repo/core';
import { communityAPI } from '@repo/community';
import type { QRPayload } from '@repo/scanner-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hapticSuccess, hapticError } from '@repo/ui';

type QRHandlerRouteParams = {
  QRHandler: { payload: QRPayload };
};

export default function QRHandlerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<QRHandlerRouteParams, 'QRHandler'>>();
  const colors = useThemedColors();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing QR action...');

  const payload = route.params?.payload;

  useEffect(() => {
    if (!payload) {
      navigation.goBack();
      return;
    }
    executeAction(payload);
  }, []);

  const executeAction = async (p: QRPayload) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Store and redirect to auth
        await AsyncStorage.setItem('pending_qr_action', JSON.stringify(p));
        navigation.navigate('Auth');
        return;
      }

      switch (p.action) {
        case 'join_school': {
          setMessage('Joining school...');
          // Update user's school_id
          await supabase
            .from('users')
            .update({ school_id: p.school_id })
            .eq('id', user.id);
          // Join community group
          await communityAPI.joinGroup(p.group_id, user.id, 'student');
          hapticSuccess();
          setStatus('success');
          setMessage('Joined! Navigating to your school...');
          setTimeout(() => navigation.navigate('Main', { screen: 'Classroom' }), 1500);
          break;
        }

        case 'join_class': {
          setMessage('Joining classroom...');
          await api.classrooms.update(p.classroom_id, { teacher_id: user.id });
          hapticSuccess();
          setStatus('success');
          setMessage('Joined classroom successfully!');
          setTimeout(() => navigation.navigate('Main', { screen: 'Classroom' }), 1500);
          break;
        }

        case 'join_group': {
          setMessage('Joining community group...');
          await communityAPI.joinGroup(p.group_id, user.id, 'student');
          hapticSuccess();
          setStatus('success');
          setMessage('Joined group!');
          setTimeout(() => navigation.navigate('Main', { screen: 'Community' }), 1500);
          break;
        }

        case 'claim_invite': {
          setMessage(`Claiming ${p.role} invite...`);
          // Apply invite: update user role + school association
          await supabase
            .from('users')
            .update({ role: p.role, school_id: p.school_id })
            .eq('id', user.id);
          // Mark invite code used
          await supabase
            .from('invite_codes')
            .update({ used: true })
            .eq('code', p.invite_code);
          hapticSuccess();
          setStatus('success');
          setMessage(`Joined as ${p.role}!`);
          setTimeout(() => navigation.navigate('Main', { screen: 'Classroom' }), 1500);
          break;
        }

        case 'user_invite': {
          // Store attribution — no immediate action needed
          await AsyncStorage.setItem(
            'referral_attribution',
            JSON.stringify({ inviter_id: p.inviter_id, inviter_role: p.inviter_role }),
          );
          hapticSuccess();
          setStatus('success');
          setMessage("Welcome! You've been invited to Gurudevi.");
          setTimeout(() => navigation.goBack(), 2000);
          break;
        }

        case 'thuthimal_gift': {
          // Navigate to dedicated claim screen
          navigation.replace('ThuthimalClaim', {
            gift_token: p.gift_token,
            gifter_name: p.gifter_name,
          });
          return;
        }

        default:
          setStatus('error');
          setMessage('Unknown QR action.');
          setTimeout(() => navigation.goBack(), 2000);
      }
    } catch (err) {
      console.error('QRHandlerScreen error:', err);
      hapticError();
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
      setTimeout(() => navigation.goBack(), 2500);
    }
  };

  const statusColor =
    status === 'success'
      ? Theme.colors.sageGreen
      : status === 'error'
        ? Theme.colors.emberRed
        : Theme.colors.sanctuarySaffron;

  return (
    <ScreenWrapper>
      <Box sx={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: Theme.spacing.xl }}>
        <VStack sx={{ alignItems: 'center', gap: Theme.spacing.lg }}>
          {status === 'processing' && (
            <Spinner size="large" color={Theme.colors.sanctuarySaffron} />
          )}
          {status === 'success' && (
            <Text sx={{ fontSize: 56 }}>✅</Text>
          )}
          {status === 'error' && (
            <Text sx={{ fontSize: 56 }}>⚠️</Text>
          )}
          <Heading
            sx={{ textAlign: 'center', fontSize: Theme.typography.fontSize.xl }}
            color={statusColor as any}
          >
            {status === 'processing' ? 'Processing QR' : status === 'success' ? 'Done!' : 'Error'}
          </Heading>
          <Text
            sx={{ textAlign: 'center', color: colors.textSecondary }}
          >
            {message}
          </Text>
        </VStack>
      </Box>
    </ScreenWrapper>
  );
}
