import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PublicLoading } from './public-loading';

describe('public loading', () => {
  it('announces one accessible loading state without a fabricated percentage', () => {
    const { container } = render(<PublicLoading title="Sebentar, ya." description="Halaman sedang disiapkan." />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('heading', { name: 'Sebentar, ya.' })).toBeVisible();
    expect(screen.getByText('Halaman sedang disiapkan.')).toBeVisible();
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
  });
});
