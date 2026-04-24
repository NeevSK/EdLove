const fs = require('node:fs');
const path = require('node:path');

const APP_ROOT = path.resolve(__dirname, '../../..');
const WORKSPACE_ROOT = path.resolve(APP_ROOT, '..', '..');

const ADMIN_SRC = path.join(WORKSPACE_ROOT, 'packages', 'admin', 'src');
const ADMIN_PRINCIPAL_WEB_SCREEN = path.join(
  WORKSPACE_ROOT,
  'packages',
  'admin',
  'src',
  'screens',
  'PrincipalDashboard.web.tsx',
);
const PRINCIPAL_WEB_SCREEN = path.join(
  WORKSPACE_ROOT,
  'packages',
  'classroom',
  'src',
  'screens',
  'PrincipalDashboard.web.tsx',
);
const CLASSROOM_COMPONENT_BARREL = path.join(
  WORKSPACE_ROOT,
  'packages',
  'classroom',
  'src',
  'components',
  'index.ts',
);
const CLASSROOM_INVENTORY_VIEW = path.join(
  WORKSPACE_ROOT,
  'packages',
  'classroom',
  'src',
  'components',
  'InventoryView.tsx',
);
const CLASSROOM_RESOURCES_VIEW = path.join(
  WORKSPACE_ROOT,
  'packages',
  'classroom',
  'src',
  'components',
  'ResourcesView.tsx',
);
const CLASSROOM_TEACHER_DASHBOARD = path.join(
  WORKSPACE_ROOT,
  'packages',
  'classroom',
  'src',
  'screens',
  'TeacherDashboard.tsx',
);
const CLASSROOM_PRINCIPAL_SCREEN = path.join(
  WORKSPACE_ROOT,
  'packages',
  'classroom',
  'src',
  'screens',
  'PrincipalDashboard.tsx',
);
const CLASSROOM_SCREEN_BARREL = path.join(
  WORKSPACE_ROOT,
  'packages',
  'classroom',
  'src',
  'screens',
  'index.ts',
);

function collectFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(fullPath));
      continue;
    }
    if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function getImportStatements(source) {
  return source.match(/^\s*import[\s\S]*?from\s+['"][^'"]+['"];?/gm) ?? [];
}

describe('Package architecture boundaries', () => {
  it('admin orchestration files do not import @repo/classroom', () => {
    const adminFiles = collectFiles(ADMIN_SRC).filter((filePath) =>
      filePath.includes(`${path.sep}screens${path.sep}`) ||
      filePath.includes(`${path.sep}components${path.sep}principal${path.sep}`) ||
      filePath.includes(`${path.sep}principal${path.sep}`),
    );

    expect(adminFiles.length).toBeGreaterThan(0);

    for (const filePath of adminFiles) {
      const source = fs.readFileSync(filePath, 'utf8');
      const imports = getImportStatements(source);
      const invalid = imports.find((line) => /from\s+['"]@repo\/classroom['"]/.test(line));
      expect(invalid).toBeUndefined();
    }
  });

  it('principal web screen does not import governance widgets from @repo/classroom root', () => {
    const source = fs.readFileSync(PRINCIPAL_WEB_SCREEN, 'utf8');
    const imports = getImportStatements(source);
    const classroomRootImport = imports.find((line) => /from\s+['"]@repo\/classroom['"]/.test(line));

    if (!classroomRootImport) {
      expect(classroomRootImport).toBeUndefined();
      return;
    }

    const forbiddenWidgets = [
      'HierarchyBuilder',
      'InviteManager',
      'PrincipalNotes',
      'PrincipalObservationsSection',
      'MorningSituationalBrief',
      'TeacherCarousel',
      'LeaveApprovalSection',
      'InstitutionalCalendarSection',
      'ManagementStation',
      'AddStudentModal'];

    for (const symbol of forbiddenWidgets) {
      expect(classroomRootImport.includes(symbol)).toBe(false);
    }
  });

  it('principal web keeps capability gating for governance navigation', () => {
    const source = fs.readFileSync(ADMIN_PRINCIPAL_WEB_SCREEN, 'utf8');
    expect(source.includes('canManageSchoolScope')).toBe(true);
    expect(source.includes("can('manage', 'School')")).toBe(true);
    expect(source.includes('navigatePrincipalView')).toBe(true);
  });

  it('classroom public component barrel does not export admin-owned principal governance widgets', () => {
    const source = fs.readFileSync(CLASSROOM_COMPONENT_BARREL, 'utf8');
    const forbiddenExports = [
      'HierarchyBuilder',
      'InviteManager',
      'MorningSituationalBrief',
      'TeacherCarousel',
      'LeaveApprovalSection',
      'InstitutionalCalendarSection',
      'ManagementStation',
      'PrincipalObservationsSection'];

    for (const symbol of forbiddenExports) {
      expect(source.includes(`as ${symbol}`)).toBe(false);
      expect(source.includes(`{ default as ${symbol} }`)).toBe(false);
    }
  });

  it('classroom public screen barrel does not export the principal governance screen', () => {
    const source = fs.readFileSync(CLASSROOM_SCREEN_BARREL, 'utf8');

    expect(source.includes('PrincipalSchoolView')).toBe(false);
  });

  it('classroom inventory/resource create flows declare classroom ownership context', () => {
    const inventoryViewSource = fs.readFileSync(CLASSROOM_INVENTORY_VIEW, 'utf8');
    const resourcesViewSource = fs.readFileSync(CLASSROOM_RESOURCES_VIEW, 'utf8');

    expect(inventoryViewSource.includes('CLASSROOM_RESOURCE_SCOPE')).toBe(true);
    expect(resourcesViewSource.includes('CLASSROOM_RESOURCE_SCOPE')).toBe(true);
  });

  it('classroom dashboards consume staff orchestration UI from @repo/people', () => {
    const teacherDashboardSource = fs.readFileSync(CLASSROOM_TEACHER_DASHBOARD, 'utf8');
    const principalScreenSource = fs.readFileSync(CLASSROOM_PRINCIPAL_SCREEN, 'utf8');

    expect(teacherDashboardSource.includes('from \'@repo/people\'')).toBe(true);
    expect(principalScreenSource.includes('from \'@repo/admin\'')).toBe(true);
    expect(principalScreenSource.includes('from \'@repo/people\'')).toBe(false);
    expect(teacherDashboardSource.includes('./TeacherAdminWidget')).toBe(false);
    expect(teacherDashboardSource.includes('./teacher/TeacherFeedbackModal')).toBe(false);
    expect(teacherDashboardSource.includes('TeacherEchoHistoryModal')).toBe(true);
    expect(teacherDashboardSource.includes('TeacherAdminPortalModal')).toBe(true);
  });

  it('native principal screen composes through the admin workspace shell', () => {
    const principalScreenSource = fs.readFileSync(CLASSROOM_PRINCIPAL_SCREEN, 'utf8');

    expect(principalScreenSource.includes('PrincipalNativeWorkspace')).toBe(true);
    expect(principalScreenSource.includes('renderAdditionalView')).toBe(true);
    expect(principalScreenSource.includes('HierarchyBuilder')).toBe(false);
    expect(principalScreenSource.includes('InviteManager')).toBe(false);
  });

  it('principal web reads official oversight routes directly instead of legacy injected analytics', () => {
    const classroomSource = fs.readFileSync(PRINCIPAL_WEB_SCREEN, 'utf8');
    const adminSource = fs.readFileSync(ADMIN_PRINCIPAL_WEB_SCREEN, 'utf8');

    expect(classroomSource.includes('classroomAnalyticsAPI')).toBe(false);
    expect(classroomSource.includes('getStudentAttendancePulse=')).toBe(false);
    expect(adminSource.includes('api.attendance.getSchoolAttendancePulse')).toBe(true);
    expect(adminSource.includes('api.grading.getSchoolPublishedGradingCompletion')).toBe(true);
    expect(adminSource.includes('staffOperationsAPI.getStudentAttendancePulse')).toBe(false);
  });
});
