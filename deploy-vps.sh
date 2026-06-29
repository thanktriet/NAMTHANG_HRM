#!/bin/bash
# NAM THẮNG HRM - One-click Deploy
# Copy toàn bộ nội dung này paste vào terminal VPS

set -e
export DEBIAN_FRONTEND=noninteractive

echo "🚀 NAM THẮNG HRM - Bắt đầu deploy..."

# 1. Cài đặt cơ bản
echo "📦 Cài Node.js, pnpm, PM2..."
apt update -y
apt install -y git curl build-essential
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi
npm install -g pnpm pm2 2>/dev/null

echo "✅ Node $(node -v)"

# 2. Clone code
echo "📥 Clone code..."
rm -rf /var/www/namthang-hrm
git clone https://github.com/thanktriet/NAMTHANG_HRM.git /var/www/namthang-hrm
cd /var/www/namthang-hrm

# 3. Install packages
echo "📦 Cài packages (mất 1-2 phút)..."
pnpm install --no-frozen-lockfile

# 4. Setup PostgreSQL
echo "🗄️ Setup Database..."
if ! command -v psql &> /dev/null; then
    apt install -y postgresql postgresql-contrib
    systemctl enable postgresql
    systemctl start postgresql
fi

sudo -u postgres psql -c "CREATE USER namthang WITH PASSWORD 'NamThang@HRM2026!';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE namthang_hrm OWNER namthang;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE namthang_hrm TO namthang;" 2>/dev/null || true
sudo -u postgres psql -c "ALTER USER namthang WITH SUPERUSER;" 2>/dev/null || true

# Run schema & seed
sudo -u postgres psql -d namthang_hrm -f /var/www/namthang-hrm/database/schema.sql 2>/dev/null || true
sudo -u postgres psql -d namthang_hrm -f /var/www/namthang-hrm/database/seed-data.sql 2>/dev/null || true
sudo -u postgres psql -d namthang_hrm -c "CREATE TABLE IF NOT EXISTS employee_documents (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), employee_id UUID NOT NULL REFERENCES employees(id), document_type VARCHAR(50) NOT NULL, file_name VARCHAR(255) NOT NULL, file_path VARCHAR(500) NOT NULL, uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), uploaded_by UUID, notes TEXT);" 2>/dev/null || true
sudo -u postgres psql -d namthang_hrm -c "ALTER TABLE rewards_disciplines ADD COLUMN IF NOT EXISTS file_name VARCHAR(255); ALTER TABLE rewards_disciplines ADD COLUMN IF NOT EXISTS file_path VARCHAR(500); ALTER TABLE contracts ADD COLUMN IF NOT EXISTS file_name VARCHAR(255); ALTER TABLE contracts ADD COLUMN IF NOT EXISTS file_path VARCHAR(500);" 2>/dev/null || true

# Insert admin user
sudo -u postgres psql -d namthang_hrm -c "INSERT INTO users (id, username, password_hash, status) VALUES (gen_random_uuid(), 'admin', '\$2b\$10\$rHWE0Flx5XIF.FSfGO22SOIEn.7FopzqypwKFuEuXRs/edbE8NrT.', 'active') ON CONFLICT (username) DO NOTHING;" 2>/dev/null || true

echo "✅ Database ready"

# 5. Create .env
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH=$(openssl rand -hex 32)

cat > /var/www/namthang-hrm/.env << EOF
DATABASE_URL=postgresql://namthang:NamThang@HRM2026!@localhost:5432/namthang_hrm
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=$JWT_REFRESH
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=production
GATEWAY_PORT=6060
EOF

# 6. Update API URLs for production
echo "🔗 Cập nhật API URLs..."
find /var/www/namthang-hrm/apps/web/src -name "*.tsx" -exec sed -i 's|http://localhost:4000|/api-proxy|g' {} \;
find /var/www/namthang-hrm/apps/web/src -name "*.ts" -exec sed -i 's|http://localhost:4000|/api-proxy|g' {} \;
find /var/www/namthang-hrm/apps/landing/src -name "*.tsx" -exec sed -i 's|http://localhost:4000|/api-proxy|g' {} \;

# 7. Build Gateway
echo "🔨 Build API Gateway..."
cd /var/www/namthang-hrm/services/gateway
npx nest build

# 8. Build Web Admin
echo "🔨 Build Web Admin (mất 1-2 phút)..."
cd /var/www/namthang-hrm/apps/web
NEXT_PUBLIC_API_URL="/api-proxy/api/v1" npx next build || true

# 9. Build Landing
echo "🔨 Build Landing..."
cd /var/www/namthang-hrm/apps/landing
NEXT_PUBLIC_API_URL="/api-proxy/api/v1" npx next build || true

# 10. Start with PM2
echo "🚀 Khởi động services..."
pm2 delete hrm-gateway hrm-web hrm-landing 2>/dev/null || true

cd /var/www/namthang-hrm/services/gateway
pm2 start dist/main.js --name "hrm-gateway" --env production -- --port 6060

cd /var/www/namthang-hrm/apps/web
pm2 start npx --name "hrm-web" -- next start -p 6050

cd /var/www/namthang-hrm/apps/landing
pm2 start npx --name "hrm-landing" -- next start -p 6052

pm2 save
pm2 startup 2>/dev/null || true

echo "✅ Services started!"
pm2 status

# 11. Nginx config
echo "🌐 Cấu hình Nginx..."

cat > /etc/nginx/sites-available/namthang-hrm << 'NGINX'
server {
    listen 80;
    server_name hrm.vinfastnamthang.vn;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:6050;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api-proxy/ {
        rewrite ^/api-proxy/(.*) /$1 break;
        proxy_pass http://127.0.0.1:6060;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

server {
    listen 80;
    server_name tuyendung.vinfastnamthang.vn;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:6052;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api-proxy/ {
        rewrite ^/api-proxy/(.*) /$1 break;
        proxy_pass http://127.0.0.1:6060;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/namthang-hrm /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo ""
echo "============================================"
echo "🎉 DEPLOY HOÀN TẤT!"
echo "============================================"
echo ""
echo "📌 URLs:"
echo "   Admin:   http://hrm.vinfastnamthang.vn"
echo "   Landing: http://tuyendung.vinfastnamthang.vn"
echo ""
echo "📌 Ports nội bộ:"
echo "   Web Admin: 6050"
echo "   Landing:   6052"
echo "   API:       6060"
echo ""
echo "📌 Đăng nhập:"
echo "   Username: admin"
echo "   Password: Admin@123"
echo ""
echo "📌 SSL (chạy sau khi DNS đã trỏ):"
echo "   certbot --nginx -d hrm.vinfastnamthang.vn -d tuyendung.vinfastnamthang.vn"
echo ""
echo "📌 Quản lý:"
echo "   pm2 status / pm2 logs / pm2 restart all"
echo ""
