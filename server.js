require('dotenv').config();

const inquirer = require('inquirer');
const mysql = require('mysql2');
const table = require('console.table');

const express = require('express');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'business_db'
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to the Business Database as ' + db.threadId);
  initApp();
});

const initApp = () => {
  console.log("Ready to use the employee tracker? Let's get this thing rolling!");
  runMainQuestions();
};

const runMainQuestions = () => {
  inquirer.prompt([
    {
      type: 'list',
      name: 'choices',
      message: 'What would you like to do?',
      loop: false,
      choices: [
        'View all departments',
        'Add a department',
        'View all roles',
        'Add a role',
        'View all employees',
        'Add an employee',
        'Update an employee role',
        'Exit the Employee Tracker',
      ]
    }
  ])

    .then((response) => {
      const { choices } = response;

      if (choices === 'View all departments') {
        allDepartments();
      }

      if (choices === 'View all roles') {
        allRoles();
      }

      if (choices === 'View all employees') {
        allEmployees();
      }

      if (choices === 'Add a department') {
        addDepartment();
      }

      if (choices === 'Add a role') {
        addRole();
      }

      if (choices === 'Add an employee') {
        addEmployee();
      }

      if (choices === 'Update an employee role') {
        updateEmployee();
      }

      if (choices === 'Exit the Employee Tracker') {
        db.end()
      };
    });
};

const allDepartments = () => {
  console.log('Showing all departments...\n');
  const sql = `SELECT id, department_name AS department FROM departments`;

  db.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    runMainQuestions();
  });
};

const allRoles = () => {
  console.log('Showing all roles...\n');

  const sql = `
    SELECT r.id, r.role_title as title, d.department_name as department, r.role_salary as salary
    FROM roles r
    LEFT JOIN departments d ON r.department_id = d.id
  `;

  db.query(sql, (err, data) => {
    if (err) throw err;
    console.table(data);
    runMainQuestions();
  });
};

const allEmployees = () => {
  console.log('Showing all employees...\n');
  const sql = `
    SELECT e.id, 
    e.first_name, 
    e.last_name, 
    r.role_title AS title, 
    d.department_name AS department,
    r.role_salary AS salary, 
    CONCAT (m.first_name, " ", m.last_name) AS manager
    FROM employees e
    LEFT JOIN roles r ON e.role_id = r.id
    LEFT JOIN departments d ON r.department_id = d.id
    LEFT JOIN employees m ON e.manager_id = m.id
  `;

  db.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    runMainQuestions();
  });
};

const addDepartment = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'addDepartment',
      message: 'What is the department name?',
      validate: addDepartment => {
        if (addDepartment) {
          return true;
        } else {
          console.log('Please enter a department name.');
          return false;
        }
      }
    }
  ])
    .then(res => {
      const sql = `
        INSERT INTO departments (department_name)
        VALUES (?)
      `;
      db.query(sql, res.addDepartment, (err, res) => {
        if (err) throw err;
        console.log(`${res.addDepartment} has been added to the departments table.`);
        allDepartments();
      });
    });
};

const addRole = () => {
  const existingDepartments = [];
  db.query("SELECT * FROM departments", (err, res) => {
    if (err) throw err;

    res.forEach(dep => {
      let deptObj = {
        name: dep.department_name,
        value: dep.id
      }
      existingDepartments.push(deptObj);
    });

    let roleQuestions = [
      {
        type: "input",
        name: "roleTitle",
        message: "What is the title of the role you would like to add?"
      },
      {
        type: "input",
        name: "roleSalary",
        message: "What is the roles salary?"
      },
      {
        type: "list",
        name: "department",
        choices: existingDepartments,
        message: "which department will the role be in?"
      }
    ];

    inquirer.prompt(roleQuestions)
      .then(response => {
        const sqlQuery = `
        INSERT INTO roles (role_title, role_salary, department_id) 
        VALUES (?)
      `;

        db.query(sqlQuery, [[response.roleTitle, response.roleSalary, response.department]], (err, res) => {
          if (err) throw err;
          console.log(`Successfully inserted ${response.roleTitle} role at id ${res.insertId}`);
          allRoles();
        });
      })
      .catch(err => {
        console.error(err);
      });
  });
};

const addEmployee = () => {
  const managerSql = `SELECT * FROM employees`
  db.query(managerSql, (err, data) => {
    if (err) throw err;
    const employeeChoice = [
      {
        name: 'None',
        value: 0
      }
    ];
    data.forEach(({ first_name, last_name, id }) => {
      employeeChoice.push({
        name: first_name + " " + last_name,
        value: id
      });
    });

    db.query('SELECT * FROM roles', (err, data) => {
      if (err) throw err;
      const roleChoice = [];
      data.forEach(({ role_title, id }) => {
        roleChoice.push({
          name: role_title,
          value: id
        });
      });

      let employeeQuestions = [
        {
          type: "input",
          name: "first_name",
          message: "what is the employee's first name?"
        },
        {
          type: "input",
          name: "last_name",
          message: "what is the employee's last name?"
        },
        {
          type: "list",
          name: "role_id",
          choices: roleChoice,
          message: "what is the employee's role?"
        },
        {
          type: "list",
          name: "manager_id",
          choices: employeeChoice,
          message: "who is the employee's manager? (can be null)"
        }
      ]

      inquirer.prompt(employeeQuestions)
        .then(response => {
          const employeeSqlQuery = `
          INSERT INTO employees (first_name, last_name, role_id, manager_id) 
          VALUES (?)
          `;
          let manager_id = response.manager_id !== 0 ? response.manager_id : null;

          db.query(employeeSqlQuery,
            [[response.first_name, response.last_name, response.role_id, manager_id]],
            (err, res) => {
              if (err) throw err;
              console.log(`Successfully inserted new employee ${response.first_name} ${response.last_name} with the id of ${res.insertId}`);
              allEmployees();
            });
        })
        .catch(err => {
          console.error(err);
        });
    })
  });
};

updateEmployee = () => {
  const employeeSql = `SELECT * FROM employees`;

  db.query(employeeSql, (err, data) => {
    if (err) throw err;

    const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));

    inquirer.prompt([
      {
        type: 'list',
        name: 'name',
        message: "Which employee would you like to update?",
        choices: employees
      }
    ])
      .then(employeeChoice => {
        const employee = employeeChoice.name;
        const params = [];
        params.push(employee);

        const roleSql = `SELECT * FROM roles`;

        db.query(roleSql, (err, data) => {
          if (err) throw err;

          const roles = data.map(({ id, role_title }) => ({ name: role_title, value: id }));

          inquirer.prompt([
            {
              type: 'list',
              name: 'role',
              message: "What is the employee's new role?",
              choices: roles
            }
          ])
            .then(roleChoice => {
              const role = roleChoice.role;
              params.push(role);

              let employee = params[0]
              params[0] = role
              params[1] = employee

              const updateSql = `UPDATE employees SET role_id = ? WHERE id = ?`;

              db.query(updateSql, params, (err, result) => {
                if (err) throw err;
                console.log("Employee has been updated!");

                allEmployees();
              });
            });
        });
      });
  });
};

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});