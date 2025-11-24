module.exports = {
  apps: [
    {
      name: 'marshalats-fe',
      script: 'npm',
      args: 'start',
      cwd: '/www/wwwroot/Marshalats-fe',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3022
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3022
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
};
