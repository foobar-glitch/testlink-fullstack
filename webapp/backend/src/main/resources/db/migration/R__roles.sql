INSERT INTO authorities (user_id, authority)
SELECT user_id, 'ROLE_ADMIN' FROM users WHERE username = 'admin';

INSERT INTO authorities (user_id, authority)
SELECT user_id, 'ROLE_TESTER' FROM users WHERE username = 'tester';

INSERT INTO authorities (user_id, authority)
SELECT user_id, 'ROLE_TESTER' FROM users WHERE username = 'newuser';