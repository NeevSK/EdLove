#!/bin/bash
set -e

echo "=== 1. Updating System Packages ==="
sudo apt-get update && sudo apt-get install -y build-essential curl git unzip openjdk-17-jdk

echo "=== 2. Installing Node.js 22 & PNPM ==="
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

sudo npm install -g pnpm eas-cli

echo "=== 3. Installing Doppler CLI ==="
if ! command -v doppler &> /dev/null; then
  curl -Ls https://cli.doppler.com/install.sh | sudo sh
fi

echo "=== 4. Downloading and Configuring Android SDK & NDK ==="
export ANDROID_HOME=$HOME/Android/Sdk
mkdir -p "$ANDROID_HOME/cmdline-tools"

# Download official Android command-line tools
if [ ! -d "$ANDROID_HOME/cmdline-tools/latest" ]; then
  echo "Downloading Android Command Line Tools..."
  cd /tmp
  curl -o cmdline-tools.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
  unzip -q cmdline-tools.zip
  mv cmdline-tools "$ANDROID_HOME/cmdline-tools/latest"
  rm cmdline-tools.zip
fi

# Export paths for sdkmanager
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin

echo "Accepting Android Licenses..."
yes | sdkmanager --licenses

echo "Installing Android SDK Platform 35, Build-Tools, and NDK 27..."
sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0" "ndk;27.1.12297006"

echo "=== 5. Writing Path Exports to ~/.bashrc ==="
if ! grep -q "ANDROID_HOME" ~/.bashrc; then
  cat << 'EOF' >> ~/.bashrc

# Android SDK & NDK config
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
EOF
  echo "Environment variables appended to ~/.bashrc"
fi

echo "=========================================="
echo "Setup complete! Please run the following command to load the new environment:"
echo "  source ~/.bashrc"
echo "=========================================="
