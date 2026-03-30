import React from 'react';
import { AuthScreen as UIAuthScreen } from '@repo/ui';
import { ScannerModal } from '@repo/scanner-kit';

export default function AppAuthScreen(props: any) {
    return <UIAuthScreen {...props} Scanner={ScannerModal} />;
}
