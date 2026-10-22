# .devcontainer/Dockerfile
# Base image with Node.js 24, pnpm 12.15.0, and development tools
# Optimized for Polymath Platform (Expo 57, React Native 0.86, Android SDK)

ARG NODE_VERSION=24
ARG PNPM_VERSION=12.15.0

FROM node:${NODE_VERSION}-bookworm-slim AS base

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    wget \
    unzip \
    ca-certificates \
    gnupg \
    lsb-release \
    build-essential \
    python3 \
    python3-pip \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

# Create non-root user (matches devcontainer remoteUser)
ARG USERNAME=node
ARG USER_UID=1000
ARG USER_GID=1000

# Ensure node user exists with correct UID/GID
RUN if id "${USERNAME}" >/dev/null 2>&1; then \
      usermod -u ${USER_UID} ${USERNAME} && groupmod -g ${USER_GID} ${USERNAME}; \
    else \
      groupadd --gid ${USER_GID} ${USERNAME} && useradd --uid ${USER_UID} --gid ${USER_GID} -m -s /bin/bash ${USERNAME}; \
    fi

# Set up workspace directory
WORKDIR /workspaces/EdLove

# Install global tools needed for development
RUN pnpm add -g \
    @expo/cli@latest \
    @expo/ngrok@latest \
    typescript@7.1.0-beta \
    turbo@latest \
    @biomejs/biome@latest \
    oxlint@latest \
    @changesets/cli@latest \
    depcruise@latest \
    vitest@latest \
    playwright@latest \
    supabase@latest \
    @supabase/mcp-server-supabase@latest

# Install Android SDK command-line tools (for local Android builds)
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin:${ANDROID_SDK_ROOT}/platform-tools:${PATH}

RUN mkdir -p ${ANDROID_SDK_ROOT}/cmdline-tools && \
    cd ${ANDROID_SDK_ROOT}/cmdline-tools && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O cmdline-tools.zip && \
    unzip -q cmdline-tools.zip && \
    mv cmdline-tools latest && \
    rm cmdline-tools.zip && \
    yes | ${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin/sdkmanager --licenses >/dev/null 2>&1 && \
    ${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin/sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" >/dev/null 2>&1

# Install Java 17 (required for Android Gradle builds)
RUN apt-get update && apt-get install -y --no-install-recommends \
    openjdk-17-jdk-headless \
    && rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH=${JAVA_HOME}/bin:${PATH}

# Install Gradle (via SDKMAN alternative - just download)
ENV GRADLE_VERSION=8.5
RUN cd /opt && \
    wget -q https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip && \
    unzip -q gradle-${GRADLE_VERSION}-bin.zip && \
    ln -s /opt/gradle-${GRADLE_VERSION}/bin/gradle /usr/local/bin/gradle && \
    rm gradle-${GRADLE_VERSION}-bin.zip

# Install Supabase CLI (already via pnpm, but also need binary for some ops)
RUN curl -fsSL https://github.com/supabase/cli/releases/download/v2.15.0/supabase_linux_amd64.tar.gz | tar -xz -C /usr/local/bin

# Install EAS CLI (via pnpm already, but also available globally)
# Already covered by pnpm add -g @expo/cli

# Install Watchman (for Metro file watching)
RUN apt-get update && apt-get install -y --no-install-recommends \
    watchman \
    && rm -rf /var/lib/apt/lists/*

# Install additional tools for React Native development
RUN apt-get update && apt-get install -y --no-install-recommends \
    libjpeg-dev \
    libpng-dev \
    libwebp-dev \
    libgif-dev \
    libxml2-dev \
    libxslt-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Set ownership of workspace to node user
RUN chown -R ${USERNAME}:${USERNAME} /workspaces/EdLove ${ANDROID_SDK_ROOT} /opt/gradle-${GRADLE_VERSION}

USER ${USERNAME}

# Verify installations
RUN node --version && pnpm --version && java -version && gradle --version && watchman --version

# Pre-warm pnpm store (optional - speeds up first install)
# RUN pnpm setup

# Default command
CMD ["bash"]