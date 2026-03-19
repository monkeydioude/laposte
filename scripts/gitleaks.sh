#!/bin/sh
set -eu

echo "[INFO] Running gitleaks scan!"
docker run --rm -v "$(pwd):/path" zricethezav/gitleaks:latest detect --source="/path" -v
if [ $? -ne 0 ]; then
 echo "❌ Gitleaks found secrets. Check if you didnt forget to add a secret/password in .gitleaks.toml"
 exit 1
fi