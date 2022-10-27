-- Creation of database
DROP DATABASE IF EXISTS business_db;
CREATE DATABASE business_db;

USE business_db;

-- Creation of departments table
CREATE TABLE departments (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  department_name VARCHAR(30) NOT NULL
);

-- Creation of roles table
CREATE TABLE roles (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  role_title VARCHAR(30) NOT NULL,
  role_salary DECIMAL (20, 2) NOT NULL,
  department_id INT,
  FOREIGN KEY (department_id)
    REFERENCES departments(id)
    ON DELETE SET NULL
);

-- Creation of employees table
CREATE TABLE employees (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INT,
  manager_id INT,
  FOREIGN KEY (role_id)
    REFERENCES roles(id)
    ON DELETE SET NULL,
  FOREIGN KEY (manager_id)
    REFERENCES employees(id)
    ON DELETE SET NULL
);