-- Migration 003: Create cats table

CREATE TABLE IF NOT EXISTS cats (
    cat_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    breed TEXT NOT NULL,
    personality TEXT NOT NULL,
    bio TEXT,
    zoomies_per_hour REAL NOT NULL DEFAULT 0.0,
    naps_per_day INTEGER NOT NULL DEFAULT 0,
    judginess_level INTEGER NOT NULL DEFAULT 5 CHECK (judginess_level BETWEEN 1 AND 10),
    favorite_product_id INTEGER,
    img_name TEXT,
    FOREIGN KEY (favorite_product_id) REFERENCES products(product_id) ON DELETE SET NULL
);

-- Index for FK and common query patterns
CREATE INDEX IF NOT EXISTS idx_cats_favorite_product_id ON cats(favorite_product_id);
