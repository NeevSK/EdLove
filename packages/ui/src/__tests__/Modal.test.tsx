import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '../components/ui/modal';

describe('Modal Component (Robustness)', () => {
  it('does not render when isOpen is false', async () => {
    const { queryByText } = await render(
      <Modal isOpen={false} onClose={() => {}}>
        <ModalBody>Modal Content</ModalBody>
      </Modal>
    );
    expect(queryByText('Modal Content')).toBeNull();
  });

  it('renders content when isOpen is true', async () => {
    const { getByText } = await render(
      <Modal isOpen={true} onClose={() => {}}>
        <ModalBody>Modal Content</ModalBody>
      </Modal>
    );
    expect(getByText('Modal Content')).toBeTruthy();
  });

  it('provides a structured layout', async () => {
    const { getByText } = await render(
      <Modal isOpen={true} onClose={() => {}}>
        <ModalHeader>Title</ModalHeader>
        <ModalBody>Body</ModalBody>
        <ModalFooter>Footer</ModalFooter>
      </Modal>
    );
    expect(getByText('Title')).toBeTruthy();
    expect(getByText('Body')).toBeTruthy();
    expect(getByText('Footer')).toBeTruthy();
  });
});
