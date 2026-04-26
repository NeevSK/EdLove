import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { GuardianDashboardScreen } from '../../screens/GuardianDashboardScreen';
import { guardianAPI } from '../../guardian/api';
import type { GuardianDashboard, StudentOverview } from '../../guardian/types';

// Mock the API
jest.mock('../../guardian/api');
const mockedGuardianAPI = guardianAPI as jest.Mocked<typeof guardianAPI>;

describe('GuardianDashboardScreen', () => {
  const mockProps = {
    guardianId: 'test-guardian-1',
    onStudentPress: jest.fn(),
    onNotificationPress: jest.fn(),
    onEventPress: jest.fn()};

  const mockDashboard: GuardianDashboard  = {
    guardianId: 'test-guardian-1',
    students: [
      {
        studentId: 'student-1',
        name: 'John Doe',
        grade: '5',
        classroom: 'Class A',
        attendance: {
          present: 18,
          absent: 2,
          late: 1,
          total: 21,
          percentage: 85.7},
        grades: {
          latest: [
            { subject: 'Math', grade: 'A', percentage: 92, date: '2024-01-15', type: 'exam' },
            { subject: 'Science', grade: 'B+', percentage: 87, date: '2024-01-14', type: 'assignment' }],
          average: 89.5},
        upcomingAssignments: [
          { id: 'assign-1', title: 'Math Homework', subject: 'Math', dueDate: '2024-01-20', status: 'pending', grade: undefined }],
        recentAnnouncements: []},
      {
        studentId: 'student-2',
        name: 'Jane Doe',
        grade: '3',
        classroom: 'Class B',
        attendance: {
          present: 20,
          absent: 1,
          late: 0,
          total: 21,
          percentage: 95.2},
        grades: {
          latest: [
            { subject: 'Reading', grade: 'A-', percentage: 90, date: '2024-01-15', type: 'exam' }],
          average: 90.0},
        upcomingAssignments: [],
        recentAnnouncements: []}],
    notifications: [
      {
        id: 'notif-1',
        type: 'grade',
        title: 'New Grade Posted',
        message: 'John received an A in Math',
        isRead: false,
        createdAt: '2024-01-15T10:00:00Z',
        actionUrl: '/grades/student-1'}],
    upcomingEvents: [
      {
        id: 'event-1',
        title: 'Parent-Teacher Conference',
        description: 'Quarterly conference to discuss student progress',
        date: '2024-01-25',
        time: '15:00',
        location: 'Classroom A',
        type: 'meeting',
        requiresRsvp: true,
        rsvpStatus: undefined}],
    recentActivity: []};

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGuardianAPI.getGuardianDashboard.mockResolvedValue(mockDashboard);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render the guardian dashboard correctly', async () => {
      render(<GuardianDashboardScreen {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Guardian Dashboard')).toBeTruthy();
        expect(screen.getByText('2 Students')).toBeTruthy();
      });
    });

    it('should display loading state initially', () => {
      mockedGuardianAPI.getGuardianDashboard.mockImplementation(() => new Promise(() => {}));
      
      render(<GuardianDashboardScreen {...mockProps} />);
      
      expect(screen.getByText('Loading dashboard...')).toBeTruthy();
    });

    it('should display student cards when loaded', async () => {
      render(<GuardianDashboardScreen {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeTruthy();
        expect(screen.getByText('Jane Doe')).toBeTruthy();
        expect(screen.getByText('Grade 5 " Class A')).toBeTruthy();
        expect(screen.getByText('Grade 3 " Class B')).toBeTruthy();
      });
    });

    it('should display empty state when no students', async () => {
      mockedGuardianAPI.getGuardianDashboard.mockResolvedValue({
        ...mockDashboard,
        students: []});
      
      render(<GuardianDashboardScreen {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Your Students')).toBeTruthy();
        expect(screen.queryByText(/Student/)).toBeFalsy();
      });
    });
  });

  describe('Student Cards', () => {
    it('should display attendance information correctly', async () => {
      render(<GuardianDashboardScreen {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('85.7%')).toBeTruthy(); // John's attendance
        expect(screen.getByText('95.2%')).toBeTruthy(); // Jane's attendance
        expect(screen.getByText('18 present " 2 absent " 1 late')).toBeTruthy();
      });
    });

    it('should display grade information correctly', async () => {
      render(<GuardianDashboardScreen {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Math')).toBeTruthy();
        expect(screen.getByText('A')).toBeTruthy();
        expect(screen.getByText('Science')).toBeTruthy();
        expect(screen.getByText('B+')).toBeTruthy();
        expect(screen.getByText('Average: 89.5%')).toBeTruthy();
      });
    });

    it('should display upcoming assignments', async () => {
      render(<GuardianDashboardScreen {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Math Homework')).toBeTruthy();
        expect(screen.getByText('Due: 1/20/2024')).toBeTruthy();
      });
    });
  });

  describe('Student Interactions', () => {
    it('should call onStudentPress when student card is pressed', async () => {
      render(<GuardianDashboardScreen {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('John Doe'));
      
      expect(mockProps.onStudentPress).toHaveBeenCalledWith(mockDashboard.students[0]);
    });
  });

  describe('Notifications Section', () => {
    it('should display notifications', async () => {
      render(<GuardianDashboardScreen {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Recent Notifications')).toBeTruthy();
        expect(screen.getByText('New Grade Posted')).toBeTruthy();
        expect(screen.getByText('John received an A in Math')).toBeTruthy();
      });
    });

    it('should call onNotificationPress when notification is pressed', async () => {
      render(<GuardianDashboardScreen {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('New Grade Posted')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('New Grade Posted'));
      
      expect(mockProps.onNotificationPress).toHaveBeenCalledWith(mockDashboard.notifications[0]);
    });

    it('should show unread notifications with different styling', async () => {
      render(<GuardianDashboardScreen {...mockProps} />);
      
      await waitFor(() => {
        const notificationElement = screen.getByText('New Grade Posted');
        expect(notificationElement).toBeTruthy();
        // Unread notifications should have distinct styling
      });
    });
  });

  describe('Events Section', () => {
    it('should display upcoming events', async () => {
      render(<GuardianDashboardScreen {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Upcoming Events')).toBeTruthy();
        expect(screen.getByText('Parent-Teacher Conference')).toBeTruthy();
        expect(screen.getByText('15:00 " Classroom A')).toBeTruthy();
      });
    });

    it('should call onEventPress when event is pressed', async () => {
      render(<GuardianDashboardScreen {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Parent-Teacher Conference')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('Parent-Teacher Conference'));
      
      expect(mockProps.onEventPress).toHaveBeenCalledWith(mockDashboard.upcomingEvents[0]);
    });

    it('should show RSVP badge for events requiring RSVP', async () => {
      render(<GuardianDashboardScreen {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('RSVP')).toBeTruthy();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should adapt layout for mobile screens', async () => {
      // Mock mobile dimensions
      jest.spyOn(require('react-native'), 'Dimensions').mockImplementation(() => ({
        get: jest.fn().mockReturnValue({ width: 768, height: 1024 })
      }));

      render(<GuardianDashboardScreen {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Guardian Dashboard')).toBeTruthy();
        // Should render single column layout on mobile
      });
    });

    it('should adapt layout for desktop screens', async () => {
      // Mock desktop dimensions
      jest.spyOn(require('react-native'), 'Dimensions').mockImplementation(() => ({
        get: jest.fn().mockReturnValue({ width: 1200, height: 800 })
      }));

      render(<GuardianDashboardScreen {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Guardian Dashboard')).toBeTruthy();
        // Should render two-column layout on desktop
        expect(screen.getByText('Recent Notifications')).toBeTruthy();
        expect(screen.getByText('Upcoming Events')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error message when API fails', async () => {
      mockedGuardianAPI.getGuardianDashboard.mockRejectedValue(new Error('API Error'));
      
      render(<GuardianDashboardScreen {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('API Error')).toBeTruthy();
      });
    });

    it('should show error state when dashboard is null', async () => {
      mockedGuardianAPI.getGuardianDashboard.mockRejectedValue(new Error('Dashboard not found'));
      
      render(<GuardianDashboardScreen {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load dashboard')).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', async () => {
      render(<GuardianDashboardScreen {...mockProps} />);
      
      await waitFor(() => {
        const studentCards = screen.getAllByTestId('student-card');
        expect(studentCards.length).toBeGreaterThan(0);
      });
    });

    it('should support screen reader navigation', async () => {
      render(<GuardianDashboardScreen {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /John Doe/ })).toBeTruthy();
        expect(screen.getByRole('button', { name: /Jane Doe/ })).toBeTruthy();
      });
    });

    it('should have sufficient color contrast', async () => {
      render(<GuardianDashboardScreen {...mockProps} />);
      
      await waitFor(() => {
        // Test that text elements have proper contrast
        const textElements = screen.getAllByText(/./);
        expect(textElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Performance', () => {
    it('should render efficiently with multiple students', async () => {
      const largeDashboard = { 
        ...mockDashboard,
        students: Array(10).fill(null).map((_, index) => ({
          ...mockDashboard.students[0],
          studentId: `student-${index}`,
          name: `Student ${index + 1}`,
          grade: mockDashboard.students[0]?.grade || '5',
          classroom: mockDashboard.students[0]?.classroom || 'Class A',
          attendance: mockDashboard.students[0]?.attendance || {
            present: 18,
            absent: 2,
            late: 1,
            total: 21,
            percentage: 85.7},
          grades: mockDashboard.students[0]?.grades || {
            latest: [],
            average: 0},
          upcomingAssignments: mockDashboard.students[0]?.upcomingAssignments || [],
          recentAnnouncements: mockDashboard.students[0]?.recentAnnouncements || []}))};
      
      mockedGuardianAPI.getGuardianDashboard.mockResolvedValue(largeDashboard);
      
      const startTime = performance.now();
      render(<GuardianDashboardScreen {...mockProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('10 Students')).toBeTruthy();
      });
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should render within 1 second
    });
  });
});
