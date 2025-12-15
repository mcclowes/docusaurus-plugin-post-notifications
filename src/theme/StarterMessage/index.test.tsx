import { render, screen } from '@testing-library/react';
import StarterMessage from './index';

jest.mock('@docusaurus/useDocusaurusContext', () => () => ({
  siteConfig: { title: 'Test Site' },
}));

jest.mock('@docusaurus/useGlobalData', () => ({
  usePluginData: () => ({ greeting: 'Hello from plugin', routePath: '/starter' }),
}));

describe('StarterMessage', () => {
  it('renders the greeting from plugin data', () => {
    render(<StarterMessage />);

    expect(screen.getByText(/Hello from plugin/)).toBeInTheDocument();
    expect(screen.getByText(/Test Site/)).toBeInTheDocument();
  });
});
