/**
 * TodoView — Generic Reusable Offline-First Todo List Surface
 *
 * Can be mounted on any screen (Founder, Teacher, Student, Tomorrow Prep)
 * simply by passing a list name. Dressed by the active world tokens.
 */

import React, { useMemo, useState } from 'react';
import {
  Keyboard,
  Pressable,
  type StyleProp,
  StyleSheet,
  Text as RNText,
  TextInput,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTodos, type Todo } from '@repo/core/powersync';
import { radiusStyle, useWorldContext } from '@repo/ui/theme/native';
import { hapticLight, hapticSelection } from '@repo/ui/utils/haptics';
import { SwipeableTodoRow } from './SwipeableTodoRow';

export interface TodoViewProps {
  listName: string;
  userId?: string;
  displayTitle?: string;
  style?: StyleProp<ViewStyle>;
}

type FilterType = 'all' | 'active' | 'completed';

export function TodoView({
  listName,
  userId,
  displayTitle,
  style,
}: TodoViewProps) {
  const { world } = useWorldContext();
  const tokens = world.tokens;
  const rad = radiusStyle(world.definition.style.corner.surface);
  const inputRad = radiusStyle(world.definition.style.corner.control);

  const { todos, isLoading, addTodo, toggleTodo, deleteTodo } = useTodos(
    listName,
    userId,
  );

  const [inputTitle, setInputTitle] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  const pendingCount = (todos as Todo[]).filter((t: Todo) => !t.isCompleted).length;
  const completedCount = (todos as Todo[]).length - pendingCount;
  const progressPct =
    (todos as Todo[]).length > 0
      ? Math.round((completedCount / (todos as Todo[]).length) * 100)
      : 0;

  const filteredTodos = useMemo(() => {
    const all = todos as Todo[];
    if (filter === 'active') return all.filter((t) => !t.isCompleted);
    if (filter === 'completed') return all.filter((t) => t.isCompleted);
    return all;
  }, [todos, filter]);

  const handleAdd = async () => {
    const trimmed = inputTitle.trim();
    if (!trimmed) return;
    hapticLight();
    setInputTitle('');
    Keyboard.dismiss();
    await addTodo(trimmed);
  };

  const handleFilterSelect = (selected: FilterType) => {
    hapticSelection();
    setFilter(selected);
  };

  return (
    <View style={[styles.wrapper, style]}>
      {/* Header bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <RNText style={[styles.headerTitle, { color: tokens.ink }]}>
            {displayTitle || listName}
          </RNText>
          <View style={[styles.badge, { backgroundColor: tokens.sunken }]}>
            <RNText style={[styles.badgeText, { color: tokens.inkSoft }]}>
              {pendingCount} remaining
            </RNText>
          </View>
        </View>

        {completedCount > 0 && (
          <RNText style={[styles.completedSubtext, { color: tokens.inkFaint }]}>
            {completedCount} completed ({progressPct}%)
          </RNText>
        )}
      </View>

      {/* Progress Track */}
      {(todos as Todo[]).length > 0 && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressTrack, { backgroundColor: tokens.sunken }]}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${progressPct}%`,
                  backgroundColor: tokens.lamp,
                },
              ]}
            />
          </View>
        </View>
      )}

      {/* Quick-add inline input */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: tokens.sunken,
            borderColor: tokens.line,
          },
          inputRad,
        ]}
      >
        <TextInput
          value={inputTitle}
          onChangeText={setInputTitle}
          onSubmitEditing={handleAdd}
          placeholder={`Add task to ${displayTitle || listName}...`}
          placeholderTextColor={tokens.inkFaint}
          returnKeyType="done"
          style={[styles.input, { color: tokens.ink }]}
        />
        <Pressable
          onPress={handleAdd}
          disabled={!inputTitle.trim()}
          hitSlop={8}
          style={[
            styles.addButton,
            {
              backgroundColor: inputTitle.trim() ? tokens.lamp : 'transparent',
            },
          ]}
        >
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 5v14M5 12h14"
              stroke={inputTitle.trim() ? tokens.onLamp : tokens.inkFaint}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          </Svg>
        </Pressable>
      </View>

      {/* Filter Tabs */}
      {(todos as Todo[]).length > 0 && (
        <View style={styles.filtersBar}>
          <Pressable
            onPress={() => handleFilterSelect('all')}
            style={[
              styles.filterTab,
              filter === 'all' && [styles.filterTabActive, { backgroundColor: tokens.sunken }],
            ]}
          >
            <RNText
              style={[
                styles.filterTabText,
                { color: filter === 'all' ? tokens.ink : tokens.inkFaint },
                filter === 'all' && styles.filterTabTextActive,
              ]}
            >
              All ({(todos as Todo[]).length})
            </RNText>
          </Pressable>

          <Pressable
            onPress={() => handleFilterSelect('active')}
            style={[
              styles.filterTab,
              filter === 'active' && [styles.filterTabActive, { backgroundColor: tokens.sunken }],
            ]}
          >
            <RNText
              style={[
                styles.filterTabText,
                { color: filter === 'active' ? tokens.ink : tokens.inkFaint },
                filter === 'active' && styles.filterTabTextActive,
              ]}
            >
              Active ({pendingCount})
            </RNText>
          </Pressable>

          <Pressable
            onPress={() => handleFilterSelect('completed')}
            style={[
              styles.filterTab,
              filter === 'completed' && [styles.filterTabActive, { backgroundColor: tokens.sunken }],
            ]}
          >
            <RNText
              style={[
                styles.filterTabText,
                { color: filter === 'completed' ? tokens.ink : tokens.inkFaint },
                filter === 'completed' && styles.filterTabTextActive,
              ]}
            >
              Done ({completedCount})
            </RNText>
          </Pressable>
        </View>
      )}

      {/* Animated Task List */}
      <View style={styles.listContainer}>
        {filteredTodos.length === 0 && !isLoading ? (
          <View style={[styles.emptyContainer, { borderColor: tokens.line }, rad]}>
            <RNText style={[styles.emptyTitle, { color: tokens.inkSoft }]}>
              {filter === 'completed'
                ? 'No completed tasks yet'
                : filter === 'active'
                ? 'All clear!'
                : 'All clear'}
            </RNText>
            <RNText style={[styles.emptySubtitle, { color: tokens.inkFaint }]}>
              {filter === 'active'
                ? 'Every item in this list is completed. Take a mindful breath!'
                : filter === 'completed'
                ? 'Swipe items to the right to mark them completed.'
                : 'No pending tasks in this list. Add one above!'}
            </RNText>
          </View>
        ) : (
          filteredTodos.map((item: Todo) => (
            <Animated.View
              key={item.id}
              layout={LinearTransition.springify().damping(16)}
            >
              <SwipeableTodoRow
                id={item.id}
                title={item.title}
                notes={item.notes}
                isCompleted={item.isCompleted}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
              />
            </Animated.View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  completedSubtext: {
    fontSize: 12,
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 4,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersBar: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  filterTab: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  filterTabActive: {
    borderRadius: 8,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '500',
  },
  filterTabTextActive: {
    fontWeight: '700',
  },
  listContainer: {
    gap: 6,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
});
