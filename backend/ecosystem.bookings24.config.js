module.exports = {
  apps: [
    {
      name: 'bookings24-backend',
      script: './start-bookings24.sh',
      cwd: '/root/CascadeProjects/rezerwacja24-saas/backend',
      interpreter: '/bin/bash',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};
