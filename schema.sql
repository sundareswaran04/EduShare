CREATE DATABASE IF NOT EXISTS edushare;

USE edushare;

-- Table for research papers
CREATE TABLE IF NOT EXISTS research_papers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    year INT,
    uploaded_by VARCHAR(100) NOT NULL,  -- Added column
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for projects
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_by VARCHAR(100) NOT NULL,  -- Added column
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for study materials
CREATE TABLE IF NOT EXISTS study_material (
    id INT AUTO_INCREMENT PRIMARY KEY,
    semester INT NOT NULL,
    regulation VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_by VARCHAR(100) NOT NULL,  -- Added column
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for converted files
CREATE TABLE IF NOT EXISTS converted_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    semester INT NOT NULL,
    regulation VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_by VARCHAR(100) NOT NULL,  -- Added column
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Users (
    userID VARCHAR(20) PRIMARY KEY,  -- Stores IDs like 21ec017
    password VARCHAR(255) NOT NULL, -- Password (use hashed for security)
    name VARCHAR(100) NOT NULL      -- Name of the user
);
