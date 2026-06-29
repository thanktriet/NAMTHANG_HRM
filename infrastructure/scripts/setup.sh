#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")"
DOCKER_DIR="$INFRA_DIR/docker"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check Docker is installed
check_docker() {
    log_info "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker compose &> /dev/null; then
        log_error "Docker Compose is not available. Please install Docker Compose."
        exit 1
    fi

    log_info "Docker is installed and available."
}

# Start Docker Compose services
start_services() {
    log_info "Starting Docker Compose services..."
    cd "$DOCKER_DIR"
    docker compose up -d
    log_info "Services started successfully."
}

# Wait for PostgreSQL to be ready
wait_for_postgres() {
    log_info "Waiting for PostgreSQL to be ready..."
    local retries=30
    local count=0

    while [ $count -lt $retries ]; do
        if docker exec namthang-postgres pg_isready -U namthang -d namthang_hrm &> /dev/null; then
            log_info "PostgreSQL is ready."
            return 0
        fi
        count=$((count + 1))
        log_warn "PostgreSQL not ready yet. Retry $count/$retries..."
        sleep 2
    done

    log_error "PostgreSQL did not become ready in time."
    exit 1
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    cd "$INFRA_DIR/.."
    if [ -f "package.json" ]; then
        if grep -q "migration:run" package.json; then
            npm run migration:run
            log_info "Migrations completed successfully."
        else
            log_warn "No migration:run script found in package.json. Skipping migrations."
        fi
    else
        log_warn "No package.json found. Skipping migrations."
    fi
}

# Seed initial data
seed_data() {
    log_info "Seeding initial data..."
    cd "$INFRA_DIR/.."
    if [ -f "package.json" ]; then
        if grep -q "seed" package.json; then
            npm run seed
            log_info "Data seeding completed successfully."
        else
            log_warn "No seed script found in package.json. Skipping seeding."
        fi
    else
        log_warn "No package.json found. Skipping seeding."
    fi
}

# Main execution
main() {
    echo "========================================"
    echo "  NamThang HRM - Infrastructure Setup"
    echo "========================================"
    echo ""

    check_docker
    start_services
    wait_for_postgres
    run_migrations
    seed_data

    echo ""
    log_info "Setup complete! Services are running:"
    echo "  - PostgreSQL:  localhost:5432"
    echo "  - Redis:       localhost:6379"
    echo "  - MinIO:       localhost:9000 (Console: localhost:9001)"
    echo "  - NATS:        localhost:4222"
    echo "  - PgAdmin:     localhost:5050"
    echo "  - MailHog:     localhost:8025"
    echo ""
}

main "$@"
