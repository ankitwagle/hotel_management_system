<?php
// ── Suppress ALL PHP warnings/notices so they don't break JSON ──
error_reporting(0);
ini_set('display_errors', '0');
while (ob_get_level()) ob_end_clean();
ob_start();

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_name('HOTEL_SESS');
    session_start();
}

require_once __DIR__ . '/db.php';

$action = trim($_GET['action'] ?? '');

// ── Helpers ───────────────────────────────────────────────────
function OK($d = []) {
    while (ob_get_level()) ob_end_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(array_merge(['success' => true], $d));
    exit;
}
function FAIL($msg) {
    while (ob_get_level()) ob_end_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'error' => $msg]);
    exit;
}

// ── PING — quick connectivity test ───────────────────────────
if ($action === 'ping') {
    $db = getDB();
    $db->close();
    OK(['php' => PHP_VERSION, 'db' => DB_NAME, 'msg' => 'All systems OK']);
}

// ── LOGIN ─────────────────────────────────────────────────────
if ($action === 'login') {
    $raw  = file_get_contents('php://input');
    $body = json_decode($raw, true);
    if (!$body) $body = $_POST;

    $username = trim($body['username'] ?? '');
    $password = trim($body['password'] ?? '');
    $role     = trim($body['role']     ?? '');

    if ($username === '') FAIL('Please enter your username.');
    if ($password === '') FAIL('Please enter your password.');
    if ($role     === '') FAIL('Please select a role tab.');

    $db = getDB();
    $u  = $db->real_escape_string($username);
    $r  = $db->real_escape_string($role);

    // Plain text comparison — no hashing
    $res = $db->query(
        "SELECT id, username, password, full_name, role, status, guest_id
         FROM users
         WHERE username = '$u' AND role = '$r'
         LIMIT 1"
    );

    if (!$res || $res->num_rows === 0) {
        $db->close();
        FAIL('No ' . $role . ' account found with username "' . htmlspecialchars($username) . '". Check the role tab.');
    }

    $user = $res->fetch_assoc();

    if ($user['status'] !== 'Active') {
        $db->close();
        FAIL('This account is inactive. Contact the administrator.');
    }

    // Direct string comparison
    if ($user['password'] !== $password) {
        $db->close();
        FAIL('Wrong password. Try again.');
    }

    // Update last login
    $id = (int)$user['id'];
    $db->query("UPDATE users SET last_login = NOW() WHERE id = $id");
    $db->close();

    // Save session
    $_SESSION['uid']       = $user['id'];
    $_SESSION['username']  = $user['username'];
    $_SESSION['role']      = $user['role'];
    $_SESSION['full_name'] = $user['full_name'];
    $_SESSION['guest_id']  = $user['guest_id'];

    OK([
        'role'      => $user['role'],
        'full_name' => $user['full_name'],
        'username'  => $user['username'],
    ]);
}

// ── LOGOUT ────────────────────────────────────────────────────
if ($action === 'logout') {
    $_SESSION = [];
    session_destroy();
    OK(['msg' => 'Logged out.']);
}

// ── SESSION CHECK ─────────────────────────────────────────────
if ($action === 'check') {
    if (!empty($_SESSION['uid'])) {
        OK([
            'logged_in' => true,
            'role'      => $_SESSION['role'],
            'full_name' => $_SESSION['full_name'],
            'username'  => $_SESSION['username'],
            'guest_id'  => $_SESSION['guest_id'] ?? null,
        ]);
    }
    OK(['logged_in' => false]);
}

FAIL('Unknown action: "' . htmlspecialchars($action) . '"');
?>
