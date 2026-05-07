export type DocumentStatus =
	| "draft"
	| "review"
	| "approved"
	| "published"
	| "archived";
export type DocumentWorkflowStep =
	| "create"
	| "submit"
	| "review"
	| "approve"
	| "reject"
	| "publish"
	| "archive";

export interface DocumentWorkflow {
	id: string;
	templateId: string;
	title: string;
	content: any;
	status: DocumentStatus;
	currentStep: DocumentWorkflowStep;
	authorId: string;
	schoolId: string;
	tenantId: string;
	createdAt: string;
	updatedAt: string;
	version: number;
	metadata: Record<string, any>;
}

export interface DocumentVersion {
	id: string;
	documentId: string;
	version: number;
	content: any;
	changes: any;
	authorId: string;
	createdAt: string;
	metadata: Record<string, any>;
}

export interface DocumentComment {
	id: string;
	documentId: string;
	authorId: string;
	content: string;
	type: "comment" | "suggestion" | "approval" | "rejection";
	createdAt: string;
	resolvedAt?: string;
	metadata?: Record<string, any>;
}

export interface DocumentCollaborator {
	id: string;
	documentId: string;
	userId: string;
	role: "owner" | "editor" | "reviewer" | "viewer";
	permissions: string[];
	addedAt: string;
	addedBy: string;
}

export interface DocumentTemplate {
	id: string;
	title: string;
	description: string;
	category: "report" | "letter" | "certificate" | "form";
	audience: "principal" | "staff" | "guardian" | "student";
	schema: any;
	conditionalFields: ConditionalField[];
	variables: TemplateVariable[];
	version: string;
	isActive: boolean;
}

export interface ConditionalField {
	id: string;
	name: string;
	type: "text" | "number" | "date" | "select" | "checkbox";
	condition: {
		field: string;
		operator:
			| "equals"
			| "not_equals"
			| "contains"
			| "greater_than"
			| "less_than";
		value: any;
	};
	required: boolean;
}

export interface TemplateVariable {
	id: string;
	name: string;
	type: "user" | "school" | "date" | "custom";
	defaultValue?: any;
	description: string;
}

export interface WorkflowTransition {
	from: DocumentStatus;
	to: DocumentStatus;
	action: DocumentWorkflowStep;
	requiredPermissions: string[];
	allowedRoles: string[];
	conditions?: WorkflowCondition[];
}

export interface WorkflowCondition {
	field: string;
	operator: "exists" | "equals" | "not_equals";
	value?: any;
}

export interface ChangeRecord {
	id: string;
	documentId: string;
	versionId: string;
	userId: string;
	type: "create" | "update" | "delete" | "move";
	field?: string;
	oldValue?: any;
	newValue?: any;
	timestamp: string;
	metadata?: Record<string, any>;
}

// Mobile-first responsive breakpoints
export interface ResponsiveLayout {
	mobile: {
		maxWidth: "768px";
		padding: "16px";
		fontSize: "16px";
	};
	tablet: {
		maxWidth: "1024px";
		padding: "24px";
		fontSize: "16px";
	};
	desktop: {
		minWidth: "1025px";
		padding: "32px";
		fontSize: "18px";
	};
}

// Web standalone specific features
export interface WebCollaborationFeatures {
	realTimeEditing: boolean;
	versionHistory: boolean;
	comments: boolean;
	suggestions: boolean;
	shareableLinks: boolean;
	exportFormats: ("pdf" | "docx" | "html")[];
}

// Mobile-specific features
export interface MobileFeatures {
	offlineEditing: boolean;
	touchOptimized: boolean;
	cameraIntegration: boolean;
	voiceInput: boolean;
	pushNotifications: boolean;
}
