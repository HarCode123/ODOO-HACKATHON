// controllers/apiController.js
// Thin HTTP layer — reads req, calls a model function, writes res.
// Business rules that touch more than one table (e.g. allocating an asset
// also flips its status) live here, not in the model.

const {
  Roles, Departments, Employees, Categories, Assets, Allocations,
  Transfers, Bookings, Maintenance, Audit, Notifications, ActivityLog, Dashboard,
} = require('../models/apiModel');

// Small helper so every handler doesn't need its own try/catch
const wrap = (fn) => (req, res) => fn(req, res).catch((err) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Server error' });
});

/* ============================== Roles ============================== */
exports.getRoles = wrap(async (req, res) => res.json(await Roles.all()));

/* ============================== Departments ============================== */
exports.getDepartments = wrap(async (req, res) => res.json(await Departments.all()));
exports.createDepartment = wrap(async (req, res) => {
  const result = await Departments.create(req.body);
  await ActivityLog.add({ user_name: req.body.actor || 'System', action: `Created department ${req.body.name}` });
  res.status(201).json({ id: result.insertId });
});
exports.updateDepartment = wrap(async (req, res) => {
  await Departments.update(req.params.id, req.body);
  res.json({ ok: true });
});
exports.deleteDepartment = wrap(async (req, res) => {
  await Departments.remove(req.params.id);
  res.json({ ok: true });
});

/* ============================== Employees ============================== */
exports.getEmployees = wrap(async (req, res) => res.json(await Employees.all()));
exports.getEmployee = wrap(async (req, res) => {
  const rows = await Employees.byId(req.params.id);
  if (!rows.length) return res.status(404).json({ error: 'Employee not found' });
  res.json(rows[0]);
});
exports.createEmployee = wrap(async (req, res) => {
  const result = await Employees.create(req.body);
  res.status(201).json({ id: result.insertId });
});
exports.updateEmployeeRole = wrap(async (req, res) => {
  const { role_id } = req.body;
  await Employees.updateRole(req.params.id, role_id);
  const emp = (await Employees.byId(req.params.id))[0];
  await ActivityLog.add({ user_name: req.body.actor || 'Admin', action: `Promoted ${emp.name} to ${emp.role_name}` });
  await Notifications.create({ type: 'Approval', message: `${emp.name} role changed to ${emp.role_name}`, priority: 'info' });
  res.json({ ok: true, employee: emp });
});
exports.updateEmployee = wrap(async (req, res) => {
  await Employees.update(req.params.id, req.body);
  res.json({ ok: true });
});

/* ============================== Categories ============================== */
exports.getCategories = wrap(async (req, res) => res.json(await Categories.all()));
exports.createCategory = wrap(async (req, res) => {
  const result = await Categories.create(req.body);
  res.status(201).json({ id: result.insertId });
});

/* ============================== Assets ============================== */
exports.getAssets = wrap(async (req, res) => {
  const { q, status } = req.query;
  res.json(await Assets.all({ q, status }));
});
exports.getAsset = wrap(async (req, res) => {
  const rows = await Assets.byId(req.params.id);
  if (!rows.length) return res.status(404).json({ error: 'Asset not found' });
  const [allocations, maintenance] = await Promise.all([
    Allocations.byAsset(req.params.id),
    query_maintenanceForAsset(req.params.id),
  ]);
  res.json({ ...rows[0], allocationHistory: allocations, maintenanceHistory: maintenance });
});
async function query_maintenanceForAsset(assetId) {
  const all = await Maintenance.all();
  return all.filter((m) => String(m.asset_id) === String(assetId));
}
exports.createAsset = wrap(async (req, res) => {
  const tag = await Assets.nextTag();
  const result = await Assets.create({ ...req.body, tag });
  await ActivityLog.add({ user_name: req.body.actor || 'System', action: `Registered asset ${tag} (${req.body.name})` });
  await Notifications.create({ type: 'Allocation', message: `New asset registered: ${tag}`, priority: 'info' });
  res.status(201).json({ id: result.insertId, tag });
});
exports.updateAsset = wrap(async (req, res) => {
  await Assets.update(req.params.id, req.body);
  res.json({ ok: true });
});
exports.deleteAsset = wrap(async (req, res) => {
  await Assets.remove(req.params.id);
  res.json({ ok: true });
});

/* ============================== Allocation & transfer ============================== */
exports.getAllocations = wrap(async (req, res) => res.json(await Allocations.all()));

exports.allocateAsset = wrap(async (req, res) => {
  const { asset_id, employee_id, dept_id, expected_return, actor } = req.body;
  const active = await Allocations.activeForAsset(asset_id);
  if (active.length) {
    return res.status(409).json({ error: 'Asset is already allocated. Submit a transfer request instead.' });
  }
  const today = new Date().toISOString().slice(0, 10);
  await Allocations.create({ asset_id, employee_id, dept_id, allocated_at: today, expected_return });
  await Assets.updateStatus(asset_id, 'Allocated');
  const asset = (await Assets.byId(asset_id))[0];
  const emp = (await Employees.byId(employee_id))[0];
  await ActivityLog.add({ user_name: actor || 'System', action: `Allocated ${asset.tag} to ${emp.name}` });
  await Notifications.create({ type: 'Allocation', message: `${asset.tag} allocated to ${emp.name}`, priority: 'info' });
  res.status(201).json({ ok: true });
});

exports.returnAsset = wrap(async (req, res) => {
  const { allocation_id, notes, actor } = req.body;
  const today = new Date().toISOString().slice(0, 10);

  // look up the allocation first so we know which asset to flip back to Available
  const allocRows = await Allocations.all();
  const match = allocRows.find((a) => String(a.id) === String(allocation_id));
  if (!match) return res.status(404).json({ error: 'Allocation not found' });

  await Allocations.markReturned(allocation_id, { returned_at: today, notes });
  await Assets.updateStatus(match.asset_id, 'Available');
  await ActivityLog.add({ user_name: actor || 'System', action: `${match.tag} returned by ${match.employee_name}` });
  res.json({ ok: true });
});

exports.getTransfers = wrap(async (req, res) => res.json(await Transfers.all()));
exports.getPendingTransfers = wrap(async (req, res) => res.json(await Transfers.pending()));

exports.requestTransfer = wrap(async (req, res) => {
  const { asset_id, from_employee_id, to_employee_id, reason, actor } = req.body;
  const today = new Date().toISOString().slice(0, 10);
  await Transfers.create({ asset_id, from_employee_id, to_employee_id, reason, requested_at: today });
  const asset = (await Assets.byId(asset_id))[0];
  await ActivityLog.add({ user_name: actor || 'System', action: `Transfer requested for ${asset.tag}` });
  res.status(201).json({ ok: true });
});

exports.approveTransfer = wrap(async (req, res) => {
  const transferRows = await Transfers.byId(req.params.id);
  if (!transferRows.length) return res.status(404).json({ error: 'Transfer not found' });
  const transfer = transferRows[0];
  await Transfers.setStatus(transfer.id, 'Approved');

  const active = await Allocations.activeForAsset(transfer.asset_id);
  const today = new Date().toISOString().slice(0, 10);
  if (active.length) {
    await Allocations.markReturned(active[0].id, { returned_at: today, notes: '' });
  }
  const toEmp = (await Employees.byId(transfer.to_employee_id))[0];
  await Allocations.create({
    asset_id: transfer.asset_id,
    employee_id: transfer.to_employee_id,
    dept_id: toEmp ? toEmp.dept_id : null,
    allocated_at: today,
    expected_return: null,
  });
  const asset = (await Assets.byId(transfer.asset_id))[0];
  await ActivityLog.add({ user_name: req.body.actor || 'System', action: `Transfer approved: ${asset.tag} → ${toEmp ? toEmp.name : ''}` });
  await Notifications.create({ type: 'Approval', message: `Transfer approved: ${asset.tag} to ${toEmp ? toEmp.name : ''}`, priority: 'info' });
  res.json({ ok: true });
});

exports.rejectTransfer = wrap(async (req, res) => {
  await Transfers.setStatus(req.params.id, 'Rejected');
  res.json({ ok: true });
});

/* ============================== Bookings ============================== */
exports.getBookableAssets = wrap(async (req, res) => res.json(await Bookings.bookableAssets()));
exports.getBookingsForDay = wrap(async (req, res) => {
  const { assetId, date } = req.query;
  res.json(await Bookings.byAssetAndDate(assetId, date));
});
exports.createBooking = wrap(async (req, res) => {
  const { asset_id, booked_by, start_time, end_time } = req.body;
  if (!start_time || !end_time || start_time >= end_time) {
    return res.status(400).json({ error: 'Enter a valid time range.' });
  }
  const overlap = await Bookings.overlapping(asset_id, start_time, end_time);
  if (overlap.length) {
    return res.status(409).json({ error: 'Requested time overlaps an existing booking.' });
  }
  await Bookings.create({ asset_id, booked_by, start_time, end_time });
  const asset = (await Assets.byId(asset_id))[0];
  await ActivityLog.add({ user_name: req.body.actor || 'System', action: `Booked ${asset.name} ${start_time}–${end_time}` });
  await Notifications.create({ type: 'Booking', message: `Booking confirmed: ${asset.name}`, priority: 'info' });
  res.status(201).json({ ok: true });
});
exports.cancelBooking = wrap(async (req, res) => {
  await Bookings.cancel(req.params.id);
  res.json({ ok: true });
});

/* ============================== Maintenance ============================== */
exports.getMaintenance = wrap(async (req, res) => res.json(await Maintenance.all()));
exports.createMaintenance = wrap(async (req, res) => {
  console.log("Maintenance request received:", req.body);

  const { asset_id, raised_by, issue, priority, actor } = req.body;

  const result = await Maintenance.create({
    asset_id,
    raised_by,
    issue,
    priority
  });

  console.log("Inserted ID:", result.insertId);

  const asset = (await Assets.byId(asset_id))[0];

  await ActivityLog.add({
    user_name: actor || 'System',
    action: `Raised maintenance request for ${asset.tag}`
  });

  await Notifications.create({
    type: 'Alert',
    message: `Maintenance requested for ${asset.tag}`,
    priority: 'info'
  });

  res.status(201).json({ id: result.insertId });
});
exports.updateMaintenanceStatus = wrap(async (req, res) => {
  const { status, technician, actor } = req.body;
  const reqRows = await Maintenance.byId(req.params.id);
  if (!reqRows.length) return res.status(404).json({ error: 'Request not found' });
  const request = reqRows[0];

  await Maintenance.setStatus(request.id, status, technician || null);
  await Maintenance.addHistory({ request_id: request.id, asset_id: request.asset_id, action: `Moved to ${status}` });

  const asset = (await Assets.byId(request.asset_id))[0];
  if (status === 'Approved') {
    await Assets.updateStatus(request.asset_id, 'UnderMaintenance');
    await Notifications.create({ type: 'Approval', message: `Maintenance approved for ${asset.tag}`, priority: 'info' });
  }
  if (status === 'Resolved') {
    const today = new Date().toISOString().slice(0, 10);
    await Maintenance.resolve(request.id, today);
    await Assets.updateStatus(request.asset_id, 'Available');
    await Assets.incrementMaintCount(request.asset_id);
    await Notifications.create({ type: 'Approval', message: `Maintenance resolved for ${asset.tag}`, priority: 'info' });
  }
  await ActivityLog.add({ user_name: actor || 'System', action: `${asset.tag} maintenance moved to ${status}` });
  res.json({ ok: true });
});

/* ============================== Audit ============================== */
exports.getAuditCycles = wrap(async (req, res) => res.json(await Audit.cycles()));
exports.getAuditCycle = wrap(async (req, res) => {
  const cycleRows = await Audit.cycleById(req.params.id);
  if (!cycleRows.length) return res.status(404).json({ error: 'Cycle not found' });
  const items = await Audit.itemsForCycle(req.params.id);
  res.json({ ...cycleRows[0], items });
});
exports.createAuditCycle = wrap(async (req, res) => {
  const { name, dept_id, location, start_date, end_date, assetIds, actor } = req.body;
  const cycleId = await Audit.createCycle({ name, dept_id, location, start_date, end_date, assetIds });
  await ActivityLog.add({ user_name: actor || 'System', action: `Created audit cycle: ${name}` });
  res.status(201).json({ id: cycleId });
});
exports.setAuditItemVerification = wrap(async (req, res) => {
  await Audit.setItemVerification(req.params.itemId, req.body.verification);
  res.json({ ok: true });
});
exports.closeAuditCycle = wrap(async (req, res) => {
  await Audit.closeCycle(req.params.id);
  const items = await Audit.itemsForCycle(req.params.id);
  for (const item of items) {
    if (item.verification === 'Missing') {
      await Assets.updateStatus(item.asset_id, 'Lost');
    }
  }
  const flagged = items.filter((i) => i.verification !== 'Verified').length;
  const cycle = (await Audit.cycleById(req.params.id))[0];
  await ActivityLog.add({ user_name: req.body.actor || 'System', action: `Closed audit cycle: ${cycle.name}` });
  await Notifications.create({ type: 'Alert', message: `Audit cycle closed: ${cycle.name} — ${flagged} discrepancies`, priority: 'high' });
  res.json({ ok: true, flagged });
});

/* ============================== Notifications & activity ============================== */
exports.getNotifications = wrap(async (req, res) => res.json(await Notifications.all()));
exports.markNotificationsRead = wrap(async (req, res) => {
  await Notifications.markAllRead();
  res.json({ ok: true });
});
exports.getActivityLog = wrap(async (req, res) => res.json(await ActivityLog.all()));

/* ============================== Dashboard & reports ============================== */
exports.getDashboard = wrap(async (req, res) => {
  const [kpis, overdue] = await Promise.all([Dashboard.kpis(), Dashboard.overdueReturns()]);
  res.json({ kpis, overdue });
});

exports.getReports = wrap(async (req, res) => {
  const [departments, categories, assets] = await Promise.all([Departments.all(), Categories.all(), Assets.all()]);
  const allocations = await Allocations.activeAll();

  const deptAlloc = departments.map((d) => ({
    name: d.name,
    count: allocations.filter((a) => String(a.dept_id) === String(d.id)).length,
  }));
  const catMaint = categories.map((c) => ({
    name: c.name,
    count: assets.filter((a) => String(a.category_id) === String(c.id)).reduce((s, a) => s + a.maintenance_count, 0),
  }));
  const mostUsed = [...assets].sort((a, b) => b.maintenance_count - a.maintenance_count).slice(0, 3);
  const idle = assets.filter((a) => a.status === 'Available').sort((a, b) => a.health_score - b.health_score).slice(0, 3);
  const nearRetirement = [...assets].sort((a, b) => a.health_score - b.health_score).slice(0, 3);

  res.json({ deptAlloc, catMaint, mostUsed, idle, nearRetirement });
});