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
    reactStrictMode: true, // You've mentioned turning this off.
    images: {
        domains: ['twitterclone-bucket.s3.us-east-2.amazonaws.com'], // Add this to allow images from your S3 bucket
    },
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
