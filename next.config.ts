import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  serverExternalPackages: ['pg', 'sharp', '@aws-sdk/client-s3', 'isomorphic-dompurify'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }, { protocol: 'https', hostname: '*.ufs.sh' }],
  },
};

export default withNextIntl(nextConfig);
