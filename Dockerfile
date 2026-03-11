# Development-ready environment container for Gasless Rollup
# Minimal requirements: Node 20, Rust/Cargo, Foundry, and project deps

FROM node:20-bookworm

ENV DEBIAN_FRONTEND=noninteractive

# Install system packages
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    pkg-config \
    libssl-dev \
    ca-certificates \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Install Rust + Cargo
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install Foundry
RUN curl -L https://foundry.paradigm.xyz | bash
ENV PATH="/root/.foundry/bin:${PATH}"
RUN foundryup

# Set working directory and copy project
WORKDIR /workspace
COPY . .

# Install dependencies for local manual commands
RUN npm install --prefix relayer
RUN npm install --prefix rollup-explorer-main --legacy-peer-deps

# Do not auto-start services; they will be run manually inside the container
EXPOSE 4000 8080

CMD ["/bin/bash"]
