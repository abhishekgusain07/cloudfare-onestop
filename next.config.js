/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs");
const { Config } = require('@remotion/cli/config');

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
    domains: ['assets.aceternity.com'],
  },
  // Note: esmExternals was removed as it's not supported with Turbopack
  experimental: {},
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

    // Handle Remotion's requirements
    if (!isServer) {
      // Add fallbacks for Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
      
      // Ensure proper handling of ESM modules
      config.module.rules.push({
        test: /\.m?js$/,
        type: 'javascript/auto',
        resolve: {
          fullySpecified: false,
        },
      });
    }
    
    // Explicitly mark Remotion packages as external to avoid bundling issues
    if (isServer) {
      const externals = [...(config.externals || [])]; 
      config.externals = [...externals, /^@remotion\/.*$/, /^remotion$/];
    }

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