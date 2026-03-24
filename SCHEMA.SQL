-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

---

-- REGIONS

CREATE TABLE regions (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name TEXT UNIQUE NOT NULL
);

---

-- COUNTRIES

CREATE TABLE countries (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name TEXT NOT NULL,
iso2 VARCHAR(2) UNIQUE,
iso3 VARCHAR(3) UNIQUE,
capital TEXT,
region_id UUID REFERENCES regions(id),
subregion TEXT,
population BIGINT,
area FLOAT,
latitude FLOAT,
longitude FLOAT,
flag_url TEXT,
currency TEXT,
created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_country_iso3 ON countries(iso3);
CREATE INDEX idx_country_region ON countries(region_id);

---

-- INDICATORS

CREATE TABLE indicators (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name TEXT NOT NULL,
code TEXT UNIQUE NOT NULL,
category TEXT,
unit TEXT,
source TEXT
);

---

-- INDICATOR VALUES (TIME SERIES DATA)

CREATE TABLE indicator_values (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
country_id UUID REFERENCES countries(id) ON DELETE CASCADE,
indicator_id UUID REFERENCES indicators(id) ON DELETE CASCADE,
year INTEGER NOT NULL,
value NUMERIC,
created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_country_indicator_year
ON indicator_values(country_id, indicator_id, year);

CREATE INDEX idx_indicator_year
ON indicator_values(indicator_id, year);

---

-- GLOBAL INDICATOR VALUES

CREATE TABLE global_indicator_values (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
indicator_id UUID REFERENCES indicators(id),
region_id UUID REFERENCES regions(id),
year INTEGER NOT NULL,
value NUMERIC
);

---

-- SIMULATION BASELINES

CREATE TABLE simulation_baselines (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
country_id UUID REFERENCES countries(id) UNIQUE,
gdp NUMERIC,
gdp_growth NUMERIC,
hdi NUMERIC,
life_expectancy NUMERIC,
co2_emissions NUMERIC,
unemployment NUMERIC,
innovation_index NUMERIC,
year INTEGER
);

---

-- POLICY VARIABLES

CREATE TABLE policy_variables (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name TEXT UNIQUE NOT NULL,
description TEXT,
min_value NUMERIC DEFAULT 0,
max_value NUMERIC DEFAULT 100,
default_value NUMERIC DEFAULT 50
);

---

-- API CACHE

CREATE TABLE api_cache (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
source TEXT NOT NULL,
endpoint TEXT NOT NULL,
response JSONB,
cached_at TIMESTAMP DEFAULT NOW(),
expires_at TIMESTAMP
);

CREATE INDEX idx_api_cache_endpoint ON api_cache(endpoint);

---

-- DATA SOURCES

CREATE TABLE data_sources (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name TEXT UNIQUE NOT NULL,
url TEXT,
last_updated TIMESTAMP
);
