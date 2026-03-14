import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardPage from '@/app/page';
import { listChannels } from '@/lib/data';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

jest.mock('@/lib/data', () => ({
  listChannels: jest.fn(),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: any) => <span data-variant={variant}>{children}</span>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('lucide-react', () => ({
  Calendar: (props: any) => <svg data-testid="calendar-icon" {...props} />,
  ListFilter: (props: any) => <svg data-testid="list-filter-icon" {...props} />,
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders page header and browse summaries link', async () => {
    (listChannels as jest.Mock).mockResolvedValue([]);

    render(await DashboardPage());

    expect(screen.getByText('Analyst Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Channel Briefings')).toBeInTheDocument();
    expect(screen.getByText(/browse latest analyst transcript summaries/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /browse all summaries/i })).toHaveAttribute('href', '/summaries');
  });

  it('renders channel cards when channels load successfully', async () => {
    (listChannels as jest.Mock).mockResolvedValue([
      { slug: 'alpha', name: 'Alpha Research', type: 'narrative', hasNew: true },
      { slug: 'beta', name: 'Beta Capital', type: 'info', hasNew: false },
    ]);

    render(await DashboardPage());

    expect(screen.getByRole('link', { name: /alpha research/i })).toHaveAttribute('href', '/channel/alpha');
    expect(screen.getByRole('link', { name: /beta capital/i })).toHaveAttribute('href', '/channel/beta');
    expect(screen.getByText('narrative')).toBeInTheDocument();
    expect(screen.getByText('info')).toBeInTheDocument();
  });

  it('renders an error message when listChannels throws an Error', async () => {
    (listChannels as jest.Mock).mockRejectedValue(new Error('Boom'));

    render(await DashboardPage());

    expect(screen.getByText('Boom')).toBeInTheDocument();
    expect(screen.queryByTestId('card')).not.toBeInTheDocument();
  });

  it('renders fallback error message when listChannels throws a non-Error value', async () => {
    (listChannels as jest.Mock).mockRejectedValue('bad');

    render(await DashboardPage());

    expect(screen.getByText('Failed to load channels')).toBeInTheDocument();
  });

  it('renders no cards and no error when channels resolve to an empty list', async () => {
    (listChannels as jest.Mock).mockResolvedValue([]);

    render(await DashboardPage());

    expect(screen.queryByTestId('card')).not.toBeInTheDocument();
    expect(screen.queryByText('Failed to load channels')).not.toBeInTheDocument();
  });
});
