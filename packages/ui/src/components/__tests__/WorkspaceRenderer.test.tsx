import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { WorkspaceRenderer } from '@repo/ui/components/workspace/WorkspaceRenderer';
import { useWorkspaceRendererContext } from '@repo/ui/components/workspace/shared';

function ContextProbe() {
  const { runtimePlatform } = useWorkspaceRendererContext();
  return <Text>{runtimePlatform}</Text>;
}

describe('WorkspaceRenderer', () => {
  it('provides renderer context when used as the root provider', () => {
    expect(() =>
      render(
        <WorkspaceRenderer platform="web" isNative={false}>
          <ContextProbe />
        </WorkspaceRenderer>,
      ),
    ).not.toThrow();
  });
});
