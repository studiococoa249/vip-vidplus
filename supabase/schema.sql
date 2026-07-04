-- Enums
CREATE TYPE user_level AS ENUM ('Admin', 'Member');
CREATE TYPE user_status AS ENUM ('Active', 'Not-Active');
CREATE TYPE user_membership AS ENUM ('Free', 'VIP');
CREATE TYPE payment_status AS ENUM ('Pending', 'Error', 'Expired', 'Success');

-- Table: users
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_token TEXT,
    level user_level DEFAULT 'Member',
    status user_status DEFAULT 'Active',
    membership user_membership DEFAULT 'Free',
    start_membership TIMESTAMP WITH TIME ZONE,
    end_membership TIMESTAMP WITH TIME ZONE,
    create_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    update_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: plan_membership
CREATE TABLE plan_membership (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price_idr NUMERIC(15, 2) NOT NULL,
    price_usd NUMERIC(10, 2) NOT NULL,
    duration INTEGER NOT NULL, -- in days
    create_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    update_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE plan_membership ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now for development
CREATE POLICY "Allow all operations on plan_membership"
    ON plan_membership
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Table: membership_history
CREATE TABLE membership_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_plan_membership UUID REFERENCES plan_membership(id) ON DELETE SET NULL,
    id_users UUID REFERENCES users(id) ON DELETE CASCADE,
    status_payment payment_status DEFAULT 'Pending',
    detail_payment JSONB,
    invoice VARCHAR(255),
    create_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    update_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger for update_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.update_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_update_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plan_membership_update_at
    BEFORE UPDATE ON plan_membership
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_membership_history_update_at
    BEFORE UPDATE ON membership_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Table: actor
CREATE TABLE actor (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    actor_banner_imagekit_url TEXT,
    create_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    update_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: video_actor
CREATE TABLE video_actor (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_actor UUID REFERENCES actor(id) ON DELETE CASCADE,
    url_video JSONB,
    create_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    update_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_actor_update_at
    BEFORE UPDATE ON actor
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_actor_update_at
    BEFORE UPDATE ON video_actor
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Table: genre
CREATE TABLE genre (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    create_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    update_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: short_drama
CREATE TABLE short_drama (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    drama_id VARCHAR(255) NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    id_genre JSONB,
    "desc" TEXT,
    total_episode INTEGER DEFAULT 0,
    banner_url TEXT,
    view_count INTEGER DEFAULT 0,
    create_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    update_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: play_short_drama
CREATE TABLE play_short_drama (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_short_drama UUID REFERENCES short_drama(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    episode INTEGER,
    duration INTEGER,
    create_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    update_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_genre_update_at
    BEFORE UPDATE ON genre
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_short_drama_update_at
    BEFORE UPDATE ON short_drama
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_play_short_drama_update_at
    BEFORE UPDATE ON play_short_drama
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Table: imagekit_api
CREATE TABLE imagekit_api (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) NOT NULL,
    secret_key VARCHAR(255) NOT NULL,
    url_endpoint VARCHAR(255) NOT NULL,
    create_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    update_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE payment_mode AS ENUM ('Sandbox', 'Production');

-- Table: payment_gateway
CREATE TABLE payment_gateway (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mode payment_mode DEFAULT 'Sandbox',
    tripay_config JSONB,
    cryptomus_config JSONB,
    create_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    update_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_imagekit_api_update_at
    BEFORE UPDATE ON imagekit_api
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_gateway_update_at
    BEFORE UPDATE ON payment_gateway
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Table: rapid_api
CREATE TABLE rapid_api (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url TEXT,
    rapidapi_host VARCHAR(255),
    rapidapi_key VARCHAR(255),
    create_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    update_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_rapid_api_update_at
    BEFORE UPDATE ON rapid_api
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
