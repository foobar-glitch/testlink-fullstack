INSERT INTO users (username, email, password_hash, enabled)
VALUES
('admin', 'admin@mail.com', '$2b$12$13L2SNGrVNOAe4169gvIBOA2qcLGtQSl8zkLgPoDWCTpIkaaUI28e', true),
('tester', 'tester@mail.com', '$2b$12$/t3NKElSFMetnCVCFCFn.uX.YEiAY//dy9vu4h/3/fRLPzbmplpre', true)
('newuser', 'newuser@mail.com', '$2b$12$RLjh8Mr7AInIzjtmt1yRXuyerOUgMFaVkhgY6idQWUR1FHprN2tWS', true)
ON CONFLICT (username) DO NOTHING;