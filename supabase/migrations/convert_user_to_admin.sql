-- Convert specific user to admin role
-- User ID: 38bd9a90-7380-40b5-a025-8d23f6d0bc69

UPDATE profiles 
SET 
  role = 'admin',
  credit_multiplier = 1.0,
  campaign_limit = 999,
  updated_at = NOW()
WHERE id = '38bd9a90-7380-40b5-a025-8d23f6d0bc69';

-- Verify the update
SELECT 
  id,
  username,
  role,
  credit_multiplier,
  campaign_limit,
  credits,
  updated_at
FROM profiles 
WHERE id = '38bd9a90-7380-40b5-a025-8d23f6d0bc69';
