import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import DocumentListScreen from '../../screens/DocumentListScreen';
import { documentWorkflowAPI } from '../../document-workflow/api';
import type { DocumentWorkflow } from '../../document-workflow/types';

// Mock the API
jest.mock('../../document-workflow/api');
const mockedDocumentAPI = documentWorkflowAPI as jest.Mocked<typeof documentWorkflowAPI>;

describe('DocumentListScreen', () => {
  const mockProps = {
    schoolId: 'test-school-1',
    userId: 'test-user-1',
    userRole: 'teacher',
    onDocumentPress: jest.fn(),
    onCreateNew: jest.fn()};

  const mockDocuments: DocumentWorkflow[] = [
    {
      id: 'doc-1',
      templateId: 'template-1',
      title: 'Test Document 1',
      content: { test: 'content' },
      status: 'draft',
      currentStep: 'create',
      authorId: 'test-user-1',
      schoolId: 'test-school-1',
      tenantId: 'test-tenant-1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      version: 1,
      metadata: {}},
    {
      id: 'doc-2',
      templateId: 'template-2',
      title: 'Test Document 2',
      content: { test: 'content' },
      status: 'review',
      currentStep: 'submit',
      authorId: 'test-user-2',
      schoolId: 'test-school-1',
      tenantId: 'test-tenant-1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      version: 1,
      metadata: {}}];

  beforeEach(() => {
    jest.clearAllMocks();
    mockedDocumentAPI.getDocuments.mockResolvedValue(mockDocuments);
    mockedDocumentAPI.getDocumentsForReview.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render the document list screen correctly', async () => {
      await render(<DocumentListScreen {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Documents')).toBeTruthy();
        expect(screen.getByText('+ New')).toBeTruthy();
      });
    });

    it('should display loading state initially', async () => {
      mockedDocumentAPI.getDocuments.mockImplementation(() => new Promise(() => {}));
      
      await render(<DocumentListScreen {...mockProps} />);
      
      expect(screen.getByText('Loading documents...')).toBeTruthy();
    });

    it('should display documents when loaded', async () => {
      await render(<DocumentListScreen {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Document 1')).toBeTruthy();
        expect(screen.getByText('Test Document 2')).toBeTruthy();
      });
    });

    it('should display empty state when no documents', async () => {
      mockedDocumentAPI.getDocuments.mockResolvedValue([]);
      
      await render(<DocumentListScreen {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText(/No documents yet/)).toBeTruthy();
      });
    });
  });

  describe('Document Filtering', () => {
    it('should filter documents by status', async () => {
      await render(<DocumentListScreen {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Document 1')).toBeTruthy();
        expect(screen.getByText('Test Document 2')).toBeTruthy();
      });

      // Tap on 'draft' filter
      fireEvent.press(screen.getByText('Draft (1)'));
      
      await waitFor(() => {
        expect(screen.getByText('Test Document 1')).toBeTruthy();
        expect(screen.queryByText('Test Document 2')).toBeFalsy();
      });
    });

    it('should show all documents when "All" filter is selected', async () => {
      await render(<DocumentListScreen {...mockProps} />);
      
      // First tap on 'draft' filter
      fireEvent.press(screen.getByText('Draft (1)'));
      
      await waitFor(() => {
        expect(screen.getByText('Test Document 1')).toBeTruthy();
        expect(screen.queryByText('Test Document 2')).toBeFalsy();
      });

      // Then tap on 'All' filter
      fireEvent.press(screen.getByText('All (2)'));
      
      await waitFor(() => {
        expect(screen.getByText('Test Document 1')).toBeTruthy();
        expect(screen.getByText('Test Document 2')).toBeTruthy();
      });
    });
  });

  describe('Document Interactions', () => {
    it('should call onDocumentPress when document is pressed', async () => {
      await render(<DocumentListScreen {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Document 1')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('Test Document 1'));
      
      expect(mockProps.onDocumentPress).toHaveBeenCalledWith(mockDocuments[0]);
    });

    it('should call onCreateNew when create button is pressed', async () => {
      await render(<DocumentListScreen {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('+ New')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('+ New'));
      
      expect(mockProps.onCreateNew).toHaveBeenCalled();
    });
  });

  describe('Status Badge Display', () => {
    it('should show correct status badges', async () => {
      await render(<DocumentListScreen {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('DRAFT')).toBeTruthy();
        expect(screen.getByText('REVIEW')).toBeTruthy();
      });
    });

    it('should show "Pending Review" badge for review documents', async () => {
      await render(<DocumentListScreen {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Pending Review')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error message when API fails', async () => {
      mockedDocumentAPI.getDocuments.mockRejectedValue(new Error('API Error'));
      const alertSpy = jest.spyOn(Alert, 'alert');
      
      await render(<DocumentListScreen {...mockProps} />);
      
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Error', 'Failed to load documents');
      });
    });
  });

  describe('Responsive Design', () => {
    it('should adapt layout for different screen sizes', async () => {
      const { rerender } = await render(<DocumentListScreen {...mockProps} />);
      
      // The component should render without crashing
      expect(screen.getByText('Documents')).toBeTruthy();
      
      // Re-render with different props if needed for responsive testing
      await rerender(<DocumentListScreen {...mockProps} />);
      
      expect(screen.getByText('Documents')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', async () => {
      await render(<DocumentListScreen {...mockProps} />);
      
      await waitFor(() => {
        const documentItems = screen.getAllByTestId('document-item');
        expect(documentItems.length).toBeGreaterThan(0);
      });
    });

    it('should support screen reader navigation', async () => {
      await render(<DocumentListScreen {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Create new document/ })).toBeTruthy();
      });
    });
  });
});
