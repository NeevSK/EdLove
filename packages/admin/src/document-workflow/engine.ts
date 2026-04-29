import { supabase } from '@repo/core/native';

import type {
  ChangeRecord,
  DocumentCollaborator,
  DocumentComment,
  DocumentStatus,
  DocumentTemplate,
  DocumentVersion,
  DocumentWorkflow,
  WorkflowTransition,
} from './types';

export class DocumentWorkflowEngine {
  private static instance: DocumentWorkflowEngine;

  static getInstance(): DocumentWorkflowEngine {
    if (!DocumentWorkflowEngine.instance) {
      DocumentWorkflowEngine.instance = new DocumentWorkflowEngine();
    }
    return DocumentWorkflowEngine.instance;
  }

  // Workflow transition rules
  private workflowTransitions: WorkflowTransition[] = [
    {
      from: 'draft',
      to: 'review',
      action: 'submit',
      requiredPermissions: ['document.submit'],
      allowedRoles: ['teacher', 'admin', 'principal'],
    },
    {
      from: 'review',
      to: 'approved',
      action: 'approve',
      requiredPermissions: ['document.approve'],
      allowedRoles: ['admin', 'principal'],
    },
    {
      from: 'review',
      to: 'draft',
      action: 'reject',
      requiredPermissions: ['document.reject'],
      allowedRoles: ['admin', 'principal'],
    },
    {
      from: 'approved',
      to: 'published',
      action: 'publish',
      requiredPermissions: ['document.publish'],
      allowedRoles: ['admin', 'principal'],
    },
    {
      from: 'published',
      to: 'archived',
      action: 'archive',
      requiredPermissions: ['document.archive'],
      allowedRoles: ['admin', 'principal'],
    },
  ];

  // Create document from template
  async createDraft(
    template: DocumentTemplate,
    data: any,
    authorId: string,
    schoolId: string,
  ): Promise<DocumentWorkflow> {
    const document: Partial<DocumentWorkflow> = {
      id: crypto.randomUUID(),
      templateId: template.id,
      title: data.title || 'Untitled Document',
      content: this.processTemplateVariables(template, data),
      status: 'draft',
      currentStep: 'create',
      authorId,
      schoolId,
      tenantId: schoolId, // TODO: Get from context
      version: 1,
      metadata: {
        template,
        originalData: data,
      },
    };

    const { data: result, error } = await supabase
      .from('document_workflows')
      .insert(document)
      .select()
      .single();

    if (error) throw error;

    // Create initial version
    await this.createVersion(result.id, result.content, authorId, 'Initial version');

    return result;
  }

  // Submit document for review
  async submitForReview(documentId: string, userId: string): Promise<void> {
    await this.validateTransition(documentId, 'draft', 'review', userId);

    const { error } = await supabase
      .from('document_workflows')
      .update({
        status: 'review',
        currentStep: 'submit',
        updatedAt: new Date().toISOString(),
      })
      .eq('id', documentId);

    if (error) throw error;
  }

  // Approve document
  async approveDocument(documentId: string, userId: string, comments?: string): Promise<void> {
    await this.validateTransition(documentId, 'review', 'approved', userId);

    const { error } = await supabase
      .from('document_workflows')
      .update({
        status: 'approved',
        currentStep: 'approve',
        updatedAt: new Date().toISOString(),
      })
      .eq('id', documentId);

    if (error) throw error;

    if (comments) {
      await this.addComment(documentId, userId, comments, 'approval');
    }
  }

  // Reject document
  async rejectDocument(documentId: string, userId: string, reason: string): Promise<void> {
    await this.validateTransition(documentId, 'review', 'draft', userId);

    const { error } = await supabase
      .from('document_workflows')
      .update({
        status: 'draft',
        currentStep: 'reject',
        updatedAt: new Date().toISOString(),
      })
      .eq('id', documentId);

    if (error) throw error;

    await this.addComment(documentId, userId, reason, 'rejection');
  }

  // Publish document
  async publishDocument(documentId: string, userId: string): Promise<void> {
    await this.validateTransition(documentId, 'approved', 'published', userId);

    const { error } = await supabase
      .from('document_workflows')
      .update({
        status: 'published',
        currentStep: 'publish',
        updatedAt: new Date().toISOString(),
      })
      .eq('id', documentId);

    if (error) throw error;
  }

  // Archive document
  async archiveDocument(documentId: string, userId: string): Promise<void> {
    await this.validateTransition(documentId, 'published', 'archived', userId);

    const { error } = await supabase
      .from('document_workflows')
      .update({
        status: 'archived',
        currentStep: 'archive',
        updatedAt: new Date().toISOString(),
      })
      .eq('id', documentId);

    if (error) throw error;
  }

  // Get version history
  async getVersionHistory(documentId: string): Promise<DocumentVersion[]> {
    const { data, error } = await supabase
      .from('document_versions')
      .select('*')
      .eq('documentId', documentId)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Create new version
  async createVersion(
    documentId: string,
    content: any,
    authorId: string,
    changes?: any,
  ): Promise<DocumentVersion> {
    // Get current version number
    const { data: currentDoc } = await supabase
      .from('document_workflows')
      .select('version')
      .eq('id', documentId)
      .single();

    const version: Partial<DocumentVersion> = {
      id: crypto.randomUUID(),
      documentId,
      version: (currentDoc?.version || 0) + 1,
      content,
      changes: changes || {},
      authorId,
      createdAt: new Date().toISOString(),
      metadata: {},
    };

    const { data, error } = await supabase
      .from('document_versions')
      .insert(version)
      .select()
      .single();

    if (error) throw error;

    // Update document version
    await supabase
      .from('document_workflows')
      .update({
        version: version.version,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', documentId);

    return data;
  }

  // Restore version
  async restoreVersion(documentId: string, versionId: string, userId: string): Promise<void> {
    const { data: version } = await supabase
      .from('document_versions')
      .select('content')
      .eq('id', versionId)
      .single();

    if (!version) throw new Error('Version not found');

    await this.createVersion(
      documentId,
      version.content,
      userId,
      `Restored from version ${versionId}`,
    );
  }

  // Add comment
  async addComment(
    documentId: string,
    authorId: string,
    content: string,
    type: DocumentComment['type'],
  ): Promise<void> {
    const comment: Partial<DocumentComment> = {
      id: crypto.randomUUID(),
      documentId,
      authorId,
      content,
      type,
      createdAt: new Date().toISOString(),
    };

    const { error } = await supabase.from('document_comments').insert(comment);

    if (error) throw error;
  }

  // Invite collaborator
  async inviteCollaborator(
    documentId: string,
    userId: string,
    role: DocumentCollaborator['role'],
    invitedBy: string,
  ): Promise<void> {
    const collaborator: Partial<DocumentCollaborator> = {
      id: crypto.randomUUID(),
      documentId,
      userId,
      role,
      permissions: this.getPermissionsForRole(role),
      addedAt: new Date().toISOString(),
      addedBy: invitedBy,
    };

    const { error } = await supabase.from('document_collaborators').insert(collaborator);

    if (error) throw error;
  }

  // Track changes
  async trackChanges(documentId: string): Promise<ChangeRecord[]> {
    const { data, error } = await supabase
      .from('change_records')
      .select('*')
      .eq('documentId', documentId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Private helper methods
  private async validateTransition(
    _documentId: string,
    fromStatus: DocumentStatus,
    toStatus: DocumentStatus,
    _userId: string,
  ): Promise<void> {
    const transition = this.workflowTransitions.find(
      (t) => t.from === fromStatus && t.to === toStatus,
    );
    if (!transition) {
      throw new Error(`Invalid transition from ${fromStatus} to ${toStatus}`);
    }

    // TODO: Validate user permissions and roles
    // This would integrate with the core permissions system
  }

  private processTemplateVariables(template: DocumentTemplate, data: any): any {
    const processedContent = { ...data };

    template.variables.forEach((variable) => {
      if (variable.type === 'date') {
        processedContent[variable.name] = new Date().toISOString();
      }
      // Add more variable processing logic
    });

    return processedContent;
  }

  private getPermissionsForRole(role: DocumentCollaborator['role']): string[] {
    switch (role) {
      case 'owner':
        return ['read', 'write', 'delete', 'share', 'approve'];
      case 'editor':
        return ['read', 'write', 'comment'];
      case 'reviewer':
        return ['read', 'comment', 'approve'];
      case 'viewer':
        return ['read'];
      default:
        return ['read'];
    }
  }
}

// Export singleton instance
export const documentWorkflowEngine = DocumentWorkflowEngine.getInstance();
