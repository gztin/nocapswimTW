ALTER TABLE locations ADD COLUMN official_url TEXT;
ALTER TABLE submissions ADD COLUMN official_url TEXT;

-- Existing public rows used source_url for the hotel's official website.
-- Preserve that URL in its new field before replacing the source URL with the
-- original post for the known community-sourced dataset.
UPDATE locations
SET official_url = source_url
WHERE source_url IS NOT NULL;

UPDATE locations
SET source_url = 'https://www.facebook.com/share/p/1F9RNSgNU1/'
WHERE source_name = '熱血史丹利大叔應援團';
