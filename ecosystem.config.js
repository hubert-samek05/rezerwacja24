module.exports = {
  apps: [
    {
      name: 'rezerwacja24-backend',
      script: 'dist/src/main.js',
      cwd: '/root/CascadeProjects/rezerwacja24-saas/backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      error_file: '/root/.pm2/logs/rezerwacja24-backend-error.log',
      out_file: '/root/.pm2/logs/rezerwacja24-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
    {
      name: 'rezerwacja24-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: '/root/CascadeProjects/rezerwacja24-saas/frontend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      error_file: '/root/.pm2/logs/rezerwacja24-frontend-error.log',
      out_file: '/root/.pm2/logs/rezerwacja24-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
