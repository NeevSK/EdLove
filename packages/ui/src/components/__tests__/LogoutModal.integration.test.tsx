import { fireEvent, render } from '@testing-library/react-native';

import LogoutModal from '../LogoutModal';

vi.mock('../SanctuaryModal', () => ({
  default: ({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) => (
    <>{children}{footer}</>
  ),
}));

vi.mock('@repo/ui/icons', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@repo/ui/icons')>()),
  LogOut: 'LogOutIcon',
}));

describe('LogoutModal interaction flow', () => {
  it('keeps the user signed in or confirms sign-out through labeled actions', async () => {
    const onClose = vi.fn();
    const onLogout = vi.fn();
    const { getByLabelText } = await render(
      <LogoutModal isOpen onClose={onClose} onLogout={onLogout} />,
    );

    fireEvent.press(getByLabelText('Stay signed in'));
    fireEvent.press(getByLabelText('Sign out'));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('disables the stay action while sign-out is in progress', async () => {
    const { queryByLabelText } = await render(
      <LogoutModal isOpen onClose={vi.fn()} onLogout={vi.fn()} isLoading />,
    );

    expect(queryByLabelText('Stay signed in')).toBeNull();
  });
});
