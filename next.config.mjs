/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  async headers() {
    return [
      {
        // Apply headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            // Allow this site to be embedded by itself and any origin
            // Note: This controls who can embed OUR site, not whether we can embed other sites
            value: "frame-ancestors 'self' *;",
          },
          {
            key: 'X-Frame-Options',
            // Allow this site to be embedded (SAMEORIGIN allows same origin, ALLOWALL is not standard)
            // Using SAMEORIGIN for security, but CSP frame-ancestors above is more flexible
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

