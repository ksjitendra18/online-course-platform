module.exports = {
    apps: [
      {
        name: 'dev-next-app',
        script: 'npm',
        args: 'start',
        cwd: './apps/web',
        env: {
          NODE_ENV: 'production',
          PORT: process.env.NEXT_PORT || 3002,
          NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
        }
      },
      {
        name: 'dev-upload-api',
        script: './apps/upload-api/dist/index.js',
        interpreter: "bun",
        env: {
          NODE_ENV: 'production',
          PORT: process.env.API_PORT || 3003,

        }
      }
    ]
  };

