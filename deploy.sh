#!/bin/bash
# ============================================
# NAM THẮNG HRM - Deploy Script
# Domain: hrm.vinfastnamthang.vn (Web Admin)
#         tuyendung.vinfastnamthang.vn (Landing)
# Ports:  3050 (Web Admin)
#         3052 (Landing)
#         4050 (API Gateway)
# ============================================

set -e

echo "🚀 Bắt đầu deploy Nam Thắng HRM..."

# ===== CONFIG =====
APP_DIR="/var/www/namthang-hrm"
WEB_PORT=3050
LANDING_PORT=3052
API_PORT=4050
DB_NAME="namthang_hrm"
DB_USER="namthang"
DB_PASS="NamThang@HRM2026!"
DOMAIN_ADMIN="hrm.vinfastnamthang.vn"
DOMAIN_LANDING="tuyendung.vinfastnamthang.vn"

# ===== STEP 1: Install dependencies =====
echo "📦 Step 1: Kiểm tra & cài đặt dependencies..."

if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi

if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm
fi

if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

echo "✅ Node $(node -v), pnpm $(pnpm -v), pm2 installed"

# ===== STEP 2: Clone/Pull code =====
echo "📥 Step 2: Clone code từ GitHub..."

if [ -d "$APP_DIR" ]; then
    cd $APP_DIR
    git pull origin main
else
    git clone https://github.com/thanktriet/NAMTHANG_HRM.git $APP_DIR
    cd $APP_DIR
fi

# ===== STEP 3: Install packages =====
echo "📦 Step 3: Cài packages..."
pnpm install

# ===== STEP 4: Setup PostgreSQL =====
echo "🗄️ Step 4: Setup Database..."

# Check if database exists
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo "Database $DB_NAME đã tồn tại, skip..."
else
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

    # Run schema
    sudo -u postgres psql -d $DB_NAME -f $APP_DIR/database/schema.sql
    sudo -u postgres psql -d $DB_NAME -f $APP_DIR/database/seed-data.sql

    echo "✅ Database created & seeded"
fi

# ===== STEP 5: Create .env =====
echo "⚙️ Step 5: Tạo .env..."

cat > $APP_DIR/.env << EOF
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=production
GATEWAY_PORT=$API_PORT
EOF

# ===== STEP 6: Build Gateway =====
echo "🔨 Step 6: Build API Gateway..."
cd $APP_DIR/services/gateway
npx nest build

# ===== STEP 7: Update API URL in frontend =====
echo "🔗 Step 7: Cập nhật API URL..."

# Replace localhost:4000 with production API URL in all frontend files
find $APP_DIR/apps/web/src -name "*.tsx" -exec sed -i "s|http://localhost:4000|https://$DOMAIN_ADMIN/api-proxy|g" {} \;
find $APP_DIR/apps/landing/src -name "*.tsx" -exec sed -i "s|http://localhost:4000|https://$DOMAIN_LANDING/api-proxy|g" {} \;

# ===== STEP 8: Build Frontend =====
echo "🔨 Step 8: Build Web Admin..."
cd $APP_DIR/apps/web
npx next build

echo "🔨 Step 9: Build Landing..."
cd $APP_DIR/apps/landing
npx next build

# ===== STEP 10: Start with PM2 =====
echo "🚀 Step 10: Khởi động services với PM2..."

# Stop existing if any
pm2 delete hrm-gateway 2>/dev/null || true
pm2 delete hrm-web 2>/dev/null || true
pm2 delete hrm-landing 2>/dev/null || true

# Start Gateway
cd $APP_DIR/services/gateway
DATABASE_URL="postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME" \
JWT_SECRET=$(grep JWT_SECRET $APP_DIR/.env | cut -d= -f2) \
JWT_EXPIRES_IN=1d \
JWT_REFRESH_SECRET=$(grep JWT_REFRESH_SECRET $APP_DIR/.env | cut -d= -f2) \
JWT_REFRESH_EXPIRES_IN=7d \
PORT=$API_PORT \
pm2 start dist/main.js --name "hrm-gateway"

# Start Web Admin
cd $APP_DIR/apps/web
pm2 start npx --name "hrm-web" -- next start -p $WEB_PORT

# Start Landing
cd $APP_DIR/apps/landing
pm2 start npx --name "hrm-landing" -- next start -p $LANDING_PORT

pm2 save

echo "✅ Services started!"
pm2 status

# ===== STEP 11: Setup Nginx =====
echo "🌐 Step 11: Cấu hình Nginx..."

cat > /etc/nginx/sites-available/namthang-hrm << EOF
# Nam Thắng HRM - Web Admin
server {
    listen 80;
    server_name $DOMAIN_ADMIN;

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:$WEB_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # API proxy
    location /api-proxy/ {
        rewrite ^/api-proxy/(.*) /\$1 break;
        proxy_pass http://127.0.0.1:$API_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}

# Nam Thắng HRM - Landing Tuyển dụng
server {
    listen 80;
    server_name $DOMAIN_LANDING;

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:$LANDING_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # API proxy
    location /api-proxy/ {
        rewrite ^/api-proxy/(.*) /\$1 break;
        proxy_pass http://127.0.0.1:$API_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/namthang-hrm /etc/nginx/sites-enabled/

# Test & reload nginx
nginx -t && systemctl reload nginx

echo "✅ Nginx configured!"

# ===== STEP 12: SSL =====
echo "🔒 Step 12: Cài SSL..."
certbot --nginx -d $DOMAIN_ADMIN -d $DOMAIN_LANDING --non-interactive --agree-tos --email admin@vinfastnamthang.vn || echo "⚠️ SSL sẽ cần cài thủ công nếu certbot chưa có"

echo ""
echo "============================================"
echo "🎉 DEPLOY HOÀN TẤT!"
echo "============================================"
echo ""
echo "📌 URLs:"
echo "   Admin:   https://$DOMAIN_ADMIN"
echo "   Landing: https://$DOMAIN_LANDING"
echo ""
echo "📌 Ports nội bộ:"
echo "   Web Admin: $WEB_PORT"
echo "   Landing:   $LANDING_PORT"
echo "   API:       $API_PORT"
echo ""
echo "📌 Đăng nhập:"
echo "   Username: admin"
echo "   Password: Admin@123"
echo ""
echo "📌 Lệnh quản lý:"
echo "   pm2 status          - Xem trạng thái"
echo "   pm2 logs            - Xem logs"
echo "   pm2 restart all     - Restart tất cả"
echo ""
