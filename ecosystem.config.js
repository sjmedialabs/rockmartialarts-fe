module.exports = {
  apps: [
    {
      name: 'rockmartialarts-fe',
      script: 'node_modules/.bin/next',
      args: 'start -p 3022 -H 0.0.0.0',
      cwd: '/root/rockmartialarts-fe',
      interpreter: 'none',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3022,
        HOSTNAME: '0.0.0.0'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3022,
        HOSTNAME: '0.0.0.0'
      },
      error_file: '/root/rockmartialarts-fe/logs/err.log',
      out_file: '/root/rockmartialarts-fe/logs/out.log',
      log_file: '/root/rockmartialarts-fe/logs/combined.log',
      time: true
    }
  ]
};
