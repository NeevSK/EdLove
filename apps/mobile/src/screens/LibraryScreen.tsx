import React from 'react';
import { Box, Text, Center, Heading } from "@gluestack-ui/themed";

export default function LibraryScreen() {
    return (
        <Box sx={{ flex: 1, backgroundColor: '$backgroundDark950', padding: '$4' }}>
            <Center sx={{ flex: 1 }}>
                <Heading color="$orange500">Library</Heading>
                <Text color="$textDark200">Explore our vast collection of knowledge.</Text>
            </Center>
        </Box>
    );
}
