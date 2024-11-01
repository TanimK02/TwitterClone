/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs']
    },

    webpack(config, { dev, isServer }) {
        if (dev && !isServer) {
            config.devtool = 'cheap-module-source-map';
        }

        if (!isServer) {
            config.resolve.fallback = {
                crypto: false,
                stream: false,
                fs: false,
            };
        }
        config.cache = false;
        return config;
    },
    reactStrictMode: false, // You've mentioned turning this off.
    async headers() {
        return [
            {
                source: '/_next/static/css/:path*',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'text/css',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
