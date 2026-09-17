INSERT OR IGNORE INTO locations (
  id, name, city, district, region, address, latitude, longitude, cap_policy,
  restrictions, source_type, source_url, last_verified, notes, created_at, updated_at
) VALUES
  ('westin-tashee-resort', '桃園大溪笠復威斯汀度假酒店', '桃園市', '大溪區', 'north', '桃園市大溪區日新路 166 號', 24.882119, 121.326594, 'not-required', '["女生及孩童需穿泳衣","男生需穿泳褲"]', 'official', 'https://www.lifutashee.com.tw/faq/', '2026-09', '飯店官方 FAQ 說明，使用室內及室外泳池時泳帽無特別規定；泳池開放與現場管理仍以當日公告為準。', '2026-09-17T00:00:00.000Z', '2026-09-17T00:00:00.000Z'),
  ('caesar-park-kenting', '墾丁凱撒大飯店', '屏東縣', '恆春鎮', 'south', '屏東縣恆春鎮墾丁路 6 號', 21.942364, 120.805238, 'not-required', '["需穿著合適泳衣泳褲","未滿 12 歲或身高未滿 130 公分需成人陪同"]', 'official', 'https://kenting.caesarpark.com.tw/service-detail/scenic-swimming-pool/', '2026-09', '飯店官方泳池使用須知說明泳帽無特別規定；泳池遇雷雨或天候不佳時可能暫停開放。', '2026-09-17T00:00:00.000Z', '2026-09-17T00:00:00.000Z'),
  ('h-resort-kenting', '墾丁 H 會館', '屏東縣', '獅子鄉', 'south', '屏東縣獅子鄉竹坑村竹坑巷 60 號', 22.167008, 120.697023, 'conditional', '["頭部入水需配戴泳帽","需穿著泳裝、泳褲","10 歲以下兒童需成人陪同"]', 'official', 'https://h-resort.com/tw/about/facility/Infinity%20Pool', '2026-09', '飯店官方泳池規範說明，頭部不入水時可不戴泳帽；如頭部會下水，需配戴泳帽。', '2026-09-17T00:00:00.000Z', '2026-09-17T00:00:00.000Z'),
  ('fullon-hotel-fulong', '福容大飯店福隆', '新北市', '貢寮區', 'north', '新北市貢寮區福隆里福隆街 41 號', 25.018914, 121.942994, 'conditional', '["兒童池不需戴泳帽","僅供房客使用","成人池請依現場公告"]', 'official', 'https://www.fullon-hotels.com.tw/fl/tw/fac-detail/Swimmingpool/', '2026-09', '飯店官方泳池規範明載兒童池不需戴泳帽；成人池及其他泳池規則請依現場公告確認。', '2026-09-17T00:00:00.000Z', '2026-09-17T00:00:00.000Z');
