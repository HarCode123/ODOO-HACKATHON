/**
 * Seeds the database with the same demo data the frontend used to mock
 * in-memory (departments, categories, employees, assets, etc).
 * Run with: npm run seed
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function seed() {
  const conn = await pool.getConnection();
  try {
    console.log('Clearing existing data...');
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    const tables = [
      'audit_items','audit_cycles','notifications','maintenance','bookings',
      'transfers','allocations','assets','employees','categories',
      'departments','activity_log'
    ];
    for (const t of tables) await conn.query(`TRUNCATE TABLE ${t}`);
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Seeding departments...');
    await conn.query(
      `INSERT INTO departments (id,name,head_id,parent_id,status) VALUES
       ('d1','Engineering',NULL,NULL,'Active'),
       ('d2','Facilities',NULL,NULL,'Active'),
       ('d3','Field Ops (East)',NULL,NULL,'Inactive'),
       ('d4','IT',NULL,NULL,'Active')`
    );

    console.log('Seeding categories...');
    await conn.query(
      `INSERT INTO categories (id,name,fields) VALUES
       ('c1','Electronics','Warranty period (months)'),
       ('c2','Furniture','Material'),
       ('c3','Vehicles','Registration No.'),
       ('c4','Facility Equipment','—')`
    );

    console.log('Seeding employees (with hashed passwords)...');
    const demoUsers = [
      { id: 'u1', name: 'Admin User', email: 'admin@assetflow.com', pass: 'admin123', dept: 'd1', role: 'Admin' },
      { id: 'e1', name: 'Haripriya', email: 'aditi.rao@company.com', pass: 'demo123', dept: 'd1', role: 'DeptHead' },
      { id: 'e2', name: 'Reena', email: 'rohan.mehta@company.com', pass: 'demo123', dept: 'd2', role: 'DeptHead' },
      { id: 'e3', name: 'Teju', email: 'sana.iqbal@company.com', pass: 'demo123', dept: 'd3', role: 'Employee' },
      { id: 'e4', name: 'Arjun', email: 'priya.shah@company.com', pass: 'demo123', dept: 'd1', role: 'Employee' },
      { id: 'e5', name: 'Harini', email: 'raj.verma@company.com', pass: 'demo123', dept: 'd1', role: 'AssetManager' },
      { id: 'e6', name: 'Arjun Nair', email: 'arjun.nair@company.com', pass: 'demo123', dept: 'd4', role: 'Employee' },
      { id: 'e7', name: 'Meera Krishnan', email: 'meera.k@company.com', pass: 'demo123', dept: 'd2', role: 'Employee' },
    ];
    for (const u of demoUsers) {
      const hash = await bcrypt.hash(u.pass, 10);
      await conn.query(
        `INSERT INTO employees (id,name,email,password_hash,dept_id,role,status) VALUES (?,?,?,?,?,?,'Active')`,
        [u.id, u.name, u.email, hash, u.dept, u.role]
      );
    }

    await conn.query(`UPDATE departments SET head_id='e1' WHERE id='d1'`);
    await conn.query(`UPDATE departments SET head_id='e2' WHERE id='d2'`);
    await conn.query(`UPDATE departments SET head_id='e3' WHERE id='d3'`);

    console.log('Seeding assets...');
    const assets = [
      ['a1','AF-0114','Dell Laptop','c1','SN-88213','2024-03-12',78000,'Good','Bengaluru HQ','Allocated',0,82,1],
      ['a2','AF-0012','Dell Laptop','c1','SN-88214','2023-11-02',76000,'Good','Bengaluru','Allocated',0,74,2],
      ['a3','AF-0062','Projector','c1','SN-55021','2022-06-18',42000,'Fair','HQ Floor 2','UnderMaintenance',1,38,4],
      ['a4','AF-0201','Office Chair','c2','SN-11987','2021-02-01',8500,'Good','Warehouse','Available',0,91,0],
      ['a5','AF-0003','AC Unit','c4','SN-33112','2020-08-14',52000,'Fair','HQ Floor 1','UnderMaintenance',0,29,5],
      ['a6','AF-0078','Forklift','c3','SN-90021','2019-05-09',410000,'Poor','Warehouse','UnderMaintenance',0,21,6],
      ['a7','AF-0197','Printer','c1','SN-77102','2023-01-22',18500,'Good','HQ Floor 2','UnderMaintenance',0,55,2],
      ['a8','AF-0973','Chair (Reception)','c2','SN-20044','2022-09-30',6200,'Good','HQ Lobby','Available',0,88,1],
      ['a9','AF-0021','Camera Tripod','c1','SN-44771','2021-12-11',9800,'Good','IT Store','Allocated',0,80,0],
      ['a10','AF-0301','Camera','c1','SN-44772','2021-12-11',64000,'Good','IT Store','Available',1,70,0],
      ['a11','AF-0088','Monitor','c1','SN-90210','2023-04-04',15500,'Damaged','Desk E15','Lost',0,12,3],
      ['a12','AF-0410','Reception Chair','c2','SN-10029','2020-01-15',5400,'Good','HQ Lobby','Available',0,66,0],
      ['a13','AF-0345','Delivery Van','c3','SN-VAN02','2021-07-19',1250000,'Good','Warehouse','Allocated',1,74,1],
      ['a14','AF-0055','Air Compressor','c4','SN-CMP01','2019-03-02',34000,'Fair','Facilities Store','UnderMaintenance',0,33,3],
      ['a15','CONF-B2','Conference Room B2','c4','—','2018-01-01',0,'Good','HQ Floor 3','Available',1,95,0],
    ];
    for (const a of assets) {
      await conn.query(
        `INSERT INTO assets (id,tag,name,category_id,serial,acq_date,cost,\`condition\`,location,status,bookable,score,maint_count)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`, a
      );
    }

    console.log('Seeding allocations...');
    await conn.query(
      `INSERT INTO allocations (id,asset_id,employee_id,dept_id,allocated_at,expected_return,returned_at,notes,status) VALUES
       ('al1','a1','e4','d1','2026-03-12','2026-07-20',NULL,'','Active'),
       ('al2','a2','e6','d4','2026-01-09','2026-06-01',NULL,'','Active'),
       ('al3','a9','e6','d4','2026-01-05','2026-07-01',NULL,'','Active'),
       ('al4','a13','e2','d2','2026-02-01','2026-08-01',NULL,'','Active'),
       ('al5','a1','e6','d4','2025-09-04','2026-01-04','2026-01-04','Condition good on return','Returned'),
       ('al6','a4','e7','d2','2025-11-01','2026-01-01','2026-01-04','Returned by Arjun Nair — condition good','Returned')`
    );

    console.log('Seeding transfers...');
    await conn.query(
      `INSERT INTO transfers (id,asset_id,from_id,to_id,reason,status,requested_at) VALUES
       ('t1','a2','e6','e4','','Requested','2026-07-10'),
       ('t2','a4','e7','d2','Department reallocation','Approved','2026-06-20')`
    );

    console.log('Seeding bookings...');
    await conn.query(
      `INSERT INTO bookings (id,asset_id,booked_by,start_time,end_time,status) VALUES
       ('b1','a15','e5','2026-07-14 09:00:00','2026-07-14 10:00:00','Upcoming'),
       ('b2','a13','e2','2026-07-13 14:00:00','2026-07-13 15:00:00','Upcoming')`
    );

    console.log('Seeding maintenance...');
    await conn.query(
      `INSERT INTO maintenance (id,asset_id,raised_by,issue,priority,status,technician,resolved_at) VALUES
       ('m1','a3','e4','Projector bulb not turning on','Medium','Pending',NULL,NULL),
       ('m2','a5','e2','AC unit noisy compressor','High','Approved',NULL,NULL),
       ('m3','a6','e5','Forklift parts ordered','High','TechnicianAssigned','V. Kumar',NULL),
       ('m4','a7','e6','Printer jam — parts ordered','Low','InProgress','R. Varma',NULL),
       ('m5','a8','e7','Chair repair resolved','Low','Resolved','R. Varma','2026-07-07')`
    );

    console.log('Seeding audit cycle...');
    await conn.query(
      `INSERT INTO audit_cycles (id,name,dept_id,location,start_date,end_date,auditor_id,status) VALUES
       ('au1','Q3 Audit: Engineering Dept','d1','HQ','2026-07-01','2026-07-15','e5','Open')`
    );
    await conn.query(
      `INSERT INTO audit_items (cycle_id,asset_id,expected_loc,verification,notes) VALUES
       ('au1','a2','Desk E12','Verified',''),
       ('au1','a4','Desk E14','Missing',''),
       ('au1','a11','Desk E15','Damaged','')`
    );

    console.log('Seeding notifications...');
    await conn.query(
      `INSERT INTO notifications (id,user_id,type,message,priority,is_read) VALUES
       ('n1',NULL,'Allocation','Laptop AF-0114 assigned to Priya Shah','info',0),
       ('n2',NULL,'Approval','Maintenance request AF-0055 approved','info',0),
       ('n3',NULL,'Booking','Booking confirmed: Room B2, 2:00–3:00 PM','info',1),
       ('n4',NULL,'Approval','Transfer approved: AF-0033 to Facilities dept','info',1),
       ('n5',NULL,'Alert','Overdue return: AF-0021 was due 3 days ago','high',0),
       ('n6',NULL,'Alert','Audit discrepancy flagged: AF-0088 damaged','high',0)`
    );

    console.log('Seeding activity log...');
    await conn.query(
      `INSERT INTO activity_log (user_name,action) VALUES
       ('Raj Verma','Registered asset AF-0301'),
       ('Priya Shah','Raised maintenance request for AF-0062'),
       ('Rohan Mehta','Approved transfer AF-0033 to Facilities'),
       ('Admin','Promoted Raj Verma to Asset Manager')`
    );

    console.log('✅ Seed complete. Demo logins:');
    console.log('   Admin:         admin@assetflow.com / admin123');
    console.log('   Asset Manager: raj.verma@company.com / demo123');
    console.log('   Dept Head:     aditi.rao@company.com / demo123');
    console.log('   Employee:      priya.shah@company.com / demo123');
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

seed();
