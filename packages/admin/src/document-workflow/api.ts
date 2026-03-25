export type { 
  DocumentWorkflow, 
  DocumentVersion, 
  DocumentComment, 
  DocumentCollaborator,
  DocumentTemplate,
  ChangeRecord,
  DocumentStatus
} from './types';

import { documentWorkflowEngine } from './engine';
import { 
  DocumentWorkflow, 
  DocumentVersion, 
  DocumentComment, 
  DocumentCollaborator,
  DocumentTemplate,
  ChangeRecord,
  DocumentStatus
} from './types';

export interface DocumentWorkflowAPI {
  // Lifecycle management
  createDraft(template: DocumentTemplate, data: any, authorId: string, schoolId: string): Promise<DocumentWorkflow>;
  submitForReview(documentId: string, userId: string): Promise<void>;
  approveDocument(documentId: string, userId: string, comments?: string): Promise<void>;
  rejectDocument(documentId: string, userId: string, reason: string): Promise<void>;
  publishDocument(documentId: string, userId: string): Promise<void>;
  archiveDocument(documentId: string, userId: string): Promise<void>;
  
  // Version control
  getVersionHistory(documentId: string): Promise<DocumentVersion[]>;
  createVersion(documentId: string, content: any, authorId: string, changes?: any): Promise<DocumentVersion>;
  restoreVersion(documentId: string, versionId: string, userId: string): Promise<void>;
  
  // Collaboration
  addComment(documentId: string, authorId: string, content: string, type: DocumentComment['type']): Promise<void>;
  inviteCollaborator(documentId: string, userId: string, role: DocumentCollaborator['role'], invitedBy: string): Promise<void>;
  trackChanges(documentId: string): Promise<ChangeRecord[]>;
  
  // Document retrieval
  getDocument(documentId: string): Promise<DocumentWorkflow | null>;
  getDocuments(schoolId: string, status?: DocumentStatus, authorId?: string): Promise<DocumentWorkflow[]>;
  getDocumentsForReview(schoolId: string, userId: string): Promise<DocumentWorkflow[]>;
  getPublishedDocuments(schoolId: string): Promise<DocumentWorkflow[]>;
}

export const documentWorkflowAPI: DocumentWorkflowAPI = {
  // Lifecycle management
  async createDraft(template: DocumentTemplate, data: any, authorId: string, schoolId: string): Promise<DocumentWorkflow> {
    return await documentWorkflowEngine.createDraft(template, data, authorId, schoolId);
  },

  async submitForReview(documentId: string, userId: string): Promise<void> {
    return await documentWorkflowEngine.submitForReview(documentId, userId);
  },

  async approveDocument(documentId: string, userId: string, comments?: string): Promise<void> {
    return await documentWorkflowEngine.approveDocument(documentId, userId, comments);
  },

  async rejectDocument(documentId: string, userId: string, reason: string): Promise<void> {
    return await documentWorkflowEngine.rejectDocument(documentId, userId, reason);
  },

  async publishDocument(documentId: string, userId: string): Promise<void> {
    return await documentWorkflowEngine.publishDocument(documentId, userId);
  },

  async archiveDocument(documentId: string, userId: string): Promise<void> {
    return await documentWorkflowEngine.archiveDocument(documentId, userId);
  },

  // Version control
  async getVersionHistory(documentId: string): Promise<DocumentVersion[]> {
    return await documentWorkflowEngine.getVersionHistory(documentId);
  },

  async createVersion(documentId: string, content: any, authorId: string, changes?: any): Promise<DocumentVersion> {
    return await documentWorkflowEngine.createVersion(documentId, content, authorId, changes);
  },

  async restoreVersion(documentId: string, versionId: string, userId: string): Promise<void> {
    return await documentWorkflowEngine.restoreVersion(documentId, versionId, userId);
  },

  // Collaboration
  async addComment(documentId: string, authorId: string, content: string, type: DocumentComment['type']): Promise<void> {
    return await documentWorkflowEngine.addComment(documentId, authorId, content, type);
  },

  async inviteCollaborator(documentId: string, userId: string, role: DocumentCollaborator['role'], invitedBy: string): Promise<void> {
    return await documentWorkflowEngine.inviteCollaborator(documentId, userId, role, invitedBy);
  },

  async trackChanges(documentId: string): Promise<ChangeRecord[]> {
    return await documentWorkflowEngine.trackChanges(documentId);
  },

  // Document retrieval
  async getDocument(documentId: string): Promise<DocumentWorkflow | null> {
    const { supabase } = await import('@repo/core');
    const { data, error } = await supabase
      .from('document_workflows')
      .select('*')
      .eq('id', documentId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getDocuments(schoolId: string, status?: DocumentStatus, authorId?: string): Promise<DocumentWorkflow[]> {
    const { supabase } = await import('@repo/core');
    let query = supabase
      .from('document_workflows')
      .select('*')
      .eq('schoolId', schoolId);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (authorId) {
      query = query.eq('authorId', authorId);
    }
    
    const { data, error } = await query.order('updatedAt', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getDocumentsForReview(schoolId: string, userId: string): Promise<DocumentWorkflow[]> {
    const { supabase } = await import('@repo/core');
    const { data, error } = await supabase
      .from('document_workflows')
      .select('*')
      .eq('schoolId', schoolId)
      .eq('status', 'review')
      .neq('authorId', userId) // Don't show own documents for review
      .order('updatedAt', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getPublishedDocuments(schoolId: string): Promise<DocumentWorkflow[]> {
    const { supabase } = await import('@repo/core');
    const { data, error } = await supabase
      .from('document_workflows')
      .select('*')
      .eq('schoolId', schoolId)
      .eq('status', 'published')
      .order('updatedAt', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
};
