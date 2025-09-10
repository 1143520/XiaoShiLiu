# 部署指南

本文檔詳細介紹了小石榴圖文社區項目的部署流程和配置說明。

## 部署方式

項目支援兩種部署方式：

1. **Docker 一鍵部署**（推薦）- 簡單快速，適合生產環境
2. **傳統部署** - 手動配置，適合開發環境

---

## 🐳 Docker 一鍵部署（推薦）

### 環境要求

- Docker >= 20.0
- Docker Compose >= 2.0
- 可用記憶體 >= 2GB
- 可用磁碟空間 >= 5GB

### 映像與版本說明

| 元件 | 映像/來源 | 版本/標籤 | 說明 |
|------|-----------|-----------|------|
| 資料庫 | mysql | 8.0 | 使用官方映像 `mysql:8.0`，utf8mb4 預設配置 |
| 後端執行時 | node | 18-alpine | `express-project/Dockerfile` 採用 `node:18-alpine` |
| 前端建置 | node | 18-alpine | `vue3-project/Dockerfile` 建置階段使用 |
| 前端執行時 | nginx | alpine | 使用 `nginx:alpine` 提供靜態文件 |
| Compose 健康檢查 | wget | - | 前端健康檢查使用 `wget --spider http://localhost/` |

> 說明：上述版本與 `docker-compose.yml`、前後端 `Dockerfile` 保持一致；如需變更請同步調整對應文件與文檔。

### 快速開始

#### 1. 複製項目

```bash
git clone https://github.com/ZTMYO/XiaoShiLiu.git
cd XiaoShiLiu
```

#### 2. 配置環境變數（可選）

```bash
# 可選：如果你有自訂環境變數，可以建立 .env 文件
# 本儲存庫未提供 .env.docker，若無特殊需求可直接跳過，使用 docker-compose.yml 中的預設值即可
```

#### 3. 一鍵啟動

**Windows 使用者：**
```powershell
# 啟動服務
.\deploy.ps1

# 重新建置並啟動
.\deploy.ps1 -Build

# 啟動並灌裝範例資料（可選）
.\deploy.ps1 -Build -Seed
# 或服務已啟動後單獨灌裝
.\deploy.ps1 -Seed

# 查看服務狀態
.\deploy.ps1 -Status

# 查看日誌
.\deploy.ps1 -Logs

# 停止服務
.\deploy.ps1 -Stop
```

**Linux/macOS 使用者：**
```bash
# 給腳本執行權限
chmod +x deploy.sh

# 啟動服務
./deploy.sh

# 重新建置並啟動
./deploy.sh --build

# 查看服務狀態
./deploy.sh --status

# 查看日誌
./deploy.sh --logs

# 停止服務
./deploy.sh --stop
```

#### 4. 存取應用程式

服務啟動成功後，可以透過以下地址存取：

| 服務 | 地址 | 說明 |
|------|------|------|
| 前端界面 | http://localhost | 主要存取入口 |
| 後端API | http://localhost:3001 | API接口 |
| 資料庫 | localhost:3306 | MySQL資料庫 |

### Docker 部署架構

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │     MySQL       │
│   (Nginx)       │◄───┤   (Express)     │◄───┤   (Database)    │
│   Port: 80      │    │   Port: 3001    │    │   Port: 3306    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 環境變數配置

項目使用 `.env` 文件進行配置，主要配置項：

```env
# 資料庫配置
DB_HOST=mysql
DB_USER=xiaoshiliu_user
DB_PASSWORD=123456
DB_NAME=xiaoshiliu

# JWT配置
JWT_SECRET=xiaoshiliu_secret_key_2025_docker
JWT_EXPIRES_IN=7d

# 上傳配置
UPLOAD_MAX_SIZE=50mb
# 圖片上傳策略 (local: 本地儲存, imagehost: 第三方圖床)
UPLOAD_STRATEGY=imagehost

# 本地儲存配置
LOCAL_UPLOAD_DIR=uploads
LOCAL_BASE_URL=http://localhost:3001

# 第三方圖床配置
IMAGEHOST_API_URL=https://api.xinyew.cn/api/jdtc
IMAGEHOST_TIMEOUT=60000

# API配置
API_BASE_URL=http://localhost:3001
```

### 常用指令

```bash
# 查看服務狀態
docker-compose ps

# 查看服務日誌
docker-compose logs -f

# 重啟特定服務
docker-compose restart backend

# 進入容器（alpine 映像通常沒有 bash，請使用 sh）
docker-compose exec backend sh
# 或進入 MySQL 客戶端
docker-compose exec mysql mysql -u root -p

# 備份資料庫
docker-compose exec mysql mysqldump -u root -p xiaoshiliu > backup.sql

# 恢復資料庫
docker-compose exec -T mysql mysql -u root -p xiaoshiliu < backup.sql
```

### 資料持久化

Docker 部署使用資料卷進行資料持久化：

- `mysql_data`: MySQL 資料庫文件
- `backend_uploads`: 後端上傳文件

### 故障排除

#### 1. 連接埠衝突

如果遇到連接埠衝突，可以修改 `docker-compose.yml` 中的連接埠對應：

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # 修改前端連接埠
  backend:
    ports:
      - "3002:3001"  # 修改後端連接埠
```

#### 2. 記憶體不足

確保系統有足夠的記憶體，可以透過以下指令查看資源使用：

```bash
docker stats
```

#### 3. 資料庫連接失敗 / 灌裝資料

- 檢查資料庫服務是否正常啟動：

```bash
docker-compose logs mysql
```

- 灌裝範例資料（Windows）：
```powershell
.\deploy.ps1 -Seed
```

- 灌裝範例資料（手動執行）：
```bash
docker-compose exec -T backend node scripts/generate-data.js
```

#### 4. 檔案上傳權限問題

**問題現象**：
- 前端上傳檔案時返回400錯誤
- 後端日誌顯示：`EACCES: permission denied, open '/app/uploads/xxx.png'`

**原因分析**：
Docker容器內uploads目錄權限問題，目錄屬於root使用者，但應用程式執行在nodejs使用者下。

**解決方案**：

1. **檢查uploads目錄權限**：
```bash
docker-compose exec backend ls -la /app/uploads
```

2. **修復權限問題**：
```bash
# 使用root使用者修改目錄所有者
docker-compose exec --user root backend chown -R nodejs:nodejs /app/uploads
```

3. **驗證權限修復**：
```bash
# 確認目錄現在屬於nodejs使用者
docker-compose exec backend ls -la /app/uploads
```

**預防措施**：
- 確保Dockerfile中正確設定了uploads目錄權限
- 在容器啟動時自動修復權限問題

#### 5. 上傳策略配置

專案支援兩種檔案上傳策略：

**本地儲存模式**（推薦用於開發和小型部署）：
```yaml
# 在docker-compose.yml中設定
environment:
  UPLOAD_STRATEGY: local
```

**第三方圖床模式**（推薦用於生產環境）：
```yaml
# 在docker-compose.yml中設定
environment:
  UPLOAD_STRATEGY: imagehost
```

#### 6. 清理和重設

如果遇到問題需要重新開始：

```bash
# Windows
.\deploy.ps1 -Clean

# Linux/macOS
./deploy.sh --clean
```

---

## 📋 傳統部署方式

## 環境要求

| 元件 | 版本要求 | 說明 |
|------|----------|------|
| Node.js | >= 16.0.0 | 執行環境 |
| MySQL | >= 5.7 | 資料庫 |
| MariaDB | >= 10.3 | 資料庫（可選） |
| npm | >= 8.0.0 | 套件管理器 |
| yarn | >= 1.22.0 | 套件管理器（可選） |
| 瀏覽器 | 支援ES6+ | 現代瀏覽器 |

## 快速開始

### 1. 安裝相依性

```bash
# 使用 cnpm
cnpm install
# 或使用 yarn
yarn install
```

### 2. 配置後端API地址

建立環境配置文件（可選）：

```bash
# 複製環境配置範本
cp .env.example .env
```

編輯 `.env` 文件，配置後端API地址：

```env
# 後端API地址
VITE_API_BASE_URL=http://localhost:3001

# 其他配置...
```

### 3. 啟動開發伺服器

```bash
# 啟動開發伺服器
npm run dev

# 或使用 yarn
yarn dev
```

開發伺服器將在 `http://localhost:5173` 啟動

### 4. 建置生產版本

```bash
# 建置生產版本
npm run build

# 預覽生產版本
npm run preview
```

## 後端服務配置

⚠️ **重要提醒**：前端項目需要配合後端服務使用

1. **啟動後端服務**：
   ```bash
   # 進入後端項目目錄
   cd ../express-project
   
   # 安裝後端相依性
   npm install
   
   # 啟動後端服務
   npm start
   ```

2. **後端服務地址**：`http://localhost:3001`

3. **API文檔**：查看後端項目的 `API_DOCS.md` 文件

## 開發環境配置

### 環境檢查

```bash
# 檢查Node.js版本
node --version

# 檢查npm版本
npm --version
```

### 開發伺服器

```bash
# 啟動開發伺服器（熱重載）
npm run dev

# 存取地址：http://localhost:5173
```

### 程式碼規範

- 使用 Vue 3 Composition API
- 遵循 Vue.js 官方風格指南
- 元件命名採用 PascalCase
- 文件命名採用 kebab-case

## 配置文件說明

### 前端配置文件（vue3-project目錄）

| 文件 | 說明 |
|------|------|
| `.env` | 環境變數配置文件 |
| `vite.config.js` | Vite建置工具配置 |
| `package.json` | 項目相依性和腳本配置 |
| `jsconfig.json` | JavaScript項目配置 |

### 後端配置文件（express-project目錄）

| 文件 | 說明 |
|------|------|
| `config/config.js` | 主配置文件 |
| `.env` | 環境變數配置文件 |
| `database_design.md` | 資料庫設計文檔 |
| `scripts/init-database.js` | 資料庫初始化腳本 |
| `generate-data.js` | 測試資料產生腳本 |

## npm腳本指令

### 前端腳本（在vue3-project目錄下執行）

| 指令 | 說明 |
|------|------|
| `npm run dev` | 啟動開發伺服器 |
| `npm run build` | 建置生產版本 |
| `npm run preview` | 預覽生產版本 |

### 後端腳本（在express-project目錄下執行）

| 指令 | 說明 |
|------|------|
| `npm start` | 啟動伺服器 |
| `npm run dev` | 啟動開發伺服器（熱重載） |
| `npm run init-db` | 初始化資料庫 |
| `npm run generate-data` | 產生測試資料 |

## 環境變數配置

### 前端環境變數（vue3-project/.env）

```env
# API伺服器地址
VITE_API_BASE_URL=http://localhost:3001/api

# 其他前端配置
VITE_APP_TITLE=小石榴圖文社區
VITE_USE_REAL_API=true
```

### 後端環境變數（express-project/.env）

```env
# 伺服器配置
NODE_ENV=development
PORT=3001

# JWT配置
JWT_SECRET=xiaoshiliu_secret_key_2025
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# 資料庫配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123456
DB_NAME=xiaoshiliu
DB_PORT=3306

# API配置
API_BASE_URL=http://localhost:3001

# 上傳配置
UPLOAD_MAX_SIZE=50mb
```

## 資料庫腳本說明

項目的資料庫相關腳本都統一放在 `express-project/scripts/` 目錄下，方便管理和使用：

### 腳本文件介紹

#### 1. 資料庫初始化腳本
- **文件位置**：`scripts/init-database.js`
- **功能**：建立資料庫和所有資料表結構
- **使用方法**：
  ```bash
  cd express-project
  node scripts/init-database.js
  ```
- **說明**：首次部署時必須執行，會自動建立 `xiaoshiliu` 資料庫和12個資料表

#### 2. 測試資料產生腳本
- **文件位置**：`scripts/generate-data.js`
- **功能**：產生模擬的使用者、貼文、評論等測試資料
- **使用方法**：
  ```bash
  cd express-project
  node scripts/generate-data.js
  ```
- **說明**：可選執行，用於快速填充測試資料，包含50個使用者、200個貼文、800條評論等

#### 3. SQL初始化文件
- **文件位置**：`scripts/init-database.sql`
- **功能**：純SQL版本的資料庫初始化腳本
- **使用方法**：可直接在MySQL客戶端中執行
- **說明**：與 `init-database.js` 功能相同，提供SQL版本供參考

#### 4. 範例圖片更新腳本
- **文件位置**：`scripts/update-sample-images.js`
- **功能**：自動獲取最新圖片連結並更新資料庫中的範例圖片
- **使用方法**：
  ```bash
  cd express-project
  node scripts/update-sample-images.js
  ```
- **說明**：
  - 自動從栗次元API獲取最新的圖片連結
  - 更新 `imgLinks/avatar_link.txt`（50個頭像連結）
  - 更新 `imgLinks/post_img_link.txt`（300個貼文圖片連結）
  - 批次更新資料庫中的使用者頭像和貼文圖片
  - 支援統計顯示更新前後的圖片數量

## 開發環境啟動流程

### 1. 啟動後端服務

```bash
# 開啟第一個終端，進入後端目錄
cd express-project

# 安裝後端相依性（首次執行）
npm install

# 配置資料庫（首次執行）
# 編輯 config/config.js 或 .env 文件

# 初始化資料庫（首次執行）
node scripts/init-database.js

# 產生測試資料（可選）
node scripts/generate-data.js

# 啟動後端服務
npm start
# 後端服務執行在 http://localhost:3001
```

### 2. 啟動前端服務

```bash
# 開啟第二個終端，進入前端目錄
cd vue3-project

# 安裝前端相依性（首次執行）
npm install

# 配置API地址（可選）
# 編輯 .env 文件，設定 VITE_API_BASE_URL

# 啟動前端開發伺服器
npm run dev
# 前端服務執行在 http://localhost:5173
```

### 3. 存取應用程式

| 服務 | 地址 |
|------|------|
| 前端界面 | http://localhost:5173 |
| 後端API | http://localhost:3001 |

---

*最後更新: 2025年1月16日*
*部署指南版本: 1.0.3*