import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const screenPath = join(__dirname, '..', 'NotificationsScreen.web.tsx');
const drawerPath = join(__dirname, '..', '..', 'components', 'NotificationDrawer.tsx');
const settingsPath = join(__dirname, '..', 'AppSettingsScreen.shared.tsx');

describe('profile and notification surface contracts', () => {
  it('does not mark the notification stream read merely by entering the web screen', () => {
    const source = readFileSync(screenPath, 'utf8');

    expect(source).not.toContain('Automatically mark all as read when visiting this screen');
    expect(source).toContain('aria-label={`Mark ${notif.title} as read`}');
    expect(source).toContain('onClick={() => void onRead(notif.id)}');
  });

  it('keeps explicit read actions and responsive settings geometry in shared surfaces', () => {
    const drawer = readFileSync(drawerPath, 'utf8');
    const settings = readFileSync(settingsPath, 'utf8');

    expect(drawer).toContain('Marks only this notification as read');
    expect(settings).toContain('useResponsiveGrid');
  });
});
