#!/bin/sh
set -e

# Ensure storage directory has correct permissions
mkdir -p /var/lib/opamp
chown -R nobody:nobody /var/lib/opamp
chmod -R 755 /var/lib/opamp

# Switch to nobody user and run the supervisor
exec su-exec nobody /usr/local/bin/opampsupervisor --config /etc/supervisor_docker.yaml
