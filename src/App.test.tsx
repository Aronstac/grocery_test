import { render, screen } from '@testing-library/react';
import App from './App';

it('renders dashboard after auth', async () => {
  render(<App />);
  const heading = await screen.findByRole('heading', { name: /dashboard/i });
  expect(heading).toBeInTheDocument();
});
