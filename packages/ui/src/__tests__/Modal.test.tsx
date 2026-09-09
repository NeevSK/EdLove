import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '../components/ui/modal';

describe('Modal Component (scenario contract)', {
  tags: ['interaction', 'a11y', 'scenario', 'boundary'],
}, () => {
  it('does not render when isOpen is false', async () => {
    const { queryByText } = await render(
      <Modal isOpen={false} onClose={() => {}}>
        <ModalBody>
          <Text>Modal Content</Text>
        </ModalBody>
      </Modal>,
    );
    expect(queryByText('Modal Content')).toBeNull();
  });

  it('renders content when isOpen is true and sets accessibility attributes', async () => {
    await render(
      <Modal isOpen={true} onClose={() => {}}>
        <ModalBody>
          <Text>Modal Content</Text>
        </ModalBody>
      </Modal>,
    );
    expect(screen.getByText('Modal Content')).toBeTruthy();

    const dialog = screen.getByRole('dialog');
    expect(dialog.props.accessibilityViewIsModal).toBe(true);
  });

  it('can opt out of focus trapping for non-dialog overlays', async () => {
    await render(
      <Modal isOpen={true} onClose={() => {}} trapFocus={false}>
        <ModalBody>
          <Text>Non trapping content</Text>
        </ModalBody>
      </Modal>,
    );

    expect(screen.getByRole('dialog').props.accessibilityViewIsModal).toBe(false);
  });

  it('calls onClose when backdrop is pressed', async () => {
    const onClose = vi.fn();
    const { getByLabelText } = await render(
      <Modal isOpen={true} onClose={onClose}>
        <ModalBody>
          <Text>Modal Content</Text>
        </ModalBody>
      </Modal>,
    );

    const backdrop = getByLabelText('backdrop');
    expect(backdrop).toBeTruthy();
    fireEvent.press(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it('provides a structured layout', async () => {
    const { getByText } = await render(
      <Modal isOpen={true} onClose={() => {}}>
        <ModalHeader>
          <Text>Title</Text>
        </ModalHeader>
        <ModalBody>
          <Text>Body</Text>
        </ModalBody>
        <ModalFooter>
          <Text>Footer</Text>
        </ModalFooter>
      </Modal>,
    );
    expect(getByText('Title')).toBeTruthy();
    expect(getByText('Body')).toBeTruthy();
    expect(getByText('Footer')).toBeTruthy();
  });
});
