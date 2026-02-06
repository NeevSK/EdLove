import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Input,
  InputField,
  Button,
  ButtonText,
  ScrollView
} from '@gluestack-ui/themed';
import { Lightbulb, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '../../constants/Theme';
import { supabase } from '../../lib/supabase';
import { hapticLight, hapticSuccess } from '../../utils/haptics';
import { WisdomNote } from '../../types/Wellbeing';

interface WisdomSeedsProps {
  userId?: string;
}

export default function WisdomSeeds({ userId }: WisdomSeedsProps) {
  const { t } = useTranslation();
  const [notes, setNotes] = useState<WisdomNote[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [insight, setInsight] = useState('');

  useEffect(() => {
    if (userId) {
      loadNotes();
    }
  }, [userId]);

  const loadNotes = async () => {
    if (!userId) return;
    
    const { data, error } = await supabase
      .from('wisdom_notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (data) {
      setNotes(data);
    }
  };

  const handleSave = async () => {
    if (!userId || !insight.trim()) return;
    
    setLoading(true);
    hapticLight();

    const { error } = await supabase
      .from('wisdom_notes')
      .insert({
        user_id: userId,
        insight: insight.trim()
      });

    if (!error) {
      hapticSuccess();
      setInsight('');
      setShowForm(false);
      await loadNotes();
    }
    
    setLoading(false);
  };

  const wisdomPrompts = [
    "Questions work better than answers",
    "Silence creates space for thinking",
    "Small wins compound into confidence",
    "Mistakes are data, not disasters",
    "Connection before content"
  ];

  return (
    <VStack space="lg" sx={{ flex: 1 }}>
      <VStack space="xs">
        <HStack space="sm" alignItems="center">
          <Lightbulb color={Theme.colors.sanctuarySaffron} size={24} />
          <Heading color={Theme.colors.sacredWhite} size="lg">
            {t('self.wisdom')}
          </Heading>
        </HStack>
        <Text color={Theme.colors.mistGray} size="sm">
          {t('self.wisdomDesc')}
        </Text>
      </VStack>

      {!showForm ? (
        <>
          <Button
            size="md"
            action="primary"
            onPress={() => {
              hapticLight();
              setShowForm(true);
            }}
            sx={{
              backgroundColor: Theme.colors.sanctuarySaffron,
              borderRadius: Theme.corners.comfortable
            }}
          >
            <Plus color={Theme.colors.white} size={20} />
            <ButtonText ml="$2">{t('self.addWisdom')}</ButtonText>
          </Button>

          <ScrollView sx={{ flex: 1, maxHeight: 400 }}>
            <VStack space="md">
              {notes.map((note) => (
                <Box
                  key={note.id}
                  p={Theme.spacing.md}
                  sx={{
                    backgroundColor: Theme.colors.deepIndigo,
                    borderRadius: Theme.corners.comfortable,
                    borderLeftWidth: 3,
                    borderLeftColor: Theme.colors.sanctuarySaffron
                  }}
                >
                  <VStack space="xs">
                    <Text
                      color={Theme.colors.sacredWhite}
                      size="md"
                      fontStyle="italic"
                    >
                      "{note.insight}"
                    </Text>
                    <Text color={Theme.colors.dimGray} size="xs">
                      {new Date(note.created_at).toLocaleDateString()}
                    </Text>
                  </VStack>
                </Box>
              ))}
              
              {notes.length === 0 && (
                <VStack space="md" p={Theme.spacing.lg}>
                  <Text
                    color={Theme.colors.mistGray}
                    size="md"
                    textAlign="center"
                  >
                    Your personal pedagogy journal 📝
                  </Text>
                  <VStack space="xs" mt="$4">
                    <Text color={Theme.colors.dimGray} size="sm" bold>
                      Example insights:
                    </Text>
                    {wisdomPrompts.map((prompt, idx) => (
                      <Text
                        key={idx}
                        color={Theme.colors.mistGray}
                        size="sm"
                        fontStyle="italic"
                      >
                        • {prompt}
                      </Text>
                    ))}
                  </VStack>
                </VStack>
              )}
            </VStack>
          </ScrollView>
        </>
      ) : (
        <VStack space="md">
          {/* Insight Input */}
          <Box>
            <Text color={Theme.colors.mistGray} size="sm" mb="$2">
              {t('self.yourInsight')}
            </Text>
            <Input
              variant="outline"
              size="md"
              sx={{
                backgroundColor: Theme.colors.deepIndigo,
                borderWidth: 1,
                borderColor: Theme.colors.transparent,
                minHeight: 120
              }}
            >
              <InputField
                placeholder="What teaching insight did you discover today?"
                value={insight}
                onChangeText={setInsight}
                multiline
                color={Theme.colors.sacredWhite}
                placeholderTextColor={Theme.colors.dimGray}
                sx={{ textAlignVertical: 'top' }}
              />
            </Input>
          </Box>

          {/* Quick prompts */}
          <Box>
            <Text color={Theme.colors.dimGray} size="xs" mb="$2">
              Need inspiration? Try:
            </Text>
            <VStack space="xs">
              {wisdomPrompts.slice(0, 3).map((prompt, idx) => (
                <Text
                  key={idx}
                  color={Theme.colors.mistGray}
                  size="xs"
                  fontStyle="italic"
                >
                  • {prompt}
                </Text>
              ))}
            </VStack>
          </Box>

          {/* Actions */}
          <HStack space="md" justifyContent="flex-end">
            <Button
              size="md"
              variant="outline"
              onPress={() => {
                hapticLight();
                setShowForm(false);
                setInsight('');
              }}
              sx={{
                borderColor: Theme.colors.deepIndigo,
                borderRadius: Theme.corners.comfortable
              }}
            >
              <ButtonText color={Theme.colors.mistGray}>
                {t('common.cancel')}
              </ButtonText>
            </Button>
            <Button
              size="md"
              action="primary"
              onPress={handleSave}
              isDisabled={!insight.trim() || loading}
              sx={{
                backgroundColor: Theme.colors.sanctuarySaffron,
                borderRadius: Theme.corners.comfortable
              }}
            >
              <ButtonText>{t('common.save')}</ButtonText>
            </Button>
          </HStack>
        </VStack>
      )}
    </VStack>
  );
}
