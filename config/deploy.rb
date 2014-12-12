# config valid only for Capistrano 3.1
lock '3.2.1'

set :application, 'cwic'
set :repo_url, 'git@bitbucket.org:iadavof/cwic.git'

role :app, %w(cwic@cola.iada.nl)
role :web, %w(cwic@cola.iada.nl)
role :db,  %w(cwic@cola.iada.nl)

# Default branch is :master
# ask :branch, proc { `git rev-parse --abbrev-ref HEAD`.chomp }.call

# Default deploy_to directory is /var/www/my_app
# set :deploy_to, '/var/www/my_app'

# Default value for :scm is :git
# set :scm, :git

# Default value for :format is :pretty
# set :format, :pretty

# Default value for :log_level is :debug
# set :log_level, :debug

# Default value for :pty is false
# set :pty, true

# Default value for :linked_files is []
set :linked_files, %w(config/database.yml config/secrets.yml)

# Default value for linked_dirs is []
# set :linked_dirs, %w{bin log tmp/pids tmp/cache tmp/sockets vendor/bundle public/system}

# Default value for default_env is {}
# set :default_env, { path: "/opt/ruby/bin:$PATH" }

# Default value for keep_releases is 5
# set :keep_releases, 5

namespace :deploy do
  namespace :websocket_rails do
    desc 'Start Websocket-Rails standalone server'
    task :start_server do
      on release_roles(:app) do
        within release_path do
          with rails_env: fetch(:rails_env) do
            execute :mkdir, '-p', release_path.join('tmp', 'pids')
            execute :rake, 'websocket_rails:start_server'
            invoke 'deploy:websocket_rails:symlink_pid'
          end
        end
      end
    end

    desc 'Symlink Websocket-Rails standalone server pid file to shared'
    task :symlink_pid do
      on release_roles(:app) do
        execute :mkdir, '-p', shared_path.join('tmp', 'pids')
        execute :ln, '-s', release_path.join('tmp', 'pids', 'websocket_rails.pid'), shared_path.join('tmp', 'pids', 'websocket_rails.pid')
      end
    end

    desc 'Stop Websocket-Rails standalone server'
    task :stop_server do
      on release_roles(:app) do
        within release_path do
          with rails_env: fetch(:rails_env) do
            if test "[ -f #{release_path.join('tmp', 'pids', 'websocket_rails.pid')} ]"
              # PID file present in current release; kill server.
              execute :rake, 'websocket_rails:stop_server'
            elsif test "[ -f #{shared_path.join('tmp', 'pids', 'websocket_rails.pid')} ]"
              # PID file present in shared folder (from previous release); copy it and kill server.
              invoke 'deploy:websocket_rails:copy_pid'
              execute :rake, 'websocket_rails:stop_server'
            else
              # PID file could not be found; assume not running.
            end
          end
        end
      end
    end

    desc 'Copy Websocket-Rails standalone server pid file from shared'
    task :copy_pid do
      on release_roles(:app) do
        execute :mkdir, '-p', release_path.join('tmp', 'pids')
        execute :cp, shared_path.join('tmp', 'pids', 'websocket_rails.pid'), release_path.join('tmp', 'pids', 'websocket_rails.pid')
      end
    end

    desc 'Restart Websocket-Rails standalone server'
    task :restart_server do
      invoke 'deploy:websocket_rails:stop_server'
      invoke 'deploy:websocket_rails:start_server'
    end
  end

  # Auto restarting of websocket rails server disabled for now, due to various problems:
  # - Stopping the old server is difficult, hence the symlink/copy pid file solution
  # - The script often hangs after (really) starting the websocket server
  # The last problem is probably related to issue #231 with websocket-rails. Also see our Gemfile

  # before :publishing, 'websocket_rails:stop_server' # Stop the old release server
  # after :publishing, 'websocket_rails:start_server' # Start the new release server
end
