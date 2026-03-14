import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import RootLayout from '@/app/layout';

describe('RootLayout', () => {
  it('renders html with lang=en and dark class and wraps children in body', () => {
    const html = renderToStaticMarkup(
      <RootLayout>
        <div data-testid="child">Hello</div>
      </RootLayout>,
    );

    expect(html).toContain('<html lang="en" class="dark">');
    expect(html).toContain('<body><div data-testid="child">Hello</div></body>');
  });
});
