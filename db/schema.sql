-- =========================================================================
-- ASSETFLOW — MySQL schema
-- Run with:  mysql -u root -p < db/schema.sql
-- =========================================================================

CREATE DATABASE IF NOT EXISTS assetflow CHARACTER SET utf8mb4;
USE assetflow;

-- ---------------------------------------------------------------------
-- Departments
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
  id           VARCHAR(20)  PRIMARY KEY,
  name         VARCHAR(120) NOT NULL,
  head_id      VARCHAR(20)  NULL,
  parent_id    VARCHAR(20)  NULL,
  status       ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- ---------------------------------------------------------------------
-- Asset categories
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id           VARCHAR(20)  PRIMARY KEY,
  name         VARCHAR(120) NOT NULL,
  fields       VARCHAR(255) DEFAULT '—',
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- Users / Employees  (one table drives both login and the directory)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employees (
  id            VARCHAR(20)  PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  dept_id       VARCHAR(20)  NULL,
  role          ENUM('Admin','AssetManager','DeptHead','Employee') NOT NULL DEFAULT 'Employee',
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE SET NULL
);

ALTER TABLE departments
  ADD CONSTRAINT fk_dept_head FOREIGN KEY (head_id) REFERENCES employees(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------
-- Assets
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assets (
  id           VARCHAR(20)  PRIMARY KEY,
  tag          VARCHAR(40)  NOT NULL UNIQUE,
  name         VARCHAR(150) NOT NULL,
  category_id  VARCHAR(20)  NULL,
  serial       VARCHAR(80)  DEFAULT '—',
  acq_date     DATE         NULL,
  cost         DECIMAL(12,2) DEFAULT 0,
  `condition`  ENUM('Good','Fair','Poor','Damaged') DEFAULT 'Good',
  location     VARCHAR(150) DEFAULT 'Unassigned',
  status       ENUM('Available','Allocated','Reserved','UnderMaintenance','Lost','Retired','Disposed') NOT NULL DEFAULT 'Available',
  bookable     TINYINT(1) DEFAULT 0,
  score        INT DEFAULT 100,
  maint_count  INT DEFAULT 0,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ---------------------------------------------------------------------
-- Allocations (asset <-> employee assignment history)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS allocations (
  id              VARCHAR(20) PRIMARY KEY,
  asset_id        VARCHAR(20) NOT NULL,
  employee_id     VARCHAR(20) NOT NULL,
  dept_id         VARCHAR(20) NULL,
  allocated_at    DATE NOT NULL,
  expected_return DATE NULL,
  returned_at     DATE NULL,
  notes           VARCHAR(255) DEFAULT '',
  status          ENUM('Active','Returned') NOT NULL DEFAULT 'Active',
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- ---------------------------------------------------------------------
-- Transfers (asset moved between employees / departments)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transfers (
  id            VARCHAR(20) PRIMARY KEY,
  asset_id      VARCHAR(20) NOT NULL,
  from_id       VARCHAR(20) NULL,
  to_id         VARCHAR(20) NULL,
  reason        VARCHAR(255) DEFAULT '',
  status        ENUM('Requested','Approved','Rejected') NOT NULL DEFAULT 'Requested',
  requested_at  DATE NOT NULL,
  decided_at    DATE NULL,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- Bookings (bookable assets / rooms)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  id          VARCHAR(20) PRIMARY KEY,
  asset_id    VARCHAR(20) NOT NULL,
  booked_by   VARCHAR(20) NOT NULL,
  start_time  DATETIME NOT NULL,
  end_time    DATETIME NOT NULL,
  status      ENUM('Upcoming','Ongoing','Completed','Cancelled') NOT NULL DEFAULT 'Upcoming',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY (booked_by) REFERENCES employees(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- Maintenance requests
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS maintenance (
  id           VARCHAR(20) PRIMARY KEY,
  asset_id     VARCHAR(20) NOT NULL,
  raised_by    VARCHAR(20) NOT NULL,
  issue        VARCHAR(500) NOT NULL,
  priority     ENUM('Low','Medium','High') DEFAULT 'Medium',
  status       ENUM('Pending','Approved','TechnicianAssigned','InProgress','Resolved','Rejected') NOT NULL DEFAULT 'Pending',
  technician   VARCHAR(120) NULL,
  resolved_at  DATE NULL,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY (raised_by) REFERENCES employees(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- Audit cycles + audit items
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_cycles (
  id          VARCHAR(20) PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  dept_id     VARCHAR(20) NULL,
  location    VARCHAR(150) DEFAULT 'HQ',
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  auditor_id  VARCHAR(20) NULL,
  status      ENUM('Open','Closed') NOT NULL DEFAULT 'Open',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE SET NULL,
  FOREIGN KEY (auditor_id) REFERENCES employees(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS audit_items (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  cycle_id      VARCHAR(20) NOT NULL,
  asset_id      VARCHAR(20) NOT NULL,
  expected_loc  VARCHAR(150) DEFAULT '',
  verification  ENUM('Verified','Missing','Damaged') DEFAULT 'Verified',
  notes         VARCHAR(255) DEFAULT '',
  FOREIGN KEY (cycle_id) REFERENCES audit_cycles(id) ON DELETE CASCADE,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id          VARCHAR(20) PRIMARY KEY,
  user_id     VARCHAR(20) NULL,
  type        ENUM('Allocation','Approval','Booking','Alert') NOT NULL,
  message     VARCHAR(500) NOT NULL,
  priority    ENUM('info','high') DEFAULT 'info',
  is_read     TINYINT(1) DEFAULT 0,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- Activity log
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_log (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_name   VARCHAR(120) NOT NULL,
  action      VARCHAR(500) NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_alloc_status ON allocations(status);
CREATE INDEX idx_maint_status ON maintenance(status);
CREATE INDEX idx_bookings_asset ON bookings(asset_id, start_time, end_time);
