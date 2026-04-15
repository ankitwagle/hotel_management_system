<?php
error_reporting(0);
ini_set('display_errors', '0');
while (ob_get_level()) ob_end_clean();
ob_start();

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_name('HOTEL_SESS');
    session_start();
}

require_once __DIR__ . '/db.php';

function OK($d=[])  { while(ob_get_level())ob_end_clean(); header('Content-Type:application/json;charset=utf-8'); echo json_encode(array_merge(['success'=>true],$d)); exit; }
function FAIL($m)   { while(ob_get_level())ob_end_clean(); header('Content-Type:application/json;charset=utf-8'); echo json_encode(['success'=>false,'error'=>$m]); exit; }
function needLogin(){ if(empty($_SESSION['uid'])){while(ob_get_level())ob_end_clean();header('Content-Type:application/json;charset=utf-8');echo json_encode(['success'=>false,'error'=>'Not logged in.','auth'=>false]);exit;} }
function needRole(...$roles){ needLogin(); if(!in_array($_SESSION['role'],$roles)) FAIL('Access denied for '.$_SESSION['role'].'.'); }
function x($db,$v){ return $db->real_escape_string(trim($v??'')); }

needLogin();
$db     = getDB();
$action = trim($_GET['action'] ?? '');
$ROLE   = $_SESSION['role'];

$raw  = file_get_contents('php://input');
$B    = json_decode($raw,true) ?: $_POST;

switch($action){

/* ════════════════════════════════
   DASHBOARD
   ════════════════════════════════ */
case 'dashboard':
    if($ROLE==='Guest'){
        $gid=(int)($_SESSION['guest_id']??0);
        $tot=$db->query("SELECT COUNT(*) c FROM bookings WHERE guest_id=$gid")->fetch_assoc()['c'];
        $act=$db->query("SELECT COUNT(*) c FROM bookings WHERE guest_id=$gid AND status IN('Confirmed','Checked-In')")->fetch_assoc()['c'];
        $sp =$db->query("SELECT COALESCE(SUM(total_amount),0) s FROM bookings WHERE guest_id=$gid AND status!='Cancelled'")->fetch_assoc()['s'];
        OK(['total_bookings'=>$tot,'active_bookings'=>$act,'total_spent'=>number_format($sp,2)]);
    }
    needRole('Admin','Staff');
    $s=[];
    $s['rooms_total']    =$db->query("SELECT COUNT(*) c FROM rooms")->fetch_assoc()['c'];
    $s['rooms_available']=$db->query("SELECT COUNT(*) c FROM rooms WHERE status='Available'")->fetch_assoc()['c'];
    $s['rooms_occupied'] =$db->query("SELECT COUNT(*) c FROM rooms WHERE status='Occupied'")->fetch_assoc()['c'];
    $s['rooms_reserved'] =$db->query("SELECT COUNT(*) c FROM rooms WHERE status='Reserved'")->fetch_assoc()['c'];
    $s['guests_total']   =$db->query("SELECT COUNT(*) c FROM guests")->fetch_assoc()['c'];
    $s['bookings_active']=$db->query("SELECT COUNT(*) c FROM bookings WHERE status IN('Confirmed','Checked-In')")->fetch_assoc()['c'];
    $s['bookings_total'] =$db->query("SELECT COUNT(*) c FROM bookings")->fetch_assoc()['c'];
    $s['staff_active']   =$db->query("SELECT COUNT(*) c FROM staff WHERE status='Active'")->fetch_assoc()['c'];
    $rev=$db->query("SELECT COALESCE(SUM(total_amount),0) r FROM bookings WHERE status!='Cancelled' AND MONTH(created_at)=MONTH(NOW()) AND YEAR(created_at)=YEAR(NOW())")->fetch_assoc()['r'];
    $s['monthly_revenue']=number_format((float)$rev,2,'.',',');
    $recent=[];
    $q=$db->query("SELECT b.booking_ref,b.check_in,b.check_out,b.status,b.total_amount,CONCAT(g.first_name,' ',g.last_name) gn,r.room_number,r.room_type FROM bookings b JOIN guests g ON b.guest_id=g.id JOIN rooms r ON b.room_id=r.id ORDER BY b.created_at DESC LIMIT 6");
    while($r=$q->fetch_assoc()) $recent[]=$r;
    $s['recent']=$recent;
    OK($s);

/* ════════════════════════════════
   ROOMS
   ════════════════════════════════ */
case 'rooms_list':
    $w='1=1';
    if(!empty($_GET['status'])) $w.=" AND status='".x($db,$_GET['status'])."'";
    if(!empty($_GET['type']))   $w.=" AND room_type='".x($db,$_GET['type'])."'";
    $list=[];
    $q=$db->query("SELECT * FROM rooms WHERE $w ORDER BY CAST(room_number AS UNSIGNED),room_number");
    while($r=$q->fetch_assoc()) $list[]=$r;
    OK(['rooms'=>$list]);

case 'rooms_available':
    $ci=x($db,$_GET['check_in']??''); $co=x($db,$_GET['check_out']??'');
    if(!$ci||!$co) FAIL('Dates required.');
    $list=[];
    $q=$db->query("SELECT * FROM rooms WHERE status!='Maintenance' AND id NOT IN(SELECT room_id FROM bookings WHERE status NOT IN('Cancelled','Checked-Out') AND check_in<'$co' AND check_out>'$ci') ORDER BY room_type,room_number");
    while($r=$q->fetch_assoc()) $list[]=$r;
    OK(['rooms'=>$list]);

case 'rooms_add':
    needRole('Admin');
    $rn=x($db,$B['room_number']??''); $tp=x($db,$B['room_type']??'Standard');
    $fl=(int)($B['floor']??1); $cap=(int)($B['capacity']??2);
    $pr=(float)($B['price_per_night']??0); $st=x($db,$B['status']??'Available');
    $am=x($db,$B['amenities']??''); $de=x($db,$B['description']??'');
    if(!$rn) FAIL('Room number required.');
    if($pr<=0) FAIL('Price must be greater than 0.');
    if($db->query("SELECT id FROM rooms WHERE room_number='$rn'")->num_rows>0) FAIL("Room $rn already exists.");
    $db->query("INSERT INTO rooms(room_number,room_type,floor,capacity,price_per_night,status,amenities,description)VALUES('$rn','$tp',$fl,$cap,$pr,'$st','$am','$de')");
    if($db->affected_rows>0) OK(['id'=>$db->insert_id,'message'=>"Room $rn added."]);
    FAIL($db->error);

case 'rooms_update':
    needRole('Admin');
    $id=(int)($B['id']??0); if(!$id) FAIL('ID missing.');
    $tp=x($db,$B['room_type']??''); $fl=(int)($B['floor']??1); $cap=(int)($B['capacity']??1);
    $pr=(float)($B['price_per_night']??0); $st=x($db,$B['status']??'Available');
    $am=x($db,$B['amenities']??''); $de=x($db,$B['description']??'');
    $db->query("UPDATE rooms SET room_type='$tp',floor=$fl,capacity=$cap,price_per_night=$pr,status='$st',amenities='$am',description='$de' WHERE id=$id");
    OK(['message'=>'Room updated.']);

case 'rooms_delete':
    needRole('Admin');
    $id=(int)($B['id']??0); if(!$id) FAIL('ID missing.');
    if($db->query("SELECT id FROM bookings WHERE room_id=$id AND status IN('Confirmed','Checked-In')")->num_rows>0) FAIL('Room has active bookings.');
    $db->query("DELETE FROM rooms WHERE id=$id");
    OK(['message'=>'Room deleted.']);

/* ════════════════════════════════
   GUESTS
   ════════════════════════════════ */
case 'guests_list':
    needRole('Admin','Staff');
    $w='1=1';
    if(!empty($_GET['q'])){$q=x($db,$_GET['q']); $w.=" AND(first_name LIKE'%$q%' OR last_name LIKE'%$q%' OR email LIKE'%$q%' OR phone LIKE'%$q%')";}
    $list=[];
    $r=$db->query("SELECT * FROM guests WHERE $w ORDER BY created_at DESC");
    while($row=$r->fetch_assoc()) $list[]=$row;
    OK(['guests'=>$list]);

case 'guests_all':
    needRole('Admin','Staff');
    $list=[];
    $r=$db->query("SELECT id,first_name,last_name,email,phone FROM guests ORDER BY first_name,last_name");
    while($row=$r->fetch_assoc()) $list[]=$row;
    OK(['guests'=>$list]);

case 'guests_add':
    needRole('Admin','Staff');
    $fn=x($db,$B['first_name']??''); $ln=x($db,$B['last_name']??''); $em=x($db,$B['email']??'');
    $ph=x($db,$B['phone']??''); $addr=x($db,$B['address']??''); $idt=x($db,$B['id_type']??'Passport');
    $idn=x($db,$B['id_number']??''); $nat=x($db,$B['nationality']??''); $dob=x($db,$B['dob']??'');
    if(!$fn||!$ln) FAIL('Name required.'); if(!$em) FAIL('Email required.');
    if(!filter_var($em,FILTER_VALIDATE_EMAIL)) FAIL('Invalid email.');
    if($db->query("SELECT id FROM guests WHERE email='$em'")->num_rows>0) FAIL('Email already exists.');
    $dobSQL=$dob?"'$dob'":'NULL';
    $db->query("INSERT INTO guests(first_name,last_name,email,phone,address,id_type,id_number,nationality,date_of_birth)VALUES('$fn','$ln','$em','$ph','$addr','$idt','$idn','$nat',$dobSQL)");
    if($db->affected_rows>0) OK(['id'=>$db->insert_id,'message'=>'Guest registered.']);
    FAIL($db->error);

case 'guests_update':
    needRole('Admin','Staff');
    $id=(int)($B['id']??0); if(!$id) FAIL('ID missing.');
    $fn=x($db,$B['first_name']??''); $ln=x($db,$B['last_name']??''); $em=x($db,$B['email']??'');
    $ph=x($db,$B['phone']??''); $addr=x($db,$B['address']??''); $idt=x($db,$B['id_type']??'Passport');
    $idn=x($db,$B['id_number']??''); $nat=x($db,$B['nationality']??'');
    $db->query("UPDATE guests SET first_name='$fn',last_name='$ln',email='$em',phone='$ph',address='$addr',id_type='$idt',id_number='$idn',nationality='$nat' WHERE id=$id");
    OK(['message'=>'Guest updated.']);

case 'guests_delete':
    needRole('Admin');
    $id=(int)($B['id']??0); if(!$id) FAIL('ID missing.');
    $db->query("DELETE FROM guests WHERE id=$id");
    OK(['message'=>'Guest deleted.']);

/* ════════════════════════════════
   BOOKINGS
   ════════════════════════════════ */
case 'bookings_list':
    $w='1=1';
    if($ROLE==='Guest'){
        $gid=(int)($_SESSION['guest_id']??0);
        if(!$gid) FAIL('No guest profile linked to your account.');
        $w="b.guest_id=$gid";
    } else {
        needRole('Admin','Staff');
        if(!empty($_GET['status'])) $w.=" AND b.status='".x($db,$_GET['status'])."'";
        if(!empty($_GET['q'])){$q=x($db,$_GET['q']); $w.=" AND(b.booking_ref LIKE'%$q%' OR g.first_name LIKE'%$q%' OR g.last_name LIKE'%$q%' OR r.room_number LIKE'%$q%')";}
    }
    $list=[];
    $r=$db->query("SELECT b.*,CONCAT(g.first_name,' ',g.last_name) gn,g.email ge,r.room_number,r.room_type,r.price_per_night FROM bookings b JOIN guests g ON b.guest_id=g.id JOIN rooms r ON b.room_id=r.id WHERE $w ORDER BY b.created_at DESC");
    while($row=$r->fetch_assoc()) $list[]=$row;
    OK(['bookings'=>$list]);

case 'bookings_active':
    needRole('Admin','Staff');
    $list=[];
    $r=$db->query("SELECT b.id,b.booking_ref,b.total_amount,b.paid_amount,CONCAT(g.first_name,' ',g.last_name) gn FROM bookings b JOIN guests g ON b.guest_id=g.id WHERE b.status IN('Confirmed','Checked-In') ORDER BY b.booking_ref");
    while($row=$r->fetch_assoc()) $list[]=$row;
    OK(['bookings'=>$list]);

case 'bookings_add':
    $gid=(int)($B['guest_id']??0); $rid=(int)($B['room_id']??0);
    $ci=x($db,$B['check_in']??''); $co=x($db,$B['check_out']??'');
    $ng=(int)($B['num_guests']??1); $ta=(float)($B['total_amount']??0);
    $req=x($db,$B['special_requests']??'');
    if(!$gid) FAIL('Select a guest.'); if(!$rid) FAIL('Select a room.');
    if(!$ci||!$co) FAIL('Dates required.'); if($ci>=$co) FAIL('Check-out must be after check-in.');
    if($ta<=0) FAIL('Total amount must be > 0.');
    if($ROLE==='Guest'&&$gid!=(int)($_SESSION['guest_id']??0)) FAIL('Guests can only book for themselves.');
    if($db->query("SELECT id FROM bookings WHERE room_id=$rid AND status NOT IN('Cancelled','Checked-Out') AND check_in<'$co' AND check_out>'$ci'")->num_rows>0) FAIL('Room not available for selected dates.');
    do{ $ref='BK'.strtoupper(substr(md5(uniqid(rand(),true)),0,8)); }while($db->query("SELECT id FROM bookings WHERE booking_ref='$ref'")->num_rows>0);
    $db->query("INSERT INTO bookings(booking_ref,guest_id,room_id,check_in,check_out,num_guests,total_amount,special_requests,status)VALUES('$ref',$gid,$rid,'$ci','$co',$ng,$ta,'$req','Confirmed')");
    if($db->affected_rows>0){
        $db->query("UPDATE rooms SET status='Reserved' WHERE id=$rid");
        OK(['id'=>$db->insert_id,'booking_ref'=>$ref,'message'=>"Booking confirmed! Ref: $ref"]);
    }
    FAIL($db->error);

case 'bookings_status':
    needRole('Admin','Staff');
    $id=(int)($B['id']??0); $st=x($db,$B['status']??'');
    if(!$id||!$st) FAIL('ID and status required.');
    $db->query("UPDATE bookings SET status='$st' WHERE id=$id");
    $bk=$db->query("SELECT room_id FROM bookings WHERE id=$id")->fetch_assoc();
    if($bk){
        $rid=(int)$bk['room_id'];
        if($st==='Checked-In')  $db->query("UPDATE rooms SET status='Occupied'  WHERE id=$rid");
        if($st==='Checked-Out') $db->query("UPDATE rooms SET status='Available' WHERE id=$rid");
        if($st==='Cancelled')   $db->query("UPDATE rooms SET status='Available' WHERE id=$rid");
    }
    OK(['message'=>"Status updated to $st."]);

case 'bookings_delete':
    needRole('Admin');
    $id=(int)($B['id']??0); if(!$id) FAIL('ID missing.');
    $bk=$db->query("SELECT room_id FROM bookings WHERE id=$id")->fetch_assoc();
    if($bk) $db->query("UPDATE rooms SET status='Available' WHERE id=".(int)$bk['room_id']);
    $db->query("DELETE FROM bookings WHERE id=$id");
    OK(['message'=>'Booking deleted.']);

/* ════════════════════════════════
   STAFF
   ════════════════════════════════ */
case 'staff_list':
    needRole('Admin');
    $w='1=1';
    if(!empty($_GET['role'])) $w.=" AND role='".x($db,$_GET['role'])."'";
    if(!empty($_GET['q'])){$q=x($db,$_GET['q']); $w.=" AND(first_name LIKE'%$q%' OR last_name LIKE'%$q%' OR email LIKE'%$q%')";}
    $list=[];
    $r=$db->query("SELECT * FROM staff WHERE $w ORDER BY created_at DESC");
    while($row=$r->fetch_assoc()) $list[]=$row;
    OK(['staff'=>$list]);

case 'staff_add':
    needRole('Admin');
    $fn=x($db,$B['first_name']??''); $ln=x($db,$B['last_name']??''); $em=x($db,$B['email']??'');
    $ph=x($db,$B['phone']??''); $rl=x($db,$B['role']??''); $de=x($db,$B['department']??'');
    $sal=(float)($B['salary']??0); $hd=x($db,$B['hire_date']??date('Y-m-d')); $st=x($db,$B['status']??'Active');
    if(!$fn||!$ln) FAIL('Name required.'); if(!$em) FAIL('Email required.'); if(!$rl) FAIL('Role required.');
    if($db->query("SELECT id FROM staff WHERE email='$em'")->num_rows>0) FAIL('Email already exists.');
    $db->query("INSERT INTO staff(first_name,last_name,email,phone,role,department,salary,hire_date,status)VALUES('$fn','$ln','$em','$ph','$rl','$de',$sal,'$hd','$st')");
    if($db->affected_rows>0) OK(['id'=>$db->insert_id,'message'=>'Staff added.']);
    FAIL($db->error);

case 'staff_update':
    needRole('Admin');
    $id=(int)($B['id']??0); if(!$id) FAIL('ID missing.');
    $fn=x($db,$B['first_name']??''); $ln=x($db,$B['last_name']??''); $em=x($db,$B['email']??'');
    $ph=x($db,$B['phone']??''); $rl=x($db,$B['role']??''); $de=x($db,$B['department']??'');
    $sal=(float)($B['salary']??0); $hd=x($db,$B['hire_date']??''); $st=x($db,$B['status']??'Active');
    $db->query("UPDATE staff SET first_name='$fn',last_name='$ln',email='$em',phone='$ph',role='$rl',department='$de',salary=$sal,hire_date='$hd',status='$st' WHERE id=$id");
    OK(['message'=>'Staff updated.']);

case 'staff_delete':
    needRole('Admin');
    $id=(int)($B['id']??0); if(!$id) FAIL('ID missing.');
    $db->query("DELETE FROM staff WHERE id=$id");
    OK(['message'=>'Staff removed.']);

/* ════════════════════════════════
   PAYMENTS
   ════════════════════════════════ */
case 'payments_list':
    needRole('Admin','Staff');
    $list=[];
    $r=$db->query("SELECT p.*,b.booking_ref,b.total_amount bt,b.paid_amount bp,CONCAT(g.first_name,' ',g.last_name) gn FROM payments p JOIN bookings b ON p.booking_id=b.id JOIN guests g ON b.guest_id=g.id ORDER BY p.payment_date DESC");
    while($row=$r->fetch_assoc()) $list[]=$row;
    OK(['payments'=>$list]);

case 'payments_add':
    needRole('Admin','Staff');
    $bid=(int)($B['booking_id']??0); $amt=(float)($B['amount']??0);
    $pm=x($db,$B['payment_method']??'Cash'); $ref=x($db,$B['reference_number']??''); $nt=x($db,$B['notes']??'');
    if(!$bid) FAIL('Select a booking.'); if($amt<=0) FAIL('Amount must be > 0.');
    $db->query("INSERT INTO payments(booking_id,amount,payment_method,reference_number,notes)VALUES($bid,$amt,'$pm','$ref','$nt')");
    if($db->affected_rows>0){ $db->query("UPDATE bookings SET paid_amount=paid_amount+$amt WHERE id=$bid"); OK(['message'=>'Payment recorded.']); }
    FAIL($db->error);

/* ════════════════════════════════
   SERVICES
   ════════════════════════════════ */
case 'services_list':
    needRole('Admin','Staff');
    $list=[];
    $r=$db->query("SELECT s.*,b.booking_ref,CONCAT(g.first_name,' ',g.last_name) gn FROM services s JOIN bookings b ON s.booking_id=b.id JOIN guests g ON b.guest_id=g.id ORDER BY s.service_date DESC");
    while($row=$r->fetch_assoc()) $list[]=$row;
    OK(['services'=>$list]);

case 'services_add':
    needRole('Admin','Staff');
    $bid=(int)($B['booking_id']??0); $sn=x($db,$B['service_name']??'');
    $stp=x($db,$B['service_type']??'Other'); $amt=(float)($B['amount']??0);
    if(!$bid) FAIL('Select a booking.'); if(!$sn) FAIL('Service name required.'); if($amt<=0) FAIL('Amount must be > 0.');
    $db->query("INSERT INTO services(booking_id,service_name,service_type,amount)VALUES($bid,'$sn','$stp',$amt)");
    if($db->affected_rows>0) OK(['message'=>'Service added.']);
    FAIL($db->error);

case 'services_status':
    needRole('Admin','Staff');
    $id=(int)($B['id']??0); $st=x($db,$B['status']??'');
    if(!$id||!$st) FAIL('ID and status required.');
    $db->query("UPDATE services SET status='$st' WHERE id=$id");
    OK(['message'=>"Service marked $st."]);

/* ════════════════════════════════
   USERS
   ════════════════════════════════ */
case 'users_list':
    needRole('Admin');
    $list=[];
    $r=$db->query("SELECT id,username,full_name,role,status,last_login,created_at FROM users ORDER BY role,full_name");
    while($row=$r->fetch_assoc()) $list[]=$row;
    OK(['users'=>$list]);

case 'users_add':
    needRole('Admin');
    $un=x($db,$B['username']??''); $fn=x($db,$B['full_name']??'');
    $rl=x($db,$B['role']??'Staff'); $pw=trim($B['password']??''); $st=x($db,$B['status']??'Active');
    $gid=!empty($B['guest_id'])?(int)$B['guest_id']:'NULL';
    if(!$un) FAIL('Username required.'); if(!$fn) FAIL('Full name required.');
    if(strlen($pw)<4) FAIL('Password must be at least 4 characters.');
    if($db->query("SELECT id FROM users WHERE username='$un'")->num_rows>0) FAIL("Username '$un' already taken.");
    $pwesc=x($db,$pw);
    $db->query("INSERT INTO users(username,password,full_name,role,status,guest_id)VALUES('$un','$pwesc','$fn','$rl','$st',$gid)");
    if($db->affected_rows>0) OK(['id'=>$db->insert_id,'message'=>"User '$un' created."]);
    FAIL($db->error);

case 'users_set_password':
    needRole('Admin');
    $id=(int)($B['id']??0); $pw=trim($B['password']??'');
    if(!$id) FAIL('User ID missing.'); if(strlen($pw)<4) FAIL('Password min 4 chars.');
    $pwesc=x($db,$pw);
    $db->query("UPDATE users SET password='$pwesc' WHERE id=$id");
    OK(['message'=>'Password updated.']);

case 'users_toggle':
    needRole('Admin');
    $id=(int)($B['id']??0); if(!$id) FAIL('ID missing.');
    $cur=$db->query("SELECT status FROM users WHERE id=$id")->fetch_assoc();
    $new=$cur['status']==='Active'?'Inactive':'Active';
    $db->query("UPDATE users SET status='$new' WHERE id=$id");
    OK(['message'=>"User $new.",'new_status'=>$new]);

case 'users_delete':
    needRole('Admin');
    $id=(int)($B['id']??0); if(!$id) FAIL('ID missing.');
    if($id===(int)$_SESSION['uid']) FAIL('Cannot delete your own account.');
    $db->query("DELETE FROM users WHERE id=$id");
    OK(['message'=>'User deleted.']);

default:
    FAIL("Unknown action: '$action'");
}
$db->close();
?>
