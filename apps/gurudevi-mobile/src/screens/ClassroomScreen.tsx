import React from 'react';
import { Box, Text, Center, Heading } from "@gluestack-ui/themed";

export default function ClassroomScreen() {
    return (
        <Box sx={{ flex: 1, backgroundColor: '$backgroundDark950', padding: '$4' }}>
            <Center sx={{ flex: 1 }}>
                <Heading color="$orange500">Classroom</Heading>
                <Text color="$textDark200">Your learning journey continues here.</Text>
            </Center>
        </Box>
    );
}
