CREATE TABLE templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    keywords TEXT,
    embedding VECTOR(384),
    html_content TEXT NOT NULL,
    css_content TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
