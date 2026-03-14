import React from 'react';
import { render, screen } from '@testing-library/react';
import SummariesPage from '@/app/summaries/page';
import { listChannels, listChannelSummaries } from '@/lib/data';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

jest.mock('lucide-react', () => ({
  ArrowLeft: (props: any) => <svg data-testid="arrow-left" {...props} />,
}));

jest.mock('@/lib/data', () => ({
  listChannels: jest.fn(),
  listChannelSummaries: jest.fn(),
}));

jest.mock('@/components/content/summaries-browser', () => ({
  SummariesBrowser: ({ items, channels }: any) => (
    <div>
      <div data-testid="browser-items">{JSON.stringify(items)}</div>
      <div data-testid="browser-channels">{JSON.stringify(channels)}</div>
    </div>
  ),
}));

describe('SummariesPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('fetches all channels and summaries, flattens them, sorts by sourceDate descending, and passes channel list', async () => {
    (listChannels as jest.Mock).mockResolvedValue([
      { slug: 'beta', name: 'Beta Capital' },
      { slug: 'alpha', name: 'Alpha Research' },
    ]);

    (listChannelSummaries as jest.Mock)
      .mockImplementation(async (slug: string) => {
        if (slug === 'beta') {
          return {
            items: [
              { title: 'Older', sourceDate: '2024-01-01', filename: 'older.md' },
              { title: 'Newest', sourceDate: '2024-03-01', filename: 'newest.md' },
            ],
          };
        }
        return {
          items: [
            { title: 'Middle', sourceDate: '2024-02-01', filename: 'middle.md' },
          ],
        };
      });

    render(await SummariesPage());

    expect(listChannels).toHaveBeenCalledTimes(1);
    expect(listChannelSummaries).toHaveBeenCalledTimes(2);
    expect(listChannelSummaries).toHaveBeenNthCalledWith(1, 'beta', { limit: 1000 });
    expect(listChannelSummaries).toHaveBeenNthCalledWith(2, 'alpha', { limit: 1000 });

    const items = JSON.parse(screen.getByTestId('browser-items').textContent || '[]');
    expect(items.map((item: any) => item.title)).toEqual(['Newest', 'Middle', 'Older']);
    expect(items[0]).toMatchObject({ channelName: 'Beta Capital', channelSlug: 'beta' });
    expect(items[1]).toMatchObject({ channelName: 'Alpha Research', channelSlug: 'alpha' });

    const channelList = JSON.parse(screen.getByTestId('browser-channels').textContent || '[]');
    expect(channelList).toEqual([
      { slug: 'beta', name: 'Beta Capital' },
      { slug: 'alpha', name: 'Alpha Research' },
    ]);

    expect(screen.getByRole('link', { name: /back to dashboard/i })).toHaveAttribute('href', '/');
    expect(screen.getByText('All Summaries')).toBeInTheDocument();
    expect(screen.getByText(/search and filter summaries across all analyst channels/i)).toBeInTheDocument();
  });

  it('passes empty arrays when there are no channels', async () => {
    (listChannels as jest.Mock).mockResolvedValue([]);

    render(await SummariesPage());

    expect(listChannelSummaries).not.toHaveBeenCalled();
    expect(JSON.parse(screen.getByTestId('browser-items').textContent || '[]')).toEqual([]);
    expect(JSON.parse(screen.getByTestId('browser-channels').textContent || '[]')).toEqual([]);
  });
});
