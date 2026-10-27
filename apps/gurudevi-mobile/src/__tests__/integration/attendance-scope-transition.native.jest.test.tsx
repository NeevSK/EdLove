import React from 'react';
import { act, create } from 'react-test-renderer';

const mockRead = {
  current: {
    scope: { entityId: 'school-a' },
    classesIdentity: 'principal-a:bond-a:school-a:teacher-a',
    identity: null,
    gradeClasses: [{ id: 'class-a', name: 'Grade A' }],
    register: null,
    classesQuery: { isPending: false, error: null, refetch: jest.fn() },
    registerQuery: { isPending: false, error: null, refetch: jest.fn() },
    invalidateRegister: jest.fn(),
  },
};

jest.mock('expo-router', () => ({ useLocalSearchParams: () => ({}) }));
jest.mock('expo-observe', () => ({ ObserveInteractiveMarker: () => null }));
jest.mock('@repo/scanner-kit', () => ({ parseInstitutionalQR: () => null, ScannerModal: () => null }));
jest.mock('@repo/ui', () => ({ BrandPulse: () => null }));
jest.mock('@repo/ui/hooks', () => ({ useAppStoreReview: () => ({ triggerReview: jest.fn() }) }));
jest.mock('@repo/ui/utils/haptics', () => ({ hapticSuccess: jest.fn() }));
jest.mock('@repo/ui/primitives', () => ({ Box: 'View', Button: 'View', ButtonText: 'Text', Text: 'Text', VStack: 'View' }));
jest.mock('@repo/classroom/components/AttendanceSheet', () => () => null);
jest.mock('@repo/classroom/logic/gradeClassRegister', () => ({ localDate: () => '2026-10-24', PICK_GRADE_CLASS_NOTICE: 'Choose a class', SHADOW_STUDENT_NOTICE: 'Shadow learners', loadGradeClassRegister: jest.fn(), saveGradeClassRegister: jest.fn() }));
jest.mock('@repo/core/api/client', () => ({ academicCyclesAPI: { getCurrent: jest.fn() }, growthSignalsAPI: { emitSilent: jest.fn() } }));
jest.mock('@repo/core/hooks', () => ({ useSafeMutation: () => ({ isLoading: false, mutate: jest.fn() }) }));
jest.mock('@repo/core/store/useAuthStore', () => ({
  useAuthStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({ showToast: jest.fn(), user: null }),
}));
jest.mock('@repo/core/store/useTenantStore', () => ({
  useTenantStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({ schoolId: 'school-a', academicCycleId: null, setAcademicCycleId: jest.fn() }),
}));
jest.mock('@repo/core/logic/classroomResolver', () => ({ resolveGradeClassFromClassroom: jest.fn() }));
jest.mock('../../../../../packages/classroom/src/hooks/useScopedAttendanceRegister', () => ({ useScopedAttendanceRegister: () => mockRead.current }));

import AttendanceScreen from '../../../../../packages/classroom/src/screens/AttendanceScreen';

describe('AttendanceScreen scoped class projection', () => {
  it('withholds a prior scope class picker until the replacement scope resolves', () => {
    let screen: ReturnType<typeof create>;
    act(() => {
      screen = create(<AttendanceScreen />);
    });
    expect(JSON.stringify(screen!.toJSON())).toContain('Grade A');

    mockRead.current = { ...mockRead.current, scope: { entityId: 'school-b' }, classesIdentity: 'principal-a:bond-b:school-b:teacher-b', gradeClasses: [], classesQuery: { isPending: true, error: null, refetch: jest.fn() } };
    act(() => screen!.update(<AttendanceScreen />));
    expect(JSON.stringify(screen!.toJSON())).not.toContain('Grade A');
  });
});
