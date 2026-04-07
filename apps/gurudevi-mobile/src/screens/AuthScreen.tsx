import React from 'react';
import { AuthScreen as UIAuthScreen } from '@repo/ui/screens';
import { ScannerModal } from '@repo/scanner-kit';

/**
 * High-End "Assembled" Screen
 * 
 * This screen acts as the "Glue" between the UI package and the Scanner package.
 * By assembling it here, we keep the packages clean and avoid circular dependencies.
 */
export default function AuthScreen(props: any) {
    return <UIAuthScreen {...props} Scanner={ScannerModal} />;
}
