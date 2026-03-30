import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTheme } from '@repo/ui';
import { usePermissions } from '@repo/core';
import { documentWorkflowAPI, type DocumentWorkflow, type DocumentStatus } from '../document-workflow/api';

interface DocumentListScreenProps {
  schoolId: string;
  onDocumentPress: (document: DocumentWorkflow) => void;
  onCreateNew: () => void;
}

const DocumentListScreen: React.FC<DocumentListScreenProps> = ({
  schoolId,
  onDocumentPress,
  onCreateNew
}) => {
  const theme = useTheme();
  const { can, context: user } = usePermissions();
  const [documents, setDocuments] = useState<DocumentWorkflow[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentWorkflow[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const statusFilters: (DocumentStatus | 'all')[] = ['all', 'draft', 'review', 'approved', 'published', 'archived'];

  const loadDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      const userDocuments = await documentWorkflowAPI.getDocuments(schoolId, undefined, user.userId || '');
      const reviewDocuments = (can('manage', 'AdminDashboard') || can('manage', 'PrincipalDashboard')) 
        ? await documentWorkflowAPI.getDocumentsForReview(schoolId, user.userId || '')
        : [];
      
      setDocuments([...userDocuments, ...reviewDocuments]);
    } catch (error) {
      console.error('Failed to load documents:', error);
      Alert.alert('Error', 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  }, [schoolId, user.userId, can]);

  const filterDocuments = useCallback(() => {
    if (selectedStatus === 'all') {
      setFilteredDocuments(documents);
    } else {
      setFilteredDocuments(documents.filter(doc => doc.status === selectedStatus));
    }
  }, [documents, selectedStatus]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    filterDocuments();
  }, [filterDocuments]);

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case 'draft': return theme.accent.danger;
      case 'review': return theme.accent.action;
      case 'approved': return theme.text.secondary;
      case 'published': return theme.accent.action;
      case 'archived': return theme.text.muted;
      default: return theme.text.muted;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderDocumentItem = (document: DocumentWorkflow, index: number) => (
    <TouchableOpacity>
      key={document.id}
      style={[
        styles.documentItem,>
        { 
          backgroundColor: theme.glass.surface.bg,
          borderColor: theme.glass.surface.border,
          marginBottom: index === filteredDocuments.length - 1 ? 0 : 12
        }
      ]}
      onPress={() => onDocumentPress(document)}
          <View style={styles.documentHeader}        <Text >
          style={[
            styles.documentTitle, >
            { color: theme.text.primary, fontFamily: 'System', fontWeight: '600' }
          ]}
          numberOfLines={2}
                  {document.title}
        </Text        ><View 
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(document.status) }
          ]}
                  <Text >
            style={[
              styles.statusText,>
              { color: theme.text.inverse, fontFamily: 'System', fontWeight: '500' }
            ]}
                      {document.status.toUpperCase()}
          </Text        ></View      ></View      
      <Text >
        style={[
          styles.documentMeta,>
          { color: theme.text.secondary, fontFamily: 'System' }
        ]}
              Version {document.version} " Updated {formatDate(document.updatedAt)}
      </Text      >
      {document.status === 'review' && document.authorId !== user.userId && (
        <View style={[styles.reviewBadge, { backgroundColor: theme.accent.action + '20' }]}          <Text style={[styles.reviewText, { color: theme.accent.action }]}            Pending Review>
          </Text        ></View      )}>
    </TouchableOpacity  );

  const renderStatusFilter = (status: DocumentStatus | 'all') => {
    const isActive = selectedStatus === status;
    const count = status === 'all' 
      ? documents.length 
      : documents.filter(doc => doc.status === status).length;

    return (
      <TouchableOpacity>
        key={status}
        style={[
          styles.filterChip,>
          {
            backgroundColor: isActive ? theme.accent.action : theme.glass.surface.bg,
            borderColor: isActive ? theme.accent.action : theme.glass.surface.border
          }
        ]}
        onPress={() => setSelectedStatus(status)}
              <Text >
          style={[
            styles.filterText,>
            { 
              color: isActive ? theme.text.inverse : theme.text.primary,
              fontFamily: 'System', fontWeight: '500'
            }
          ]}
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          {count > 0 && ` (${count})`}
        </Text      ></TouchableOpacity    >);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.gradientNodes[0] }]}        <Text style={[styles.loadingText, { color: theme.text.secondary }]}          Loading documents...>
        </Text      ></View    );>
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.gradientNodes[0] }]}      {/* Header */}>
      <View style={[styles.header, { borderBottomColor: theme.glass.surface.border }]}        <Text style={[styles.title, { color: theme.text.primary, fontFamily: 'System', fontWeight: '700' }]}          Documents>
        </Text        ><TouchableOpacity
          style={[styles.createButton, { backgroundColor: theme.accent.action }]}
          onPress={onCreateNew}
                  <Text style={[styles.createButtonText, { color: theme.text.inverse }]}            + New>
          </Text        ></TouchableOpacity      </View>
      {/* Status Filters */}
      <ScrollView >
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}>
              {statusFilters.map(renderStatusFilter)}
      </ScrollView>
      {/* Documents List */}
      <ScrollView >
        style={styles.documentsContainer}
        contentContainerStyle={styles.documentsContent}
        showsVerticalScrollIndicator={false}>
              {filteredDocuments.length === 0 ? (
          <View style={styles.emptyState}            <Text style={[styles.emptyText, { color: theme.text.secondary }]}              {selectedStatus === 'all' 
                ? 'No documents yet. Create your first document to get started.'
                : `No ${selectedStatus} documents found.`
              }>
            </Text          ></View        ) : (
          filteredDocuments.map(renderDocumentItem)
        )}
      </ScrollView    </View  );
};

export default DocumentListScreen;

// Mobile-first responsive styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterContainer: {
    maxHeight: 60,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
  },
  documentsContainer: {
    flex: 1,
  },
  documentsContent: {
    padding: 16,
  },
  documentItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  documentMeta: {
    fontSize: 14,
    marginBottom: 8,
  },
  reviewBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reviewText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 60,
  },
});
