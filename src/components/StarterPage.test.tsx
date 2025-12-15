import { render, screen } from '@testing-library/react';
import StarterPage from './StarterPage';

const mockData = {
  greeting: 'Hello from tests!',
  routePath: '/starter',
};

describe('StarterPage', () => {
  it('renders the greeting and helper cards', () => {
    render(<StarterPage modules={{ starterData: mockData }} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(mockData.greeting);
    expect(screen.getByText(/Plugin lifecycle/)).toBeInTheDocument();
    expect(screen.getByText(/Client modules guide/)).toBeInTheDocument();
  });
});
