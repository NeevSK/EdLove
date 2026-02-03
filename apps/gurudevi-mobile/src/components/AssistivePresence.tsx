import React from 'react';
import { Fab, FabIcon, CircleIcon } from "@gluestack-ui/themed";
import { MotiView } from 'moti';
import { Theme } from '../constants/Theme';

export default function AssistivePresence() {
    return (
        <MotiView
            from={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 1.1, opacity: 1 }}
            transition={{
                type: 'timing',
                duration: Theme.motion.breathing, // 4000ms breathing animation
            }}
            style={{ position: 'absolute', bottom: 90, right: Theme.spacing.lg }} // 20px → Theme.spacing.lg
        >
            <Fab size="lg" placement="bottom right" sx={{ backgroundColor: Theme.colors.sanctuarySaffron, borderRadius: Theme.corners.full }}>
                <FabIcon as={CircleIcon} />
            </Fab>
        </MotiView>
    );
}