import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useDebouncedValue, useThrottledInvalidate } from '@/hooks/usePacer';

// Mock API function to simulate a network call
const fetchMockSearchResults = async (query: string): Promise<string[]> => {
  if (!query) return [];
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [`Result 1 for "${query}"`, `Result 2 for "${query}"`, `Result 3 for "${query}"`];
};

export default function TanStackPacerDemo() {
  const [searchTerm, setSearchTerm] = useState('');
  const [syncClickCount, setSyncClickCount] = useState(0);
  const [actualInvalidationCount, setActualInvalidationCount] = useState(0);

  // 1. Debounce Search Input
  // Debounce the search term value by 400ms before sending it as a Query Key
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 400);

  // React Query will only trigger a fetch when debouncedSearchTerm changes
  const { data: searchResults, isFetching } = useQuery({
    queryKey: ['mockSearch', debouncedSearchTerm],
    queryFn: () => fetchMockSearchResults(debouncedSearchTerm),
    enabled: debouncedSearchTerm.length > 0,
  });

  // 2. Throttle Database Invalidation
  // Throttle invalidation triggers (e.g., from SQLite/PowerSync sync streaming) to once every 1000ms
  const throttledInvalidate = useThrottledInvalidate(1000);

  const handleRapidDbSyncEvent = () => {
    setSyncClickCount((prev) => prev + 1);

    // Call the throttled invalidation function
    throttledInvalidate(['mockSearch']).then(() => {
      setActualInvalidationCount((prev) => prev + 1);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TanStack Pacer + React Query Demo</Text>

      {/* Section 1: Debounced Search */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>1. Debounced Search (useDebouncedValue)</Text>
        <TextInput
          accessibilityLabel="Search term input"
          accessibilityHint="Enter a term to search query cache mock results"
          style={styles.input}
          placeholder="Type to search..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor="#888"
        />
        <Text style={styles.text}>Current Input: "{searchTerm}"</Text>
        <Text style={styles.text}>Debounced Query Key: "{debouncedSearchTerm}"</Text>

        {isFetching && <Text style={styles.fetching}>Fetching results...</Text>}
        {searchResults && searchResults.length > 0 && (
          <View style={styles.resultsContainer}>
            {searchResults.map((result, idx) => (
              <Text key={idx} style={styles.resultItem}>
                • {result}
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* Section 2: Throttled Invalidation */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>
          2. Throttled Sync Invalidation (useThrottledInvalidate)
        </Text>
        <Text style={styles.text}>
          Simulate rapid database synchronization event stream (PowerSync triggers).
        </Text>
        <View style={styles.buttonContainer}>
          <Button title="Trigger Rapid Db Invalidation" onPress={handleRapidDbSyncEvent} />
        </View>
        <Text style={styles.text}>Triggered Events Count: {syncClickCount}</Text>
        <Text style={styles.text}>
          Actual Invalidation Executions (1s throttle): {actualInvalidationCount}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    color: '#fff',
    marginBottom: 10,
    backgroundColor: '#2A2A2A',
  },
  text: {
    color: '#AAA',
    fontSize: 14,
    marginVertical: 4,
  },
  fetching: {
    color: '#FFA726',
    marginVertical: 5,
    fontStyle: 'italic',
  },
  resultsContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 10,
  },
  resultItem: {
    color: '#FFF',
    fontSize: 14,
    marginVertical: 2,
  },
  buttonContainer: {
    marginVertical: 10,
  },
});
