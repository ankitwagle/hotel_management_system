<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Grand Imperial Hotel — Sign In</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',sans-serif;min-height:100vh;overflow:hidden;background:#f0f4f8}

/* ── BACKGROUND SCENE ── */
.scene{position:fixed;inset:0;z-index:0}

/* Sky gradient */
.sky{
  position:absolute;inset:0;
  background:linear-gradient(170deg,
    #e8f4fd 0%,
    #dbeeff 20%,
    #c8e6fa 40%,
    #e8f5e9 70%,
    #f3e5d8 100%);
}

/* Decorative blobs */
.blob{position:absolute;border-radius:50%;filter:blur(80px);opacity:.45}
.blob1{width:600px;height:600px;background:radial-gradient(circle,#a8d8ea,#84c4e8);top:-150px;left:-150px}
.blob2{width:500px;height:500px;background:radial-gradient(circle,#ffd3a5,#ffb347);bottom:-100px;right:-100px}
.blob3{width:400px;height:400px;background:radial-gradient(circle,#c8f7c5,#82e0aa);bottom:50px;left:100px;opacity:.3}
.blob4{width:300px;height:300px;background:radial-gradient(circle,#f9d4e8,#f48fb1);top:100px;right:200px;opacity:.35}

/* Hotel illustration silhouette */
.hotel-bg{
  position:absolute;bottom:0;left:0;right:0;height:45%;
  background:linear-gradient(180deg,transparent 0%,rgba(255,255,255,.15) 100%);
  display:flex;align-items:flex-end;justify-content:center;
  overflow:hidden;
}
.hotel-svg{width:100%;max-width:900px;opacity:.12}

/* Floating shapes */
.shape{position:absolute;border-radius:50%;animation:floatShape var(--d) ease-in-out infinite alternate}
@keyframes floatShape{from{transform:translateY(0) rotate(0deg)}to{transform:translateY(-20px) rotate(15deg)}}
.sh1{width:60px;height:60px;background:rgba(168,216,234,.5);top:15%;left:8%;--d:4s}
.sh2{width:40px;height:40px;background:rgba(255,179,71,.4);top:25%;right:10%;--d:5s;border-radius:8px}
.sh3{width:80px;height:80px;background:rgba(130,224,170,.3);bottom:30%;left:12%;--d:6s}
.sh4{width:50px;height:50px;background:rgba(244,143,177,.4);top:60%;right:8%;--d:3.5s;border-radius:10px}
.sh5{width:35px;height:35px;background:rgba(168,216,234,.6);bottom:40%;right:20%;--d:7s}

/* ── CARD ── */
.wrap{
  position:relative;z-index:10;
  min-height:100vh;display:flex;align-items:center;justify-content:center;
  padding:20px;
}

.card{
  background:rgba(255,255,255,.92);
  backdrop-filter:blur(24px);
  -webkit-backdrop-filter:blur(24px);
  border:1.5px solid rgba(255,255,255,.8);
  border-radius:24px;
  width:100%;max-width:460px;
  box-shadow:
    0 4px 6px rgba(0,0,0,.04),
    0 20px 60px rgba(0,0,0,.12),
    0 0 0 1px rgba(255,255,255,.5) inset;
  overflow:hidden;
  animation:cardIn .7s cubic-bezier(.16,1,.3,1) both;
}
@keyframes cardIn{from{opacity:0;transform:translateY(28px) scale(.97)}to{opacity:1;transform:none}}

/* top accent line */
.card::before{
  content:'';display:block;height:4px;
  background:linear-gradient(90deg,#4facfe 0%,#00f2fe 40%,#43e97b 70%,#f9d423 100%);
}

/* ── HOTEL BRAND ── */
.brand{
  padding:28px 32px 22px;text-align:center;
  background:linear-gradient(180deg,rgba(248,252,255,.8),transparent);
  border-bottom:1px solid rgba(0,0,0,.06);
}
.brand-icon{
  width:64px;height:64px;margin:0 auto 12px;
  background:linear-gradient(135deg,#4facfe,#00f2fe);
  border-radius:16px;
  display:flex;align-items:center;justify-content:center;
  font-size:1.8rem;
  box-shadow:0 8px 24px rgba(79,172,254,.35);
}
.brand-name{
  font-family:'Playfair Display',Georgia,serif;
  font-size:1.65rem;font-weight:700;
  background:linear-gradient(135deg,#1a1a2e,#16213e,#0f3460);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  letter-spacing:.5px;
}
.brand-sub{
  font-size:.68rem;letter-spacing:3.5px;text-transform:uppercase;
  color:#94a3b8;margin-top:4px;
}
.stars{color:#f59e0b;font-size:.85rem;letter-spacing:4px;margin-top:8px}

/* ── ROLE TABS ── */
.tabs{display:grid;grid-template-columns:1fr 1fr 1fr}
.tab{
  padding:14px 8px 12px;text-align:center;cursor:pointer;
  border-bottom:2.5px solid transparent;
  color:#94a3b8;transition:all .25s ease;
  background:transparent;border-top:none;border-left:none;border-right:none;
  font-family:'Inter',sans-serif;
}
.tab:hover{color:#475569;background:rgba(79,172,254,.04)}
.tab.active{color:#0f3460;border-bottom-color:#4facfe;background:rgba(79,172,254,.06)}
.tab-icon{font-size:1.3rem;display:block;margin-bottom:3px}
.tab-lbl{font-size:.62rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase}

/* ── FORM ── */
.form{padding:26px 32px 28px}

.greeting{
  font-family:'Playfair Display',Georgia,serif;
  font-size:1rem;font-weight:400;font-style:italic;
  color:#64748b;text-align:center;margin-bottom:22px;
  line-height:1.5;
}
.greeting strong{font-style:normal;font-weight:600;color:#0f3460}

/* error */
.err-box{
  display:none;
  background:#fff5f5;border:1.5px solid #fed7d7;border-radius:10px;
  padding:10px 14px;color:#c53030;font-size:.82rem;
  margin-bottom:16px;line-height:1.5;
  animation:shake .35s ease;
}
.err-box.show{display:flex;gap:8px;align-items:flex-start}
@keyframes shake{0%,100%{transform:none}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}

/* fields */
.fg{margin-bottom:16px}
.fg label{
  display:block;font-size:.7rem;font-weight:600;
  text-transform:uppercase;letter-spacing:1.2px;
  color:#475569;margin-bottom:6px;
}
.input-wrap{position:relative}
.input-wrap .ico{
  position:absolute;left:14px;top:50%;transform:translateY(-50%);
  font-size:1rem;pointer-events:none;color:#94a3b8;
}
.fg input{
  width:100%;padding:11px 14px 11px 42px;
  background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:10px;
  color:#1e293b;font-family:'Inter',sans-serif;font-size:.9rem;
  transition:all .2s ease;
}
.fg input:focus{
  outline:none;border-color:#4facfe;background:#fff;
  box-shadow:0 0 0 3px rgba(79,172,254,.15);
}
.fg input::placeholder{color:#cbd5e1}

/* button */
.btn-login{
  width:100%;padding:13px;border:none;border-radius:10px;cursor:pointer;
  background:linear-gradient(135deg,#4facfe 0%,#00f2fe 100%);
  color:#fff;font-family:'Inter',sans-serif;
  font-size:.9rem;font-weight:700;letter-spacing:.8px;
  box-shadow:0 4px 20px rgba(79,172,254,.4);
  transition:all .25s ease;margin-top:4px;
  position:relative;overflow:hidden;
}
.btn-login::after{
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,.2),transparent);
  opacity:0;transition:opacity .2s;
}
.btn-login:hover{transform:translateY(-1px);box-shadow:0 6px 28px rgba(79,172,254,.5)}
.btn-login:hover::after{opacity:1}
.btn-login:active{transform:none}
.btn-login:disabled{opacity:.7;pointer-events:none}

/* divider */
.divider{
  display:flex;align-items:center;gap:12px;
  color:#cbd5e1;font-size:.72rem;margin:18px 0 16px;
}
.divider::before,.divider::after{content:'';flex:1;height:1px;background:#e2e8f0}

/* quick creds */
.creds{
  background:linear-gradient(135deg,#f0f9ff,#e0f2fe);
  border:1px solid #bae6fd;border-radius:10px;
  padding:12px 14px;font-size:.78rem;color:#0369a1;
  line-height:1.8;
}
.creds strong{color:#0c4a6e;font-weight:600}
.cred-row{display:flex;align-items:center;gap:8px}
.cred-tag{
  display:inline-block;padding:1px 8px;border-radius:20px;
  font-size:.65rem;font-weight:700;letter-spacing:.5px;
}
.ct-admin{background:#dbeafe;color:#1d4ed8}
.ct-staff{background:#d1fae5;color:#065f46}
.ct-guest{background:#fef3c7;color:#92400e}

/* features */
.feats{
  display:grid;grid-template-columns:1fr 1fr 1fr;
  border-top:1px solid #f1f5f9;
  background:linear-gradient(180deg,#fafcff,#f0f7ff);
}
.feat{
  padding:14px 8px;text-align:center;
  border-right:1px solid #f1f5f9;font-size:.65rem;
  color:#94a3b8;letter-spacing:.5px;text-transform:uppercase;
  line-height:1.6;
}
.feat:last-child{border-right:none}
.feat-i{font-size:1.3rem;display:block;margin-bottom:3px}

/* loading spinner inside button */
@keyframes spin{to{transform:rotate(360deg)}}
.spin{
  display:inline-block;width:16px;height:16px;
  border:2px solid rgba(255,255,255,.4);border-top-color:#fff;
  border-radius:50%;animation:spin .6s linear infinite;
  vertical-align:middle;margin-right:6px;
}

/* server status pill */
.srv-pill{
  display:inline-flex;align-items:center;gap:5px;
  padding:3px 10px;border-radius:20px;font-size:.68rem;
  font-weight:600;margin-top:10px;
}
.srv-ok {background:#d1fae5;color:#065f46}
.srv-err{background:#fee2e2;color:#991b1b}
.dot{width:6px;height:6px;border-radius:50%;background:currentColor;animation:pulse 1.5s ease infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
</style>
</head>
<body>

<!-- Background -->
<div class="scene">
  <div class="sky"></div>
  <div class="blob blob1"></div>
  <div class="blob blob2"></div>
  <div class="blob blob3"></div>
  <div class="blob blob4"></div>
  <div class="shape sh1"></div>
  <div class="shape sh2"></div>
  <div class="shape sh3"></div>
  <div class="shape sh4"></div>
  <div class="shape sh5"></div>
  <!-- Hotel silhouette SVG -->
  <div class="hotel-bg">
    <svg class="hotel-svg" viewBox="0 0 1200 400" xmlns="http://www.w3.org/2000/svg">
      <rect x="100" y="100" width="200" height="300" fill="#1e293b"/>
      <rect x="120" y="80"  width="160" height="30"  fill="#1e293b"/>
      <rect x="150" y="50"  width="100" height="35"  fill="#1e293b"/>
      <rect x="170" y="20"  width="60"  height="35"  fill="#1e293b"/>
      <rect x="130" y="120" width="30"  height="40"  fill="#f8fafc"/>
      <rect x="170" y="120" width="30"  height="40"  fill="#f8fafc"/>
      <rect x="210" y="120" width="30"  height="40"  fill="#f8fafc"/>
      <rect x="130" y="180" width="30"  height="40"  fill="#f8fafc"/>
      <rect x="170" y="180" width="30"  height="40"  fill="#f8fafc"/>
      <rect x="210" y="180" width="30"  height="40"  fill="#f8fafc"/>
      <rect x="130" y="240" width="30"  height="40"  fill="#f8fafc"/>
      <rect x="170" y="240" width="30"  height="40"  fill="#f8fafc"/>
      <rect x="210" y="240" width="30"  height="40"  fill="#f8fafc"/>
      <rect x="155" y="320" width="90"  height="80"  fill="#0f3460"/>
      <rect x="400" y="150" width="400" height="250" fill="#1e293b"/>
      <rect x="420" y="120" width="360" height="40"  fill="#1e293b"/>
      <rect x="460" y="80"  width="280" height="45"  fill="#1e293b"/>
      <rect x="510" y="40"  width="180" height="45"  fill="#1e293b"/>
      <rect x="560" y="10"  width="80"  height="35"  fill="#1e293b"/>
      <rect x="420" y="170" width="40"  height="50"  fill="#fef3c7"/>
      <rect x="475" y="170" width="40"  height="50"  fill="#fef3c7"/>
      <rect x="530" y="170" width="40"  height="50"  fill="#fef3c7"/>
      <rect x="585" y="170" width="40"  height="50"  fill="#dbeafe"/>
      <rect x="640" y="170" width="40"  height="50"  fill="#fef3c7"/>
      <rect x="695" y="170" width="40"  height="50"  fill="#fef3c7"/>
      <rect x="740" y="170" width="40"  height="50"  fill="#fef3c7"/>
      <rect x="420" y="240" width="40"  height="50"  fill="#fef3c7"/>
      <rect x="475" y="240" width="40"  height="50"  fill="#dbeafe"/>
      <rect x="530" y="240" width="40"  height="50"  fill="#fef3c7"/>
      <rect x="585" y="240" width="40"  height="50"  fill="#fef3c7"/>
      <rect x="640" y="240" width="40"  height="50"  fill="#dbeafe"/>
      <rect x="695" y="240" width="40"  height="50"  fill="#fef3c7"/>
      <rect x="740" y="240" width="40"  height="50"  fill="#fef3c7"/>
      <rect x="550" y="310" width="100" height="90"  fill="#0f3460"/>
      <rect x="850" y="180" width="240" height="220" fill="#1e293b"/>
      <rect x="870" y="150" width="200" height="38"  fill="#1e293b"/>
      <rect x="900" y="120" width="140" height="35"  fill="#1e293b"/>
      <rect x="870" y="200" width="35"  height="45"  fill="#fef3c7"/>
      <rect x="920" y="200" width="35"  height="45"  fill="#fef3c7"/>
      <rect x="970" y="200" width="35"  height="45"  fill="#dbeafe"/>
      <rect x="1020" y="200" width="35" height="45"  fill="#fef3c7"/>
      <rect x="870" y="265" width="35"  height="45"  fill="#dbeafe"/>
      <rect x="920" y="265" width="35"  height="45"  fill="#fef3c7"/>
      <rect x="970" y="265" width="35"  height="45"  fill="#fef3c7"/>
      <rect x="1020" y="265" width="35" height="45"  fill="#fef3c7"/>
      <rect x="940" y="320" width="80"  height="80"  fill="#0f3460"/>
    </svg>
  </div>
</div>

<!-- Login Card -->
<div class="wrap">
<div class="card">

  <!-- Brand -->
  <div class="brand">
    <div class="brand-icon">🏨</div>
    <div class="brand-name">Grand Imperial</div>
    <div class="brand-sub">Hotel &amp; Resorts — Kathmandu</div>
    <div class="stars">★ ★ ★ ★ ★</div>
    <div id="srv-status"></div>
  </div>

  <!-- Role tabs -->
  <div class="tabs">
    <button class="tab active" data-role="Admin" onclick="pickRole(this)">
      <span class="tab-icon">🔑</span>
      <span class="tab-lbl">Admin</span>
    </button>
    <button class="tab" data-role="Staff" onclick="pickRole(this)">
      <span class="tab-icon">👨‍💼</span>
      <span class="tab-lbl">Staff</span>
    </button>
    <button class="tab" data-role="Guest" onclick="pickRole(this)">
      <span class="tab-icon">🛎️</span>
      <span class="tab-lbl">Guest</span>
    </button>
  </div>

  <!-- Form -->
  <div class="form">

    <div class="greeting">Sign in as <strong id="role-name">Administrator</strong></div>

    <div class="err-box" id="err-box">
      <span>⚠️</span><span id="err-msg"></span>
    </div>

    <div class="fg">
      <label>Username</label>
      <div class="input-wrap">
        <span class="ico">👤</span>
        <input type="text" id="f-user" placeholder="Enter username" autocomplete="username" />
      </div>
    </div>

    <div class="fg">
      <label>Password</label>
      <div class="input-wrap">
        <span class="ico">🔒</span>
        <input type="password" id="f-pass" placeholder="Enter password"
               autocomplete="current-password" onkeydown="if(event.key==='Enter')login()" />
      </div>
    </div>

    <button class="btn-login" id="btn-login" onclick="login()">Sign In →</button>

    <div class="divider">Default Credentials</div>

    <div class="creds">
      <div class="cred-row"><span class="cred-tag ct-admin">ADMIN</span> <strong>admin</strong> / admin123</div>
      <div class="cred-row"><span class="cred-tag ct-staff">STAFF</span> <strong>staff1</strong> / staff123</div>
      <div class="cred-row"><span class="cred-tag ct-guest">GUEST</span> <strong>guest1</strong> / guest123</div>
    </div>

  </div>

  <!-- Features strip -->
  <div class="feats">
    <div class="feat"><span class="feat-i">🏨</span>Room Mgmt</div>
    <div class="feat"><span class="feat-i">📋</span>Reservations</div>
    <div class="feat"><span class="feat-i">💰</span>Payments</div>
  </div>

</div>
</div>

<script>
var role = 'Admin';
var roleNames = {Admin:'Administrator', Staff:'Staff Member', Guest:'Guest'};

function pickRole(el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  role = el.dataset.role;
  document.getElementById('role-name').textContent = roleNames[role];
  hideErr();
}

function showErr(msg) {
  var b = document.getElementById('err-box');
  document.getElementById('err-msg').textContent = msg;
  b.classList.add('show');
}
function hideErr() { document.getElementById('err-box').classList.remove('show'); }

async function login() {
  var btn  = document.getElementById('btn-login');
  var user = document.getElementById('f-user').value.trim();
  var pass = document.getElementById('f-pass').value;
  hideErr();
  if (!user) { showErr('Please enter your username.'); return; }
  if (!pass) { showErr('Please enter your password.'); return; }

  btn.disabled = true;
  btn.innerHTML = '<span class="spin"></span>Signing in…';

  try {
    var resp = await fetch('includes/auth.php?action=login', {
      method : 'POST',
      headers: {'Content-Type': 'application/json'},
      body   : JSON.stringify({username: user, password: pass, role: role})
    });

    var text = await resp.text();
    var data;
    try { data = JSON.parse(text); }
    catch(e) {
      btn.disabled = false;
      btn.innerHTML = 'Sign In →';
      showErr('Server error — PHP did not return JSON. Check WAMP is fully started and setup.sql was run in phpMyAdmin.');
      console.error('Raw response:', text);
      return;
    }

    if (data.success) {
      btn.innerHTML = '✓ Welcome, ' + data.full_name + '!';
      btn.style.background = 'linear-gradient(135deg,#11998e,#38ef7d)';
      setTimeout(() => window.location.href = 'dashboard.php', 700);
    } else {
      btn.disabled = false;
      btn.innerHTML = 'Sign In →';
      showErr(data.error || 'Login failed.');
    }
  } catch(e) {
    btn.disabled = false;
    btn.innerHTML = 'Sign In →';
    showErr('Cannot reach server. Ensure WAMP is running (green icon in tray) and files are in C:\\wamp64\\www\\hotel\\');
  }
}

// Auto ping on load
(async function ping() {
  var el = document.getElementById('srv-status');
  try {
    var r = await fetch('includes/auth.php?action=ping');
    var t = await r.text();
    var d = JSON.parse(t);
    if (d.success) {
      el.innerHTML = '<span class="srv-pill srv-ok"><span class="dot"></span>Server Online · PHP ' + d.php + '</span>';
    } else {
      el.innerHTML = '<span class="srv-pill srv-err"><span class="dot"></span>' + d.error + '</span>';
    }
  } catch(e) {
    el.innerHTML = '<span class="srv-pill srv-err"><span class="dot"></span>Server offline — start WAMP</span>';
  }
})();
</script>
</body>
</html>
