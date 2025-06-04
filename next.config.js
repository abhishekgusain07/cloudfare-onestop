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
  Config.Rendering.setImageFormat('jpeg');
  Config.Output.setCodec('h264');
  Config.Output.setPixelFormat('yuv420p');
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
    domains: ['assets.aceternity.com', 'res.cloudinary.com'],
  },
  // Disable Turbopack for specific routes
  experimental: {
    turbo: {
      rules: {
        // Disable Turbopack for render API routes
        '**/**/api/render/**': {
          turbo: false,
        },
      },
    },
  },
  webpack: (config, { isServer }) => {
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

    // Handle README.md files
    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/source',
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
      config.plugins.push(
        new config.webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      );
    }
    
    // Explicitly mark Remotion packages as external to avoid bundling issues
    if (isServer) {
      const externals = [...(config.externals || [])]; 
      config.externals = [...externals, /^@remotion\/.*$/, /^remotion$/];
    }

    // Ignore specific problematic modules
    config.ignoreWarnings = [
      { module: /node_modules\/@esbuild\/.*\/README\.md/ },
      { module: /node_modules\/jest-worker/ },
      { module: /node_modules\/browserslist/ },
    ];

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