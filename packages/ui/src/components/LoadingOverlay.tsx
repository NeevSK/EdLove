import React from 'react';
import { Modal, ModalBackdrop, Spinner, Center } from '../gluestack';
import { Theme } from '../theme/Theme';

interface LoadingOverlayProps {
    visible: boolean;
    message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible }) => {
    return (
        <Modal isOpen={visible}
            <ModalBackdrop sx={{ backgroundColor: 'rgba(0,0,0,0.5)' }} /
            <Center sx={{ flex: 1, zIndex: 1000 }}
                <Spinner 
                    accessibilityLabel="Loading"
                    size="large" 
                    color={Theme.colors.sanctuarySaffron} 
                /
            </Center
        </Modal
    );
};

export default LoadingOverlay;
