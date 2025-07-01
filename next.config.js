/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs");
const { Config } = require('@remotion/cli/config');
const path = require('path');

// Remotion Configuration
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');

// AWS Lambda configuration (if using Lambda rendering)
if (process.env.NODE_ENV === 'production') {
  Config.setImageFormat('jpeg');
  Config.setCodec('h264');
  Config.setPixelFormat('yuv420p');
}

// Webpack override for additional file support
Config.overrideWebpackConfig((currentConfiguration) => {
  return {
    ...currentConfiguration,
    module: {
      ...currentConfiguration.module,
      rules: [
        ...(currentConfiguration.module?.rules || []),
        {
          test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                publicPath: '/_next/static/media/',
                outputPath: 'static/media/',
              },
            },
          ],
        },
      ],
    },
  };
});

// Define config inline for Node.js compatibility
const config = {
  auth: {
    enabled: true,
  },
  payments: {
    enabled: true,
  },
  analytics: {
    posthog: {
      enabled: process.env.NEXT_PUBLIC_POSTHOG_KEY ? true : false,
      apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
      apiHost: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    },
  },
  monitoring: {
    sentry: {
      enabled: process.env.NEXT_PUBLIC_SENTRY_DSN ? true : false,
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
    },
  },
};

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    domains: ['assets.aceternity.com', 'res.cloudinary.com','oaidalleapiprodscus.blob.core.windows.net','d3cqxidtqh4nzy.cloudfront.net',"pub-e417bacc3219477ba0f53509654df970.r2.dev"],
  },
  // Fixed experimental configuration
  experimental: {
    // Remove turbo rules - they're causing issues
    // turbo: false, // Uncomment this line if you want to completely disable Turbopack
  },
  webpack: (config, { isServer, dev }) => {
    // Handle media files
    config.module.rules.push({
      test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/media/',
          outputPath: 'static/media/',
          esModule: false,
        },
      },
    });

    // FIXED: Handle README.md files properly
    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/[hash][ext]',
      },
    });

    // FIXED: Add externals for esbuild platform binaries
    config.externals = config.externals || [];
    if (!Array.isArray(config.externals)) {
      config.externals = [config.externals];
    }
    
    config.externals.push({
      '@esbuild/darwin-arm64': 'commonjs @esbuild/darwin-arm64',
      '@esbuild/darwin-x64': 'commonjs @esbuild/darwin-x64',
      '@esbuild/linux-arm64': 'commonjs @esbuild/linux-arm64',
      '@esbuild/linux-x64': 'commonjs @esbuild/linux-x64',
      '@esbuild/win32-arm64': 'commonjs @esbuild/win32-arm64',
      '@esbuild/win32-x64': 'commonjs @esbuild/win32-x64',
    });

    // Handle Remotion's requirements
    if (!isServer) {
      // Add fallbacks for Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: require.resolve('path-browserify'),
        os: require.resolve('os-browserify/browser'),
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer/'),
        util: require.resolve('util/'),
      };
      
      // Ensure proper handling of ESM modules
      config.module.rules.push({
        test: /\.m?js$/,
        type: 'javascript/auto',
        resolve: {
          fullySpecified: false,
        },
      });

      // Polyfills for browser
      const webpack = require('webpack');
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      );
    }
    
    // FIXED: Better externals handling for server-side
    if (isServer) {
      // Keep existing externals but handle them properly
      const existingExternals = Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean);
      config.externals = [
        ...existingExternals,
        // Only externalize Remotion packages on server-side in production
        ...(process.env.NODE_ENV === 'production' ? [/^@remotion\/.*$/, /^remotion$/] : [])
      ];
    }

    // FIXED: Better ignore warnings configuration
    config.ignoreWarnings = [
      { module: /node_modules\/@esbuild\/.*\/README\.md$/ },
      { module: /node_modules\/jest-worker/ },
      { module: /node_modules\/browserslist/ },
      /Critical dependency: the request of a dependency is an expression/,
    ];

    // FIXED: Add resolve alias to ignore problematic esbuild files
    config.resolve.alias = {
      ...config.resolve.alias,
      '@esbuild/darwin-arm64/README.md': false,
      '@esbuild/darwin-x64/README.md': false,
      '@esbuild/linux-arm64/README.md': false,
      '@esbuild/linux-x64/README.md': false,
      '@esbuild/win32-arm64/README.md': false,
      '@esbuild/win32-x64/README.md': false,
    };

    return config;
  },
  async rewrites() {
    // Combine PostHog rewrites with video/music API routes
    const routes = [
      {
        source: '/videos/:path*',
        destination: '/api/videos/:path*',
      },
      {
        source: '/music/:path*',
        destination: '/api/music/:path*',
      },
      {
        source: '/renders/:path*',
        destination: '/api/download/:path*',
      }
    ];
    
    // Add PostHog rewrites if enabled
    if (config.analytics.posthog.enabled) {
      routes.push(
        {
          source: "/ingest/static/:path*",
          destination: "https://us-assets.i.posthog.com/static/:path*",
        },
        {
          source: "/ingest/:path*",
          destination: "https://us.i.posthog.com/:path*",
        },
        {
          source: "/ingest/decide",
          destination: "https://us.i.posthog.com/decide",
        }
      );
    }
    
    return routes;
  },
  // Only needed if PostHog is enabled
  skipTrailingSlashRedirect: config.analytics.posthog.enabled,
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG || "your-org",
  project: process.env.SENTRY_PROJECT || "javascript-nextjs",
  
  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,
  
  // Upload a larger set of source maps for prettier stack traces
  widenClientFileUpload: true,
  
  // Route browser requests to Sentry through a Next.js rewrite
  tunnelRoute: "/monitoring",
  
  // Automatically tree-shake Sentry logger statements
  disableLogger: true,
  
  // Enables automatic instrumentation of Vercel Cron Monitors
  automaticVercelMonitors: true,
};

// Only apply Sentry configuration if enabled
module.exports = config.monitoring.sentry.enabled 
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;