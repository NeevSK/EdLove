import React from 'react';
import { Fab, FabIcon, CircleIcon } from "@gluestack-ui/themed";
import { MotiView } from 'moti';

export default function AssistivePresence() {
    return (
        <MotiView
            from={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 1.1, opacity: 1 }}
            transition={{
                type: 'timing',
                duration: 3000,
            }}
            style={{ position: 'absolute', bottom: 90, right: 20 }}
        >
            <Fab size="lg" placement="bottom right" sx={{ backgroundColor: '$orange500', borderRadius: '$full' }}>
                <FabIcon as={CircleIcon} />
            </Fab>
        </MotiView>
    );
}