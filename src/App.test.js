import { render, screen } from '@testing-library/react';
import App from './App';

test('renders home brand and search', () => {
  render(<App />);
  expect(screen.getByText('StayHub')).toBeInTheDocument();
  expect(screen.getByText(/Tìm phòng phù hợp/i)).toBeInTheDocument();
});
