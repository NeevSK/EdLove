import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import { useTheme } from '@repo/ui';
import { usePermissions } from '@repo/core';
import { documentWorkflowAPI, type DocumentWorkflow, type DocumentStatus } from '../document-workflow/api';

interface DocumentListScreenWebProps {
  schoolId: string;
  onDocumentPress: (document: DocumentWorkflow) => void;
  onCreateNew: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

const DocumentListScreenWeb: React.FC<DocumentListScreenWebProps> = ({
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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'title' | 'status'>('updatedAt');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

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

  const filterAndSortDocuments = useCallback(() => {
    let filtered = [...documents];

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(doc => doc.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.content?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort documents
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'updatedAt':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    setFilteredDocuments(filtered);
  }, [documents, selectedStatus, searchQuery, sortBy]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    filterAndSortDocuments();
  }, [filterAndSortDocuments]);

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

  const isDesktop = screenWidth > 1024;
  const isTablet = screenWidth > 768 && screenWidth <= 1024;

  const renderDocumentItem = (document: DocumentWorkflow, index: number) => {
    if (viewMode === 'grid' && isDesktop) {
      return (
        <TouchableOpacity>
          key={document.id}
          style={[
            styles.documentCardGrid,>
            { 
              backgroundColor: theme.glass.surface.bg,
              borderColor: theme.glass.surface.border,
            }
          ]}
          onPress={() => onDocumentPress(document)}
                  <View style={styles.cardHeader}            <Text >
              style={[
                styles.documentTitleGrid,>
                { color: theme.text.primary, fontFamily: 'System', fontWeight: '600' }
              ]}
              numberOfLines={3}
                          {document.title}
            </Text            ><View 
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
              </Text            ></View          ></View          
          <Text >
            style={[
              styles.documentMeta,>
              { color: theme.text.secondary, fontFamily: 'System' }
            ]}
                      Version {document.version}
          </Text          >
          <Text >
            style={[
              styles.documentMeta,>
              { color: theme.text.secondary, fontFamily: 'System' }
            ]}
                      Updated {formatDate(document.updatedAt)}
          </Text          >
          {document.status === 'review' && document.authorId !== user.userId && (
            <View style={[styles.reviewBadge, { backgroundColor: theme.accent.action + '20' }]}              <Text style={[styles.reviewText, { color: theme.accent.action }]}                Pending Review>
              </Text            ></View          )}>
        </TouchableOpacity      );
    }

    return (
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
              <View style={styles.documentHeader}          <Text >
            style={[
              styles.documentTitle, >
              { color: theme.text.primary, fontFamily: 'System', fontWeight: '600' }
            ]}
            numberOfLines={2}
                      {document.title}
          </Text          ><View 
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
            </Text            ></View        ></View        
        <Text >
          style={[
            styles.documentMeta,>
            { color: theme.text.secondary, fontFamily: 'System' }
          ]}
                  Version {document.version} " Updated {formatDate(document.updatedAt)}
        </Text        >
        {document.status === 'review' && document.authorId !== user.userId && (
          <View style={[styles.reviewBadge, { backgroundColor: theme.accent.action + '20' }]}            <Text style={[styles.reviewText, { color: theme.accent.action }]}              Pending Review>
            </Text          ></View        )}>
      </TouchableOpacity    );
  };

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
    <View style={[styles.container, { backgroundColor: theme.gradientNodes[0] }]}      {/* Enhanced Header */}>
      <View style={[styles.headerWeb, { borderBottomColor: theme.glass.surface.border }]}        <View style={styles.headerLeft}          <Text style={[styles.title, { color: theme.text.primary, fontFamily: 'System', fontWeight: '700' }]}            Documents>
          </Text          ><Text style={[styles.subtitle, { color: theme.text.secondary, fontFamily: 'System' }]}            {filteredDocuments.length} {filteredDocuments.length === 1 ? 'document' : 'documents'}
          </Text        ></View        
        <View style={styles.headerActions}          <TouchableOpacity>
            style={[styles.createButton, { backgroundColor: theme.accent.action }]}
            onPress={onCreateNew}>
                      <Text style={[styles.createButtonText, { color: theme.text.inverse }]}              + New Document>
            </Text          </TouchableOpacity        </View      </View>
      {/* Web Controls */}
      <View style={[styles.webControls, { backgroundColor: theme.glass.surface.bg }]}        <View style={styles.searchSection}          <input>
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInputWeb}
          /        ></View
        <View style={styles.controlGroup}          <select>
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={styles.sortSelectWeb}
                      <option value="updatedAt">Last Updated</option            <option value="title">Title</option            <option value="status">Status</option          </select
          {isDesktop && (
            <View style={styles.viewToggle}              <TouchableOpacity>
                style={[
                  styles.viewButton,
                  viewMode === 'list' && { backgroundColor: theme.accent.action }
                ]}
                onPress={() => setViewMode('list')}
                              <Text style={[>
                  styles.viewButtonText,>
                  { color: viewMode === 'list' ? theme.text.inverse : theme.text.primary }
                ]}                  List
                </Text              ></TouchableOpacity              <TouchableOpacity
                style={[
                  styles.viewButton,
                  viewMode === 'grid' && { backgroundColor: theme.accent.action }
                ]}
                onPress={() => setViewMode('grid')}
                              <Text style={[>
                  styles.viewButtonText,>
                  { color: viewMode === 'grid' ? theme.text.inverse : theme.text.primary }
                ]}                  Grid
                </Text              </TouchableOpacity            </View          )}
        </View      </View
      {/* Status Filters */}
      <ScrollView >
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}>
              {statusFilters.map(renderStatusFilter)}
      </ScrollView>
      {/* Documents List/Grid */}
      <ScrollView >
        style={styles.documentsContainer}
        contentContainerStyle={[
          styles.documentsContent,
          viewMode === 'grid' && styles.documentsGrid>
        ]}
        showsVerticalScrollIndicator={false}
              {filteredDocuments.length === 0 ? (
          <View style={styles.emptyState}            <Text style={[styles.emptyText, { color: theme.text.secondary }]}              {searchQuery 
                ? `No documents found matching "${searchQuery}"`
                : selectedStatus === 'all' 
                  ? 'No documents yet. Create your first document to get started.'
                  : `No ${selectedStatus} documents found.`
              }>
            </Text          ></View        >) : (
          filteredDocuments.map(renderDocumentItem)
        )}
      </ScrollView    </View  );
};

export default DocumentListScreenWeb;

// Web-enhanced responsive styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWeb: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  webControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    marginHorizontal: 32,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchSection: {
    flex: 1,
    marginRight: 16,
  },
  searchInput: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    fontFamily: 'System',
  },
  searchInputWeb: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    fontFamily: 'System',
    backgroundColor: '#F5EDD6',
    borderColor: '#E8E2CF',
    color: '#2A2318',
  },
  controlGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sortSelect: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
    fontFamily: 'System',
  },
  sortSelectWeb: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
    fontFamily: 'System',
    backgroundColor: '#F5EDD6',
    borderColor: '#E8E2CF',
    color: '#2A2318',
  },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterContainer: {
    maxHeight: 60,
  },
  filterContent: {
    paddingHorizontal: 32,
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
    padding: 32,
  },
  documentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  documentItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  documentCardGrid: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardHeader: {
    marginBottom: 12,
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
  documentTitleGrid: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 22,
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
    marginBottom: 4,
  },
  reviewBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
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
