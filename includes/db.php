<?php
// ── Database settings ─────────────────────────────────────
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');          // WAMP default = empty
define('DB_NAME', 'hotel_db');

function getDB() {
    $c = @new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($c->connect_error) {
        sendJSON(['success'=>false,
            'error'=>'Cannot connect to MySQL. Start WAMP (green icon) and run setup.sql in phpMyAdmin. Detail: '.$c->connect_error]);
        exit;
    }
    $c->set_charset('utf8mb4');
    return $c;
}

function sendJSON($data) {
    while (ob_get_level()) ob_end_clean();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
}
?>
