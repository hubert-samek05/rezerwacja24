module.exports = {
  apps: [{
    name: 'rezerwacja24-backend',
    script: 'dist/main.js',
    cwd: '/root/CascadeProjects/rezerwacja24-saas/backend',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:6432/rezerwacja24?schema=public',
      JWT_SECRET: 'tT9y2oeKhv5SwTom+Lk5UoaVj2OhxXrNHvn8CgtiKdS4xRYoHNB6XwF/y1K7wIMzYlYfpzj3yV5ZE+FRaccTzA==',
      REDIS_HOST: 'localhost',
      REDIS_PORT: 6379
    }
  }]
}
