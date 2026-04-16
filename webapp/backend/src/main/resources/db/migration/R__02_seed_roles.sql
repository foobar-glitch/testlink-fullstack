INSERT INTO authorities (user_id, authority)
SELECT user_id, 'ROLE_ADMIN' FROM users WHERE username = 'admin';

INSERT INTO authorities (user_id, authority)
SELECT user_id, 'ROLE_TESTER' FROM users WHERE username = 'tester1';

INSERT INTO authorities (user_id, authority)
SELECT user_id, 'ROLE_TESTER' FROM users WHERE username = 'tester2';

INSERT INTO authorities (user_id, authority)
SELECT user_id, 'ROLE_VIEWER' FROM users WHERE username = 'newuser';