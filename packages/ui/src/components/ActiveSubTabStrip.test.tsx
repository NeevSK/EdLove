import { render } from '@testing-library/react-native';
import { useActiveSubTabsStore } from '@repo/core/store/useActiveSubTabsStore';
import { ActiveSubTabStrip } from './ActiveSubTabStrip';

vi.mock('expo-router', () => ({
  usePathname: () => '/self',
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

describe('ActiveSubTabStrip', () => {
  beforeEach(() => {
    useActiveSubTabsStore.setState({
      tabsByDomain: {},
      activeTabByDomain: {},
      preferences: {
        headerStyle: 'adaptive',
        catalogDefaultAction: 'open_in_subtab',
        showActiveSubTabs: true,
        autoHideChromeOnScroll: true,
        maxTabsPerDomain: 5,
      },
    });
  });

  it('keeps the task strip hidden while Home is the only open surface', async () => {
    const { queryByText } = await render(<ActiveSubTabStrip domain="self" />);

    expect(queryByText('Add Task')).toBeNull();
  });
});
