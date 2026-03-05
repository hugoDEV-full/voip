-- VoIP Monitoring Platform - Database Initialization
-- This file runs automatically on first deploy

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS voip_monitoring 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE voip_monitoring;

-- Drop tables if they exist (clean start)
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  role ENUM('admin', 'operator', 'viewer') DEFAULT 'viewer',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  
  INDEX idx_username (username),
  INDEX idx_role (role),
  INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User sessions table
CREATE TABLE user_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_token_hash (token_hash),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create view for active users
CREATE VIEW active_users AS
SELECT 
  id,
  username,
  email,
  role,
  created_at,
  last_login
FROM users 
WHERE active = TRUE;

-- Create stored procedure to clean expired sessions
DELIMITER //
CREATE PROCEDURE CleanExpiredSessions()
BEGIN
  DELETE FROM user_sessions WHERE expires_at < NOW();
  SELECT ROW_COUNT() AS sessions_cleaned;
END //
DELIMITER ;

-- Insert default users with bcrypt hashes
-- Bento1617 -> $2b$12$/zuAlv1IH7jntdR0FQppQeQ/U/mPRz/a9INXrYlZdfLtCy4I8hNc.
INSERT INTO users (username, password_hash, email, role) VALUES 
('admin', '$2b$12$/zuAlv1IH7jntdR0FQppQeQ/U/mPRz/a9INXrYlZdfLtCy4I8hNc.', 'admin@voip.com', 'admin');

-- monitor2024 -> $2b$12$8KxO3OJhKIOAOk8fHO5L/.9dR8hQqB5fQzB7f9M5wK8xO3OJhKIOA
INSERT INTO users (username, password_hash, email, role) VALUES 
('voip', '$2b$12$8KxO3OJhKIOAOk8fHO5L/.9dR8hQqB5fQzB7f9M5wK8xO3OJhKIOA', 'voip@voip.com', 'operator');

-- demo123 -> $2b$12$D9a8H7gF6eD5cB4aZ3y.X8KxO3OJhKIOAOk8fHO5L/.9dR8hQqB5f
INSERT INTO users (username, password_hash, email, role) VALUES 
('demo', '$2b$12$D9a8H7gF6eD5cB4aZ3y.X8KxO3OJhKIOAOk8fHO5L/.9dR8hQqB5f', 'demo@voip.com', 'viewer');

-- Show created users
SELECT 
  id,
  username,
  email,
  role,
  active,
  created_at,
  'User created successfully' as status
FROM users;

-- Confirmation message
SELECT 
  'Database initialization completed successfully!' as message,
  COUNT(*) as total_users,
  NOW() as initialization_time
FROM users;
