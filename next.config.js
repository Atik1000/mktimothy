/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: [
      "flagcdn.com",
      "cdn.jsdelivr.net",
      "cdn.sanity.io",
      "84.247.131.188", // MinIO VPS server
      "lh3.googleusercontent.com", // Google profile pictures
    ],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "84.247.131.188",
        port: "9000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "84.247.131.188",
        port: "9000",
        pathname: "/**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Add support for emoji fonts and flag rendering
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      use: {
        loader: "file-loader",
        options: {
          outputPath: "static/fonts/",
          publicPath: "/_next/static/fonts/",
        },
      },
    });

    // Ensure proper handling of emoji and unicode characters
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
