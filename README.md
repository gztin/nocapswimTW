# No Cap Swim TW

「免泳帽泳池清單」是台灣不強制配戴泳帽的飯店與泳池公開清單 MVP，讓使用者可以透過搜尋、地區篩選與文字分享快速尋找地點。

目前版本使用 Cloudflare D1 儲存公開地點，收錄可由飯店官方公開規範核對的真實地點；`src/data/locations.ts` 僅供 seed 對照。地點圖片使用 optional `imageUrl`，沒有圖片或圖片失效時會使用本地泳池水面 placeholder。泳帽與泳池開放規則可能因季節、活動或現場管理而變動，前往前請再次向場館確認。

## 技術架構

- React
- TypeScript
- Vite
- Lucide Icons
- 一般 CSS
- Cloudflare Pages Functions
- Cloudflare D1
- Cloudflare Turnstile

## 開始使用

安裝依賴：

```bash
npm install
```

啟動開發伺服器：

```bash
npm run dev
```

`npm run dev` 只啟動 Vite 前端。要連同 Pages Functions 與本機 D1 一起測試，請先準備本機環境變數並執行：

```bash
cp .dev.vars.example .dev.vars
npm run d1:migrate:local
npm run dev:pages
```

完整本機 runtime 預設在 `http://localhost:8788`。`.dev.vars` 已列入 gitignore，請勿提交管理員密碼。

建立 production build：

```bash
npm run build
```

## 專案結構

```text
src/
├── components/   # Header、搜尋、清單、詳細資料與回報表單
├── api/          # 前端 API client
├── data/         # D1 seed 對應的公開資料，不是 production runtime source
├── hooks/        # URL query 與篩選狀態
├── pages/        # 前台與投稿管理後台
├── types/        # 地點與狀態型別
├── utils/        # 預留共用資料轉換工具
├── App.tsx
├── index.css
└── main.tsx

functions/
├── api/          # Locations、投稿與 admin API
└── _lib/         # D1 mapping、validation、Turnstile 與 session

migrations/
├── 0001_initial.sql
├── 0002_seed_locations.sql       # 歷史 migration，保留不改寫
├── 0003_replace_sample_seed_add_phone_and_rate_limit.sql
├── 0004_add_location_image_url.sql
└── 0005_add_location_source_name.sql
```

搜尋與地區篩選會同步到 URL query，例如 `?region=north&q=台北`，方便分享目前的文字清單結果。

## Roadmap

- Cloudflare Pages／D1 投稿審核 MVP（目前版本）
- 更完整的地點搜尋與導航體驗

## D1 與 Cloudflare 設定

第一次建立 Cloudflare D1：

```bash
npx wrangler login
npx wrangler d1 create nocapswimtw
```

將指令輸出的 database ID 填入 `wrangler.toml` 的 `database_id`，再執行 migration：

```bash
npm run d1:migrate:remote
```

Cloudflare Pages 的 Variables／Secrets 需要設定：

- `ADMIN_PASSWORD`：Secret，管理後台密碼，不會進入前端 bundle。
- `TURNSTILE_SECRET_KEY`：Secret，投稿 API 的 server-side Turnstile 驗證金鑰。
- `VITE_TURNSTILE_SITE_KEY`：Build-time variable，前端 Turnstile widget 的 site key。
- `ENVIRONMENT=production`：production 必須設定；沒有 `TURNSTILE_SECRET_KEY` 時投稿會拒絕，不會略過驗證。

`wrangler.toml` 的 `DB` binding 名稱必須維持為 `DB`。若使用 Cloudflare Dashboard 綁定 D1，也請使用相同的 binding name。

`0003_replace_sample_seed_add_phone_and_rate_limit.sql` 會移除原本四筆範例資料，改以附件整理的 35 筆飯店資料作為基礎清單，並新增電話欄位與投稿頻率限制表。`0004_add_location_image_url.sql` 新增 nullable 的 `image_url` 欄位；`0005_add_location_source_name.sql` 將目前 35 筆資料的來源名稱補為「熱血史丹利大叔應援團」。兩個 migration 都不會要求既有資料填入圖片。`0002_seed_locations.sql` 是已存在的歷史 migration，不直接改寫；新資料庫依序套用後，最終資料仍是 35 筆。前台 production 只讀 `/api/locations`，不會直接載入 `src/data/locations.ts`，也不會載入前端假資料。

部署 Pages：

```bash
npm run deploy
```

實際 production 部署前，需先在自己的 Cloudflare 帳號完成 Pages 專案、D1 database ID 與上述 Secrets 設定。

## API 與管理後台

公開 API：

- `GET /api/locations`
- `POST /api/submissions`
- `POST /api/submissions/bulk`

`GET /api/locations` 回傳的地點可包含 `imageUrl` 與 `sourceName`；兩者皆可為空，前端會在沒有圖片或圖片載入失敗時使用 `public/images/pool-placeholder.webp`。投稿流程目前不開放圖片上傳。

管理 API 需要 admin cookie：

- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/submissions`
- `POST /api/admin/submissions/:id/approve`
- `POST /api/admin/submissions/:id/reject`

管理者由 `/admin` 進入；未登入會導向 `/admin/login`。核准新增地點時可在詳情頁補上 latitude／longitude，核准既有地點則更新對應 location，不會建立重複資料。

投稿流程會在 server side 驗證欄位、長度、網址、Email、投稿類型與 Turnstile token；新增地點也會做 normalize 後的名稱／地址相似檢查。所有新投稿一律由 server 強制寫成 `pending`。批次投稿最多 50 筆、request body 最多 2 MiB；單筆投稿 request body 最多 32 KiB。瀏覽器端的 CSV／JSON 檔案最多 1 MiB，且每個 IP 每小時最多 5 次投稿請求。production 需要有效的 Turnstile token。

### CSV／JSON 批次投稿格式

前台「回報地點」提供「上傳 CSV／JSON」方式。JSON 可使用資料陣列，或使用 `{ "schema_version": 1, "locations": [...] }` 外層格式；CSV 第一列必須是欄位名稱。

必要欄位為 `name`、`address`、`region`。可選欄位為 `city`、`district`、`phone`、`latitude`、`longitude`、`capPolicy`、`restrictions`、`sourceType`、`sourceUrl`、`notes`。附件使用的 `swim_cap_policy`、`source_type`、`website` 欄位也會自動轉換。檔案資料會先在瀏覽器解析並顯示逐列格式檢查結果，通過後才送到批次投稿 API。

## 資料與導航提醒

網站以文字清單呈現地點資訊；詳細資料頁仍提供 Google Maps 導航外連，地址與泳帽規則請在前往前再次確認。
