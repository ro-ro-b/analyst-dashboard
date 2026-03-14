import React from 'react';
import { render, screen } from '@testing-library/react';
import SummaryDetailPage from '@/app/channel/[slug]/summary/[filename]/page';
import { getChannelSummary } from '@/lib/data';
import { notFound } from 'next/navigation';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

jest.mock('@/lib/data', () => ({
  getChannelSummary: jest.fn(),
}));

jest.mock('lucide-react', () => ({
  ArrowLeft: (props: any) => <svg data-testid="arrow-left" {...props} />,
  ExternalLink: (props: any) => <svg data-testid="external-link" {...props} />,
}));

jest.mock('@/components/content/rendered-html', () => ({
  RenderedHtml: ({ html }: any) => <div data-testid="rendered-html">{html}</div>,
}));

jest.mock('@/components/content/metadata-row', () => ({
  MetadataRow: ({ label, value }: any) => <div>{label}: {value}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, asChild }: any) => asChild ? <>{children}</> : <button>{children}</button>,
}));

jest.mock('@/components/content/share-button', () => ({
  ShareButton: ({ title, text }: any) => <div data-testid="share-button">{title}|{text}</div>,
}));

describe('SummaryDetailPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (notFound as jest.Mock).mockImplementation(() => {
      throw new Error('NEXT_NOT_FOUND');
    });
  });

  it('calls getChannelSummary with awaited params and renders summary details', async () => {
    (getChannelSummary as jest.Mock).mockResolvedValue({
      channel: 'Alpha Research',
      title: 'Apple Q1 Thesis Update',
      sourceDate: '2024-03-01',
      duration: '12:34',
      generatedDate: '2024-03-02',
      model: 'gpt-4',
      videoUrl: 'https://youtube.com/watch?v=123',
      html: '<p>Hello</p>',
      summary: 'A concise summary',
    });

    render(
      await SummaryDetailPage({
        params: Promise.resolve({ slug: 'alpha', filename: 'apple-q1.md' }),
      }),
    );

    expect(getChannelSummary).toHaveBeenCalledWith('alpha', 'apple-q1.md');
    expect(screen.getByRole('link', { name: /back to alpha research/i })).toHaveAttribute('href', '/channel/alpha');
    expect(screen.getByText('Apple Q1 Thesis Update')).toBeInTheDocument();
    expect(screen.getByText('Source Date: 2024-03-01')).toBeInTheDocument();
    expect(screen.getByText('Duration: 12:34')).toBeInTheDocument();
    expect(screen.getByText('Generated: 2024-03-02')).toBeInTheDocument();
    expect(screen.getByText('Model: gpt-4')).toBeInTheDocument();
    expect(screen.getByTestId('share-button')).toHaveTextContent('Apple Q1 Thesis Update|A concise summary');
    expect(screen.getByTestId('rendered-html')).toHaveTextContent('<p>Hello</p>');
  });

  it('omits optional metadata rows when optional fields are absent', async () => {
    (getChannelSummary as jest.Mock).mockResolvedValue({
      channel: 'Alpha Research',
      title: 'Minimal Summary',
      sourceDate: '2024-03-01',
      html: '<p>Body</p>',
      summary: 'Summary text',
    });

    render(
      await SummaryDetailPage({
        params: Promise.resolve({ slug: 'alpha', filename: 'minimal.md' }),
      }),
    );

    expect(screen.getByText('Source Date: 2024-03-01')).toBeInTheDocument();
    expect(screen.queryByText(/Duration:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Generated:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Model:/)).not.toBeInTheDocument();
  });

  it('invokes notFound when summary is missing', async () => {
    (getChannelSummary as jest.Mock).mockResolvedValue(null);

    await expect(
      SummaryDetailPage({
        params: Promise.resolve({ slug: 'alpha', filename: 'missing.md' }),
      }),
    ).rejects.toThrow('NEXT_NOT_FOUND');

    expect(notFound).toHaveBeenCalledTimes(1);
  });
});
