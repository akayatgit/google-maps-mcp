-- Real estate schema: localities + property listings (apartments / houses for sale)
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/wbbxaqmjhuxkfykijigb/sql
-- This migration removes the previous dream-stays tables and replaces them.

DROP VIEW IF EXISTS dream_stays_by_city;
DROP TABLE IF EXISTS dream_stays CASCADE;
DROP TABLE IF EXISTS cities CASCADE;

CREATE TABLE localities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area_name text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  location_hint text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (area_name, city)
);

CREATE TABLE property_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locality_id uuid NOT NULL REFERENCES localities(id) ON DELETE CASCADE,
  title text NOT NULL,
  property_type text NOT NULL CHECK (property_type IN ('apartment', 'house')),
  description text,
  bedrooms integer NOT NULL CHECK (bedrooms >= 0),
  price_inr bigint NOT NULL CHECK (price_inr > 0),
  location_hint text NOT NULL,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_property_listings_locality ON property_listings(locality_id);
CREATE INDEX idx_property_listings_status ON property_listings(status);

-- Dummy localities (Bangalore neighborhoods)
INSERT INTO localities (area_name, city, state, location_hint) VALUES
  ('Whitefield', 'Bangalore', 'Karnataka', 'Whitefield Bengaluru Karnataka India'),
  ('Indiranagar', 'Bangalore', 'Karnataka', 'Indiranagar Bengaluru Karnataka India'),
  ('Koramangala', 'Bangalore', 'Karnataka', 'Koramangala Bengaluru Karnataka India'),
  ('HSR Layout', 'Bangalore', 'Karnataka', 'HSR Layout Bengaluru Karnataka India')
ON CONFLICT (area_name, city) DO NOTHING;

-- Dummy listings: apartments and houses for sale
INSERT INTO property_listings (locality_id, title, property_type, description, bedrooms, price_inr, location_hint, status)
SELECT l.id, v.title, v.property_type, v.description, v.bedrooms, v.price_inr, v.location_hint, v.status
FROM (VALUES
  ('Whitefield', 'Skyline 3BHK Apartment', 'apartment', 'Corner unit, club house, near ITPL. East-facing.', 3, 18500000, 'Skyline apartment Whitefield Bengaluru', 'available'),
  ('Whitefield', 'Garden View 2BHK', 'apartment', 'Gated community, metro connectivity planned.', 2, 11200000, 'Whitefield main road Bengaluru', 'available'),
  ('Indiranagar', '12th Main Independent House', 'house', 'Plot 40x60, borewell, two-car parking.', 4, 42000000, '12th Main Indiranagar Bengaluru', 'available'),
  ('Indiranagar', 'Penthouse Duplex', 'apartment', 'Duplex with terrace, CMH Road proximity.', 4, 65000000, 'CMH Road Indiranagar Bengaluru', 'available'),
  ('Koramangala', 'Block 4 Builder Floor', 'apartment', 'Third floor, natural light, near Forum Mall.', 3, 22500000, 'Koramangala 4th Block Bengaluru', 'available'),
  ('Koramangala', 'Lane 5 Villa', 'house', 'G+1, small garden, quiet lane.', 5, 58000000, 'Koramangala 5th Block Bengaluru', 'reserved'),
  ('HSR Layout', 'Sector 2 2BHK', 'apartment', 'Near BDA complex, schools within 2 km.', 2, 9800000, 'HSR Layout Sector 2 Bengaluru', 'available'),
  ('HSR Layout', 'Corner Plot House', 'house', 'Ready to move, rainwater harvesting.', 3, 31500000, 'HSR Layout Sector 7 Bengaluru', 'sold')
) AS v(area_name, title, property_type, description, bedrooms, price_inr, location_hint, status)
JOIN localities l ON l.area_name = v.area_name AND l.city = 'Bangalore';

CREATE OR REPLACE VIEW listings_by_locality AS
SELECT
  pl.id,
  pl.title,
  pl.property_type,
  pl.description,
  pl.bedrooms,
  pl.price_inr,
  pl.location_hint,
  pl.status,
  l.area_name,
  l.city,
  l.state
FROM property_listings pl
JOIN localities l ON pl.locality_id = l.id
ORDER BY l.city, l.area_name, pl.price_inr;
