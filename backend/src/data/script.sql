-- 1. Tạo 500 user owner random
DO $$
BEGIN
    FOR i IN 1..500 LOOP
        INSERT INTO "user" (
            role_id, 
            name, 
            email, 
            hashed_password
        ) VALUES (
            3,
            CONCAT('Owner ', i),
            CONCAT('owner', i, '@example.com'),
            '$2a$12$ANpXwJhvmZXTZIF0wl/24eLTQSl8SMJ9h3MfU2j3kq9t1KkQeCTGK'
        );
    END LOOP;
END$$;

select * from public.user;

-- 2. Cập nhật tất cả property: gán owner_id random từ danh sách 500 owner
DO $$
DECLARE
    prop RECORD;
    rnd_user UUID;
BEGIN
    -- Lặp qua tất cả property chưa có owner
    FOR prop IN
        SELECT property_id
        FROM property
    LOOP
        -- Lấy 1 user random role_id = 3
        SELECT user_id
        INTO rnd_user
        FROM "user"
        WHERE role_id = 4
        ORDER BY random()
        LIMIT 1;

        -- Update owner_id
        UPDATE property
        SET owner_id = rnd_user
        WHERE property_id = prop.property_id;
    END LOOP;
END $$;

-- 3. Gán category_id random cho tất cả property
UPDATE property
SET category_id = (
    SELECT category_id
    FROM category
    ORDER BY random()
    LIMIT 1
)
WHERE category_id IS NULL;

UPDATE "user"
SET avatar_url = CONCAT('https://picsum.photos/seed/', user_id::text, '/400/400')
WHERE role_id = 3;


-- Tạo 1000 user (role_id = 2 là người dùng thường)
INSERT INTO "user" (role_id, name, gender, dob, email, phone, hashed_password, avatar_url)
SELECT 
    2,
    CONCAT('User ', g),
    (ARRAY['Male','Female'])[floor(random()*2 + 1)],
    date '1970-01-01' + (trunc(random()*18250) * interval '1 day'),
    CONCAT('user', g, '@example.com'),
    CONCAT('09', LPAD((trunc(random()*100000000))::text, 8, '0')),
    '$2a$12$D2Nh1e.IQCdnD3SP.VWpxOZQldwCR9wPkiRTkEt5WmisPXF0DDxqS',
    CONCAT('https://picsum.photos/seed/user', g, '/400/400')
FROM generate_series(1, 1000) g;


-- 1. Tạo lại review: mỗi property có 1 review
INSERT INTO review (property_id, rating, count)
SELECT 
    p.property_id,
    ROUND(((random() * 2) + 3)::numeric, 1),  -- rating 3.0 đến 5.0
    floor(random() * 3 + 3)                   -- count 3-5 reviewDetails
FROM property p;

-- 2. Comment mẫu
WITH comments AS (
    SELECT unnest(ARRAY[
        'Great place, very comfortable!',
        'Clean and well located.',
        'Had a wonderful stay, highly recommend.',
        'Nice host, easy check-in.',
        'Perfect for a weekend getaway.',
        'Good value for money.',
        'Spacious and bright apartment.',
        'Loved the view and the location.'
    ]) AS comment_text
),
-- 3. Chọn review và random user
review_with_users AS (
    SELECT 
        r.review_id,
        r.rating,
        u.user_id,
        c.comment_text
    FROM review r
    JOIN LATERAL (
        SELECT user_id
        FROM "user"
        WHERE role_id = 2
        ORDER BY random()
        LIMIT (SELECT count FROM review WHERE review_id = r.review_id) -- số lượng reviewDetails
    ) u ON true
    JOIN comments c ON true
    ORDER BY random()
)
-- 4. Tạo review_details
INSERT INTO review_details (
    review_id, user_id, cleanliness, accuracy, checkin, communication, location, value, overall_rating, comment, stay_date
)
SELECT 
    rw.review_id,
    rw.user_id,
    rw.rating, rw.rating, rw.rating, rw.rating, rw.rating, rw.rating, rw.rating,
    rw.comment_text,
    NOW() - (floor(random() * 365) || ' days')::interval
FROM review_with_users rw;

-- Tạo auction
INSERT INTO auction (auction_id, property_id, status, start_time, end_time, final_price, created_at)
SELECT
    uuid_generate_v4(),
    p.property_id,
    CASE 
        WHEN g.n = max_n.max_n THEN 'active'
        ELSE 'ended'
    END AS status,

    CASE 
        WHEN g.n = max_n.max_n THEN
            -- start_time: 1–3 ngày trước hiện tại
            NOW() - ((1 + floor(random() * 3))::int * interval '1 day')
        ELSE
            NOW() - ((max_n.max_n - g.n + 2) * interval '15 days')
    END AS start_time,

    CASE 
        WHEN g.n = max_n.max_n THEN
            -- end_time: 1–3 ngày sau hiện tại (và <= checkin_date - 1 ngày nếu có)
            CASE 
                WHEN p.checkin_date IS NOT NULL THEN
                    LEAST(
                        p.checkin_date - interval '1 day',
                        NOW() + ((1 + floor(random() * 3))::int * interval '1 day')
                    )
                ELSE
                    NOW() + ((1 + floor(random() * 3))::int * interval '1 day')
            END
        ELSE
            NOW() - ((max_n.max_n - g.n) * interval '15 days')
    END AS end_time,

    round(
        p.min_price + 10000 + (random() * 50000)::numeric, -- luôn > min_price 100k
        0
    ) AS final_price,
    NOW()
FROM property p
CROSS JOIN LATERAL (
    SELECT n
    FROM generate_series(1, (floor(random() * 2) + 2)::int) AS n
) g
JOIN LATERAL (
    SELECT MAX(n) AS max_n
    FROM generate_series(1, (floor(random() * 2) + 2)::int) AS n
) max_n ON TRUE;

-- Tạo userbid
DO $$
DECLARE
    auct RECORD;
    part_users UUID[];
    usr UUID;
    final_price_val DECIMAL(12,2);
    current_price DECIMAL(12,2);
    max_rounds INT;
    round_idx INT;
    bid_time_val TIMESTAMP;
    stay_start_val TIMESTAMP;
    stay_end_val TIMESTAMP;
    stay_duration INT;
    total_days INT;
BEGIN
    -- Lặp qua tất cả auction
    FOR auct IN
        SELECT a.auction_id, p.owner_id, p.min_price, a.start_time, a.end_time, a.final_price,
               p.checkin_date, p.checkout_date
        FROM auction a
        JOIN property p ON p.property_id = a.property_id
        WHERE a.start_time IS NOT NULL 
          AND a.end_time IS NOT NULL
          AND p.checkin_date IS NOT NULL
          AND p.checkout_date IS NOT NULL
    LOOP
        final_price_val := auct.final_price;
        total_days := (auct.checkout_date - auct.checkin_date);

        -- Lấy 2 user (hoặc nhiều hơn nếu bạn muốn)
        SELECT ARRAY(
            SELECT user_id
            FROM "user"
            WHERE role_id = 2
              AND user_id <> auct.owner_id
            ORDER BY random()
            LIMIT 2
        ) INTO part_users;

        -- Giá hiện tại
        current_price := auct.min_price;

        -- Random số vòng bid (2–6)
        max_rounds := (2 + floor(random() * 5))::int;

        FOR round_idx IN 1..max_rounds LOOP
            -- Chọn user xen kẽ theo vòng
            usr := part_users[(round_idx % array_length(part_users, 1)) + 1];

            -- Tăng giá
            current_price := current_price + 10000 + (random() * 50000);

            -- Random thời gian bid trong khoảng
            bid_time_val := auct.start_time + (
                random() * (EXTRACT(EPOCH FROM (auct.end_time - auct.start_time))) * interval '1 second'
            );

            -- Random khoảng lưu trú
            stay_start_val := auct.checkin_date + (
                floor(random() * GREATEST(0, total_days - 5))::int
            ) * interval '1 day';

            stay_duration := 5 + floor(random() * 3);
            stay_end_val := stay_start_val + (stay_duration || ' days')::interval;

            IF stay_end_val > auct.checkout_date THEN
                stay_end_val := auct.checkout_date;
            END IF;

            -- Nếu là bid cuối cùng thì đặt = final_price
            IF round_idx = max_rounds THEN
                current_price := final_price_val;
            END IF;

            INSERT INTO userbid (
                bid_id, auction_id, bidder_id, stay_start, stay_end, bid_time, bid_amount, status
            )
            VALUES (
                uuid_generate_v4(),
                auct.auction_id,
                usr,
                stay_start_val,
                stay_end_val,
                bid_time_val,
                round(current_price::numeric, 0),
                'past'
            );
        END LOOP;
    END LOOP;
END $$;

UPDATE auction a
SET winner_id = ub.bidder_id, final_price = ub.bid_amount
FROM (
    SELECT DISTINCT ON (auction_id) 
           auction_id, bidder_id, bid_time, bid_amount
    FROM userbid
    WHERE status = 'valid'
    ORDER BY auction_id, bid_amount DESC
) ub
WHERE a.auction_id = ub.auction_id;