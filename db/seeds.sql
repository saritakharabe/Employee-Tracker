INSERT INTO department (dept_name)
VALUES ("Engineering"), ("Sales"),("Legal"), ("Finance");

INSERT INTO roles (title, salary, department_id)
VALUES ("Software Engineer", 100000, 1),
        ("Full Stack Developer", 125000, 2),
        ("Junior Engineer", 100000, 2),
        ("Accountant", 120000, 3),
        ("Lawyer", 190000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Sarita", "Kharabe", 1, NULL),
        ("Dattatri", "Patil", 2, 1),
        ("Heena", "Shaik", 3, 1),
        ("Prats", "Nar", 4, 2);    