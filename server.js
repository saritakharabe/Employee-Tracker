const express = require("express");
const inquirer = require("inquirer");
const mysql = require("mysql2");
const cTable = require("console.table");

const app = express();
const PORT = 3001 || process.env.PORT;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "mysql@25",
    database: "employee_db",
  },
  console.log("connected to employee_db database")
);

function init() {
  const questions = [
    {
      type: "list",
      message: "What would you like to do? ",
      name: "choices",
      choices: [
        "view all employees",
        "view all departments",
        "view all roles",
        "add an employee",
        "add a department",
        "add a role",
        "update an employee role",
        "exit",
      ],
    },
  ];
  inquirer.prompt(questions).then((result) => {
    const { choices } = result;

    if (choices == "view all employees") {
      console.log("showing all Employee");
      viewEmployees();
    }

    if (choices == "view all departments") {
      console.log("showing all departments");
      viewDepartments();
    }

    if (choices == "view all roles") {
      console.log("showing all roles");
      viewRoles();
    }

    if (choices == "add an employee") {
      console.log("adding employee");
      addEmployee();
    }

    if (choices == "add a department") {
      console.log("adding department");
      addDepartment();
    }

    if (choices == "add a role") {
      console.log("adding a role");
      addRole();
    }

    if (choices == "update an employee role") {
      console.log("updating employee details");
      updateEmployee();
    }

    if (choices == "exit") {
      console.log("Exit");
    }
  });
}

//getting departments data from database
const viewDepartments = () => {
  db.query("SELECT * FROM department", function (error, results) {
    if (error) throw error;
    console.table(results);
    init();
  });
};

//getting roles from database
const viewRoles = () => {
  db.query("SELECT * FROM roles INNER JOIN department ON roles.department_id = department.id", function (error, results) {
    if (error) throw error;
    console.table(results);
    init();
  });
};

//getting employee from datatbase
const viewEmployees = () => {
  db.query("SELECT * FROM employee", function (error, results) {
    if (error) throw error;
    console.table(results);
    init();
  });
};

//adding new department to database
const addDepartment = () => {
  inquirer
    .prompt([
      {
        type: "input",
        message: "What is your new department name ? ",
        name: "newDepartment",
      },
    ])
    .then((response) => {
      db.query(
        "INSERT INTO department (dept_name) VALUES (?)",
        response.newDepartment,
        (error, res) => {
          if (error) {
            throw error;
          }
          if (res) {
            console.log(
              //if we want to see whole object use JSON.stringfy(res)
              "New Department " + response.newDepartment + " added to database. " +res.affectedRows+ " is added."
            );
          }
          init();
        }
      );
    });
};

//adding new role to database
const addRole = () => {
  const departments = [];

  db.query("SELECT * FROM department", (error, res) => {
   console.log(JSON.stringify(res));
    res.forEach((dept) => {
      let dep = {
        name: dept.dept_name,
        value: dept.id,
      };
      departments.push(dep);
    });
    inquirer
    .prompt([
      {
        type: "input",
        message: "what is your new role title? ",
        name: "newRole",
      },
      {
        type: "input",
        message: "what is the new salary for this role",
        name: "newSalary",
      },
      {
        type: "list",
        message: "what is the department for this role? ",
        name: 'selectedDept',
        choices: departments
      },
    ])
    .then((response) => {
      db.query(
        "INSERT INTO roles (title, salary, department_id) VALUES (?)",
        [[response.newRole, response.newSalary, response.selectedDept]],
        (error, response) => {
          if (error) throw error;
          console.log(JSON.stringify(response)+ " added ");
          init();
        }
      );
    });
  });
};

//adding new employee to database
const addEmployee = () => {
  const roles = [];
  db.query("SELECT * FROM roles", (error, res) => {
    if (error) throw error;
    //console.log(JSON.stringify(res));
    res.forEach((role) => {
      let newRole = {
        name: role.title,
        value: role.id,
      };
      roles.push(newRole);
    });
  });

  const managers = [];
  db.query("SELECT * FROM employee", (error, res) => {
    if (error) throw error;
    //console.log(JSON.stringify(res));
    res.forEach((emp) => {
      let manager = {
        name: emp.first_name + " " + emp.last_name,
        value: emp.manager_id,
      };
      managers.push(manager);
    });
    inquirer
    .prompt([
      {
        type: "input",
        message: "What is first name of new employee? ",
        name: "firstName",
      },
      {
        type: "input",
        message: "What is last name of new employee? ",
        name: "lastName",
      },
      {
        type: "list",
        message: "What is new employee role? ",
        name: "roleList",
        choices: roles,
      },
      {
        type: "list",
        message: "Who is the manager of new employee? ",
        name: "managerList",
        choices: managers,
      },
    ])
    .then((response) => {
      db.query(
        "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?)",
        [[
          response.firstName,
          response.lastName,
          response.roleList,
          response.managerList,
        ]],
        (error, response) => {
          if (error) throw error;
          console.log(
            `Added new employee to database`
          );
          init();
        }
      );
    });
  });
};

// function that will edit the employee
const updateEmployee = () => {
  const employee = [];
  const roles = [];
  // retrieving the data for the employees table to use in the prompt
  db.query("SELECT * FROM employee", (err, res) => {
    if (err) throw err;
    res.forEach((role) => {
      let manager = {
        name: role.first_name + " " + role.last_name,
        value: role.id,
      };
      employee.push(manager);
    });
    // retrieving the data for the roles table to use in the prompt
    db.query("SELECT * FROM roles", (err, res) => {
      if (err) throw err;

      res.forEach((role) => {
        let editRole = {
          name: role.title,
          value: role.id,
        };
        roles.push(editRole);
      });
    });
    inquirer
      .prompt([
        {
          type: "list",
          name: "employeeList",
          message: "Which employees role would you like to update?",
          choices: employee,
        },
        {
          type: "list",
          name: "roleList",
          message: "Which role would you like to assign the selected employee?",
          choices: roles,
        },
      ])
      .then((response) => {
        const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;
        const obj = [response.roleList, response.employeeList];

        db.query(sql, obj, function (err) {
          if (err) throw err;
          console.log(`Successfully updated employees role!`);
          init();
        });
      });
  });
};

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

init();
