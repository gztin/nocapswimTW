ALTER TABLE locations ADD COLUMN source_name TEXT;

UPDATE locations
SET source_name = '熱血史丹利大叔應援團'
WHERE id IN (
  'mandarin-oriental-taipei', 'w-taipei', 'grand-hotel-taipei', 'grand-hyatt-taipei',
  'regent-taipei', 'shangri-la-taipei', 'taipei-marriott', 'sheraton-grand-taipei',
  'humble-house-taipei', 'hexa-yangmingshan', 'grand-hilai-taipei', 'caesar-park-banqiao',
  'hilton-taipei-sinban', 'four-points-linkou', 'fullon-hotel-fulong', 'westin-tashee-resort',
  'hoshinoya-guguan', 'the-lin-hotel', 'le-meridien-taichung', 'the-bale-villas-puli',
  'wyndham-sun-moon-lake', 'hotel-indigo-alishan', 'just-sleep-hushan', 'silks-club-kaohsiung',
  'h2o-hotel-kaohsiung', 'grand-hotel-kaohsiung', 'tai-urban-resort', 'caesar-park-kenting',
  'westin-yilan', 'dws-resort-yilan', 'archipelago-yilan', 'silks-place-taroko',
  'kadda-hotel', 'discovery-hotel-penghu', 'four-points-penghu'
);
