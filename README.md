# No Cap Swim TW

「免泳帽泳池地圖」是台灣不強制配戴泳帽的飯店與泳池公開清單 MVP，讓使用者可以透過清單或地圖快速尋找地點。

目前版本使用本機 TypeScript mock data，所有地點均為清楚標示的「示範資料」，不代表任何真實場館的已驗證規則。

## 技術架構

- React
- TypeScript
- Vite
- MapLibre GL JS
- Lucide Icons
- 一般 CSS

## 開始使用

安裝依賴：

```bash
npm install
```

啟動開發伺服器：

```bash
npm run dev
```

建立 production build：

```bash
npm run build
```

## 專案結構

```text
src/
├── components/   # Header、搜尋、清單、地圖、詳細資料與回報表單
├── data/         # 本機示範資料
├── hooks/        # URL query 與篩選狀態
├── types/        # 地點與狀態型別
├── utils/        # 預留共用資料轉換工具
├── App.tsx
├── index.css
└── main.tsx
```

搜尋、地區與視圖會同步到 URL query，例如 `?view=map&region=north&q=台北`，方便分享目前的篩選結果。

## Roadmap

- Cloudflare Pages 部署
- Cloudflare D1 資料儲存
- 投稿審核流程
- 資料來源驗證與更新紀錄
- MapLibre Marker clustering
- 更完整的地點搜尋與導航體驗

## 資料與地圖提醒

地圖使用 MapLibre 顯示 OpenStreetMap 標準 raster 圖磚，不需 Google API Key。瀏覽器需要網路連線，地圖保留 OpenStreetMap attribution。公開圖磚不提供服務保證；請遵守 https://operations.osmfoundation.org/policies/tiles/ ，不要預抓或大量下載、不要封鎖 Referer，並保留瀏覽器快取。流量成長時應改用適當的圖磚供應商。
