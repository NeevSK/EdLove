import { usePermissions } from '@repo/core';
import {
  Box,
  Heading,
  HStack,
  Icon,
  LayoutGrid,
  List,
  ScreenWrapper,
  Text,
  useThemedColors,
  VStack,
} from '@repo/ui';
import { Pressable, ScrollView, useTheme } from '@repo/ui/primitives';

import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  type DocumentStatus,
  type DocumentWorkflow,
  documentWorkflowAPI,
} from '../document-workflow/api';

interface DocumentListScreenWebProps {
  schoolId: string;
  onDocumentPress: (document: DocumentWorkflow) => void;
  onCreateNew: () => void;
  viewDate?: string;
  isPastView?: boolean;
}

const DocumentListScreenWeb: React.FC<DocumentListScreenWebProps> = ({
  schoolId,
  onDocumentPress,
  onCreateNew,
  viewDate,
  isPastView,
}) => {
  const _theme = useTheme();
  const _colors = useThemedColors();
  const { can, context: user } = usePermissions();
  const [documents, setDocuments] = useState<DocumentWorkflow[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentWorkflow[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'title' | 'status'>('updatedAt');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

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

  const filterAndSortDocuments = useCallback(() => {
    let filtered = [...documents];

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((doc) => doc.status === selectedStatus);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.content?.toString().toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'status':
          return a.status.localeCompare(b.status);
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

  const getStatusColors = (status: DocumentStatus) => {
    switch (status) {
      case 'draft':
        return { bg: 'bg-error/10', text: 'text-error' };
      case 'review':
        return { bg: 'bg-action/10', text: 'text-action' };
      case 'approved':
        return { bg: 'bg-green-100', text: 'text-green-600' };
      case 'published':
        return { bg: 'bg-action', text: 'text-white' };
      case 'archived':
        return { bg: 'bg-ink/10', text: 'text-ink/40' };
      default:
        return { bg: 'bg-ink/5', text: 'text-ink/30' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderDocumentItem = (document: DocumentWorkflow) => {
    const statusStyle = getStatusColors(document.status);

    if (viewMode === 'grid') {
      return (
        <Pressable
          key={document.id}
          onPress={() => onDocumentPress(document)}
          className="bg-white p-6 rounded-[32px] border border-border w-[31%] mb-6 active:scale-95 transition-all shadow-sm"
        >
          <VStack className="gap-4">
            <HStack className="justify-between items-start">
              <Box className={`${statusStyle.bg} px-3 py-1 rounded-full`}>
                <Text
                  className={`text-[10px] font-black uppercase tracking-widest ${statusStyle.text}`}
                >
                  {document.status}
                </Text>
              </Box>
              <Text className="text-[10px] font-bold text-ink/30">V{document.version}</Text>
            </HStack>

            <VStack className="gap-2">
              <Text className="text-lg font-black text-ink leading-tight" numberOfLines={2}>
                {document.title}
              </Text>
              <Text className="text-xs font-bold text-ink/40">
                Updated {formatDate(document.updatedAt)}
              </Text>
            </VStack>

            {document.status === 'review' && document.authorId !== user.userId && (
              <Box className="bg-action/10 p-3 rounded-2xl border border-action/20">
                <Text className="text-[11px] font-black text-action uppercase tracking-wider text-center">
                  Needs Review
                </Text>
              </Box>
            )}
          </VStack>
        </Pressable>
      );
    }

    return (
      <Pressable
        key={document.id}
        onPress={() => onDocumentPress(document)}
        className="bg-white p-5 rounded-[24px] border border-border mb-3 flex-row items-center justify-between active:scale-[0.99] transition-all"
      >
        <HStack className="gap-4 items-center flex-1">
          <Box className={`${statusStyle.bg} w-2 h-12 rounded-full`} />
          <VStack className="flex-1">
            <Text className="text-base font-black text-ink" numberOfLines={1}>
              {document.title}
            </Text>
            <Text className="text-xs font-bold text-ink/40">
              Version {document.version} • {formatDate(document.updatedAt)}
            </Text>
          </VStack>
        </HStack>

        <HStack className="gap-6 items-center">
          <Box className={`${statusStyle.bg} px-3 py-1 rounded-full`}>
            <Text
              className={`text-[10px] font-black uppercase tracking-widest ${statusStyle.text}`}
            >
              {document.status}
            </Text>
          </Box>
          {document.status === 'review' && document.authorId !== user.userId && (
            <Box className="bg-action/10 px-3 py-1 rounded-full border border-action/20">
              <Text className="text-[10px] font-black text-action uppercase tracking-widest">
                Review
              </Text>
            </Box>
          )}
        </HStack>
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <ScreenWrapper>
        <Box className="flex-1 items-center justify-center bg-silk p-20">
          <Text className="text-ink/40 font-bold italic">Gathering documentation...</Text>
        </Box>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper noTopInset={true}>
      <Box className="flex-1 bg-silk">
        {/* Web Header */}
        <Box className="px-12 py-10 bg-white border-b border-border">
          <HStack className="justify-between items-center">
            <VStack>
              <Heading className="text-4xl font-black text-ink tracking-tight">Documents</Heading>
              <Text className="text-base font-bold text-ink/40">
                {filteredDocuments.length} total items
              </Text>
            </VStack>

            <Pressable
              onPress={onCreateNew}
              className="bg-action px-8 py-4 rounded-full active:scale-95 shadow-lg shadow-action/20"
            >
              <Text className="text-white font-black uppercase tracking-widest">
                + New Document
              </Text>
            </Pressable>
          </HStack>
        </Box>

        {/* Controls Bar */}
        <Box className="px-12 py-6 bg-silk">
          <HStack className="gap-8 items-center bg-white p-3 rounded-[32px] border border-border">
            <Box className="flex-1 pl-4">
              <input
                type="text"
                placeholder="Search documents by title or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-ink font-bold placeholder:text-ink/20"
              />
            </Box>

            <HStack className="gap-4 pr-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-silk/50 border border-border rounded-2xl px-4 py-2 text-xs font-bold text-ink/60 outline-none"
              >
                <option value="updatedAt">Latest First</option>
                <option value="title">Alphabetical</option>
                <option value="status">By Status</option>
              </select>

              <HStack className="bg-silk/50 rounded-2xl p-1 border border-border">
                <Pressable
                  onPress={() => setViewMode('list')}
                  className={`p-2 rounded-xl ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Icon
                    as={List}
                    size={18}
                    className={viewMode === 'list' ? 'text-action' : 'text-ink/20'}
                  />
                </Pressable>
                <Pressable
                  onPress={() => setViewMode('grid')}
                  className={`p-2 rounded-xl ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Icon
                    as={LayoutGrid}
                    size={18}
                    className={viewMode === 'grid' ? 'text-action' : 'text-ink/20'}
                  />
                </Pressable>
              </HStack>
            </HStack>
          </HStack>
        </Box>

        {/* Status Filter Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="max-h-16 flex-none"
          contentContainerStyle={{
            paddingLeft: 48,
            paddingRight: 48,
            gap: 12,
            paddingTop: 8,
            paddingBottom: 8,
          }}
        >
          {statusFilters.map((status) => (
            <Pressable
              key={status}
              onPress={() => setSelectedStatus(status)}
              className={`px-6 py-2 rounded-full border transition-all ${
                selectedStatus === status
                  ? 'bg-ink border-ink transform scale-105'
                  : 'bg-white border-border'
              }`}
            >
              <Text
                className={`text-xs font-black uppercase tracking-widest ${
                  selectedStatus === status ? 'text-white' : 'text-ink/40'
                }`}
              >
                {status}
                {status !== 'all' && ` (${documents.filter((d) => d.status === status).length})`}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Results Area */}
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 48, paddingBottom: 96 }}>
          {filteredDocuments.length === 0 ? (
            <Box className="items-center justify-center p-20 opacity-20">
              <Text className="text-2xl font-black text-ink">No Documents Found</Text>
              <Text className="text-sm font-bold text-ink mt-2">
                Try adjusting your filters or search query.
              </Text>
            </Box>
          ) : (
            <Box
              className={viewMode === 'grid' ? 'flex-row flex-wrap justify-between' : 'flex-col'}
            >
              {filteredDocuments.map(renderDocumentItem)}
            </Box>
          )}
        </ScrollView>
      </Box>
    </ScreenWrapper>
  );
};

export default DocumentListScreenWeb;
