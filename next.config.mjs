/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  headers: async () => [
    {
      source: '/sw.js',
      headers: [
        { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
      ],
    },
  ],
  // Prevent Node.js-only packages from being bundled into the Edge Runtime
  serverExternalPackages: ['canvas'],
  webpack: (config, { nextRuntime }) => {
    if (nextRuntime === 'edge') {
      // The `ws` package (used by @supabase/realtime-js) uses __dirname
      // which is not available in Edge Runtime. Replace with false so the
      // edge bundle uses the native WebSocket API instead.
      config.resolve.alias = {
        ...config.resolve.alias,
        ws: false,
        'bufferutil': false,
        'utf-8-validate': false,
      }
    }
    return config
  },
}

export default nextConfig
