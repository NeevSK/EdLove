import React from 'react';
import { Box, Text, Center, Heading } from "@gluestack-ui/themed";

export default function CommunityScreen() {
    return (
        <Box sx={{ flex: 1, backgroundColor: '$backgroundDark950', padding: '$4' }}>
            <Center sx={{ flex: 1 }}>
                <Heading color="$orange500">Community</Heading>
                <Text color="$textDark200">Connect with your peers here.</Text>
            </Center>
        </Box>
    );
}
