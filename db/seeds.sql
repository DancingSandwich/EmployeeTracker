-- Seeding of departments table
INSERT INTO departments (department_name)
VALUES 
    ('Engineering'),
    ('Finance'),
    ('Legal'),
    ('Sales');

SELECT * FROM departments;

-- Seeding of roles table
INSERT INTO roles (role_title, role_salary, department_id)
VALUES
    ('Project Manager', 175000, 1),
    ('Lead Engineer', 150000, 1),
    ('Software Engineer', 120000, 1),
    ('Account Supervisor', 80000, 2),
    ('Accountant',120000, 2),
    ('Legal Team Lead', 75000, 3),
    ('Lawyer', 100000, 3),
    ('Sales Lead', 80000, 4),
    ('Salesperson', 70000, 4);

SELECT * FROM roles;

-- Seeding of employees table
INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES 
    ('Homer', 'Simpson', 1, NULL),
    ('Ned', 'Flanders', 2, 1),
    ('Apu', 'Nahasapeemapetilon', 3, 1),
    ('Edna', 'Krabappel', 4, NULL),
    ('Kent', 'Brockman', 5, 1),
    ('Martin', 'Prince', 6, NULL),
    ('Seymour', 'Skinner', 7, 6),
    ('Otto', 'Mann', 8, NULL),
    ('Moe', 'Szyslak', 9, 8);

SELECT * FROM employees;
