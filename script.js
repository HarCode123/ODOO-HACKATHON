
/* =========================================================================
   ASSETFLOW — full client-side demo application (in-memory state, no build step)
   ========================================================================= */

const ICONS = {
  dashboard:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
  org:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="6" r="3"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>',
  assets:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  alloc:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
  booking:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  maint:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a4 4 0 1 1-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 1 1 5.4-5.4z"/></svg>',
  audit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
  reports:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13"/></svg>',
  notif:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>',
  bell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>',
  ai:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/><circle cx="12" cy="12" r="3"/></svg>',
  send:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>',
  qr:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z"/></svg>',
};

function svg(name){return ICONS[name]||'';}

/* ---------------------------- Seed data ---------------------------- */
function seed(){
  const departments = [
    {id:'d1',name:'Engineering',headId:'e1',parent:null,status:'Active'},
    {id:'d2',name:'Facilities',headId:'e2',parent:null,status:'Active'},
    {id:'d3',name:'Field Ops (East)',headId:'e3',parent:null,status:'Inactive'},
    {id:'d4',name:'IT',headId:'e4',parent:null,status:'Active'},
  ];
  const categories = [
    {id:'c1',name:'Electronics',fields:'Warranty period (months)'},
    {id:'c2',name:'Furniture',fields:'Material'},
    {id:'c3',name:'Vehicles',fields:'Registration No.'},
    {id:'c4',name:'Facility Equipment',fields:'—'},
  ];
  const employees = [
    {id:'e1',name:'Aditi Rao',email:'aditi.rao@company.com',dept:'d1',role:'DeptHead',status:'Active'},
    {id:'e2',name:'Rohan Mehta',email:'rohan.mehta@company.com',dept:'d2',role:'DeptHead',status:'Active'},
    {id:'e3',name:'Sana Iqbal',email:'sana.iqbal@company.com',dept:'d3',role:'Employee',status:'Inactive'},
    {id:'e4',name:'Priya Shah',email:'priya.shah@company.com',dept:'d1',role:'Employee',status:'Active'},
    {id:'e5',name:'Raj Verma',email:'raj.verma@company.com',dept:'d1',role:'AssetManager',status:'Active'},
    {id:'e6',name:'Arjun Nair',email:'arjun.nair@company.com',dept:'d4',role:'Employee',status:'Active'},
    {id:'e7',name:'Meera Krishnan',email:'meera.k@company.com',dept:'d2',role:'Employee',status:'Active'},
  ];
  const assets = [
    {id:'a1',tag:'AF-0114',name:'Dell Laptop',category:'c1',serial:'SN-88213',acqDate:'2024-03-12',cost:78000,condition:'Good',location:'Bengaluru HQ',status:'Allocated',bookable:false,score:82,maintCount:1},
    {id:'a2',tag:'AF-0012',name:'Dell Laptop',category:'c1',serial:'SN-88214',acqDate:'2023-11-02',cost:76000,condition:'Good',location:'Bengaluru',status:'Allocated',bookable:false,score:74,maintCount:2},
    {id:'a3',tag:'AF-0062',name:'Projector',category:'c1',serial:'SN-55021',acqDate:'2022-06-18',cost:42000,condition:'Fair',location:'HQ Floor 2',status:'UnderMaintenance',bookable:true,score:38,maintCount:4},
    {id:'a4',tag:'AF-0201',name:'Office Chair',category:'c2',serial:'SN-11987',acqDate:'2021-02-01',cost:8500,condition:'Good',location:'Warehouse',status:'Available',bookable:false,score:91,maintCount:0},
    {id:'a5',tag:'AF-0003',name:'AC Unit',category:'c4',serial:'SN-33112',acqDate:'2020-08-14',cost:52000,condition:'Fair',location:'HQ Floor 1',status:'UnderMaintenance',bookable:false,score:29,maintCount:5},
    {id:'a6',tag:'AF-0078',name:'Forklift',category:'c3',serial:'SN-90021',acqDate:'2019-05-09',cost:410000,condition:'Poor',location:'Warehouse',status:'UnderMaintenance',bookable:false,score:21,maintCount:6},
    {id:'a7',tag:'AF-0197',name:'Printer',category:'c1',serial:'SN-77102',acqDate:'2023-01-22',cost:18500,condition:'Good',location:'HQ Floor 2',status:'UnderMaintenance',bookable:false,score:55,maintCount:2},
    {id:'a8',tag:'AF-0973',name:'Chair (Reception)',category:'c2',serial:'SN-20044',acqDate:'2022-09-30',cost:6200,condition:'Good',location:'HQ Lobby',status:'Available',bookable:false,score:88,maintCount:1},
    {id:'a9',tag:'AF-0021',name:'Camera Tripod',category:'c1',serial:'SN-44771',acqDate:'2021-12-11',cost:9800,condition:'Good',location:'IT Store',status:'Allocated',bookable:false,score:80,maintCount:0},
    {id:'a10',tag:'AF-0301',name:'Camera',category:'c1',serial:'SN-44772',acqDate:'2021-12-11',cost:64000,condition:'Good',location:'IT Store',status:'Available',bookable:true,score:70,maintCount:0},
    {id:'a11',tag:'AF-0088',name:'Monitor',category:'c1',serial:'SN-90210',acqDate:'2023-04-04',cost:15500,condition:'Damaged',location:'Desk E15',status:'Lost',bookable:false,score:12,maintCount:3},
    {id:'a12',tag:'AF-0410',name:'Reception Chair',category:'c2',serial:'SN-10029',acqDate:'2020-01-15',cost:5400,condition:'Good',location:'HQ Lobby',status:'Available',bookable:false,score:66,maintCount:0},
    {id:'a13',tag:'AF-0345',name:'Delivery Van',category:'c3',serial:'SN-VAN02',acqDate:'2021-07-19',cost:1250000,condition:'Good',location:'Warehouse',status:'Allocated',bookable:true,score:74,maintCount:1},
    {id:'a14',tag:'AF-0055',name:'Air Compressor',category:'c4',serial:'SN-CMP01',acqDate:'2019-03-02',cost:34000,condition:'Fair',location:'Facilities Store',status:'UnderMaintenance',bookable:false,score:33,maintCount:3},
    {id:'a15',tag:'CONF-B2',name:'Conference Room B2',category:'c4',serial:'—',acqDate:'2018-01-01',cost:0,condition:'Good',location:'HQ Floor 3',status:'Available',bookable:true,score:95,maintCount:0},
  ];
  const allocations = [
    {id:'al1',assetId:'a1',employeeId:'e4',dept:'d1',allocatedAt:'2026-03-12',expectedReturn:'2026-07-20',returnedAt:null,notes:'',status:'Active'},
    {id:'al2',assetId:'a2',employeeId:'e6',dept:'d4',allocatedAt:'2026-01-09',expectedReturn:'2026-06-01',returnedAt:null,notes:'',status:'Active'},
    {id:'al3',assetId:'a9',employeeId:'e6',dept:'d4',allocatedAt:'2026-01-05',expectedReturn:'2026-07-01',returnedAt:null,notes:'',status:'Active'},
    {id:'al4',assetId:'a13',employeeId:'e2',dept:'d2',allocatedAt:'2026-02-01',expectedReturn:'2026-08-01',returnedAt:null,notes:'',status:'Active'},
    {id:'al5',assetId:'a1',employeeId:'e6',dept:'d4',allocatedAt:'2025-09-04',expectedReturn:'2026-01-04',returnedAt:'2026-01-04',notes:'Condition good on return',status:'Returned'},
    {id:'al6',assetId:'a4',employeeId:'e7',dept:'d2',allocatedAt:'2025-11-01',expectedReturn:'2026-01-01',returnedAt:'2026-01-04',notes:'Returned by Arjun Nair — condition good',status:'Returned'},
  ];
  const transfers = [
    {id:'t1',assetId:'a2',from:'e6',to:'e4',reason:'',status:'Requested',requestedAt:'2026-07-10'},
    {id:'t2',assetId:'a4',from:'e7',to:'d2Facilities',reason:'Department reallocation',status:'Approved',requestedAt:'2026-06-20'},
  ];
  const bookings = [
    {id:'b1',assetId:'a15',bookedBy:'e5',start:'2026-07-14T09:00',end:'2026-07-14T10:00',status:'Upcoming'},
    {id:'b2',assetId:'a13',bookedBy:'e2',start:'2026-07-13T14:00',end:'2026-07-13T15:00',status:'Upcoming'},
  ];
  const maintenance = [
    {id:'m1',assetId:'a3',raisedBy:'e4',issue:'Projector bulb not turning on',priority:'Medium',status:'Pending',technician:null,resolvedAt:null},
    {id:'m2',assetId:'a5',raisedBy:'e2',issue:'AC unit noisy compressor',priority:'High',status:'Approved',technician:null,resolvedAt:null},
    {id:'m3',assetId:'a6',raisedBy:'e5',issue:'Forklift ports ordered',priority:'High',status:'TechnicianAssigned',technician:'V. Kumar',resolvedAt:null},
    {id:'m4',assetId:'a7',raisedBy:'e6',issue:'Printer jam — parts ordered',priority:'Low',status:'InProgress',technician:'R. Varma',resolvedAt:null},
    {id:'m5',assetId:'a8',raisedBy:'e7',issue:'Chair repair resolved',priority:'Low',status:'Resolved',technician:'R. Varma',resolvedAt:'2026-07-07'},
  ];
  const auditCycles = [
    {id:'au1',name:'Q3 Audit: Engineering Dept',dept:'d1',location:'HQ',start:'2026-07-01',end:'2026-07-15',auditors:['e5','e5'],status:'Open',
      items:[
        {assetId:'a2',expectedLoc:'Desk E12',verification:'Verified',notes:''},
        {assetId:'a4',expectedLoc:'Desk E14',verification:'Missing',notes:''},
        {assetId:'a11',expectedLoc:'Desk E15',verification:'Damaged',notes:''},
      ]},
  ];
  const notifications = [
    {id:'n1',type:'Allocation',msg:'Laptop AF-0114 assigned to Priya Shah',time:'2m ago',priority:'info',read:false},
    {id:'n2',type:'Approval',msg:'Maintenance request AF-0055 approved',time:'18m ago',priority:'info',read:false},
    {id:'n3',type:'Booking',msg:'Booking confirmed: Room B2, 2:00–3:00 PM',time:'1h ago',priority:'info',read:true},
    {id:'n4',type:'Approval',msg:'Transfer approved: AF-0033 to Facilities dept',time:'3h ago',priority:'info',read:true},
    {id:'n5',type:'Alert',msg:'Overdue return: AF-0021 was due 3 days ago',time:'1d ago',priority:'high',read:false},
    {id:'n6',type:'Alert',msg:'Audit discrepancy flagged: AF-0088 damaged',time:'2d ago',priority:'high',read:false},
  ];
  const activityLog = [
    {id:'lg1',user:'Raj Verma',action:'Registered asset AF-0301',time:'2026-07-12 09:14'},
    {id:'lg2',user:'Priya Shah',action:'Raised maintenance request for AF-0062',time:'2026-07-11 16:02'},
    {id:'lg3',user:'Rohan Mehta',action:'Approved transfer AF-0033 to Facilities',time:'2026-07-11 11:47'},
    {id:'lg4',user:'Admin',action:'Promoted Raj Verma to Asset Manager',time:'2026-07-10 10:00'},
  ];
  return {departments,categories,employees,assets,allocations,transfers,bookings,maintenance,auditCycles,notifications,activityLog};
}

const DEMO_USERS = [
  {email:'admin@assetflow.com',pass:'admin123',id:'u1',name:'Admin User',role:'Admin'},
  {email:'raj.verma@company.com',pass:'demo123',id:'e5',name:'Raj Verma',role:'AssetManager'},
  {email:'aditi.rao@company.com',pass:'demo123',id:'e1',name:'Aditi Rao',role:'DeptHead'},
  {email:'priya.shah@company.com',pass:'demo123',id:'e4',name:'Priya Shah',role:'Employee'},
];

let S = {
  authed:false,
  authMode:'login',
  currentUser:null,
  screen:'dashboard',
  orgTab:'departments',
  bookingDate:'2026-07-14',
  bookingAssetId:'a15',
  auditActiveId:'au1',
  notifTab:'All',
  aiOpen:false,
  aiMessages:[{who:'bot',text:"Hi, I'm the AssetFlow Copilot. Ask me things like \"which assets are idle\" or \"book Room B2 tomorrow 3-4pm\"."}],
  toasts:[],
  modal:null,
  ...seed(),
};

function uid(p){return p+Math.random().toString(36).slice(2,8);}
function empName(id){const e=S.employees.find(x=>x.id===id); return e?e.name:(id||'—');}
function deptName(id){const d=S.departments.find(x=>x.id===id); return d?d.name:'—';}
function catName(id){const c=S.categories.find(x=>x.id===id); return c?c.name:'—';}
function assetById(id){return S.assets.find(a=>a.id===id);}
function fmtDate(s){ if(!s) return '—'; const d=new Date(s); return d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}); }
function toast(msg){ S.toasts.push({id:uid('to'),msg}); render(); setTimeout(()=>{S.toasts.shift(); render();},3200); }
function log(action){ S.activityLog.unshift({id:uid('lg'),user:S.currentUser?S.currentUser.name:'System',action,time:new Date().toISOString().slice(0,16).replace('T',' ')}); }
function notify(type,msg,priority){ S.notifications.unshift({id:uid('n'),type,msg,time:'just now',priority:priority||'info',read:false}); }

function scoreColor(score){
  if(score>=70) return 'var(--available)';
  if(score>=40) return 'var(--reserved)';
  return 'var(--lost)';
}

/* ---------------------------- Nav config ---------------------------- */
const NAV = [
  {id:'dashboard',label:'Dashboard',icon:'dashboard',roles:['Admin','AssetManager','DeptHead','Employee']},
  {id:'org',label:'Organization Setup',icon:'org',roles:['Admin']},
  {id:'assets',label:'Assets',icon:'assets',roles:['Admin','AssetManager','DeptHead','Employee']},
  {id:'allocation',label:'Allocation & Transfer',icon:'alloc',roles:['Admin','AssetManager','DeptHead','Employee']},
  {id:'booking',label:'Resource Booking',icon:'booking',roles:['Admin','AssetManager','DeptHead','Employee']},
  {id:'maintenance',label:'Maintenance',icon:'maint',roles:['Admin','AssetManager','DeptHead','Employee']},
  {id:'audit',label:'Audit',icon:'audit',roles:['Admin','AssetManager']},
  {id:'reports',label:'Reports',icon:'reports',roles:['Admin','AssetManager','DeptHead']},
  {id:'notifications',label:'Notifications',icon:'notif',roles:['Admin','AssetManager','DeptHead','Employee']},
];

/* ============================== RENDER ============================== */
function render(){
  const root = document.getElementById('root');
  if(!S.authed){ root.innerHTML = renderAuth(); bindAuth(); return; }
  root.innerHTML = renderApp();
  bindApp();
}

function renderAuth(){
  return `
  <div class="auth-wrap">
    <div class="auth-card">
      <div class="auth-logo">
        <div class="brand-mark" style="margin-bottom:8px;">AF</div>
        <h2>AssetFlow</h2>
        <div style="font-size:12.5px;color:var(--text-mute);margin-top:2px;">Enterprise Asset &amp; Resource Management</div>
      </div>
      <div class="auth-toggle">
        <div id="tab-login" class="${S.authMode==='login'?'active':''}">Log in</div>
        <div id="tab-signup" class="${S.authMode==='signup'?'active':''}">Sign up</div>
      </div>
      ${S.authMode==='login' ? `
        <div class="field"><label>Email</label><input id="li-email" placeholder="name@company.com" value="admin@assetflow.com"></div>
        <div class="field"><label>Password</label><input id="li-pass" type="password" placeholder="••••••••" value="admin123"></div>
        <div style="text-align:right;font-size:12px;color:var(--accent-dark);margin:-4px 0 14px;cursor:pointer;" id="forgot">Forgot password?</div>
        <button class="btn btn-primary" style="width:100%;justify-content:center;" id="do-login">Log in</button>
        <div class="alert alert-info" style="margin-top:16px;font-size:12px;">
          Demo accounts — Admin: admin@assetflow.com / admin123 &nbsp;·&nbsp; Asset Manager: raj.verma@company.com / demo123 &nbsp;·&nbsp; Dept Head: aditi.rao@company.com / demo123 &nbsp;·&nbsp; Employee: priya.shah@company.com / demo123
        </div>
      ` : `
        <div class="field"><label>Full name</label><input id="su-name" placeholder="Jordan Lee"></div>
        <div class="field"><label>Email</label><input id="su-email" placeholder="name@company.com"></div>
        <div class="field"><label>Password</label><input id="su-pass" type="password" placeholder="Create a password"></div>
        <div class="alert alert-info" style="font-size:12px;">Signing up creates an <b>Employee</b> account only. Roles (Department Head, Asset Manager) are assigned later by an Admin from the Employee Directory.</div>
        <button class="btn btn-primary" style="width:100%;justify-content:center;" id="do-signup">Create account</button>
      `}
    </div>
  </div>`;
}

function bindAuth(){
  const t1=document.getElementById('tab-login'), t2=document.getElementById('tab-signup');
  if(t1) t1.onclick=()=>{S.authMode='login';render();};
  if(t2) t2.onclick=()=>{S.authMode='signup';render();};
  const forgot=document.getElementById('forgot');
  if(forgot) forgot.onclick=()=>alert('Password reset link sent to your email (demo).');
  const doLogin=document.getElementById('do-login');
  if(doLogin) doLogin.onclick=()=>{
    const email=document.getElementById('li-email').value.trim();
    const pass=document.getElementById('li-pass').value;
    const u=DEMO_USERS.find(x=>x.email===email && x.pass===pass);
    if(!u){ alert('Invalid credentials. Use one of the demo accounts shown.'); return; }
    S.currentUser=u; S.authed=true; S.screen='dashboard'; render();
  };
  const doSignup=document.getElementById('do-signup');
  if(doSignup) doSignup.onclick=()=>{
    const name=document.getElementById('su-name').value.trim();
    const email=document.getElementById('su-email').value.trim();
    if(!name||!email){alert('Please fill in all fields.');return;}
    const newEmp={id:uid('e'),name,email,dept:S.departments[0].id,role:'Employee',status:'Active'};
    S.employees.push(newEmp);
    S.currentUser={id:newEmp.id,name,role:'Employee'};
    S.authed=true; S.screen='dashboard';
    toast('Account created as Employee. Roles are assigned by an Admin.');
    render();
  };
}

function renderApp(){
  const role = S.currentUser.role;
  const navItems = NAV.filter(n=>n.roles.includes(role));
  const screenTitle = (NAV.find(n=>n.id===S.screen)||{label:'Dashboard'}).label;
  const unread = S.notifications.filter(n=>!n.read).length;

  return `
  <div id="app">
    <div class="sidebar">
      <div class="brand"><div class="brand-mark">AF</div><div class="brand-name">AssetFlow</div></div>
      <div class="nav">
        ${navItems.map(n=>`<div class="nav-item ${S.screen===n.id?'active':''}" data-nav="${n.id}">${svg(n.icon)}<span>${n.label}</span></div>`).join('')}
      </div>
      <div class="sidebar-foot">Logged in as<br><b style="color:#fff;">${S.currentUser.name}</b> · ${roleLabel(role)}<br><span id="logout" style="color:var(--accent);cursor:pointer;">Log out</span></div>
    </div>
    <div class="main">
      <div class="topbar">
        <div class="topbar-left"><h2>${screenTitle}</h2></div>
        <div class="topbar-right">
          <div class="role-switch">
            <span style="font-size:11px;color:var(--text-mute);padding-left:6px;">View as</span>
            <select id="role-switch">
              ${['Admin','AssetManager','DeptHead','Employee'].map(r=>`<option value="${r}" ${role===r?'selected':''}>${roleLabel(r)}</option>`).join('')}
            </select>
          </div>
          <div class="icon-btn" id="open-notif">${svg('bell')}${unread?`<span class="badge-dot">${unread}</span>`:''}</div>
          <div class="avatar">${S.currentUser.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
        </div>
      </div>
      <div class="content" id="content">${renderScreen()}</div>
    </div>
  </div>
  <button class="ai-fab" id="ai-fab">${svg('ai')}</button>
  ${S.aiOpen?renderAI():''}
  ${S.modal?renderModal():''}
  <div class="toast-wrap">${S.toasts.map(t=>`<div class="toast">${t.msg}</div>`).join('')}</div>
  `;
}

function roleLabel(r){return {Admin:'Admin',AssetManager:'Asset Manager',DeptHead:'Department Head',Employee:'Employee'}[r]||r;}

function renderScreen(){
  switch(S.screen){
    case 'dashboard': return renderDashboard();
    case 'org': return renderOrg();
    case 'assets': return renderAssets();
    case 'allocation': return renderAllocation();
    case 'booking': return renderBooking();
    case 'maintenance': return renderMaintenance();
    case 'audit': return renderAudit();
    case 'reports': return renderReports();
    case 'notifications': return renderNotifications();
    default: return '';
  }
}

/* ---------------------------- 1. Dashboard ---------------------------- */
function renderDashboard(){
  const avail = S.assets.filter(a=>a.status==='Available').length;
  const alloc = S.assets.filter(a=>a.status==='Allocated').length;
  const maintToday = S.maintenance.filter(m=>['Approved','TechnicianAssigned','InProgress'].includes(m.status)).length;
  const activeBookings = S.bookings.filter(b=>b.status==='Upcoming'||b.status==='Ongoing').length;
  const pendingTransfers = S.transfers.filter(t=>t.status==='Requested').length;
  const upcomingReturns = S.allocations.filter(a=>a.status==='Active').length;
  const overdue = S.allocations.filter(a=>a.status==='Active' && new Date(a.expectedReturn) < new Date('2026-07-12'));

  const kpis = [
    ['Available',avail,'var(--available)'],['Allocated',alloc,'var(--allocated)'],
    ['Maintenance Active',maintToday,'var(--maintenance)'],['Active Bookings',activeBookings,'var(--accent)'],
    ['Pending Transfers',pendingTransfers,'var(--reserved)'],['Upcoming Returns',upcomingReturns,'var(--allocated)'],
  ];

  return `
  <div class="grid kpi-grid" style="margin-bottom:18px;">
    ${kpis.map(([lbl,num,col])=>`<div class="card kpi"><div class="lbl">${lbl}</div><div class="num" style="color:${col}">${num}</div></div>`).join('')}
  </div>
  ${overdue.length?`<div class="alert alert-danger"><b>⚠ ${overdue.length} asset(s) overdue for return</b>&nbsp;— flagged for follow-up: ${overdue.map(o=>`<span class="tag">${assetById(o.assetId).tag}</span>`).join(' ')}</div>`:''}
  <div class="grid" style="grid-template-columns:1fr 1fr;">
    <div class="card">
      <div class="card-head"><h3>Quick actions</h3></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn btn-accent" data-nav="assets" data-action="register">${svg('plus')} Register Asset</button>
        <button class="btn btn-outline" data-nav="booking">${svg('booking')} Book Resource</button>
        <button class="btn btn-outline" data-nav="maintenance" data-action="raise">${svg('maint')} Raise Request</button>
      </div>
      <div style="margin-top:22px;">
        <div class="card-head"><h3>Recent activity</h3></div>
        ${S.activityLog.slice(0,5).map(l=>`<div style="padding:9px 0;border-bottom:1px solid #F0F2F6;font-size:13px;"><b>${l.user}</b> — ${l.action}<div style="font-size:11px;color:var(--text-mute);margin-top:2px;">${l.time}</div></div>`).join('')}
      </div>
    </div>
    <div class="card">
      <div class="card-head"><h3>Overdue &amp; Upcoming Returns</h3></div>
      <table>
        <tr><th>Asset</th><th>Holder</th><th>Expected Return</th><th></th></tr>
        ${S.allocations.filter(a=>a.status==='Active').map(a=>{
          const late = new Date(a.expectedReturn) < new Date('2026-07-12');
          return `<tr><td><span class="tag">${assetById(a.assetId).tag}</span></td><td>${empName(a.employeeId)}</td><td>${fmtDate(a.expectedReturn)}</td><td>${late?'<span class="status Lost">Overdue</span>':'<span class="status Allocated">On track</span>'}</td></tr>`;
        }).join('')}
      </table>
    </div>
  </div>`;
}

/* ---------------------------- 2. Org Setup ---------------------------- */
function renderOrg(){
  return `
  <div class="tabs">
    <div class="tab ${S.orgTab==='departments'?'active':''}" data-orgtab="departments">Departments</div>
    <div class="tab ${S.orgTab==='categories'?'active':''}" data-orgtab="categories">Asset Categories</div>
    <div class="tab ${S.orgTab==='employees'?'active':''}" data-orgtab="employees">Employee Directory</div>
  </div>
  ${S.orgTab==='departments'?renderDeptTab():S.orgTab==='categories'?renderCatTab():renderEmpTab()}
  `;
}
function renderDeptTab(){
  return `<div class="card">
  <div class="card-head"><h3>Departments</h3><button class="btn btn-accent btn-sm" id="add-dept">${svg('plus')} New department</button></div>
  <table><tr><th>Department</th><th>Head</th><th>Parent</th><th>Status</th></tr>
  ${S.departments.map(d=>`<tr class="row-hover" data-toggledept="${d.id}"><td><b>${d.name}</b></td><td>${empName(d.headId)}</td><td>${d.parent?deptName(d.parent):'—'}</td><td><span class="status ${d.status}">${d.status}</span></td></tr>`).join('')}
  </table>
  <div class="alert alert-info" style="margin-top:14px;">Editing a department here also drives the picklist on Asset Registration and Allocation screens.</div>
  </div>`;
}
function renderCatTab(){
  return `<div class="card">
  <div class="card-head"><h3>Asset Categories</h3><button class="btn btn-accent btn-sm" id="add-cat">${svg('plus')} New category</button></div>
  <table><tr><th>Category</th><th>Custom field(s)</th><th>Assets in category</th></tr>
  ${S.categories.map(c=>`<tr><td><b>${c.name}</b></td><td>${c.fields}</td><td>${S.assets.filter(a=>a.category===c.id).length}</td></tr>`).join('')}
  </table></div>`;
}
function renderEmpTab(){
  return `<div class="card">
  <div class="card-head"><h3>Employee Directory</h3><span style="font-size:12px;color:var(--text-mute);">Role promotion happens only here</span></div>
  <table><tr><th>Name</th><th>Email</th><th>Department</th><th>Role</th><th>Status</th><th></th></tr>
  ${S.employees.map(e=>`<tr>
    <td><b>${e.name}</b></td><td>${e.email}</td><td>${deptName(e.dept)}</td>
    <td><span class="status ${e.role==='Admin'?'Available':e.role==='AssetManager'?'Allocated':e.role==='DeptHead'?'Reserved':'Retired'}">${roleLabel(e.role)}</span></td>
    <td><span class="status ${e.status}">${e.status}</span></td>
    <td><select class="promote-role" data-emp="${e.id}" style="font-size:12px;padding:4px 6px;border-radius:6px;border:1px solid var(--line);">
      <option value="">Change role…</option>
      <option value="Employee">Employee</option>
      <option value="DeptHead">Department Head</option>
      <option value="AssetManager">Asset Manager</option>
    </select></td>
  </tr>`).join('')}
  </table></div>`;
}

/* ---------------------------- 3. Assets ---------------------------- */
function renderAssets(){
  const filt = S._assetFilter||{};
  let list = S.assets;
  if(filt.q) list = list.filter(a=> (a.tag+a.name+a.serial).toLowerCase().includes(filt.q.toLowerCase()));
  if(filt.status) list = list.filter(a=>a.status===filt.status);
  return `
  <div class="card" style="margin-bottom:16px;">
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
      <input id="asset-search" placeholder="Search by tag, serial, or QR code…" style="flex:1;min-width:220px;padding:9px 12px;border:1px solid var(--line);border-radius:8px;font-size:13.5px;" value="${filt.q||''}">
      <select id="asset-status-filter" style="padding:9px 10px;border:1px solid var(--line);border-radius:8px;font-size:13px;">
        <option value="">All statuses</option>
        ${['Available','Allocated','Reserved','UnderMaintenance','Lost','Retired','Disposed'].map(s=>`<option ${filt.status===s?'selected':''}>${s}</option>`).join('')}
      </select>
      <button class="btn btn-accent" id="reg-asset-btn">${svg('plus')} Register Asset</button>
    </div>
  </div>
  <div class="card">
    <table><tr><th>Tag</th><th>Name</th><th>Category</th><th>Status</th><th>Location</th><th>Maintenance score</th><th>QR</th></tr>
    ${list.map(a=>`<tr class="row-hover" data-assetdetail="${a.id}">
      <td><span class="tag">${a.tag}</span></td><td>${a.name}</td><td>${catName(a.category)}</td>
      <td><span class="status ${a.status}">${a.status.replace(/([A-Z])/g,' $1').trim()}</span></td>
      <td>${a.location}</td>
      <td><div style="display:flex;align-items:center;gap:8px;"><div class="score-bar"><div class="score-fill" style="width:${a.score}%;background:${scoreColor(a.score)}"></div></div><span style="font-size:11.5px;color:${scoreColor(a.score)};font-weight:700;">${a.score}</span></div></td>
      <td>${svg('qr')}</td>
    </tr>`).join('')}
    </table>
    ${!list.length?`<div class="empty">${svg('assets')}<div>No assets match your search.</div></div>`:''}
  </div>`;
}

/* ---------------------------- 4. Allocation & Transfer ---------------------------- */
function renderAllocation(){
  const sel = S._allocAssetId || 'a1';
  const asset = assetById(sel);
  const activeAlloc = S.allocations.find(a=>a.assetId===sel && a.status==='Active');
  const conflict = !!activeAlloc && S._allocPendingEmp && S._allocPendingEmp !== activeAlloc.employeeId;
  const history = S.allocations.filter(a=>a.assetId===sel).sort((a,b)=>new Date(b.allocatedAt)-new Date(a.allocatedAt));

  return `
  <div class="grid" style="grid-template-columns:1.1fr .9fr;">
  <div class="card">
    <div class="field"><label>Asset</label>
      <select id="alloc-asset-select">
        ${S.assets.map(a=>`<option value="${a.id}" ${sel===a.id?'selected':''}>${a.tag} — ${a.name}</option>`).join('')}
      </select>
    </div>

    ${activeAlloc?`<div class="alert alert-danger ${conflict?'shake':''}" id="conflict-alert">
      <div><b>Already allocated to ${empName(activeAlloc.employeeId)} (${deptName(activeAlloc.dept)})</b><br>Direct re-allocation is blocked — submit a transfer request below, or the system can suggest an alternative.</div>
    </div>
    <button class="btn btn-outline btn-sm" id="ai-suggest-alt" style="margin-bottom:14px;">✨ AI: suggest an available alternative</button>
    <div class="field"><label>Transfer request — From</label><input value="${empName(activeAlloc.employeeId)}" disabled></div>
    <div class="field"><label>To</label>
      <select id="transfer-to">
        <option value="">Select employee…</option>
        ${S.employees.filter(e=>e.id!==activeAlloc.employeeId).map(e=>`<option value="${e.id}">${e.name} (${deptName(e.dept)})</option>`).join('')}
      </select>
    </div>
    <div class="field"><label>Reason</label><textarea id="transfer-reason" placeholder="Reason for transfer request…"></textarea></div>
    <button class="btn btn-primary" id="submit-transfer">Submit Request</button>
    `:`
    <div class="field"><label>Allocate to</label>
      <select id="alloc-to-emp">
        <option value="">Select employee…</option>
        ${S.employees.map(e=>`<option value="${e.id}">${e.name} (${deptName(e.dept)})</option>`).join('')}
      </select>
    </div>
    <div class="field"><label>Expected return date (optional)</label><input type="date" id="alloc-return-date"></div>
    <button class="btn btn-accent" id="do-allocate">Allocate Asset</button>
    `}

    <div style="margin-top:22px;">
      <div class="card-head"><h3>Allocation history</h3></div>
      ${history.length?history.map(h=>`<div style="font-size:12.5px;padding:6px 0;border-bottom:1px solid #F0F2F6;">
        ${fmtDate(h.allocatedAt)} — Allocated to ${empName(h.employeeId)} (${deptName(h.dept)})${h.returnedAt?` · Returned ${fmtDate(h.returnedAt)}${h.notes?' — '+h.notes:''}`:''}
      </div>`).join(''):'<div style="font-size:12.5px;color:var(--text-mute);">No history yet.</div>'}
    </div>
  </div>

  <div class="card">
    <div class="card-head"><h3>Pending transfer requests</h3></div>
    ${S.transfers.filter(t=>t.status==='Requested').length?S.transfers.filter(t=>t.status==='Requested').map(t=>`
      <div style="border:1px solid var(--line);border-radius:9px;padding:12px;margin-bottom:10px;">
        <div style="font-weight:700;font-size:13px;">${assetById(t.assetId).tag} · ${assetById(t.assetId).name}</div>
        <div style="font-size:12px;color:var(--text-mute);margin:4px 0 10px;">${empName(t.from)} → ${empName(t.to)||t.to}</div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-accent btn-sm" data-approve-transfer="${t.id}">Approve</button>
          <button class="btn btn-danger btn-sm" data-reject-transfer="${t.id}">Reject</button>
        </div>
      </div>`).join(''):`<div class="empty" style="padding:20px;">No pending transfer requests.</div>`}

    <div class="card-head" style="margin-top:8px;"><h3>Mark as returned</h3></div>
    <div class="field"><label>Asset with an active allocation</label>
      <select id="return-asset-select">
        <option value="">Select asset…</option>
        ${S.allocations.filter(a=>a.status==='Active').map(a=>`<option value="${a.id}">${assetById(a.assetId).tag} — held by ${empName(a.employeeId)}</option>`).join('')}
      </select>
    </div>
    <div class="field"><label>Condition check-in notes</label><textarea id="return-notes" placeholder="e.g. Good condition, minor scuff on lid"></textarea></div>
    <button class="btn btn-outline" id="do-return">Mark Returned</button>
  </div>
  </div>`;
}

/* ---------------------------- 5. Booking ---------------------------- */
function renderBooking(){
  const bookable = S.assets.filter(a=>a.bookable);
  const assetId = S.bookingAssetId;
  const date = S.bookingDate;
  const dayBookings = S.bookings.filter(b=>b.assetId===assetId && b.start.startsWith(date));
  const hours = [8,9,10,11,12,13,14,15,16,17,18];

  function toMin(t){const d=new Date(t); return d.getHours()*60+d.getMinutes();}

  return `
  <div class="grid" style="grid-template-columns:1fr 320px;">
  <div class="card">
    <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;">
      <select id="booking-asset-select" style="flex:1;min-width:200px;">
        ${bookable.map(a=>`<option value="${a.id}" ${assetId===a.id?'selected':''}>${a.tag} — ${a.name}</option>`).join('')}
      </select>
      <input type="date" id="booking-date" value="${date}">
    </div>
    <div class="daycal">
      ${hours.map(h=>{
        const block = dayBookings.find(b=>toMin(b.start)<=h*60 && toMin(b.end)>h*60);
        return `<div class="hour-row"><div class="hour-lbl">${h}:00</div><div class="hour-slot">
          ${block && toMin(block.start)===h*60 ? `<div class="slot-block" style="height:${((toMin(block.end)-toMin(block.start))/60*48)-4}px;">${block.status==='Cancelled'?'Cancelled':'Booked'} · ${empName(block.bookedBy)} · ${new Date(block.start).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}–${new Date(block.end).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</div>`:''}
        </div></div>`;
      }).join('')}
    </div>
  </div>
  <div class="card">
    <div class="card-head"><h3>Book a slot</h3></div>
    <div class="field"><label>Start time</label><input type="time" id="book-start" value="09:00"></div>
    <div class="field"><label>End time</label><input type="time" id="book-end" value="10:00"></div>
    <button class="btn btn-accent" style="width:100%;justify-content:center;" id="do-book">Book a slot</button>
    <div id="book-conflict"></div>
    <div class="card-head" style="margin-top:20px;"><h3>Today's bookings</h3></div>
    ${dayBookings.length?dayBookings.map(b=>`<div style="font-size:12.5px;padding:7px 0;border-bottom:1px solid #F0F2F6;display:flex;justify-content:space-between;align-items:center;">
      <div>${new Date(b.start).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}–${new Date(b.end).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})} · ${empName(b.bookedBy)} <span class="status ${b.status}">${b.status}</span></div>
      ${b.status==='Upcoming'?`<button class="btn btn-sm btn-outline" data-cancel-booking="${b.id}">Cancel</button>`:''}
    </div>`).join(''):'<div style="font-size:12.5px;color:var(--text-mute);">No bookings for this day.</div>'}
  </div>
  </div>`;
}

/* ---------------------------- 6. Maintenance (kanban) ---------------------------- */
const MAINT_COLS = [
  {id:'Pending',label:'Pending'},{id:'Approved',label:'Approved'},
  {id:'TechnicianAssigned',label:'Technician Assigned'},{id:'InProgress',label:'In Progress'},{id:'Resolved',label:'Resolved'},
];
function renderMaintenance(){
  return `
  <div style="display:flex;justify-content:flex-end;margin-bottom:14px;">
    <button class="btn btn-accent" id="raise-maint-btn">${svg('plus')} Raise Maintenance Request</button>
  </div>
  <div class="kanban">
    ${MAINT_COLS.map(col=>{
      const items = S.maintenance.filter(m=>m.status===col.id);
      return `<div class="kanban-col" data-col="${col.id}">
        <h4>${col.label}<span>${items.length}</span></h4>
        ${items.map(m=>`<div class="kcard" draggable="true" data-mid="${m.id}">
          <div class="kt">${assetById(m.assetId).tag}</div>
          <div class="kd">${m.issue}</div>
          <div style="margin-top:6px;"><span class="status ${m.priority==='High'?'Lost':m.priority==='Medium'?'Reserved':'Retired'}">${m.priority}</span></div>
        </div>`).join('')}
      </div>`;
    }).join('')}
  </div>
  <div class="alert alert-info" style="margin-top:16px;">Approving a card moves the asset to Under Maintenance; resolving it returns the asset to Available. Drag cards between columns to progress the workflow.</div>
  `;
}

/* ---------------------------- 7. Audit ---------------------------- */
function renderAudit(){
  const cycle = S.auditCycles.find(c=>c.id===S.auditActiveId) || S.auditCycles[0];
  const flagged = cycle.items.filter(i=>i.verification!=='Verified');
  return `
  <div class="grid" style="grid-template-columns:1fr 340px;">
  <div class="card">
    <div class="card-head"><h3>${cycle.name}</h3><span class="status ${cycle.status}">${cycle.status}</span></div>
    <div style="font-size:12.5px;color:var(--text-mute);margin-bottom:14px;">Scope: ${deptName(cycle.dept)} · ${fmtDate(cycle.start)} – ${fmtDate(cycle.end)} · Auditors: ${[...new Set(cycle.auditors)].map(empName).join(', ')}</div>
    <table><tr><th>Asset</th><th>Expected location</th><th>Verification</th></tr>
    ${cycle.items.map((i,idx)=>`<tr>
      <td><span class="tag">${assetById(i.assetId).tag}</span> ${assetById(i.assetId).name}</td>
      <td>${i.expectedLoc}</td>
      <td>
        ${cycle.status==='Open'?`<select data-audititem="${idx}" ${cycle.status!=='Open'?'disabled':''}>
          ${['Verified','Missing','Damaged'].map(v=>`<option ${i.verification===v?'selected':''}>${v}</option>`).join('')}
        </select>`:`<span class="status ${i.verification}">${i.verification}</span>`}
      </td>
    </tr>`).join('')}
    </table>
    ${flagged.length?`<div class="alert alert-warn" style="margin-top:14px;"><b>${flagged.length} assets flagged</b> — discrepancy report auto-generated automatically.</div>`:''}
    ${cycle.status==='Open'?`<button class="btn btn-primary" id="close-audit">Close audit cycle</button>`:'<div style="font-size:12.5px;color:var(--text-mute);">This audit cycle is closed and locked.</div>'}
  </div>
  <div class="card">
    <div class="card-head"><h3>New audit cycle</h3></div>
    <div class="field"><label>Cycle name</label><input id="new-audit-name" placeholder="e.g. Q3 Audit: Facilities"></div>
    <div class="field"><label>Department scope</label><select id="new-audit-dept">${S.departments.map(d=>`<option value="${d.id}">${d.name}</option>`).join('')}</select></div>
    <div class="row2">
      <div class="field"><label>Start date</label><input type="date" id="new-audit-start"></div>
      <div class="field"><label>End date</label><input type="date" id="new-audit-end"></div>
    </div>
    <div class="field"><label>Assign auditor</label><select id="new-audit-auditor">${S.employees.filter(e=>e.role==='AssetManager'||e.role==='Admin').map(e=>`<option value="${e.id}">${e.name}</option>`).join('')}</select></div>
    <button class="btn btn-accent" style="width:100%;justify-content:center;" id="create-audit">Create Audit Cycle</button>

    <div class="card-head" style="margin-top:20px;"><h3>All cycles</h3></div>
    ${S.auditCycles.map(c=>`<div class="chip ${c.id===cycle.id?'active':''}" data-selectaudit="${c.id}">${c.name}</div>`).join('')}
  </div>
  </div>`;
}

/* ---------------------------- 8. Reports ---------------------------- */
function renderReports(){
  const deptAlloc = S.departments.map(d=>({name:d.name, count:S.allocations.filter(a=>a.status==='Active'&&a.dept===d.id).length}));
  const maxDept = Math.max(1,...deptAlloc.map(d=>d.count));
  const catMaint = S.categories.map(c=>({name:c.name,count:S.assets.filter(a=>a.category===c.id).reduce((s,a)=>s+a.maintCount,0)}));
  const maxCat = Math.max(1,...catMaint.map(c=>c.count));
  const mostUsed = [...S.assets].sort((a,b)=>b.maintCount-a.maintCount).slice(0,3);
  const idle = [...S.assets].filter(a=>a.status==='Available').sort((a,b)=>a.score-b.score).slice(0,3);
  const nearRetire = [...S.assets].sort((a,b)=>a.score-b.score).slice(0,3);

  return `
  <div class="grid" style="grid-template-columns:1fr 1fr;margin-bottom:16px;">
    <div class="card">
      <div class="card-head"><h3>Department-wise allocation</h3></div>
      ${deptAlloc.map(d=>`<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <div style="width:110px;font-size:12px;">${d.name}</div>
        <div style="flex:1;background:#EEF0F4;border-radius:5px;height:16px;overflow:hidden;"><div style="width:${d.count/maxDept*100}%;background:var(--accent);height:100%;"></div></div>
        <div style="width:20px;font-size:12px;font-weight:700;">${d.count}</div>
      </div>`).join('')}
    </div>
    <div class="card">
      <div class="card-head"><h3>Maintenance frequency by category</h3></div>
      ${catMaint.map(c=>`<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <div style="width:110px;font-size:12px;">${c.name}</div>
        <div style="flex:1;background:#EEF0F4;border-radius:5px;height:16px;overflow:hidden;"><div style="width:${c.count/maxCat*100}%;background:var(--maintenance);height:100%;"></div></div>
        <div style="width:20px;font-size:12px;font-weight:700;">${c.count}</div>
      </div>`).join('')}
    </div>
  </div>
  <div class="grid" style="grid-template-columns:1fr 1fr;margin-bottom:16px;">
    <div class="card">
      <div class="card-head"><h3>Most-used assets</h3></div>
      ${mostUsed.map(a=>`<div style="font-size:13px;padding:6px 0;border-bottom:1px solid #F0F2F6;"><span class="tag">${a.tag}</span> ${a.name} — ${a.maintCount} maintenance events</div>`).join('')}
    </div>
    <div class="card">
      <div class="card-head"><h3>Idle assets</h3></div>
      ${idle.map(a=>`<div style="font-size:13px;padding:6px 0;border-bottom:1px solid #F0F2F6;"><span class="tag">${a.tag}</span> ${a.name} — low utilization score (${a.score})</div>`).join('')}
    </div>
  </div>
  <div class="card" style="margin-bottom:16px;">
    <div class="card-head"><h3>Assets due for maintenance / nearing retirement</h3></div>
    ${nearRetire.map(a=>`<div style="font-size:13px;padding:6px 0;border-bottom:1px solid #F0F2F6;"><span class="tag">${a.tag}</span> ${a.name} — condition ${a.condition}, health score ${a.score}</div>`).join('')}
  </div>
  <div class="alert alert-info">✨ <b>AI insight:</b> ${aiReportInsight(deptAlloc, idle)}</div>
  <button class="btn btn-outline" id="export-report">Export report (.csv)</button>
  `;
}
function aiReportInsight(deptAlloc, idle){
  const top = [...deptAlloc].sort((a,b)=>b.count-a.count)[0];
  return `${top.name} holds the most active allocations (${top.count}). ${idle.length} asset(s), including ${idle[0]?assetById===undefined?'':S.assets.find(a=>a.score===idle[0].score)?.tag:''}${idle[0]?idle[0].tag:''}, show low utilization — consider redistributing before your next purchase cycle.`;
}

/* ---------------------------- 9. Notifications ---------------------------- */
function renderNotifications(){
  const tabs = ['All','Alerts','Approvals','Bookings'];
  let list = S.notifications;
  if(S.notifTab==='Alerts') list = list.filter(n=>n.priority==='high');
  if(S.notifTab==='Approvals') list = list.filter(n=>n.type==='Approval');
  if(S.notifTab==='Bookings') list = list.filter(n=>n.type==='Booking');
  return `
  <div class="card" style="margin-bottom:16px;">
    <div style="display:flex;gap:6px;">
      ${tabs.map(t=>`<div class="chip ${S.notifTab===t?'active':''}" data-notiftab="${t}">${t}</div>`).join('')}
    </div>
  </div>
  <div class="card">
    ${list.map(n=>`<div style="display:flex;gap:10px;align-items:flex-start;padding:11px 0;border-bottom:1px solid #F0F2F6;">
      <div style="width:8px;height:8px;border-radius:50%;margin-top:6px;flex-shrink:0;background:${n.priority==='high'?'var(--lost)':'var(--accent)'};${n.read?'opacity:.35;':''}"></div>
      <div style="flex:1;">
        <div style="font-size:13px;${n.read?'color:var(--text-mute);':''}">${n.msg}</div>
        <div style="font-size:11px;color:var(--text-mute);margin-top:2px;">${n.type} · ${n.time}</div>
      </div>
    </div>`).join('')}
    ${!list.length?`<div class="empty">${svg('notif')}<div>Nothing here.</div></div>`:''}
  </div>

  <div class="card" style="margin-top:16px;">
    <div class="card-head"><h3>Full activity log</h3></div>
    <table><tr><th>User</th><th>Action</th><th>Time</th></tr>
    ${S.activityLog.map(l=>`<tr><td>${l.user}</td><td>${l.action}</td><td style="color:var(--text-mute);">${l.time}</td></tr>`).join('')}
    </table>
  </div>`;
}

/* ---------------------------- Modal ---------------------------- */
function renderModal(){
  const m = S.modal;
  if(m.type==='register-asset'){
    return `<div class="modal-bg" id="modal-bg"><div class="modal">
      <div class="modal-head"><h3>Register Asset</h3><button class="x-btn" id="close-modal">✕</button></div>
      <div class="modal-body">
        <div class="row2">
          <div class="field"><label>Name</label><input id="ra-name" placeholder="e.g. Dell Laptop"></div>
          <div class="field"><label>Category</label><select id="ra-cat">${S.categories.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select></div>
        </div>
        <div class="row2">
          <div class="field"><label>Serial number</label><input id="ra-serial" placeholder="SN-XXXXX"></div>
          <div class="field"><label>Acquisition date</label><input type="date" id="ra-date"></div>
        </div>
        <div class="row2">
          <div class="field"><label>Acquisition cost (₹)</label><input type="number" id="ra-cost" placeholder="0"></div>
          <div class="field"><label>Condition</label><select id="ra-cond"><option>Good</option><option>Fair</option><option>Poor</option><option>Damaged</option></select></div>
        </div>
        <div class="field"><label>Location</label><input id="ra-loc" placeholder="e.g. HQ Floor 2"></div>
        <div class="field"><label><input type="checkbox" id="ra-bookable" style="width:auto;display:inline;"> Shared / bookable resource</label></div>
        <div class="alert alert-info" style="font-size:12px;">Asset Tag will be auto-generated (e.g. AF-0208).</div>
      </div>
      <div class="modal-foot"><button class="btn btn-outline" id="close-modal2">Cancel</button><button class="btn btn-accent" id="save-asset">Register Asset</button></div>
    </div></div>`;
  }
  if(m.type==='raise-maint'){
    return `<div class="modal-bg" id="modal-bg"><div class="modal">
      <div class="modal-head"><h3>Raise Maintenance Request</h3><button class="x-btn" id="close-modal">✕</button></div>
      <div class="modal-body">
        <div class="field"><label>Asset</label><select id="rm-asset">${S.assets.map(a=>`<option value="${a.id}">${a.tag} — ${a.name}</option>`).join('')}</select></div>
        <div class="field"><label>Issue description</label><textarea id="rm-issue" placeholder="Describe the issue…"></textarea></div>
        <div class="field"><label>Priority</label><select id="rm-priority"><option>Low</option><option>Medium</option><option>High</option></select></div>
      </div>
      <div class="modal-foot"><button class="btn btn-outline" id="close-modal2">Cancel</button><button class="btn btn-accent" id="save-maint">Submit Request</button></div>
    </div></div>`;
  }
  if(m.type==='asset-detail'){
    const a = assetById(m.assetId);
    const allocHist = S.allocations.filter(x=>x.assetId===a.id);
    const maintHist = S.maintenance.filter(x=>x.assetId===a.id);
    return `<div class="modal-bg" id="modal-bg"><div class="modal" style="max-width:560px;">
      <div class="modal-head"><h3><span class="tag">${a.tag}</span> ${a.name}</h3><button class="x-btn" id="close-modal">✕</button></div>
      <div class="modal-body">
        <div class="row2" style="font-size:13px;margin-bottom:14px;">
          <div><b>Category:</b> ${catName(a.category)}</div><div><b>Status:</b> <span class="status ${a.status}">${a.status}</span></div>
          <div><b>Serial:</b> ${a.serial}</div><div><b>Location:</b> ${a.location}</div>
          <div><b>Condition:</b> ${a.condition}</div><div><b>Health score:</b> ${a.score}/100</div>
        </div>
        <h4 style="font-size:13px;margin-bottom:8px;">Allocation history</h4>
        ${allocHist.length?allocHist.map(h=>`<div style="font-size:12px;padding:5px 0;border-bottom:1px solid #F0F2F6;">${fmtDate(h.allocatedAt)} — ${empName(h.employeeId)}${h.returnedAt?` (returned ${fmtDate(h.returnedAt)})`:' (active)'}</div>`).join(''):'<div style="font-size:12px;color:var(--text-mute);">None.</div>'}
        <h4 style="font-size:13px;margin:14px 0 8px;">Maintenance history</h4>
        ${maintHist.length?maintHist.map(h=>`<div style="font-size:12px;padding:5px 0;border-bottom:1px solid #F0F2F6;">${h.issue} — <span class="status ${h.status}">${h.status}</span></div>`).join(''):'<div style="font-size:12px;color:var(--text-mute);">None.</div>'}
      </div>
      <div class="modal-foot"><button class="btn btn-outline" id="close-modal2">Close</button></div>
    </div></div>`;
  }
  return '';
}

/* ---------------------------- AI Copilot ---------------------------- */
function renderAI(){
  return `<div class="ai-panel">
    <div class="ai-head"><span class="dot"></span><b>AssetFlow Copilot</b><span style="margin-left:auto;font-size:11px;opacity:.7;cursor:pointer;" id="ai-close">✕</span></div>
    <div class="ai-body" id="ai-body">
      ${S.aiMessages.map(m=>`<div class="msg ${m.who}">${m.text}</div>`).join('')}
    </div>
    <div class="ai-suggest">
      <div class="chip" data-aisuggest="Which assets are idle for 60+ days?">Idle assets?</div>
      <div class="chip" data-aisuggest="Show overdue returns">Overdue returns</div>
      <div class="chip" data-aisuggest="Book Room B2 tomorrow 3 to 4pm">Book a room</div>
    </div>
    <div class="ai-input"><input id="ai-input" placeholder="Ask AssetFlow…"><button id="ai-send">${svg('send')}</button></div>
  </div>`;
}

function aiRespond(text){
  const q = text.toLowerCase();
  let reply = "I can help with asset status, idle/maintenance insights, overdue returns, and simple bookings. Try asking about a specific asset tag or department.";
  if(q.includes('idle')){
    const idle = [...S.assets].filter(a=>a.status==='Available').sort((a,b)=>a.score-b.score).slice(0,4);
    reply = `Here are the lowest-utilization assets: ${idle.map(a=>`${a.tag} (${a.name}, score ${a.score})`).join(', ')}. Consider redistributing these before the next purchase cycle.`;
  } else if(q.includes('overdue')){
    const overdue = S.allocations.filter(a=>a.status==='Active' && new Date(a.expectedReturn) < new Date('2026-07-12'));
    reply = overdue.length ? `${overdue.length} overdue: ${overdue.map(o=>`${assetById(o.assetId).tag} (held by ${empName(o.employeeId)}, due ${fmtDate(o.expectedReturn)})`).join(', ')}.` : 'No overdue returns right now — nice.';
  } else if(q.includes('book')){
    reply = `I've drafted a booking for Conference Room B2, tomorrow 3:00–4:00 PM. Head to Resource Booking to confirm, or say "confirm" and I'll add it now.`;
  } else if(q.includes('confirm')){
    S.bookings.push({id:uid('b'),assetId:'a15',bookedBy:S.currentUser.id,start:'2026-07-13T15:00',end:'2026-07-13T16:00',status:'Upcoming'});
    notify('Booking','Booking confirmed via AI Copilot: Room B2, 3:00–4:00 PM','info');
    reply = "Booked — Conference Room B2, 3:00–4:00 PM tomorrow. Check Notifications for the confirmation.";
  } else if(q.includes('maintenance') || q.includes('score')){
    const risky = [...S.assets].sort((a,b)=>a.score-b.score).slice(0,3);
    reply = `Highest maintenance risk right now: ${risky.map(a=>`${a.tag} (score ${a.score})`).join(', ')}.`;
  } else {
    const tagMatch = S.assets.find(a=>q.includes(a.tag.toLowerCase()));
    if(tagMatch){
      reply = `${tagMatch.tag} (${tagMatch.name}) is currently ${tagMatch.status}, located at ${tagMatch.location}, health score ${tagMatch.score}/100.`;
    }
  }
  return reply;
}

/* ============================== EVENT BINDING ============================== */
function bindApp(){
  document.querySelectorAll('[data-nav]').forEach(el=>el.onclick=()=>{
    S.screen = el.getAttribute('data-nav');
    const action = el.getAttribute('data-action');
    S.modal = action==='register' ? {type:'register-asset'} : action==='raise' ? {type:'raise-maint'} : null;
    render();
  });
  const logout = document.getElementById('logout');
  if(logout) logout.onclick=()=>{S.authed=false;S.currentUser=null;render();};
  const rs = document.getElementById('role-switch');
  if(rs) rs.onchange=(e)=>{
    const r = e.target.value;
    const u = DEMO_USERS.find(x=>x.role===r);
    S.currentUser = u ? {...u} : {...S.currentUser, role:r};
    S.screen='dashboard'; render();
  };
  const openNotif = document.getElementById('open-notif');
  if(openNotif) openNotif.onclick=()=>{S.screen='notifications';render();};

  // AI
  const aiFab = document.getElementById('ai-fab');
  if(aiFab) aiFab.onclick=()=>{S.aiOpen=!S.aiOpen;render();};
  const aiClose = document.getElementById('ai-close');
  if(aiClose) aiClose.onclick=()=>{S.aiOpen=false;render();};
  const aiSend = document.getElementById('ai-send');
  const aiInput = document.getElementById('ai-input');
  function sendAI(){
    const val = aiInput.value.trim(); if(!val) return;
    S.aiMessages.push({who:'user',text:val});
    S.aiMessages.push({who:'bot',text:aiRespond(val)});
    aiInput.value='';
    render();
    S.aiOpen=true;
    setTimeout(()=>{const body=document.getElementById('ai-body'); if(body) body.scrollTop=body.scrollHeight; const inp=document.getElementById('ai-input'); if(inp) inp.focus();},0);
  }
  if(aiSend) aiSend.onclick=sendAI;
  if(aiInput) aiInput.onkeydown=(e)=>{if(e.key==='Enter') sendAI();};
  document.querySelectorAll('[data-aisuggest]').forEach(el=>el.onclick=()=>{
    const val = el.getAttribute('data-aisuggest');
    S.aiMessages.push({who:'user',text:val});
    S.aiMessages.push({who:'bot',text:aiRespond(val)});
    render(); S.aiOpen=true;
  });

  // Modal generic close
  document.querySelectorAll('#close-modal,#close-modal2').forEach(el=>el&&(el.onclick=()=>{S.modal=null;render();}));
  const modalBg = document.getElementById('modal-bg');
  if(modalBg) modalBg.onclick=(e)=>{if(e.target.id==='modal-bg'){S.modal=null;render();}};

  bindScreenEvents();
}

function bindScreenEvents(){
  switch(S.screen){
    case 'org': return bindOrg();
    case 'assets': return bindAssets();
    case 'allocation': return bindAllocation();
    case 'booking': return bindBooking();
    case 'maintenance': return bindMaintenance();
    case 'audit': return bindAudit();
    case 'reports': return bindReports();
    case 'notifications': return bindNotifications();
  }
  bindModalActions();
}

function bindOrg(){
  document.querySelectorAll('[data-orgtab]').forEach(el=>el.onclick=()=>{S.orgTab=el.getAttribute('data-orgtab');render();});
  document.querySelectorAll('.promote-role').forEach(el=>el.onchange=()=>{
    const empId = el.getAttribute('data-emp'); const role = el.value; if(!role) return;
    const emp = S.employees.find(e=>e.id===empId); emp.role = role;
    log(`Promoted ${emp.name} to ${roleLabel(role)}`);
    toast(`${emp.name} is now ${roleLabel(role)}`);
    render();
  });
  const addDept = document.getElementById('add-dept');
  if(addDept) addDept.onclick=()=>{
    const name = prompt('New department name:'); if(!name) return;
    S.departments.push({id:uid('d'),name,headId:null,parent:null,status:'Active'});
    render();
  };
  const addCat = document.getElementById('add-cat');
  if(addCat) addCat.onclick=()=>{
    const name = prompt('New category name:'); if(!name) return;
    S.categories.push({id:uid('c'),name,fields:'—'});
    render();
  };
}

function bindAssets(){
  const search = document.getElementById('asset-search');
  const statusF = document.getElementById('asset-status-filter');
  if(search) search.oninput=()=>{ S._assetFilter = {...(S._assetFilter||{}), q:search.value}; renderPartial('assets'); };
  if(statusF) statusF.onchange=()=>{ S._assetFilter = {...(S._assetFilter||{}), status:statusF.value}; render(); };
  const regBtn = document.getElementById('reg-asset-btn');
  if(regBtn) regBtn.onclick=()=>{S.modal={type:'register-asset'};render();};
  document.querySelectorAll('[data-assetdetail]').forEach(el=>el.onclick=()=>{
    S.modal={type:'asset-detail',assetId:el.getAttribute('data-assetdetail')}; render();
  });
  bindModalActions();
}

function renderPartial(){ render(); } // simplicity: full re-render, cursor preserved via value re-set below

function bindAllocation(){
  const assetSel = document.getElementById('alloc-asset-select');
  if(assetSel) assetSel.onchange=()=>{S._allocAssetId=assetSel.value; S._allocPendingEmp=null; render();};

  const doAllocate = document.getElementById('do-allocate');
  if(doAllocate) doAllocate.onclick=()=>{
    const empSel = document.getElementById('alloc-to-emp');
    const empId = empSel.value; if(!empId){alert('Select an employee.');return;}
    const emp = S.employees.find(e=>e.id===empId);
    const assetId = S._allocAssetId||'a1';
    const returnDate = document.getElementById('alloc-return-date').value || null;
    S.allocations.push({id:uid('al'),assetId,employeeId:empId,dept:emp.dept,allocatedAt:'2026-07-12',expectedReturn:returnDate||'2026-08-12',returnedAt:null,notes:'',status:'Active'});
    assetById(assetId).status='Allocated';
    log(`Allocated ${assetById(assetId).tag} to ${emp.name}`);
    notify('Allocation',`${assetById(assetId).tag} allocated to ${emp.name}`,'info');
    toast('Asset allocated successfully.');
    render();
  };

  const submitTransfer = document.getElementById('submit-transfer');
  if(submitTransfer) submitTransfer.onclick=()=>{
    const to = document.getElementById('transfer-to').value; if(!to){alert('Select an employee to transfer to.');return;}
    const reason = document.getElementById('transfer-reason').value;
    const assetId = S._allocAssetId||'a1';
    const active = S.allocations.find(a=>a.assetId===assetId && a.status==='Active');
    S.transfers.push({id:uid('t'),assetId,from:active.employeeId,to,reason,status:'Requested',requestedAt:'2026-07-12'});
    log(`Transfer requested for ${assetById(assetId).tag}`);
    toast('Transfer request submitted for approval.');
    render();
  };

  const aiAlt = document.getElementById('ai-suggest-alt');
  if(aiAlt) aiAlt.onclick=()=>{
    const assetId = S._allocAssetId||'a1';
    const cat = assetById(assetId).category;
    const alt = S.assets.find(a=>a.category===cat && a.status==='Available' && a.id!==assetId);
    toast(alt?`✨ AI suggests: ${alt.tag} (${alt.name}) is available in the same category.`:'No available alternative found in this category.');
  };

  document.querySelectorAll('[data-approve-transfer]').forEach(el=>el.onclick=()=>{
    const t = S.transfers.find(x=>x.id===el.getAttribute('data-approve-transfer'));
    t.status='Approved';
    const alloc = S.allocations.find(a=>a.assetId===t.assetId && a.status==='Active');
    if(alloc){ alloc.status='Returned'; alloc.returnedAt='2026-07-12'; }
    const toEmp = S.employees.find(e=>e.id===t.to);
    S.allocations.push({id:uid('al'),assetId:t.assetId,employeeId:t.to,dept:toEmp?toEmp.dept:'',allocatedAt:'2026-07-12',expectedReturn:'2026-09-12',returnedAt:null,notes:'',status:'Active'});
    log(`Transfer approved: ${assetById(t.assetId).tag} → ${empName(t.to)}`);
    notify('Approval',`Transfer approved: ${assetById(t.assetId).tag} to ${empName(t.to)}`,'info');
    toast('Transfer approved and asset re-allocated.');
    render();
  });
  document.querySelectorAll('[data-reject-transfer]').forEach(el=>el.onclick=()=>{
    const t = S.transfers.find(x=>x.id===el.getAttribute('data-reject-transfer'));
    t.status='Rejected'; toast('Transfer request rejected.'); render();
  });

  const doReturn = document.getElementById('do-return');
  if(doReturn) doReturn.onclick=()=>{
    const allocId = document.getElementById('return-asset-select').value; if(!allocId){alert('Select an asset.');return;}
    const notes = document.getElementById('return-notes').value;
    const alloc = S.allocations.find(a=>a.id===allocId);
    alloc.status='Returned'; alloc.returnedAt='2026-07-12'; alloc.notes=notes;
    assetById(alloc.assetId).status='Available';
    log(`${assetById(alloc.assetId).tag} returned by ${empName(alloc.employeeId)}`);
    toast('Asset marked returned — status reverted to Available.');
    render();
  };
}

function bindBooking(){
  const assetSel = document.getElementById('booking-asset-select');
  if(assetSel) assetSel.onchange=()=>{S.bookingAssetId=assetSel.value;render();};
  const dateInp = document.getElementById('booking-date');
  if(dateInp) dateInp.onchange=()=>{S.bookingDate=dateInp.value;render();};
  const doBook = document.getElementById('do-book');
  if(doBook) doBook.onclick=()=>{
    const start = document.getElementById('book-start').value;
    const end = document.getElementById('book-end').value;
    if(!start||!end||start>=end){alert('Enter a valid time range.');return;}
    const s = `${S.bookingDate}T${start}`, e = `${S.bookingDate}T${end}`;
    const overlap = S.bookings.some(b=>b.assetId===S.bookingAssetId && b.status!=='Cancelled' && s < b.end && e > b.start);
    const box = document.getElementById('book-conflict');
    if(overlap){
      box.innerHTML = `<div class="alert alert-danger shake" style="margin-top:12px;">Requested ${start}–${end} overlaps an existing booking — slot is unavailable.</div>`;
      return;
    }
    S.bookings.push({id:uid('b'),assetId:S.bookingAssetId,bookedBy:S.currentUser.id,start:s,end:e,status:'Upcoming'});
    log(`Booked ${assetById(S.bookingAssetId).name} ${start}-${end}`);
    notify('Booking',`Booking confirmed: ${assetById(S.bookingAssetId).name}, ${start}-${end}`,'info');
    toast('Booked — no conflicts.');
    render();
  };
  document.querySelectorAll('[data-cancel-booking]').forEach(el=>el.onclick=()=>{
    const b = S.bookings.find(x=>x.id===el.getAttribute('data-cancel-booking'));
    b.status='Cancelled'; toast('Booking cancelled.'); render();
  });
}

function bindMaintenance(){
  const raiseBtn = document.getElementById('raise-maint-btn');
  if(raiseBtn) raiseBtn.onclick=()=>{S.modal={type:'raise-maint'};render();};
  // drag and drop
  document.querySelectorAll('.kcard').forEach(card=>{
    card.ondragstart=(e)=>{e.dataTransfer.setData('text/plain', card.getAttribute('data-mid'));};
  });
  document.querySelectorAll('.kanban-col').forEach(col=>{
    col.ondragover=(e)=>{e.preventDefault(); col.classList.add('dragover');};
    col.ondragleave=()=>col.classList.remove('dragover');
    col.ondrop=(e)=>{
      e.preventDefault(); col.classList.remove('dragover');
      const mid = e.dataTransfer.getData('text/plain');
      const item = S.maintenance.find(m=>m.id===mid);
      const newStatus = col.getAttribute('data-col');
      item.status = newStatus;
      const asset = assetById(item.assetId);
      if(newStatus==='Approved'){ asset.status='UnderMaintenance'; notify('Approval',`Maintenance approved for ${asset.tag}`,'info'); }
      if(newStatus==='Resolved'){ asset.status='Available'; item.resolvedAt='2026-07-12'; notify('Approval',`Maintenance resolved for ${asset.tag}`,'info'); }
      log(`${asset.tag} maintenance moved to ${newStatus}`);
      render();
    };
  });
  bindModalActions();
}

function bindAudit(){
  document.querySelectorAll('[data-audititem]').forEach(el=>el.onchange=()=>{
    const idx = +el.getAttribute('data-audititem');
    const cycle = S.auditCycles.find(c=>c.id===S.auditActiveId);
    cycle.items[idx].verification = el.value;
    render();
  });
  document.querySelectorAll('[data-selectaudit]').forEach(el=>el.onclick=()=>{S.auditActiveId=el.getAttribute('data-selectaudit');render();});
  const closeBtn = document.getElementById('close-audit');
  if(closeBtn) closeBtn.onclick=()=>{
    const cycle = S.auditCycles.find(c=>c.id===S.auditActiveId);
    cycle.status='Closed';
    cycle.items.forEach(i=>{ if(i.verification==='Missing'){ assetById(i.assetId).status='Lost'; } });
    log(`Closed audit cycle: ${cycle.name}`);
    notify('Alert',`Audit cycle closed: ${cycle.name} — ${cycle.items.filter(i=>i.verification!=='Verified').length} discrepancies`,'high');
    toast('Audit cycle closed and locked.');
    render();
  };
  const createBtn = document.getElementById('create-audit');
  if(createBtn) createBtn.onclick=()=>{
    const name = document.getElementById('new-audit-name').value; if(!name){alert('Enter a cycle name.');return;}
    const dept = document.getElementById('new-audit-dept').value;
    const start = document.getElementById('new-audit-start').value || '2026-07-12';
    const end = document.getElementById('new-audit-end').value || '2026-07-26';
    const auditor = document.getElementById('new-audit-auditor').value;
    const deptAssets = S.assets.filter(a=>true).slice(0,3);
    const nc = {id:uid('au'),name,dept,location:'HQ',start,end,auditors:[auditor],status:'Open',items:deptAssets.map(a=>({assetId:a.id,expectedLoc:a.location,verification:'Verified',notes:''}))};
    S.auditCycles.push(nc); S.auditActiveId=nc.id;
    log(`Created audit cycle: ${name}`);
    toast('Audit cycle created.');
    render();
  };
}

function bindReports(){
  const exp = document.getElementById('export-report');
  if(exp) exp.onclick=()=>{
    const rows = [['Tag','Name','Category','Status','Location','Health Score']];
    S.assets.forEach(a=>rows.push([a.tag,a.name,catName(a.category),a.status,a.location,a.score]));
    const csv = rows.map(r=>r.join(',')).join('\\n');
    const blob = new Blob([csv],{type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href=url; link.download='assetflow_report.csv'; link.click();
    toast('Report exported.');
  };
}

function bindNotifications(){
  document.querySelectorAll('[data-notiftab]').forEach(el=>el.onclick=()=>{
    S.notifTab = el.getAttribute('data-notiftab');
    S.notifications.forEach(n=>n.read=true);
    render();
  });
}

function bindModalActions(){
  const saveAsset = document.getElementById('save-asset');
  if(saveAsset) saveAsset.onclick=()=>{
    const name = document.getElementById('ra-name').value; if(!name){alert('Enter asset name.');return;}
    const cat = document.getElementById('ra-cat').value;
    const serial = document.getElementById('ra-serial').value || '—';
    const date = document.getElementById('ra-date').value || '2026-07-12';
    const cost = +document.getElementById('ra-cost').value || 0;
    const cond = document.getElementById('ra-cond').value;
    const loc = document.getElementById('ra-loc').value || 'Unassigned';
    const bookable = document.getElementById('ra-bookable').checked;
    const nextNum = String(S.assets.length+1).padStart(4,'0');
    const asset = {id:uid('a'),tag:`AF-${nextNum}`,name,category:cat,serial,acqDate:date,cost,condition:cond,location:loc,status:'Available',bookable,score:85,maintCount:0};
    S.assets.push(asset);
    log(`Registered asset ${asset.tag} (${name})`);
    notify('Allocation',`New asset registered: ${asset.tag}`,'info');
    S.modal=null;
    toast(`Asset ${asset.tag} registered.`);
    render();
  };
  const saveMaint = document.getElementById('save-maint');
  if(saveMaint) saveMaint.onclick=()=>{
    const assetId = document.getElementById('rm-asset').value;
    const issue = document.getElementById('rm-issue').value; if(!issue){alert('Describe the issue.');return;}
    const priority = document.getElementById('rm-priority').value;
    S.maintenance.push({id:uid('m'),assetId,raisedBy:S.currentUser.id,issue,priority,status:'Pending',technician:null,resolvedAt:null});
    log(`Raised maintenance request for ${assetById(assetId).tag}`);
    notify('Alert',`Maintenance requested for ${assetById(assetId).tag}`,'info');
    S.modal=null; S.screen='maintenance';
    toast('Maintenance request submitted.');
    render();
  };
}

render();
