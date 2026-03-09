/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { nextRuntime, webpack }) => {
    // Polyfill __dirname / __filename for Edge Runtime bundles.
    // Some transitive deps reference these globals; replacing them with safe
    // string literals prevents ReferenceError at runtime on Vercel Edge.
    if (nextRuntime === 'edge') {
      config.plugins.push(
        new webpack.DefinePlugin({
          __dirname: JSON.stringify('/'),
          __filename: JSON.stringify('/'),
        })
      )
    }
    return config
  },
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
  experimental: {
    // canvas is dev-only (icon generation script) — never bundle in production
    serverComponentsExternalPackages: ['canvas'],
  },
}

export default nextConfig
