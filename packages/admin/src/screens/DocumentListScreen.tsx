import { usePermissions } from '@repo/core/logic';
import { Box, Button } from '@repo/ui/primitives';
import { ButtonText, HStack, Heading, Text, VStack } from '@repo/ui/primitives';
import { Pressable, ScrollView } from '@repo/ui/primitives';

import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  type DocumentStatus,
  type DocumentWorkflow,
  documentWorkflowAPI,
} from '../document-workflow/api';

interface DocumentListScreenProps {
  schoolId: string;
  onDocumentPress: (document: DocumentWorkflow) => void;
  onCreateNew: () => void;
  viewDate?: string;
  isPastView?: boolean;
}

const DocumentListScreen: React.FC<DocumentListScreenProps> = ({
  schoolId,
  onDocumentPress,
  onCreateNew,
  viewDate,
  isPastView,
}) => {
  const { can, context: user } = usePermissions();
  const [documents, setDocuments] = useState<DocumentWorkflow[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentWorkflow[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const statusFilters: (DocumentStatus | 'all')[] = [
    'all',
    'draft',
    'review',
    'approved',
    'published',
    'archived',
  ];

  const loadDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      const userDocuments = await documentWorkflowAPI.getDocuments(
        schoolId,
        undefined,
        user.userId || '',
      );
      const reviewDocuments =
        can('manage', 'AdminDashboard') || can('manage', 'PrincipalDashboard')
          ? await documentWorkflowAPI.getDocumentsForReview(schoolId, user.userId || '')
          : [];

      setDocuments([...userDocuments, ...reviewDocuments]);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setIsLoading(false);
    }
  }, [schoolId, user.userId, can]);

  const filterDocuments = useCallback(() => {
    if (selectedStatus === 'all') {
      setFilteredDocuments(documents);
    } else {
      setFilteredDocuments(documents.filter((doc) => doc.status === selectedStatus));
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
      case 'draft':
        return 'bg-phase-danger/10 text-phase-danger';
      case 'review':
        return 'bg-phase-interactive/10 text-phase-interactive';
      case 'approved':
        return 'bg-phase-success/10 text-phase-success';
      case 'published':
        return 'bg-phase-interactive/10 text-phase-interactive';
      case 'archived':
        return 'bg-phaseText-muted/10 text-phaseText-muted';
      default:
        return 'bg-phaseText-muted/5 text-phaseText-muted';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderDocumentItem = (document: DocumentWorkflow, _index: number) => (
    <Pressable
      key={document.id}
      onPress={() => onDocumentPress(document)}
      className="bg-phase-surface p-5 rounded-3xl border border-phase-border mb-3 active:scale-[0.98]"
    >
      <HStack className="justify-between items-start mb-2">
        <VStack className="flex-1 mr-4 gap-1">
          <Text className="font-bold text-lg text-phaseText-primary" numberOfLines={2}>
            {document.title}
          </Text>
          <Text className="text-xs text-phaseText-muted">
            Version {document.version} • Updated {formatDate(document.updatedAt)}
          </Text>
        </VStack>
        <Box className={`px-2 py-1 rounded-full ${getStatusColor(document.status).split(' ')[0]}`}>
          <Text
            className={`text-[10px] font-black uppercase ${getStatusColor(document.status).split(' ')[1]}`}
          >
            {document.status}
          </Text>
        </Box>
      </HStack>
    </Pressable>
  );

  const renderStatusFilter = (status: DocumentStatus | 'all') => {
    const isActive = selectedStatus === status;
    const count =
      status === 'all' ? documents.length : documents.filter((doc) => doc.status === status).length;

    return (
      <Pressable
        key={status}
        onPress={() => setSelectedStatus(status)}
        className={`px-4 py-2 rounded-full border mr-2 ${
          isActive
            ? 'bg-phase-interactive border-phase-interactive'
            : 'bg-phase-surface border-phase-border active:bg-phaseText-primary/5'
        }`}
      >
        <Text
          className={`text-sm font-bold ${isActive ? 'text-white' : 'text-phaseText-secondary'}`}
        >
          {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          {count > 0 && ` (${count})`}
        </Text>
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <Box className="flex-1 bg-phase-canvas items-center justify-center p-10">
        <Text className="text-phaseText-muted font-bold italic">Loading documents...</Text>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-phase-canvas">
      <VStack className="p-6 gap-6">
        <HStack className="justify-between items-center">
          <VStack className="gap-1">
            <Heading className="text-3xl font-black text-phaseText-primary">Documents</Heading>
            <Text className="text-sm text-phaseText-muted">
              Manage your institutional artifacts
            </Text>
          </VStack>
          <Button
            onPress={onCreateNew}
            className="bg-phase-interactive rounded-2xl h-11 px-6 shadow-sm active:scale-95"
          >
            <ButtonText className="font-black text-white">+ New</ButtonText>
          </Button>
        </HStack>

        <Box className="h-10">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HStack>{statusFilters.map(renderStatusFilter)}</HStack>
          </ScrollView>
        </Box>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {filteredDocuments.length === 0 ? (
            <Box className="p-10 items-center justify-center bg-phase-surface rounded-3xl border border-dashed border-phase-border mt-4">
              <Text className="text-phaseText-muted italic font-bold text-center">
                {selectedStatus === 'all'
                  ? 'No documents yet.'
                  : `No ${selectedStatus} documents found.`}
              </Text>
            </Box>
          ) : (
            filteredDocuments.map((doc, idx) => renderDocumentItem(doc, idx))
          )}
        </ScrollView>
      </VStack>
    </Box>
  );
};

export default DocumentListScreen;
