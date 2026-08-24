import './style-engine.css';

import { Box } from '@repo/ui/components/ui/box';
import { Icon } from '@repo/ui/components/ui/icon';
import { FlatList } from '@repo/ui/components/ui/list';
import { Pressable } from '@repo/ui/components/ui/pressable';
import { Text } from '@repo/ui/components/ui/text';
import { Search } from '@repo/ui/icons';
import { registerRootComponent } from 'expo';
import { Text as RNText, View } from 'react-native';

export default function StyleEngineRuntimeFixture() {
  return (
    <View id="runtime-fixture" className="flex-1 bg-phase-canvas p-4">
      <Box id="box-fixture" className="bg-phase-surface p-4">
        <Text id="text-fixture" className="text-phaseText-primary text-xl">
          Styled text
        </Text>
      </Box>
      <Pressable id="pressable-fixture" className="mt-4 bg-phase-interactive p-3">
        <RNText>Styled pressable</RNText>
      </Pressable>
      <Icon id="icon-fixture" as={Search} className="mt-4 text-phaseText-primary" size={24} />
      <FlatList
        id="list-fixture"
        className="mt-4 bg-phase-surface p-2"
        contentContainerClassName="p-2"
        data={['one']}
        renderItem={({ item }) => <RNText>{item}</RNText>}
      />
    </View>
  );
}

registerRootComponent(StyleEngineRuntimeFixture);
