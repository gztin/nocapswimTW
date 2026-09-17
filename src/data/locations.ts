import type { PoolLocation } from '../types/location'

/**
 * 初始公開名單整理自 Facebook 投稿（2024-07-24）。
 * 這些資料尚未逐筆向場館核對，前往前請再次確認泳帽與泳池規則。
 * 此檔案與 migrations/0003_replace_sample_seed_add_phone_and_rate_limit.sql 對照。
 */
export const locations: PoolLocation[] = [
  {
    id: 'mandarin-oriental-taipei', name: '台北文華東方酒店', city: '台北市', district: '松山區', region: 'north',
    address: '台北市松山區敦化北路158號', phone: '+886-2-2715-6888', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://www.mandarinoriental.com/zh-hk/taipei/songshan',
  },
  {
    id: 'w-taipei', name: 'W Taipei 台北W飯店', city: '台北市', district: '信義區', region: 'north',
    address: '台北市信義區忠孝東路五段10號', phone: '+886-2-7703-8888', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://www.marriott.com/en-us/hotels/tpewh-w-taipei/overview/',
    notes: '原文寫作「台北W HOTEEL」。',
  },
  {
    id: 'grand-hotel-taipei', name: '台北圓山大飯店', city: '台北市', district: '中山區', region: 'north',
    address: '台北市中山區中山北路四段1號', phone: '+886-2-2886-8888', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://www.grand-hotel.org/',
  },
  {
    id: 'grand-hyatt-taipei', name: '台北君悅酒店', city: '台北市', district: '信義區', region: 'north',
    address: '台北市信義區松壽路2號', phone: '+886-2-2720-1234', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://www.hyatt.com/grand-hyatt/en-US/taigh-grand-hyatt-taipei',
  },
  {
    id: 'regent-taipei', name: '台北晶華酒店', city: '台北市', district: '中山區', region: 'north',
    address: '台北市中山區中山北路二段39巷3號', phone: '+886-2-2523-8000', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://www.regenttaiwan.com/',
  },
  {
    id: 'shangri-la-taipei', name: '台北香格里拉遠東國際大飯店', city: '台北市', district: '大安區', region: 'north',
    address: '台北市大安區敦化南路二段201號', phone: '+886-2-2378-8888', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://www.shangri-la.com/taipei/fareasternplazashangrila/',
  },
  {
    id: 'taipei-marriott', name: '台北萬豪酒店', city: '台北市', district: '中山區', region: 'north',
    address: '台北市中山區樂群二路199號', phone: '+886-2-8502-9999', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://www.marriott.com/en-us/hotels/tpetm-taipei-marriott-hotel/overview/',
  },
  {
    id: 'sheraton-grand-taipei', name: '台北喜來登大飯店', city: '台北市', district: '中正區', region: 'north',
    address: '台北市中正區忠孝東路一段12號', phone: '+886-2-2321-5511', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://sheraton.mhh-group.com/',
  },
  {
    id: 'humble-house-taipei', name: '台北寒舍艾麗酒店', city: '台北市', district: '信義區', region: 'north',
    address: '台北市信義區松高路18號', phone: '+886-2-6631-8000', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://www.hilton.com/zh-hant/hotels/tsaqqqq-humble-house-taipei/',
    notes: '目前官方名稱為「台北艾麗酒店，希爾頓格芮精選酒店」。',
  },
  {
    id: 'hexa-yangmingshan', name: '雀客藏居台北陽明山溫泉飯店', city: '台北市', district: '士林區', region: 'north',
    address: '台北市士林區格致路237號', phone: '+886-2-2861-6661', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://yangmingshan.hexa.tw/',
  },
  {
    id: 'grand-hilai-taipei', name: '台北漢來大飯店', city: '台北市', district: '南港區', region: 'north',
    address: '台北市南港區經貿一路168號', phone: '+886-2-2788-6868', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://taipei.grand-hilai.com.tw/',
    notes: '原文列入名單；留言再次提到完全不用戴泳帽。',
  },
  {
    id: 'caesar-park-banqiao', name: '板橋凱撒大飯店', city: '新北市', district: '板橋區', region: 'north',
    address: '新北市板橋區縣民大道二段8號', phone: '+886-2-8953-8999', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://www.caesarpark.com.tw/location-detail/caesar-park-banqiao/',
  },
  {
    id: 'hilton-taipei-sinban', name: '台北新板希爾頓酒店', city: '新北市', district: '板橋區', region: 'north',
    address: '新北市板橋區民權路88號', phone: '+886-2-2958-3000', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://www.hilton.com/en/hotels/tsatchi-hilton-taipei-sinban/',
  },
  {
    id: 'four-points-linkou', name: '林口福朋喜來登酒店', city: '新北市', district: '林口區', region: 'north',
    address: '新北市林口區文化三路一段1號', phone: '+886-2-7727-6988', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://www.marriott.com/en-us/hotels/tpelf-four-points-linkou/overview/',
  },
  {
    id: 'fullon-hotel-fulong', name: '福隆福容大飯店', city: '新北市', district: '貢寮區', region: 'north',
    address: '新北市貢寮區福隆里福隆街41號', phone: '+886-2-2499-1188', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://www.fullon-hotels.com.tw/fl/',
  },
  {
    id: 'westin-tashee-resort', name: '桃園大溪笠復威斯汀度假酒店', city: '桃園市', district: '大溪區', region: 'north',
    address: '桃園市大溪區日新路166號', phone: '+886-3-272-5777', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://www.marriott.com/en-us/hotels/tpetw-the-westin-tashee-resort-taoyuan/overview/',
  },
  {
    id: 'hoshinoya-guguan', name: '虹夕諾雅 谷關', city: '台中市', district: '和平區', region: 'central',
    address: '台中市和平區博愛里東關路一段溫泉巷16號', phone: '+886-4-2595-0008', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://hoshinoresorts.com/zh_tw/hotels/hoshinoyaguguan/',
  },
  {
    id: 'the-lin-hotel', name: '台中林酒店', city: '台中市', district: '西屯區', region: 'central',
    address: '台中市西屯區朝富路99號', phone: '+886-4-2255-5555', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://www.thelin.com.tw/',
  },
  {
    id: 'le-meridien-taichung', name: '台中李方艾美酒店', city: '台中市', district: '中區', region: 'central',
    address: '台中市中區建國路111號', phone: '+886-4-2224-0888', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://www.lemeridien-taichung.com.tw/',
    notes: '原文列入名單；留言再次提到不用戴泳帽。',
  },
  {
    id: 'the-bale-villas-puli', name: "The Bal'e Villas 牛眠 埔里", city: '南投縣', district: '埔里鎮', region: 'central',
    address: '南投縣埔里鎮牛眠里內埔路18-5號', phone: '+886-49-299-0999', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://the-bal-e-villas.mydirectstay.com/tw/index.html',
  },
  {
    id: 'wyndham-sun-moon-lake', name: '日月潭力麗溫德姆溫泉酒店', city: '南投縣', district: '魚池鄉', region: 'central',
    address: '南投縣魚池鄉中正路312號', phone: '+886-49-285-0085', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://wyndhamsunmoonlake.com/',
    notes: '原文列入名單；留言再次提到不用戴泳帽。',
  },
  {
    id: 'hotel-indigo-alishan', name: '阿里山英迪格酒店', city: '嘉義縣', district: '番路鄉', region: 'south',
    address: '嘉義縣番路鄉公田村龍頭20號', phone: '+886-5-258-6800', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://www.ihg.com/hotelindigo/hotels/tw/zh/chiayi-county/cyigo/hoteldetail',
    notes: '原文列入名單；留言再次提到不用戴泳帽。',
  },
  {
    id: 'just-sleep-hushan', name: '捷絲旅 台南虎山館', city: '台南市', district: '仁德區', region: 'south',
    address: '台南市仁德區文華路二段300號', phone: '+886-6-266-0568', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://www.justsleephotels.com/hushan/tw',
    notes: '原文寫作「台南捷絲旅十鼓館」；官方名稱為「捷絲旅 台南虎山館」。',
  },
  {
    id: 'silks-club-kaohsiung', name: '晶英國際行館 Silks Club', city: '高雄市', district: '前鎮區', region: 'south',
    address: '高雄市前鎮區中山二路199號', phone: '+886-7-973-0189', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://www.silks-club.com/zh-tw',
  },
  {
    id: 'h2o-hotel-kaohsiung', name: 'H2O Hotel 水京棧國際酒店', city: '高雄市', district: '鼓山區', region: 'south',
    address: '高雄市鼓山區明華路366號', phone: '+886-7-553-7001', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://www.h2ohotel.com.tw/zh-tw',
  },
  {
    id: 'grand-hotel-kaohsiung', name: '高雄圓山大飯店', city: '高雄市', district: '鳥松區', region: 'south',
    address: '高雄市鳥松區圓山路2號', phone: '+886-7-370-5911', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://www.grand-hotel.org/TW/official/main.aspx?gh=kh',
  },
  {
    id: 'tai-urban-resort', name: '承億酒店', city: '高雄市', district: '前鎮區', region: 'south',
    address: '高雄市前鎮區林森四路189號', phone: '+886-7-333-3999', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://www.taiurbanresort.com.tw/',
    notes: '原文列入名單；留言再次提到不用戴泳帽。',
  },
  {
    id: 'caesar-park-kenting', name: '墾丁凱撒大飯店', city: '屏東縣', district: '恆春鎮', region: 'south',
    address: '屏東縣恆春鎮墾丁路6號', phone: '+886-8-886-1888', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://kenting.caesarpark.com.tw/',
    notes: '原文寫作「墾丁凱薩飯店」。',
  },
  {
    id: 'westin-yilan', name: '宜蘭力麗威斯汀度假酒店', city: '宜蘭縣', district: '員山鄉', region: 'east',
    address: '宜蘭縣員山鄉永同路三段268號', phone: '+886-3-923-2111', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://www.westin-yilan.com.tw/',
  },
  {
    id: 'dws-resort-yilan', name: '宜蘭綠舞國際觀光飯店', city: '宜蘭縣', district: '五結鄉', region: 'east',
    address: '宜蘭縣五結鄉五濱路二段459號', phone: '+886-3-960-3808', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://www.dwsresort.com.tw/',
  },
  {
    id: 'archipelago-yilan', name: '宜蘭凱渡廣場酒店', city: '宜蘭縣', district: '頭城鎮', region: 'east',
    address: '宜蘭縣頭城鎮烏石港路300號', phone: '+886-3-977-1166', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://www.archipelago.com.tw/',
    notes: '原文列入名單；留言再次提到不用戴泳帽。',
  },
  {
    id: 'silks-place-taroko', name: '太魯閣晶英酒店', city: '花蓮縣', district: '秀林鄉', region: 'east',
    address: '花蓮縣秀林鄉天祥路18號', phone: '+886-3-869-1155', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://taroko.silksplace.com/tw/',
  },
  {
    id: 'kadda-hotel', name: 'Kadda Hotel 璽賓行旅', city: '花蓮縣', district: '花蓮市', region: 'east',
    address: '花蓮縣花蓮市民權路2-6號', phone: '+886-3-831-6631', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://www.kaddahotel.com/zh-tw',
  },
  {
    id: 'discovery-hotel-penghu', name: '澎澄飯店 Discovery Hotel', city: '澎湖縣', district: '馬公市', region: 'islands',
    address: '澎湖縣馬公市光復里同和路168號', phone: '+886-6-923-5678', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://www.discoveryhotel.com.tw/',
  },
  {
    id: 'four-points-penghu', name: '澎湖福朋喜來登酒店', city: '澎湖縣', district: '馬公市', region: 'islands',
    address: '澎湖縣馬公市新店路197號', phone: '+886-6-926-6288', latitude: null, longitude: null,
    capPolicy: 'not-required', sourceType: 'community', sourceUrl: 'https://www.fourpoints-penghu.com/',
  },
]
