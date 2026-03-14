import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShareButton } from '@/components/content/share-button';

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('lucide-react', () => ({
  Share2: (props: any) => <svg data-testid="share-icon" {...props} />,
  Check: (props: any) => <svg data-testid="check-icon" {...props} />,
}));

describe('ShareButton', () => {
  const originalLocation = window.location;
  const originalNavigator = global.navigator;
  const originalSetTimeout = window.setTimeout;

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: 'https://example.com/channel/acme/summary/file' },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
    Object.defineProperty(global, 'navigator', {
      configurable: true,
      value: originalNavigator,
    });
    window.setTimeout = originalSetTimeout;
  });

  it('renders default share state initially', () => {
    render(<ShareButton title="Title" text="Text" />);

    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
    expect(screen.getByTestId('share-icon')).toBeInTheDocument();
    expect(screen.queryByText(/copied!/i)).not.toBeInTheDocument();
  });

  it('uses navigator.share when available and passes title, text, and current url', async () => {
    const share = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(global, 'navigator', {
      configurable: true,
      value: { share },
    });

    const user = userEvent.setup();
    render(<ShareButton title="My title" text="My text" />);

    await user.click(screen.getByRole('button', { name: /share/i }));

    expect(share).toHaveBeenCalledTimes(1);
    expect(share).toHaveBeenCalledWith({
      title: 'My title',
      text: 'My text',
      url: 'https://example.com/channel/acme/summary/file',
    });
    expect(screen.queryByText(/copied!/i)).not.toBeInTheDocument();
  });

  it('swallows navigator.share rejection without falling back to clipboard', async () => {
    const share = jest.fn().mockRejectedValue(new Error('dismissed'));
    const writeText = jest.fn();
    Object.defineProperty(global, 'navigator', {
      configurable: true,
      value: {
        share,
        clipboard: { writeText },
      },
    });

    const user = userEvent.setup();
    render(<ShareButton title="My title" text="My text" />);

    await user.click(screen.getByRole('button', { name: /share/i }));

    await waitFor(() => expect(share).toHaveBeenCalled());
    expect(writeText).not.toHaveBeenCalled();
    expect(screen.queryByText(/copied!/i)).not.toBeInTheDocument();
  });

  it('falls back to clipboard copy when navigator.share is unavailable', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(global, 'navigator', {
      configurable: true,
      value: {
        clipboard: { writeText },
      },
    });

    const user = userEvent.setup();
    render(<ShareButton title="My title" text="My text" />);

    await user.click(screen.getByRole('button', { name: /share/i }));

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith('https://example.com/channel/acme/summary/file');
    expect(screen.getByText(/copied!/i)).toBeInTheDocument();
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
  });

  it('resets copied state after 2 seconds when clipboard copy succeeds', async () => {
    jest.useFakeTimers();
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(global, 'navigator', {
      configurable: true,
      value: {
        clipboard: { writeText },
      },
    });

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<ShareButton title="My title" text="My text" />);

    await user.click(screen.getByRole('button', { name: /share/i }));
    expect(screen.getByText(/copied!/i)).toBeInTheDocument();

    jest.advanceTimersByTime(1999);
    expect(screen.getByText(/copied!/i)).toBeInTheDocument();

    jest.advanceTimersByTime(1);
    await waitFor(() => expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument());
    expect(screen.queryByText(/copied!/i)).not.toBeInTheDocument();

    jest.useRealTimers();
  });

  it('swallows clipboard write failures and does not show copied state', async () => {
    const writeText = jest.fn().mockRejectedValue(new Error('denied'));
    Object.defineProperty(global, 'navigator', {
      configurable: true,
      value: {
        clipboard: { writeText },
      },
    });

    const user = userEvent.setup();
    render(<ShareButton title="My title" text="My text" />);

    await user.click(screen.getByRole('button', { name: /share/i }));

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/copied!/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
  });
});
