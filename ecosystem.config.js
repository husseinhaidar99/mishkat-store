module.exports = {
  apps: [
    {
      name: 'mshkat-backend',
      script: './backend/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'mshkat-frontend',
      script: 'serve',
      env: {
        PM2_SERVE_PATH: './islamic-gifts-shop/build',
        PM2_SERVE_PORT: 3000,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html'
      }
    }
  ]
};
