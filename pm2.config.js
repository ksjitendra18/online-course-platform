module.exports = {
    apps: [
      {
        name: 'next-app',
        script: 'npm',
        args: 'start',
        cwd: './apps/web',
        env: {
          NODE_ENV: 'production',
          PORT: process.env.NEXT_PORT || 3000,
          NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
        }
      },
      {
        name: 'upload-api',
        script: './apps/upload-api/dist/index.js',
        interpreter: "bun",
        env: {
          NODE_ENV: 'production',
          PORT: process.env.API_PORT || 3001,

        }
      }
    ]
  };

