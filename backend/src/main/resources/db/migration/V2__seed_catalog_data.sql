-- ====================================================================
-- ShopStream V2 Seed Data: Categories, Products, and Images
-- ====================================================================

-- 1. Insert Categories
INSERT INTO categories (id, name, slug, description, icon_name) VALUES
(1, 'Electronics', 'electronics', 'High-performance gadgets, computing devices, and accessories', 'Cpu'),
(2, 'Audio & Sound', 'audio-sound', 'Premium noise-canceling headphones, true wireless earbuds, and studio speakers', 'Headphones'),
(3, 'Wearables & Smartwatches', 'wearables', 'Next-gen fitness trackers, GPS multisport watches, and smart bands', 'Watch'),
(4, 'Apparel & Footwear', 'apparel-footwear', 'Performance athletic wear, all-weather jackets, and trail running shoes', 'Shirt'),
(5, 'Home & Smart Living', 'home-smart-living', 'Smart home automation, air purifiers, and barista-grade espresso equipment', 'Home')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Products
INSERT INTO products (id, sku, title, slug, description, category_id, brand, base_price, sale_price, stock_quantity, rating, review_count, is_active, is_featured, tags, attributes) VALUES
-- Audio
(1, 'AUD-APM-01', 'AeroPulse Max Wireless Noise-Cancelling Headphones', 'aeropulse-max-wireless-headphones', 'Engineered with hybrid active noise cancellation, 40mm graphene drivers, spatial audio, and an ultra-lightweight titanium headband. Delivers up to 45 hours of playtime on a single USB-C charge.', 2, 'SoundFlow', 199.99, 169.99, 45, 4.85, 230, TRUE, TRUE, 'wireless,headphones,noise-cancelling,bluetooth,over-ear,black', '{"color": "Midnight Black", "battery_life": "45h", "connectivity": "Bluetooth 5.3", "weight": "240g"}'),
(2, 'AUD-SNB-02', 'SonicBuds Pro Active ANC Earbuds', 'sonicbuds-pro-active-anc-earbuds', 'True wireless earbuds with adaptive transparency mode, triple beamforming microphones, and IPX7 waterproof rating ideal for intense gym workouts and marathon running.', 2, 'SoundFlow', 119.99, 89.99, 80, 4.70, 154, TRUE, FALSE, 'wireless,earbuds,waterproof,noise-cancelling,gym,running', '{"color": "Arctic White", "battery_life": "32h with case", "waterproof_rating": "IPX7"}'),
(3, 'AUD-BSB-03', 'BassPulse 360 Portable Waterproof Bluetooth Speaker', 'basspulse-360-portable-speaker', 'Rugged outdoor bluetooth speaker featuring dual passive radiators, 360-degree sound projection, floating waterproof chassis, and 24-hour battery endurance.', 2, 'PulseAudio', 79.99, 64.99, 60, 4.65, 89, TRUE, FALSE, 'speaker,bluetooth,waterproof,outdoor,portable', '{"color": "Forest Green", "power_output": "30W", "battery_life": "24h"}'),

-- Electronics / Computing
(4, 'ELE-MBX-04', 'ApexBook Pro 16 Ultra Laptop', 'apexbook-pro-16-ultra-laptop', 'Powered by a 12-core silicon processor, 32GB unified memory, 1TB NVMe Gen4 SSD, and a stunning 120Hz Liquid Retina display. Built for software engineers and creative professionals.', 1, 'ApexTech', 1899.99, 1749.99, 25, 4.92, 78, TRUE, TRUE, 'laptop,computer,pro,intel,mac,16-inch', '{"screen_size": "16 inch", "ram": "32GB", "storage": "1TB", "processor": "Octa-Core M-Silicon"}'),
(5, 'ELE-GMC-05', 'QuantumGlide Ultra-Light Wireless Gaming Mouse', 'quantumglide-ultra-light-gaming-mouse', 'Ultra-lightweight 52g honeycomb chassis, 26,000 DPI optical sensor, optical switches with 90 million click lifespan, and sub-1ms wireless latency.', 1, 'ApexTech', 89.99, 69.99, 110, 4.75, 312, TRUE, FALSE, 'mouse,gaming,wireless,accessories', '{"weight": "52g", "dpi": "26000", "battery_life": "80h"}'),
(6, 'ELE-MKP-06', 'KeyForge 75% Mechanical Wireless Keyboard', 'keyforge-75-mechanical-keyboard', 'Custom aluminum chassis, hot-swappable tactile linear switches, south-facing RGB, PBT double-shot keycaps, and triple-mode connectivity (Type-C, 2.4GHz, Bluetooth).', 1, 'ForgeLabs', 149.99, 129.99, 50, 4.88, 142, TRUE, TRUE, 'keyboard,mechanical,wireless,office,gaming', '{"switch_type": "Tactile Cream", "layout": "75%", "connectivity": "Tri-mode"}'),

-- Wearables
(7, 'WRB-TIT-07', 'Chronos Titan GPS Multisport Smartwatch', 'chronos-titan-gps-multisport-smartwatch', 'Titanium bezel, sapphire crystal screen, multi-band dual-frequency GPS, offline topo maps, heart rate variability tracking, and 21-day solar battery life.', 3, 'Chronos', 349.99, 299.99, 35, 4.80, 95, TRUE, TRUE, 'smartwatch,watch,gps,running,fitness,titanium', '{"case_material": "Titanium", "screen": "1.4 AMOLED", "battery_life": "21 days", "water_resistance": "100m"}'),
(8, 'WRB-FIT-08', 'PulseFit Halo Health & Sleep Tracker Band', 'pulsefit-halo-health-sleep-tracker', 'Screenless lightweight woven strap designed for continuous 24/7 biometric tracking: sleep stages, recovery scores, skin temperature, and strain metrics.', 3, 'PulseFit', 129.99, 99.99, 90, 4.60, 64, TRUE, FALSE, 'fitness,tracker,health,sleep,wearable', '{"strap_color": "Onyx", "battery_life": "7 days", "sensors": "SpO2, PPG, Temp"}'),

-- Apparel & Footwear
(9, 'APP-TRX-09', 'TerraStride Waterproof Trail Running Shoes', 'terrastride-waterproof-trail-running-shoes', 'Gore-Tex waterproof membrane paired with Vibram Megagrip lugged outsoles and responsive nitrogen-infused foam midsole for maximum traction on muddy mountain trails.', 4, 'TerraGear', 149.99, 119.99, 70, 4.82, 180, TRUE, TRUE, 'shoes,running,trail,waterproof,gore-tex,blue,outdoor', '{"color": "Navy Blue / Blaze Orange", "material": "Gore-Tex", "sole": "Vibram Megagrip", "gender": "Unisex"}'),
(10, 'APP-SHL-10', 'ApexStorm 3-Layer All-Weather Mountain Jacket', 'apexstorm-3-layer-mountain-jacket', 'Technical alpine jacket featuring 28,000mm waterproof breathable membrane, fully taped seams, helmet-compatible hood, and pit zips for heat dumping during ascents.', 4, 'TerraGear', 279.99, 229.99, 30, 4.90, 88, TRUE, FALSE, 'jacket,waterproof,outerwear,hiking,black,winter', '{"waterproof_rating": "28000mm", "color": "Stealth Black", "sizes": "S, M, L, XL"}'),
(11, 'APP-HOO-11', 'MerinoCore Thermal Heavyweight Hoodie', 'merinocore-thermal-heavyweight-hoodie', '100% natural 320gsm Australian merino wool. Naturally odor-resistant, temperature-regulating, and soft next-to-skin feel for chilly mornings and travel.', 4, 'TerraGear', 139.99, NULL, 55, 4.78, 114, TRUE, FALSE, 'hoodie,apparel,wool,warm,lifestyle', '{"material": "100% Merino Wool", "color": "Charcoal Grey"}'),

-- Home & Smart Living
(12, 'HOM-ESP-12', 'BaristaCraft Pro Dual-Boiler Espresso Machine', 'baristacraft-pro-espresso-machine', 'Commercial-grade 58mm portafilter, dual stainless steel boilers with PID temperature management, quiet rotary pump, and integrated pre-infusion chamber.', 5, 'BaristaCraft', 899.99, 799.99, 15, 4.95, 62, TRUE, TRUE, 'espresso,coffee,kitchen,home,appliances', '{"boiler_type": "Dual Boiler", "portafilter": "58mm", "pressure": "15 Bar PID"}'),
(13, 'HOM-AIR-13', 'AeroClean Smart HEPA H14 Air Purifier', 'aeroclean-smart-hepa-air-purifier', 'Medical-grade H14 true HEPA filtration capturing 99.995% of airborne particles down to 0.1 microns. WiFi app-controlled with real-time PM2.5 laser air sensor.', 5, 'CleanAir', 189.99, 149.99, 40, 4.72, 105, TRUE, FALSE, 'air-purifier,home,clean,smart,wifi', '{"coverage": "800 sq ft", "filter": "H14 True HEPA", "noise_level": "21dB whisper"}')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Product Images
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(1, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', 'AeroPulse Max Wireless Headphones in Matte Black', TRUE, 1),
(2, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80', 'SonicBuds Pro Active ANC Wireless Earbuds', TRUE, 1),
(3, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80', 'BassPulse 360 Portable Waterproof Speaker', TRUE, 1),
(4, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80', 'ApexBook Pro 16 Ultra Laptop on Desk', TRUE, 1),
(5, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80', 'QuantumGlide Ultra-Light Wireless Gaming Mouse', TRUE, 1),
(6, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80', 'KeyForge 75% Mechanical Wireless Keyboard', TRUE, 1),
(7, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', 'Chronos Titan GPS Multisport Smartwatch', TRUE, 1),
(8, 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80', 'PulseFit Halo Health & Sleep Tracker Band', TRUE, 1),
(9, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'TerraStride Waterproof Trail Running Shoes', TRUE, 1),
(10, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80', 'ApexStorm 3-Layer All-Weather Mountain Jacket', TRUE, 1),
(11, 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80', 'MerinoCore Thermal Heavyweight Hoodie', TRUE, 1),
(12, 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80', 'BaristaCraft Pro Dual-Boiler Espresso Machine', TRUE, 1),
(13, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80', 'AeroClean Smart HEPA Air Purifier', TRUE, 1)
ON CONFLICT DO NOTHING;

-- Reset sequence IDs
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
