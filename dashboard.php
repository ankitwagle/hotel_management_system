<?php
error_reporting(0);
ini_set('display_errors','0');
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_name('HOTEL_SESS');
    session_start();
}
if (empty($_SESSION['uid'])) {
    header('Location: index.php');
    exit;
}
$ROLE = $_SESSION['role'];
$NAME = $_SESSION['full_name'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Grand Imperial — <?= htmlspecialchars($ROLE) ?> Panel</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
</head>
<body data-role="<?= $ROLE ?>">

<!-- SIDEBAR -->
<aside id="sidebar">
  <div class="sb-top">
    <div class="sb-logo">
      <div class="sb-ico">🏨</div>
      <div class="sb-hotel">Grand Imperial</div>
      <div class="sb-city">Kathmandu, Nepal</div>
    </div>
    <div class="sb-role-badge"><?php
      if($ROLE==='Admin')      echo '🔑 Admin Portal';
      elseif($ROLE==='Staff')  echo '👨‍💼 Staff Portal';
      else                     echo '🛎️ Guest Portal';
    ?></div>
  </div>
  <nav id="sb-nav" class="sb-nav"></nav>
  <div class="sb-foot">
    <div class="sb-user">
      <div class="sb-av"><?= strtoupper(substr($NAME,0,2)) ?></div>
      <div>
        <div class="sb-uname"><?= htmlspecialchars($NAME) ?></div>
        <div class="sb-urole"><?= $ROLE ?></div>
      </div>
    </div>
    <button class="btn-out" onclick="logout()">⏻ Sign Out</button>
  </div>
</aside>

<!-- MAIN -->
<div id="main">
  <header id="hdr">
    <div class="hdr-l">
      <button class="ham" onclick="toggleSb()">☰</button>
      <div>
        <div class="hdr-title" id="hdr-t">Dashboard</div>
        <div class="hdr-sub"   id="hdr-s">Overview</div>
      </div>
    </div>
    <div class="hdr-r">
      <div class="hdr-clk" id="clk"></div>
      <div class="hdr-user">
        <div class="hdr-av"><?= strtoupper(substr($NAME,0,2)) ?></div>
        <div>
          <div class="hdr-name"><?= htmlspecialchars($NAME) ?></div>
          <div class="hdr-role"><?= $ROLE ?></div>
        </div>
      </div>
    </div>
  </header>
  <div id="pg"></div>
</div>

<div id="toasts"></div>

<script>
var ROLE     = '<?= $ROLE ?>';
var UNAME    = <?= json_encode($NAME) ?>;
var GUEST_ID = <?= (int)($_SESSION['guest_id']??0) ?>;
</script>
<script src="js/app.js"></script>
</body>
</html>
