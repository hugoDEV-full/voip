-- VoIP Monitoring Platform Database Schema
-- MySQL 8.0+

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS voip_monitoring 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE voip_monitoring;

-- Users table
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS user_sessions (
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

-- Insert default users (passwords are bcrypt hashes)
-- admin123
INSERT IGNORE INTO users (username, password_hash, email, role) VALUES 
('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq9w5GS', 'admin@voip.com', 'admin');

-- monitor2024  
INSERT IGNORE INTO users (username, password_hash, email, role) VALUES 
('voip', '$2b$12$8KxO3OJhKIOAOk8fHO5L/.9dR8hQqB5fQzB7f9M5wK8xO3OJhKIOA', 'voip@voip.com', 'operator');

-- demo123
INSERT IGNORE INTO users (username, password_hash, email, role) VALUES 
('demo', '$2b$12$D9a8H7gF6eD5cB4aZ3y.X8KxO3OJhKIOAOk8fHO5L/.9dR8hQqB5f', 'demo@voip.com', 'viewer');

-- Create view for active users
CREATE OR REPLACE VIEW active_users AS
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
CREATE PROCEDURE IF NOT EXISTS CleanExpiredSessions()
BEGIN
  DELETE FROM user_sessions WHERE expires_at < NOW();
  SELECT ROW_COUNT() AS sessions_cleaned;
END //
DELIMITER ;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON voip_monitoring.* TO 'voip_user'@'%';
-- FLUSH PRIVILEGES;
