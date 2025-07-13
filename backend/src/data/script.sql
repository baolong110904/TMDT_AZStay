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
    city VARCHAR(100),
    province VARCHAR(100),
    country VARCHAR(100),
    longitude DECIMAL(9,6),
    latitude DECIMAL(9,6),
    min_price DECIMAL(12,2),
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
);

-- 10. UserBid
CREATE TABLE userbid (
    bid_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id UUID REFERENCES auction(auction_id),
    bidder_id UUID REFERENCES "user"(user_id),
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