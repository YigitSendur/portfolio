import type { NextConfig } from 'next';

// PREVIEW=1 builds a static export used only for the claude.ai preview.
// Normal builds (and Vercel) ignore it.
const preview = process.env.PREVIEW === '1';

const nextConfig: NextConfig = {
  ...(preview && {
    output: 'export',
    images: { unoptimized: true },
    webpack: (config, { webpack, isServer }) => {
      if (!isServer) config.plugins.push(new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }));
      return config;
    },
  }),
};

export default nextConfig;
