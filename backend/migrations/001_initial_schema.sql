-- Initial Schema for TraitQuest

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    google_id VARCHAR UNIQUE NOT NULL,
    display_name VARCHAR,
    avatar_url VARCHAR,
    level INTEGER DEFAULT 1,
    exp INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- UserQuests Table
CREATE TABLE IF NOT EXISTS user_quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    quest_type VARCHAR,
    interactions JSONB DEFAULT '[]',
    summary TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_quests_user_id ON user_quests(user_id);

-- Traits Table
CREATE TABLE IF NOT EXISTS traits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    final_report JSONB DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- GameDefinitions Table
CREATE TABLE IF NOT EXISTS game_definitions (
    id VARCHAR PRIMARY KEY,
    category VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    metadata_info JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_game_definitions_category ON game_definitions(category);

-- Functional Indexes for Traits
CREATE INDEX IF NOT EXISTS idx_traits_class_id ON traits ((final_report->>'class_id'));
CREATE INDEX IF NOT EXISTS idx_traits_race_id ON traits ((final_report->>'race_id'));
