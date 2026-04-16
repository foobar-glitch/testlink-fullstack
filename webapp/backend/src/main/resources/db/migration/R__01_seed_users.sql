INSERT INTO users (username, email, password_hash, enabled)
VALUES
('admin', 'admin@mail.com', '$2b$12$13L2SNGrVNOAe4169gvIBOA2qcLGtQSl8zkLgPoDWCTpIkaaUI28e', true),
('tester1', 'teste1r@mail.com', '$2b$12$NMr2nJAvRgrfFI7WRF4JSObkxrA3hii0h7BGyffPhgCjpg9qbiLv2', true),
('tester2', 'tester2@mail.com', '$2b$12$NMr2nJAvRgrfFI7WRF4JSObkxrA3hii0h7BGyffPhgCjpg9qbiLv2', true),
('newuser', 'newuser@mail.com', '$2b$12$RLjh8Mr7AInIzjtmt1yRXuyerOUgMFaVkhgY6idQWUR1FHprN2tWS', true)
ON CONFLICT (username) DO NOTHING;