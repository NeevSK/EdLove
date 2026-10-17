import assert from 'node:assert/strict';
import test from 'node:test';
import { auditFileContent } from '../audit-seams.mjs';

test('auditFileContent returns zero findings for clean component', () => {
  const cleanCode = `
import React from 'react';
import { View, Text } from 'react-native';

export function CleanComponent() {
  return (
    <View>
      <Text>Clean</Text>
    </View>
  );
}
`;
  const findings = auditFileContent(cleanCode, 'CleanComponent.tsx');
  assert.equal(findings.length, 0);
});

test('auditFileContent flags unthresholded onLayout state setter (Seam 4A)', () => {
  const badLayoutCode = `
import React, { useState } from 'react';
import { View } from 'react-native';

export function CyclicLayout() {
  const [height, setHeight] = useState(0);

  return (
    <View onLayout={(e) => setHeight(e.nativeEvent.layout.height)} />
  );
}
`;
  const findings = auditFileContent(badLayoutCode, 'CyclicLayout.tsx');
  assert.equal(findings.length, 1);
  assert.equal(findings[0].seamType, 'LAYOUT_LOOP_CASCADE');
  assert.equal(findings[0].ruleId, 'seam/unthresholded-onlayout-state-mutation');
});

test('auditFileContent allows thresholded onLayout state setter', () => {
  const guardedLayoutCode = `
import React, { useState } from 'react';
import { View } from 'react-native';

export function GuardedLayout() {
  const [height, setHeight] = useState(0);

  return (
    <View onLayout={(e) => {
      const h = e.nativeEvent.layout.height;
      if (Math.abs(h - height) > 2) {
        setHeight(h);
      }
    }} />
  );
}
`;
  const findings = auditFileContent(guardedLayoutCode, 'GuardedLayout.tsx');
  assert.equal(findings.length, 0);
});

test('auditFileContent allows LayoutLoopSentinel guarded onLayout', () => {
  const sentinelGuardedCode = `
import React, { useState } from 'react';
import { View } from 'react-native';
import { useLayoutSentinel } from '@repo/ui';

export function SentinelGuarded() {
  const [height, setHeight] = useState(0);
  const onLayout = useLayoutSentinel('SentinelGuarded', (e) => setHeight(e.nativeEvent.layout.height));

  return (
    <View onLayout={onLayout} />
  );
}
`;
  const findings = auditFileContent(sentinelGuardedCode, 'SentinelGuarded.tsx');
  assert.equal(findings.length, 0);
});

test('auditFileContent flags RNGH 3.3 Pressable import (TCDI Hazard)', () => {
  const badImportCode = `
import React from 'react';
import { Pressable } from 'react-native-gesture-handler';

export function BadPressable() {
  return <Pressable />;
}
`;
  const findings = auditFileContent(badImportCode, 'BadPressable.tsx');
  assert.equal(findings.length, 1);
  assert.equal(findings[0].seamType, 'GESTURE_TOUCH_DEADLOCK');
  assert.match(findings[0].message, /Pressable/);
});

test('auditFileContent flags ReanimatedSwipeable inside GestureDetector (TCDI Hazard)', () => {
  const badSwipeableCode = `
import React from 'react';
import { GestureDetector } from 'react-native-gesture-handler';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

export function BadSwipeable() {
  return (
    <GestureDetector gesture={gesture}>
      <ReanimatedSwipeable />
    </GestureDetector>
  );
}
`;
  const findings = auditFileContent(badSwipeableCode, 'BadSwipeable.tsx');
  assert.equal(findings.length, 1);
  assert.equal(findings[0].seamType, 'TCDI_FABRIC_HAZARD');
  assert.equal(findings[0].ruleId, 'seam/reanimated-swipeable-fabric-hazard');
});
