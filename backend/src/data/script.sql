CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
	
-- 1. Role
CREATE TABLE role (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- 2. User
CREATE TABLE "user" (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id INT REFERENCES role(role_id),
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(10),
    dob DATE,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    hashed_password TEXT,
    is_banned BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    oauth_provider VARCHAR(50),
    oauth_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. UserImage
CREATE TABLE userimage (
    image_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES "user"(user_id),
    image_url TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- 4. Category
CREATE TABLE category (
    category_id SERIAL PRIMARY KEY,
    sub_category_id INT REFERENCES category(category_id),
    category_name VARCHAR(100) NOT NULL,
    image_url TEXT
);

-- 5. Property
CREATE TABLE property (
    property_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES "user"(user_id),
    category_id INT REFERENCES category(category_id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT,
    ward VARCHAR(100),
    province VARCHAR(100),
    country VARCHAR(100),
    longitude DECIMAL(9,6),
    latitude DECIMAL(9,6),
    min_price DECIMAL(12,2),
    max_guest SMALLINT,
    checkin_date DATE,
    checkout_date DATE, 
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. PropertyImage
CREATE TABLE propertyimage (
    image_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES property(property_id),
    image_url TEXT NOT NULL,
    is_cover BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- 7. ExternalService
CREATE TABLE externalservice (
    external_service_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES property(property_id),
    external_service_name VARCHAR(100) NOT NULL,
    price DECIMAL(12,2),
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- 8. UserFavorite
CREATE TABLE userfavorite (
    user_id UUID REFERENCES "user"(user_id),
    property_id UUID REFERENCES property(property_id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, property_id)
);

-- 9. Auction
CREATE TABLE auction (
    auction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES property(property_id),
    winner_id UUID REFERENCES "user"(user_id),
    status VARCHAR(50),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    final_price DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT NOW()
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 10. UserBid
CREATE TABLE userbid (
    bid_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id UUID REFERENCES auction(auction_id),
    bidder_id UUID REFERENCES "user"(user_id),
    stay_start TIMESTAMP,
    stay_end TIMESTAMP,
    bid_time TIMESTAMP,
    bid_amount DECIMAL(12,2),
    status VARCHAR(50)
);

-- 11. Method
CREATE TABLE method (
    method_id SERIAL PRIMARY KEY,
    method_name VARCHAR(100),
    transaction_to VARCHAR(100),
    bank_code VARCHAR(50),
    order_info TEXT,
    response_code VARCHAR(20),
    secure_hash TEXT,
    pay_date TIMESTAMP,
    card_type VARCHAR(50)
);

-- 12. Payment
CREATE TABLE payment (
    payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES "user"(user_id),
    booking_id UUID,
    method_id INT REFERENCES method(method_id),
    amount DECIMAL(12,2),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 13. Booking
CREATE TABLE booking (
    booking_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES property(property_id),
    renter_id UUID REFERENCES "user"(user_id),
    payment_id UUID REFERENCES payment(payment_id),
    start_date DATE,
    end_date DATE,
    total_price DECIMAL(12,2),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 14. Tax
CREATE TABLE tax (
    tax_id SERIAL PRIMARY KEY,
    tax_name VARCHAR(100) NOT NULL,
    percentage DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW(),
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- 15. forgot password otp
create table otp_verifications (
	otp_id UUID primary key default uuid_generate_v4(),
	user_id UUID references "user"(user_id) on delete cascade,
	token text not null,
	expires_at timestamp not null
);

-- 16. recommender system
CREATE TABLE user_click (
    click_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES "user"(user_id),
    property_id UUID REFERENCES property(property_id),
    event_type VARCHAR(50), --'click', 'view_detail', 'favorite', 'book', 'search', 'scroll'
    event_value TEXT,        -- eg: search keyword, scroll %, ...
    user_agent TEXT,
    ip_address TEXT,
    location TEXT,
    clicked_at TIMESTAMP DEFAULT NOW()
);

-- 17. Review
CREATE TABLE review (
    review_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID UNIQUE REFERENCES property(property_id) ON DELETE CASCADE,
    rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5), -- trung bình overall_rating
    count INT CHECK (count >= 0),

    cleanliness_avg DECIMAL(3,2) CHECK (cleanliness_avg >= 0 AND cleanliness_avg <= 5),
    accuracy_avg DECIMAL(3,2) CHECK (accuracy_avg >= 0 AND accuracy_avg <= 5),
    checkin_avg DECIMAL(3,2) CHECK (checkin_avg >= 0 AND checkin_avg <= 5),
    communication_avg DECIMAL(3,2) CHECK (communication_avg >= 0 AND communication_avg <= 5),
    location_avg DECIMAL(3,2) CHECK (location_avg >= 0 AND location_avg <= 5),
    value_avg DECIMAL(3,2) CHECK (value_avg >= 0 AND value_avg <= 5),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 18. Review Details
CREATE TABLE review_details (
    review_detail_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES review(review_id) ON DELETE CASCADE,
    user_id UUID REFERENCES "user"(user_id) ON DELETE SET NULL,
    cleanliness DECIMAL(2,1) CHECK (cleanliness >= 0 AND cleanliness <= 5),
    accuracy DECIMAL(2,1) CHECK (accuracy >= 0 AND accuracy <= 5),
    checkin DECIMAL(2,1) CHECK (checkin >= 0 AND checkin <= 5),
    communication DECIMAL(2,1) CHECK (communication >= 0 AND communication <= 5),
    location DECIMAL(2,1) CHECK (location >= 0 AND location <= 5),
    value DECIMAL(2,1) CHECK (value >= 0 AND value <= 5),
    overall_rating DECIMAL(2,1) CHECK (overall_rating >= 0 AND overall_rating <= 5),
    comment TEXT,
    stay_date DATE,                 -- thời điểm khách đã ở
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO "role" (role_name, description) 
VALUES ('Admin', 'Administrator of the system');
INSERT INTO "role" (role_name, description) 
VALUES ('Customer', 'Simply a customer who want to use the services');
INSERT INTO "role" (role_name, description) 
VALUES ('Property Owner', 'Property owner who want to publish their property for bidding');
INSERT INTO "role" (role_name, description) 
VALUES ('Property Owner and Customer', 'Customer and property owner at the same time');

-- subcategory
-- aparment
INSERT INTO category(category_name, sub_category_id) VALUES
('Studio Apartment', 1),
('Penthouse Apartment', 1),
('Serviced Apartment', 1);
-- home
INSERT INTO category(category_name, sub_category_id) VALUES
('Townhouse', 2),
('House In The Alley', 2);
-- villa
INSERT INTO category(category_name, sub_category_id) VALUES
('Beachfront Villa', 3),
('Luxury Villa', 3),
('Private Pool Villa', 3),
('Hillside Villa', 3),
('Eco Villa', 3);
-- bungalow
INSERT INTO category(category_name, sub_category_id) VALUES
('Traditional Bungalow', 4),
('Modern Bungalow', 4),
('Beach Bungalow', 4),
('Garden Bungalow', 4);

INSERT INTO category(category_name, sub_category_id) VALUES
('Private Room in Home', 5),
('Shared Room in Home', 5),
('Family Homestay', 5);

-- Function cập nhật rating & count
CREATE OR REPLACE FUNCTION update_review_summary()
RETURNS TRIGGER AS $$
BEGIN
    -- Cập nhật tổng quan cho property liên quan
    UPDATE review
    SET 
        rating = (
            SELECT ROUND(AVG(overall_rating)::numeric, 2)
            FROM review_details
            WHERE review_id = NEW.review_id
        ),
        count = (
            SELECT COUNT(*)
            FROM review_details
            WHERE review_id = NEW.review_id
        ),
        updated_at = NOW()
    WHERE review_id = COALESCE(NEW.review_id, OLD.review_id);

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger trên bảng review_details
CREATE TRIGGER trg_update_review_summary
AFTER INSERT OR UPDATE OR DELETE
ON review_details
FOR EACH ROW
EXECUTE FUNCTION update_review_summary();