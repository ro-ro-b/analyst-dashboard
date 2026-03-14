import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SummariesBrowser } from '@/components/content/summaries-browser';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

jest.mock('lucide-react', () => ({
  Search: (props: any) => <svg data-testid="search-icon" {...props} />,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, onClick, className, variant, ...props }: any) => (
    <button type="button" data-variant={variant} onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/content/empty-state', () => ({
  EmptyState: ({ title, description }: any) => (
    <div data-testid="empty-state">
      <div>{title}</div>
      <div>{description}</div>
    </div>
  ),
}));

const items = [
  {
    title: 'Apple Q1 Thesis Update',
    slug: 'apple-q1',
    filename: 'apple-q1.md',
    sourceDate: '2024-03-01',
    channel: 'Alpha Research',
    channelName: 'Alpha Research',
    channelSlug: 'alpha',
  },
  {
    title: 'Microsoft Azure Deep Dive',
    slug: 'msft-azure',
    filename: 'msft-azure.md',
    sourceDate: '2024-02-15',
    channel: 'Beta Capital',
    channelName: 'Beta Capital',
    channelSlug: 'beta',
  },
  {
    title: 'apple services outlook',
    slug: 'apple-services',
    filename: 'apple-services.md',
    sourceDate: '2024-01-10',
    channel: 'Beta Capital',
    channelName: 'Beta Capital',
    channelSlug: 'beta',
  },
] as any;

const channels = [
  { slug: 'alpha', name: 'Alpha Research' },
  { slug: 'beta', name: 'Beta Capital' },
];

describe('SummariesBrowser', () => {
  it('renders search input, channel filters, and all items initially', () => {
    render(<SummariesBrowser items={items} channels={channels} />);

    expect(screen.getByPlaceholderText(/search summaries by title/i)).toBeInTheDocument();
    expect(screen.getByText('Alpha Research')).toBeInTheDocument();
    expect(screen.getByText('Beta Capital')).toBeInTheDocument();
    expect(screen.getByText('Apple Q1 Thesis Update')).toBeInTheDocument();
    expect(screen.getByText('Microsoft Azure Deep Dive')).toBeInTheDocument();
    expect(screen.getByText('apple services outlook')).toBeInTheDocument();
  });

  it('filters items by case-insensitive title search', async () => {
    const user = userEvent.setup();
    render(<SummariesBrowser items={items} channels={channels} />);

    await user.type(screen.getByPlaceholderText(/search summaries by title/i), 'APPLE');

    expect(screen.getByText('Apple Q1 Thesis Update')).toBeInTheDocument();
    expect(screen.getByText('apple services outlook')).toBeInTheDocument();
    expect(screen.queryByText('Microsoft Azure Deep Dive')).not.toBeInTheDocument();
  });

  it('trims whitespace in search query before filtering', async () => {
    const user = userEvent.setup();
    render(<SummariesBrowser items={items} channels={channels} />);

    await user.type(screen.getByPlaceholderText(/search summaries by title/i), '   azure   ');

    expect(screen.getByText('Microsoft Azure Deep Dive')).toBeInTheDocument();
    expect(screen.queryByText('Apple Q1 Thesis Update')).not.toBeInTheDocument();
  });

  it('filters items by selected channel', async () => {
    const user = userEvent.setup();
    render(<SummariesBrowser items={items} channels={channels} />);

    await user.click(screen.getByRole('button', { name: 'Alpha Research' }));

    expect(screen.getByText('Apple Q1 Thesis Update')).toBeInTheDocument();
    expect(screen.queryByText('Microsoft Azure Deep Dive')).not.toBeInTheDocument();
    expect(screen.queryByText('apple services outlook')).not.toBeInTheDocument();
  });

  it('supports multi-select channel filtering as a union of selected channels', async () => {
    const user = userEvent.setup();
    render(<SummariesBrowser items={items} channels={channels} />);

    await user.click(screen.getByRole('button', { name: 'Alpha Research' }));
    await user.click(screen.getByRole('button', { name: 'Beta Capital' }));

    expect(screen.getByText('Apple Q1 Thesis Update')).toBeInTheDocument();
    expect(screen.getByText('Microsoft Azure Deep Dive')).toBeInTheDocument();
    expect(screen.getByText('apple services outlook')).toBeInTheDocument();
  });

  it('toggles a selected channel off when clicked again', async () => {
    const user = userEvent.setup();
    render(<SummariesBrowser items={items} channels={channels} />);

    const alpha = screen.getByRole('button', { name: 'Alpha Research' });
    await user.click(alpha);
    expect(screen.queryByText('Microsoft Azure Deep Dive')).not.toBeInTheDocument();

    await user.click(alpha);
    expect(screen.getByText('Microsoft Azure Deep Dive')).toBeInTheDocument();
    expect(screen.getByText('apple services outlook')).toBeInTheDocument();
  });

  it('combines search and channel filters', async () => {
    const user = userEvent.setup();
    render(<SummariesBrowser items={items} channels={channels} />);

    await user.type(screen.getByPlaceholderText(/search summaries by title/i), 'apple');
    await user.click(screen.getByRole('button', { name: 'Beta Capital' }));

    expect(screen.getByText('apple services outlook')).toBeInTheDocument();
    expect(screen.queryByText('Apple Q1 Thesis Update')).not.toBeInTheDocument();
    expect(screen.queryByText('Microsoft Azure Deep Dive')).not.toBeInTheDocument();
  });

  it('shows empty state when no items match filters', async () => {
    const user = userEvent.setup();
    render(<SummariesBrowser items={items} channels={channels} />);

    await user.type(screen.getByPlaceholderText(/search summaries by title/i), 'nonexistent');

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('does not render channel filter badges when there is only one channel', () => {
    render(<SummariesBrowser items={items} channels={[channels[0]]} />);

    expect(screen.queryByRole('button', { name: 'Alpha Research' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Beta Capital' })).not.toBeInTheDocument();
  });
});
