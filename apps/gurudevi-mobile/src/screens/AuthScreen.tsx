import React, { useState } from 'react';
import {
    Box,
    VStack,
    Input,
    InputField,
    Button,
    ButtonText,
    Text,
    Heading,
    useToast,
    Toast,
    ToastTitle,
    Center,
    HStack,
    Pressable
} from "@gluestack-ui/themed";
import { supabase } from '../lib/supabase';

export default function AuthScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const toast = useToast();

    async function handleAuth() {
        setLoading(true);
        if (isSignUp) {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    }
                }
            });
            if (error) {
                showToast(error.message, "error");
            } else {
                showToast("Check your email for confirmation!", "success");
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                showToast(error.message, "error");
            }
        }
        setLoading(false);
    }

    function showToast(message: string, action: "error" | "success") {
        toast.show({
            placement: "bottom",
            render: ({ id }) => (
                <Toast nativeID={id} action={action} variant="solid">
                    <ToastTitle>{message}</ToastTitle>
                </Toast>
            ),
        });
    }

    return (
        <Box sx={{ flex: 1, backgroundColor: '$backgroundDark950', padding: '$6' }}>
            <Center sx={{ flex: 1 }}>
                <VStack space="xl" sx={{ width: '100%' }}>
                    <VStack space="xs">
                        <Heading size="4xl" color="$orange500">Gurudevi</Heading>
                        <Text color="$textDark400" size="lg">
                            {isSignUp ? "Join the Teacher Community" : "Enter Your Sanctuary"}
                        </Text>
                    </VStack>

                    <VStack space="md" sx={{ marginTop: '$4' }}>
                        {isSignUp && (
                            <Input variant="underlined" size="lg">
                                <InputField
                                    placeholder="Full Name"
                                    value={fullName}
                                    onChangeText={setFullName}
                                    color="$textDark100"
                                />
                            </Input>
                        )}
                        <Input variant="underlined" size="lg">
                            <InputField
                                placeholder="Email Address"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                color="$textDark100"
                            />
                        </Input>
                        <Input variant="underlined" size="lg">
                            <InputField
                                placeholder="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                color="$textDark100"
                            />
                        </Input>
                    </VStack>

                    <Button
                        onPress={handleAuth}
                        isDisabled={loading}
                        sx={{ backgroundColor: '$orange500', height: 50, borderRadius: '$full', marginTop: '$4' }}
                    >
                        <ButtonText color="$white" size="lg" bold>
                            {loading ? "Processing..." : (isSignUp ? "Create Account" : "Login")}
                        </ButtonText>
                    </Button>

                    <HStack space="xs" justifyContent="center" sx={{ marginTop: '$2' }}>
                        <Text color="$textDark400">
                            {isSignUp ? "Already have an account?" : "New to Gurudevi?"}
                        </Text>
                        <Pressable onPress={() => setIsSignUp(!isSignUp)}>
                            <Text color="$orange500" bold>
                                {isSignUp ? "Login" : "Sign Up"}
                            </Text>
                        </Pressable>
                    </HStack>
                </VStack>
            </Center>
        </Box>
    );
}
