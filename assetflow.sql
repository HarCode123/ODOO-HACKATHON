-- =========================================================================
-- AssetFlow — MySQL schema + seed data
-- Matches the tables already created in your `assetflow` database:
-- roles, departments, employees, asset_categories, assets, asset_allocations,
-- transfer_requests, resource_bookings, maintenance_requests,
-- maintenance_history, audit_cycles, audit_items, notifications, activity_logs
-- =========================================================================

CREATE DATABASE IF NOT EXISTS assetflow;
USE assetflow;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS audit_items;
DROP TABLE IF EXISTS audit_cycles;
DROP TABLE IF EXISTS maintenance_history;
DROP TABLE IF EXISTS maintenance_requests;
DROP TABLE IF EXISTS resource_bookings;
DROP TABLE IF EXISTS transfer_requests;
DROP TABLE IF EXISTS asset_allocations;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS asset_categories;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS roles;

-- ------------------------------------------------------------------ roles
CREATE TABLE roles (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) NOT NULL UNIQUE   -- Admin, AssetManager, DeptHead, Employee
);

-- ------------------------------------------------------------ departments
CREATE TABLE departments (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(120) NOT NULL,
  head_id   INT NULL,                 -- FK to employees, added after employees exists
  parent_id INT NULL,
  status    ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  CONSTRAINT fk_dept_parent FOREIGN KEY (parent_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- -------------------------------------------------------------- employees
CREATE TABLE employees (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  name     VARCHAR(120) NOT NULL,
  email    VARCHAR(160) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL DEFAULT '',   -- bcrypt hash
  dept_id  INT NULL,
  role_id  INT NULL,
  status   ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_emp_dept FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE SET NULL,
  CONSTRAINT fk_emp_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);

ALTER TABLE departments
  ADD CONSTRAINT fk_dept_head FOREIGN KEY (head_id) REFERENCES employees(id) ON DELETE SET NULL;

-- --------------------------------------------------------- asset_categories
CREATE TABLE asset_categories (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(120) NOT NULL,
  custom_fields VARCHAR(255) DEFAULT '—'
);

-- ------------------------------------------------------------------ assets
CREATE TABLE assets (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  tag                VARCHAR(30) NOT NULL UNIQUE,
  name               VARCHAR(150) NOT NULL,
  category_id        INT NULL,
  serial_number      VARCHAR(80) DEFAULT '—',
  acquisition_date   DATE NULL,
  acquisition_cost   DECIMAL(12,2) DEFAULT 0,
  condition_status   ENUM('Good','Fair','Poor','Damaged') DEFAULT 'Good',
  location           VARCHAR(150) DEFAULT 'Unassigned',
  status             ENUM('Available','Allocated','Reserved','UnderMaintenance','Lost','Retired','Disposed') NOT NULL DEFAULT 'Available',
  bookable           TINYINT(1) NOT NULL DEFAULT 0,
  health_score       INT NOT NULL DEFAULT 85,
  maintenance_count  INT NOT NULL DEFAULT 0,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_asset_category FOREIGN KEY (category_id) REFERENCES asset_categories(id) ON DELETE SET NULL
);

-- ----------------------------------------------------------- asset_allocations
CREATE TABLE asset_allocations (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  asset_id        INT NOT NULL,
  employee_id     INT NOT NULL,
  dept_id         INT NULL,
  allocated_at    DATE NOT NULL,
  expected_return DATE NULL,
  returned_at     DATE NULL,
  notes           VARCHAR(500) DEFAULT '',
  status          ENUM('Active','Returned') NOT NULL DEFAULT 'Active',
  CONSTRAINT fk_alloc_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  CONSTRAINT fk_alloc_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  CONSTRAINT fk_alloc_dept FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- ----------------------------------------------------------- transfer_requests
CREATE TABLE transfer_requests (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  asset_id        INT NOT NULL,
  from_employee_id INT NULL,
  to_employee_id  INT NULL,
  reason          VARCHAR(500) DEFAULT '',
  status          ENUM('Requested','Approved','Rejected') NOT NULL DEFAULT 'Requested',
  requested_at    DATE NOT NULL,
  CONSTRAINT fk_transfer_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  CONSTRAINT fk_transfer_from FOREIGN KEY (from_employee_id) REFERENCES employees(id) ON DELETE SET NULL,
  CONSTRAINT fk_transfer_to FOREIGN KEY (to_employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- ----------------------------------------------------------- resource_bookings
CREATE TABLE resource_bookings (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  asset_id   INT NOT NULL,
  booked_by  INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time   DATETIME NOT NULL,
  status     ENUM('Upcoming','Ongoing','Completed','Cancelled') NOT NULL DEFAULT 'Upcoming',
  CONSTRAINT fk_booking_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_emp FOREIGN KEY (booked_by) REFERENCES employees(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------- maintenance_requests
CREATE TABLE maintenance_requests (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  asset_id    INT NOT NULL,
  raised_by   INT NULL,
  issue       VARCHAR(500) NOT NULL,
  priority    ENUM('Low','Medium','High') NOT NULL DEFAULT 'Low',
  status      ENUM('Pending','Approved','TechnicianAssigned','InProgress','Resolved') NOT NULL DEFAULT 'Pending',
  technician  VARCHAR(120) NULL,
  resolved_at DATE NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_maint_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  CONSTRAINT fk_maint_emp FOREIGN KEY (raised_by) REFERENCES employees(id) ON DELETE SET NULL
);

-- ----------------------------------------------------------- maintenance_history
-- One row per status change on a maintenance_request — powers the kanban audit trail
CREATE TABLE maintenance_history (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  request_id  INT NOT NULL,
  asset_id    INT NOT NULL,
  action      VARCHAR(255) NOT NULL,   -- e.g. "Moved to Approved"
  notes       VARCHAR(500) DEFAULT '',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mhist_request FOREIGN KEY (request_id) REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  CONSTRAINT fk_mhist_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------- audit_cycles
CREATE TABLE audit_cycles (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(150) NOT NULL,
  dept_id    INT NULL,
  location   VARCHAR(150) DEFAULT 'HQ',
  start_date DATE NOT NULL,
  end_date   DATE NOT NULL,
  status     ENUM('Open','Closed') NOT NULL DEFAULT 'Open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_dept FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- ----------------------------------------------------------- audit_items
CREATE TABLE audit_items (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  cycle_id       INT NOT NULL,
  asset_id       INT NOT NULL,
  expected_loc   VARCHAR(150) DEFAULT '',
  verification   ENUM('Verified','Missing','Damaged') NOT NULL DEFAULT 'Verified',
  notes          VARCHAR(500) DEFAULT '',
  CONSTRAINT fk_item_cycle FOREIGN KEY (cycle_id) REFERENCES audit_cycles(id) ON DELETE CASCADE,
  CONSTRAINT fk_item_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------- notifications
CREATE TABLE notifications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  type       VARCHAR(40) NOT NULL,      -- Allocation, Approval, Booking, Alert
  message    VARCHAR(500) NOT NULL,
  priority   ENUM('info','high') NOT NULL DEFAULT 'info',
  is_read    TINYINT(1) NOT NULL DEFAULT 0,
  user_id    INT NULL,                  -- NULL = broadcast to everyone
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------- activity_logs
CREATE TABLE activity_logs (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_name  VARCHAR(120) NOT NULL,
  action     VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================================
-- SEED DATA — mirrors the in-memory demo data in app.js
-- =========================================================================

INSERT INTO roles (name) VALUES ('Admin'),('AssetManager'),('DeptHead'),('Employee');

-- departments (head_id filled in after employees are inserted)
INSERT INTO departments (id, name, head_id, parent_id, status) VALUES
(1,'Engineering',NULL,NULL,'Active'),
(2,'Facilities',NULL,NULL,'Active'),
(3,'Field Ops (East)',NULL,NULL,'Inactive'),
(4,'IT',NULL,NULL,'Active');

-- employees  (password is bcrypt hash of "demo123" / "admin123" — replace via your own seeding in production)
INSERT INTO employees (id, name, email, password, dept_id, role_id, status) VALUES
(1,'Aditi Rao','aditi.rao@company.com','',1,3,'Active'),
(2,'Rohan Mehta','rohan.mehta@company.com','',2,3,'Active'),
(3,'Sana Iqbal','sana.iqbal@company.com','',3,4,'Inactive'),
(4,'Priya Shah','priya.shah@company.com','',1,4,'Active'),
(5,'Raj Verma','raj.verma@company.com','',1,2,'Active'),
(6,'Arjun Nair','arjun.nair@company.com','',4,4,'Active'),
(7,'Meera Krishnan','meera.k@company.com','',2,4,'Active'),
(8,'Admin User','admin@assetflow.com','',NULL,1,'Active');

UPDATE departments SET head_id = 1 WHERE id = 1;
UPDATE departments SET head_id = 2 WHERE id = 2;
UPDATE departments SET head_id = 3 WHERE id = 3;
-- IT has no head in the demo data

-- asset_categories
INSERT INTO asset_categories (id, name, custom_fields) VALUES
(1,'Electronics','Warranty period (months)'),
(2,'Furniture','Material'),
(3,'Vehicles','Registration No.'),
(4,'Facility Equipment','—');

-- assets
INSERT INTO assets (id, tag, name, category_id, serial_number, acquisition_date, acquisition_cost, condition_status, location, status, bookable, health_score, maintenance_count) VALUES
(1,'AF-0114','Dell Laptop',1,'SN-88213','2024-03-12',78000,'Good','Bengaluru HQ','Allocated',0,82,1),
(2,'AF-0012','Dell Laptop',1,'SN-88214','2023-11-02',76000,'Good','Bengaluru','Allocated',0,74,2),
(3,'AF-0062','Projector',1,'SN-55021','2022-06-18',42000,'Fair','HQ Floor 2','UnderMaintenance',1,38,4),
(4,'AF-0201','Office Chair',2,'SN-11987','2021-02-01',8500,'Good','Warehouse','Available',0,91,0),
(5,'AF-0003','AC Unit',4,'SN-33112','2020-08-14',52000,'Fair','HQ Floor 1','UnderMaintenance',0,29,5),
(6,'AF-0078','Forklift',3,'SN-90021','2019-05-09',410000,'Poor','Warehouse','UnderMaintenance',0,21,6),
(7,'AF-0197','Printer',1,'SN-77102','2023-01-22',18500,'Good','HQ Floor 2','UnderMaintenance',0,55,2),
(8,'AF-0973','Chair (Reception)',2,'SN-20044','2022-09-30',6200,'Good','HQ Lobby','Available',0,88,1),
(9,'AF-0021','Camera Tripod',1,'SN-44771','2021-12-11',9800,'Good','IT Store','Allocated',0,80,0),
(10,'AF-0301','Camera',1,'SN-44772','2021-12-11',64000,'Good','IT Store','Available',1,70,0),
(11,'AF-0088','Monitor',1,'SN-90210','2023-04-04',15500,'Damaged','Desk E15','Lost',0,12,3),
(12,'AF-0410','Reception Chair',2,'SN-10029','2020-01-15',5400,'Good','HQ Lobby','Available',0,66,0),
(13,'AF-0345','Delivery Van',3,'SN-VAN02','2021-07-19',1250000,'Good','Warehouse','Allocated',1,74,1),
(14,'AF-0055','Air Compressor',4,'SN-CMP01','2019-03-02',34000,'Fair','Facilities Store','UnderMaintenance',0,33,3),
(15,'CONF-B2','Conference Room B2',4,'—','2018-01-01',0,'Good','HQ Floor 3','Available',1,95,0);

-- asset_allocations
INSERT INTO asset_allocations (id, asset_id, employee_id, dept_id, allocated_at, expected_return, returned_at, notes, status) VALUES
(1,1,4,1,'2026-03-12','2026-07-20',NULL,'','Active'),
(2,2,6,4,'2026-01-09','2026-06-01',NULL,'','Active'),
(3,9,6,4,'2026-01-05','2026-07-01',NULL,'','Active'),
(4,13,2,2,'2026-02-01','2026-08-01',NULL,'','Active'),
(5,1,6,4,'2025-09-04','2026-01-04','2026-01-04','Condition good on return','Returned'),
(6,4,7,2,'2025-11-01','2026-01-01','2026-01-04','Returned by Arjun Nair — condition good','Returned');

-- transfer_requests
INSERT INTO transfer_requests (id, asset_id, from_employee_id, to_employee_id, reason, status, requested_at) VALUES
(1,2,6,4,'','Requested','2026-07-10'),
(2,4,7,NULL,'Department reallocation','Approved','2026-06-20');

-- resource_bookings
INSERT INTO resource_bookings (id, asset_id, booked_by, start_time, end_time, status) VALUES
(1,15,5,'2026-07-14 09:00:00','2026-07-14 10:00:00','Upcoming'),
(2,13,2,'2026-07-13 14:00:00','2026-07-13 15:00:00','Upcoming');

-- maintenance_requests
INSERT INTO maintenance_requests (id, asset_id, raised_by, issue, priority, status, technician, resolved_at) VALUES
(1,3,4,'Projector bulb not turning on','Medium','Pending',NULL,NULL),
(2,5,2,'AC unit noisy compressor','High','Approved',NULL,NULL),
(3,6,5,'Forklift ports ordered','High','TechnicianAssigned','V. Kumar',NULL),
(4,7,6,'Printer jam — parts ordered','Low','InProgress','R. Varma',NULL),
(5,8,7,'Chair repair resolved','Low','Resolved','R. Varma','2026-07-07');

-- audit_cycles + audit_items
INSERT INTO audit_cycles (id, name, dept_id, location, start_date, end_date, status) VALUES
(1,'Q3 Audit: Engineering Dept',1,'HQ','2026-07-01','2026-07-15','Open');

INSERT INTO audit_items (id, cycle_id, asset_id, expected_loc, verification, notes) VALUES
(1,1,2,'Desk E12','Verified',''),
(2,1,4,'Desk E14','Missing',''),
(3,1,11,'Desk E15','Damaged','');

-- notifications
INSERT INTO notifications (id, type, message, priority, is_read) VALUES
(1,'Allocation','Laptop AF-0114 assigned to Priya Shah','info',0),
(2,'Approval','Maintenance request AF-0055 approved','info',0),
(3,'Booking','Booking confirmed: Room B2, 2:00–3:00 PM','info',1),
(4,'Approval','Transfer approved: AF-0033 to Facilities dept','info',1),
(5,'Alert','Overdue return: AF-0021 was due 3 days ago','high',0),
(6,'Alert','Audit discrepancy flagged: AF-0088 damaged','high',0);

-- activity_logs
INSERT INTO activity_logs (id, user_name, action, created_at) VALUES
(1,'Raj Verma','Registered asset AF-0301','2026-07-12 09:14:00'),
(2,'Priya Shah','Raised maintenance request for AF-0062','2026-07-11 16:02:00'),
(3,'Rohan Mehta','Approved transfer AF-0033 to Facilities','2026-07-11 11:47:00'),
(4,'Admin','Promoted Raj Verma to Asset Manager','2026-07-10 10:00:00');