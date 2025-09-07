# 圖文社區項目資料庫設計

## 概述

基於小石榴風格的圖文社區項目，簡化版資料庫結構設計，包含使用者管理、內容發佈、社交互動等核心功能。

### 字元集和排序規則

- 資料庫字元集：`utf8mb4`
- 排序規則：`utf8mb4_unicode_ci`
- 儲存引擎：`InnoDB`

## 核心資料表結構

### 1. 使用者表 (users)

| 欄位名 | 類型 | 說明 | 備註 |
|--------|------|------|------|
| id | BIGINT | 使用者ID | 主鍵，自增 |
| password | VARCHAR(255) | 密碼 | 可為空 |
| user_id | VARCHAR(50) | 小石榴號 | 唯一標識 |
| nickname | VARCHAR(100) | 暱稱 | 顯示名稱 |
| avatar | VARCHAR(500) | 頭像URL | 使用者頭像 |
| bio | TEXT | 個人簡介 | 使用者介紹 |
| location | VARCHAR(100) | IP屬地 | 地理位置 |
| follow_count | INT | 關注數 | 統計欄位，預設0 |
| fans_count | INT | 粉絲數 | 統計欄位，預設0 |
| like_count | INT | 獲讚數 | 統計欄位，預設0 |
| is_active | TINYINT(1) | 是否啟用 | 預設1 |
| last_login_at | TIMESTAMP | 最後登入時間 | 可為空 |
| created_at | TIMESTAMP | 建立時間 | 註冊時間 |
| updated_at | TIMESTAMP | 更新時間 | 自動更新 |
| gender | VARCHAR(10) | 性別 | 可為空 |
| zodiac_sign | VARCHAR(20) | 星座 | 可為空 |
| mbti | VARCHAR(4) | MBTI人格類型 | 可為空 |
| education | VARCHAR(50) | 學歷 | 可為空 |
| major | VARCHAR(100) | 專業 | 可為空 |
| interests | JSON | 興趣愛好 | JSON陣列，可為空 |

### 2. 筆記表 (posts)

| 欄位名 | 類型 | 說明 | 備註 |
|--------|------|------|------|
| id | BIGINT | 筆記ID | 主鍵，自增 |
| user_id | BIGINT | 發佈使用者ID | 外鍵關聯users |
| title | VARCHAR(200) | 標題 | 筆記標題 |
| content | TEXT | 內容 | 筆記描述 |
| category | VARCHAR(50) | 分類 | 如：穿搭、美食等，可為空 |
| is_draft | TINYINT(1) | 是否為草稿 | 1-草稿，0-已發佈，預設1 |
| view_count | BIGINT | 瀏覽量 | 統計欄位，預設0 |
| like_count | INT | 按讚數 | 統計欄位，預設0 |
| collect_count | INT | 收藏數 | 統計欄位，預設0 |
| comment_count | INT | 評論數 | 統計欄位，預設0 |
| created_at | TIMESTAMP | 發佈時間 | 建立時間 |

### 3. 筆記圖片表 (post_images)

| 欄位名 | 類型 | 說明 | 備註 |
|--------|------|------|------|
| id | BIGINT | 圖片ID | 主鍵，自增 |
| post_id | BIGINT | 筆記ID | 外鍵關聯posts |
| image_url | VARCHAR(500) | 圖片URL | 原圖地址 |

### 4. 標籤表 (tags)

| 欄位名 | 類型 | 說明 | 備註 |
|--------|------|------|------|
| id | INT | 標籤ID | 主鍵，自增 |
| name | VARCHAR(50) | 標籤名 | 標籤內容，唯一 |
| use_count | INT | 使用次數 | 熱度統計，預設0 |
| created_at | TIMESTAMP | 建立時間 | 首次使用時間 |

### 5. 筆記標籤關聯表 (post_tags)

| 欄位名 | 類型 | 說明 | 備註 |
|--------|------|------|------|
| id | BIGINT | 關聯ID | 主鍵，自增 |
| post_id | BIGINT | 筆記ID | 外鍵關聯posts |
| tag_id | INT | 標籤ID | 外鍵關聯tags |
| created_at | TIMESTAMP | 建立時間 | 關聯時間 |

### 6. 關注關係表 (follows)

| 欄位名 | 類型 | 說明 | 備註 |
|--------|------|------|------|
| id | BIGINT | 關注ID | 主鍵，自增 |
| follower_id | BIGINT | 關注者ID | 外鍵關聯users |
| following_id | BIGINT | 被關注者ID | 外鍵關聯users |
| created_at | TIMESTAMP | 關注時間 | 建立時間 |

### 7. 按讚表 (likes)

| 欄位名 | 類型 | 說明 | 備註 |
|--------|------|------|------|
| id | BIGINT | 按讚ID | 主鍵，自增 |
| user_id | BIGINT | 使用者ID | 外鍵關聯users |
| target_type | TINYINT | 目標類型 | 1-筆記, 2-評論 |
| target_id | BIGINT | 目標ID | 筆記或評論ID |
| created_at | TIMESTAMP | 按讚時間 | 建立時間 |

### 8. 收藏表 (collections)

| 欄位名 | 類型 | 說明 | 備註 |
|--------|------|------|------|
| id | BIGINT | 收藏ID | 主鍵，自增 |
| user_id | BIGINT | 使用者ID | 外鍵關聯users |
| post_id | BIGINT | 筆記ID | 外鍵關聯posts |
| created_at | TIMESTAMP | 收藏時間 | 建立時間 |

### 9. 評論表 (comments)

| 欄位名 | 類型 | 說明 | 備註 |
|--------|------|------|------|
| id | BIGINT | 評論ID | 主鍵，自增 |
| post_id | BIGINT | 筆記ID | 外鍵關聯posts |
| user_id | BIGINT | 評論使用者ID | 外鍵關聯users |
| parent_id | BIGINT | 父評論ID | 回覆評論時使用，可為空 |
| content | TEXT | 評論內容 | 評論文字 |
| like_count | INT | 按讚數 | 統計欄位，預設0 |
| created_at | TIMESTAMP | 評論時間 | 建立時間 |

### 10. 通知表 (notifications)

| 欄位名 | 類型 | 說明 | 備註 |
|--------|------|------|------|
| id | BIGINT | 通知ID | 主鍵，自增 |
| user_id | BIGINT | 接收使用者ID | 外鍵關聯users |
| sender_id | BIGINT | 發送使用者ID | 外鍵關聯users |
| type | TINYINT | 通知類型 | 1-按讚, 2-評論, 3-關注 |
| title | VARCHAR(200) | 通知標題 | 通知內容 |
| target_id | BIGINT | 關聯目標ID | 筆記或評論ID，可為空 |
| comment_id | BIGINT | 關聯評論ID | 用於評論和回覆通知，可為空 |
| is_read | TINYINT(1) | 是否已讀 | 預設0 |
| created_at | TIMESTAMP | 通知時間 | 建立時間 |

### 11. 使用者會話表 (user_sessions)

| 欄位名 | 類型 | 說明 | 備註 |
|--------|------|------|------|
| id | BIGINT | 會話ID | 主鍵，自增 |
| user_id | BIGINT | 使用者ID | 外鍵關聯users |
| token | VARCHAR(255) | 存取權杖 | 唯一 |
| refresh_token | VARCHAR(255) | 重新整理權杖 | 可為空 |
| expires_at | TIMESTAMP | 過期時間 | 權杖過期時間 |
| user_agent | TEXT | 使用者代理 | 瀏覽器信息，可為空 |
| is_active | TINYINT(1) | 是否啟用 | 預設1 |
| created_at | TIMESTAMP | 建立時間 | 會話建立時間 |
| updated_at | TIMESTAMP | 更新時間 | 自動更新 |

### 12. 管理員表 (admin)

| 欄位名 | 類型 | 說明 | 備註 |
|--------|------|------|------|
| id | BIGINT | 管理員ID | 主鍵，自增 |
| username | VARCHAR(50) | 管理員使用者名稱 | 唯一 |
| password | VARCHAR(255) | 管理員密碼 | 加密儲存 |
| created_at | TIMESTAMP | 建立時間 | 帳號建立時間 |

---

*最後更新: 2025年1月16日*
*資料庫版本: 1.0.2*