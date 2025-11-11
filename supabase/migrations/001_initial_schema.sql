-- Create tables for Right Wing Tracker

-- People table
CREATE TABLE IF NOT EXISTS people (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    jurisdiction TEXT,
    actor_type TEXT,
    active_since TEXT,
    notes TEXT,
    affiliations TEXT
);

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT,
    location TEXT,
    links TEXT,
    key_people TEXT,
    notes TEXT,
    affiliated TEXT
);

-- Topics table
CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    definition TEXT,
    domain TEXT,
    related_topics TEXT
);

-- Sources table
CREATE TABLE IF NOT EXISTS sources (
    id TEXT PRIMARY KEY,
    date_published DATE,
    outlet TEXT,
    type TEXT,
    title TEXT,
    topic TEXT,
    summary TEXT,
    url TEXT
);

-- Statements table
CREATE TABLE IF NOT EXISTS statements (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    actor_id TEXT NOT NULL,
    type TEXT,
    short_quote TEXT,
    topic_ids TEXT,
    source_id TEXT,
    notes TEXT,
    FOREIGN KEY (source_id) REFERENCES sources(id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_statements_date ON statements(date);
CREATE INDEX IF NOT EXISTS idx_statements_actor_id ON statements(actor_id);
CREATE INDEX IF NOT EXISTS idx_statements_source_id ON statements(source_id);
CREATE INDEX IF NOT EXISTS idx_sources_date_published ON sources(date_published);
CREATE INDEX IF NOT EXISTS idx_sources_outlet ON sources(outlet);

