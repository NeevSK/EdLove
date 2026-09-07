import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs';
import { Text } from '@repo/ui/components/ui/text';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

describe('Tabs (scenario contract)', {
  tags: ['interaction', 'a11y', 'scenario', 'boundary'],
}, () => {
  it('selects a trigger and renders matching content', async () => {
    const onValueChange = vi.fn();
    const { rerender } = await render(
      <Tabs value="one" onValueChange={onValueChange}>
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one">
          <Text>First panel</Text>
        </TabsContent>
        <TabsContent value="two">
          <Text>Second panel</Text>
        </TabsContent>
      </Tabs>,
    );

    expect(screen.getByText('First panel')).toBeTruthy();
    expect(screen.queryByText('Second panel')).toBeNull();
    fireEvent.press(screen.getByRole('tab', { name: 'Two' }));
    expect(onValueChange).toHaveBeenCalledWith('two');

    await rerender(
      <Tabs value="two" onValueChange={onValueChange}>
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one">
          <Text>First panel</Text>
        </TabsContent>
        <TabsContent value="two">
          <Text>Second panel</Text>
        </TabsContent>
      </Tabs>,
    );

    expect(screen.getByRole('tab', { name: 'Two' }).props.accessibilityState?.selected).toBe(true);
    expect(screen.queryByText('First panel')).toBeNull();
    expect(screen.getByText('Second panel')).toBeTruthy();
  });
});
