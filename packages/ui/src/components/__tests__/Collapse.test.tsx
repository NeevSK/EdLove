import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Collapse } from '../Collapse';

describe('Collapse', () => {
  it('renders children when expanded', async () => {
    const { getByText } = await render(
      <Collapse expanded>
        <Text>Content</Text>
      </Collapse>,
    );
    expect(getByText('Content')).toBeTruthy();
  });

  it('renders children when collapsed', async () => {
    const { getByText } = await render(
      <Collapse expanded={false}>
        <Text>Content</Text>
      </Collapse>,
    );
    expect(getByText('Content')).toBeTruthy();
  });

  it('accepts custom animation duration', async () => {
    const { getByText } = await render(
      <Collapse expanded animationDuration={100}>
        <Text>Content</Text>
      </Collapse>,
    );
    expect(getByText('Content')).toBeTruthy();
  });

  it('accepts callback props', async () => {
    const onExpandEnd = vi.fn();
    const onCollapseEnd = vi.fn();
    const { getByText } = await render(
      <Collapse expanded onExpandEnd={onExpandEnd} onCollapseEnd={onCollapseEnd}>
        <Text>Content</Text>
      </Collapse>,
    );
    expect(getByText('Content')).toBeTruthy();
  });
});
