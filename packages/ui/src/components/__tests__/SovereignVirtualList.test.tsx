import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react-native';
import { Text, View } from 'react-native';

// G1 Boundary Mock for FlashList recycler runtime in Vitest
vi.mock('@shopify/flash-list', () => {
  return {
    FlashList: ({ data, renderItem, ListEmptyComponent, testID }: any) => {
      if (!data || data.length === 0) {
        return (
          <View testID={testID}>
            {React.isValidElement(ListEmptyComponent)
              ? ListEmptyComponent
              : typeof ListEmptyComponent === 'function'
              ? React.createElement(ListEmptyComponent)
              : null}
          </View>
        );
      }
      return (
        <View testID={testID}>
          {data.map((item: any, index: number) => (
            <React.Fragment key={item.id ?? index}>
              {renderItem({ item, index, target: 'Cell' })}
            </React.Fragment>
          ))}
        </View>
      );
    },
  };
});

import { SovereignVirtualList } from '../SovereignVirtualList';

describe('SovereignVirtualList (G1 Boundary & Contract)', () => {
  interface TestItem {
    id: string;
    title: string;
  }

  const renderItem = ({ item }: { item: TestItem }) => (
    <Text testID={`item-${item.id}`}>{item.title}</Text>
  );

  it('renders loading skeleton when isLoading is true and data is empty', async () => {
    await render(
      <SovereignVirtualList<TestItem>
        name="TestFeed"
        testID="feed-list"
        isLoading={true}
        data={[]}
        renderItem={renderItem}
      />
    );

    expect(screen.getByTestId('feed-list-loading')).toBeTruthy();
  });

  it('renders default empty state when not loading and data is empty', async () => {
    await render(
      <SovereignVirtualList<TestItem>
        name="TestFeed"
        testID="feed-list"
        isLoading={false}
        data={[]}
        renderItem={renderItem}
        emptyTitle="No classroom records"
      />
    );

    expect(screen.getByText('No classroom records')).toBeTruthy();
  });

  it('renders item rows when data is provided', async () => {
    const items: TestItem[] = [
      { id: '1', title: 'Morning Meditation' },
      { id: '2', title: 'Classroom Reflection' },
    ];

    await render(
      <SovereignVirtualList<TestItem>
        name="TestFeed"
        testID="feed-list"
        isLoading={false}
        data={items}
        renderItem={renderItem}
      />
    );

    expect(screen.getByText('Morning Meditation')).toBeTruthy();
    expect(screen.getByText('Classroom Reflection')).toBeTruthy();
  });
});
