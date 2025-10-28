CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('door', 'hardware')),
    image_url VARCHAR(500),
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category);

INSERT INTO products (name, description, price, category, image_url, stock_quantity) VALUES
('Межкомнатная дверь Классик', 'Элегантная дверь из массива дуба', 12500.00, 'door', '/placeholder.svg', 15),
('Входная дверь Премиум', 'Стальная дверь с терморазрывом', 28900.00, 'door', '/placeholder.svg', 8),
('Дверь-купе Модерн', 'Раздвижная система с зеркалом', 18700.00, 'door', '/placeholder.svg', 12),
('Межкомнатная дверь Эконом', 'Практичная ламинированная дверь', 8900.00, 'door', '/placeholder.svg', 25),
('Входная дверь Стандарт', 'Металлическая дверь с утеплением', 19500.00, 'door', '/placeholder.svg', 10),
('Дверь для ванной Влагостойкая', 'Специальное покрытие от влаги', 14200.00, 'door', '/placeholder.svg', 18),
('Ручка дверная Классика', 'Матовый хром, универсальная', 850.00, 'hardware', '/placeholder.svg', 50),
('Замок врезной Стандарт', 'Цилиндровый механизм, 3 ключа', 1450.00, 'hardware', '/placeholder.svg', 40),
('Петли скрытые Невидимка', 'Комплект на одну дверь', 2200.00, 'hardware', '/placeholder.svg', 30),
('Доводчик дверной Премиум', 'Плавное закрывание до 100кг', 3500.00, 'hardware', '/placeholder.svg', 22),
('Глазок дверной широкоугольный', '180 градусов обзора', 650.00, 'hardware', '/placeholder.svg', 60),
('Накладка декоративная Золото', 'Для дверных ручек', 450.00, 'hardware', '/placeholder.svg', 35);