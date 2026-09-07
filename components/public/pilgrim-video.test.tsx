import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PilgrimVideo } from './pilgrim-video';

vi.stubGlobal('React', React);
vi.mock('next-intl', () => ({useTranslations: () => (key:string) => key}));
afterEach(cleanup);
describe('pilgrim video', () => {
  it('loads the player only after visitor interaction and removes it on close', () => {
    const { container } = render(<PilgrimVideo title="Video uji" url="https://youtu.be/abcdefghijk" />);
    expect(container.querySelector('iframe')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name:'playVideo' }));
    expect(container.querySelector('iframe')?.src).toBe('https://www.youtube-nocookie.com/embed/abcdefghijk?autoplay=1&rel=0');
    fireEvent.click(screen.getByRole('button', { name:'stopVideo' }));
    expect(container.querySelector('iframe')).toBeNull();
    expect(screen.getByRole('button', {name:'playVideo'})).toBeVisible();
  });
  it('does not render unsupported video URLs',()=>{
    const { container }=render(<PilgrimVideo title="Video uji" url="https://evil.test/video" />);
    expect(container).toBeEmptyDOMElement();
  });
});
