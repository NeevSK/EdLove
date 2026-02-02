import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    Text,
    Heading,
    HStack,
    Button,
    ButtonIcon,
    Spinner,
    Center
} from "@gluestack-ui/themed";
import { LogOut } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

export default function ProfileScreen() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (data) setProfile(data);
                else setProfile({ full_name: user.email?.split('@')[0] }); // Fallback
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleLogout() {
        await supabase.auth.signOut();
    }

    if (loading) {
        return (
            <Box sx={{ flex: 1, backgroundColor: '$backgroundDark950' }}>
                <Center sx={{ flex: 1 }}>
                    <Spinner size="large" color="$orange500" />
                </Center>
            </Box>
        );
    }

    return (
        <Box sx={{ flex: 1, backgroundColor: '$backgroundDark950', padding: '$4' }}>
            <VStack space="xl" sx={{ marginTop: '$12' }}>
                <HStack justifyContent="space-between" alignItems="center">
                    <Heading size="2xl" color="$orange500">Teacher Enclave</Heading>
                    <Button size="sm" action="negative" variant="outline" onPress={handleLogout}>
                        <ButtonIcon as={LogOut} />
                    </Button>
                </HStack>

                <Box p="$6" sx={{ backgroundColor: '$backgroundDark900', borderRadius: '$lg' }}>
                    <VStack space="md">
                        <VStack space="xs">
                            <Text color="$textDark400" size="sm">Full Name</Text>
                            <Text color="$textDark100" size="lg" bold>
                                {profile?.full_name || "Guru Devi Member"}
                            </Text>
                        </VStack>

                        <VStack space="xs">
                            <Text color="$textDark400" size="sm">School</Text>
                            <Text color="$textDark100" size="md">
                                {profile?.school_name || "Not set yet"}
                            </Text>
                        </VStack>
                    </VStack>
                </Box>

                <Box p="$4" sx={{ backgroundColor: '$orange500', borderRadius: '$lg', opacity: 0.1 }}>
                    <Text color="$white" italic textAlign="center">
                        "Your influence as a teacher shall bloom here."
                    </Text>
                </Box>
            </VStack>
        </Box>
    );
}
