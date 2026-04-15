'use strict';
/* ================================================================
   GRAND IMPERIAL HOTEL  —  app.js  v4  (light theme)
   ================================================================ */
const API  = 'includes/api.php';
const AUTH = 'includes/auth.php';
var _rooms=[],_guests=[],_bookings=[],_staff=[],_users=[];
var rv='grid'; // room view

/* ── UTILS ── */
async function api(action,method,data){
  try{
    var url=API+'?action='+action, o={method:method||'GET',headers:{'Content-Type':'application/json'}};
    if(method==='GET'&&data) Object.keys(data).forEach(k=>url+='&'+k+'='+encodeURIComponent(data[k]));
    else if(data) o.body=JSON.stringify(data);
    var r=await fetch(url,o);
    var t=await r.text();
    try{ return JSON.parse(t); }catch(e){ return{success:false,error:'Server error: '+t.substring(0,100)}; }
  }catch(e){return{success:false,error:e.message};}
}
function toast(msg,type){
  var ico={ok:'✅',err:'❌',warn:'⚠️'};
  var el=document.createElement('div');
  el.className='toast t'+(type||'ok');
  el.innerHTML='<span class="ti">'+(ico[type]||'ℹ️')+'</span><span class="tm">'+msg+'</span>';
  document.getElementById('toasts').appendChild(el);
  setTimeout(()=>{el.classList.add('out');setTimeout(()=>el.remove(),260);},3800);
}
function spn(id){document.getElementById(id).innerHTML='<div style="display:flex;align-items:center;justify-content:center;gap:10px;padding:60px;color:var(--txt3)"><div class="spin"></div>Loading…</div>';}
function emp(id,icon,msg){document.getElementById(id).innerHTML='<div class="empty"><div class="ei">'+icon+'</div><div class="em">'+msg+'</div></div>';}
function g(id){return document.getElementById(id);}
function v(id){return(g(id)||{}).value||'';}
function sv(id,val){if(g(id))g(id).value=val||'';}
function openM(id){g(id).classList.add('show');}
function closeM(id){g(id).classList.remove('show');}
function sal(id,msg,t){g(id).innerHTML='<div class="al al-'+(t||'err')+'">⚠ '+msg+'</div>';}
function cal(id){if(g(id))g(id).innerHTML='';}
function fdate(d){if(!d)return'—';return new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});}
function fmoney(n){return'NPR '+parseFloat(n||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});}
function bdg(s){
  if(!s)return'';
  var m={Available:'b-green',Occupied:'b-blue',Reserved:'b-amber',Maintenance:'b-red',
    Confirmed:'b-amber','Checked-In':'b-blue','Checked-Out':'b-grey',Cancelled:'b-red',
    Active:'b-green',Inactive:'b-grey',Pending:'b-amber',Completed:'b-green'};
  return'<span class="badge '+(m[s]||'b-grey')+'">'+s+'</span>';
}
function rpill(r){var m={Admin:'rp-admin',Staff:'rp-staff',Guest:'rp-guest'};return'<span class="rp '+(m[r]||'')+'">'+r+'</span>';}

/* ── CLOCK ── */
function clock(){var e=g('clk');if(!e)return;var n=new Date();e.innerHTML=n.toLocaleDateString('en-GB',{weekday:'short',day:'2-digit',month:'short',year:'numeric'})+'<br><b>'+n.toLocaleTimeString('en-GB')+'</b>';}

/* ── SIDEBAR ── */
function toggleSb(){g('sidebar').classList.toggle('open');}
document.addEventListener('click',e=>{var sb=g('sidebar');if(sb&&sb.classList.contains('open')&&!sb.contains(e.target)&&!g('hdr').contains(e.target))sb.classList.remove('open');});

/* ── LOGOUT ── */
async function logout(){await fetch(AUTH+'?action=logout',{method:'POST'});window.location.href='index.php';}

/* ── NAV ── */
var PAGE='';
var PT={
  dashboard:['Dashboard','Hotel overview & analytics'],
  rooms:['Rooms','Room inventory and management'],
  guests:['Guests','Guest registry'],
  bookings:['Reservations','Booking management'],
  staff:['Staff','Employee directory'],
  payments:['Payments','Financial records'],
  services:['Services','Guest service requests'],
  users:['User Accounts','Login & access management'],
  my_bookings:['My Bookings','Your reservations'],
  browse:['Browse Rooms','Find and book your room'],
};

function nav(page){
  PAGE=page;
  document.querySelectorAll('.sb-item').forEach(e=>e.classList.toggle('active',e.dataset.p===page));
  var t=PT[page]||[page,''];
  g('hdr-t').textContent=t[0]; g('hdr-s').textContent=t[1];
  g('pg').innerHTML='<div class="pg-load"><div class="spin"></div>Loading…</div>';
  var fn={dashboard:pgDash,rooms:pgRooms,guests:pgGuests,bookings:pgBookings,
          staff:pgStaff,payments:pgPayments,services:pgServices,users:pgUsers,
          my_bookings:pgMyBk,browse:pgBrowse};
  if(fn[page]) fn[page]();
}

/* ── BUILD SIDEBAR ── */
function buildSidebar(){
  var items=[];
  if(ROLE==='Admin'){
    items=[{s:'Overview'},{p:'dashboard',i:'📊',l:'Dashboard'},{s:'Hotel'},{p:'rooms',i:'🏨',l:'Rooms'},
      {p:'guests',i:'👥',l:'Guests'},{p:'bookings',i:'📋',l:'Reservations'},
      {s:'Operations'},{p:'staff',i:'👨‍💼',l:'Staff'},{p:'payments',i:'💰',l:'Payments'},
      {p:'services',i:'🛎️',l:'Services'},{s:'System'},{p:'users',i:'🔐',l:'User Accounts'}];
  }else if(ROLE==='Staff'){
    items=[{s:'Overview'},{p:'dashboard',i:'📊',l:'Dashboard'},{s:'Hotel'},
      {p:'rooms',i:'🏨',l:'Rooms'},{p:'guests',i:'👥',l:'Guests'},{p:'bookings',i:'📋',l:'Reservations'},
      {s:'Operations'},{p:'payments',i:'💰',l:'Payments'},{p:'services',i:'🛎️',l:'Services'}];
  }else{
    items=[{s:'My Portal'},{p:'dashboard',i:'📊',l:'Dashboard'},
      {p:'browse',i:'🏨',l:'Browse Rooms'},{p:'my_bookings',i:'📋',l:'My Bookings'}];
  }
  g('sb-nav').innerHTML=items.map(i=>i.s
    ?'<div class="sb-sec">'+i.s+'</div>'
    :'<div class="sb-item" data-p="'+i.p+'" onclick="nav(\''+i.p+'\')"><span class="sb-icon">'+i.i+'</span>'+i.l+'</div>'
  ).join('');
}

/* ================================================================
   DASHBOARD
   ================================================================ */
async function pgDash(){
  var pb=g('pg');
  var d=await api('dashboard');
  if(!d.success){pb.innerHTML='<div class="al al-err">❌ '+(d.error||'Failed')+'</div>';return;}

  if(ROLE==='Guest'){
    pb.innerHTML=
    '<div class="hero"><div class="hero-inner">'+
      '<div class="hero-greet">Welcome, <em>'+UNAME+'</em> 🛎️</div>'+
      '<div class="hero-sub">Your personal guest portal at Grand Imperial Hotel</div>'+
      '<div class="hero-chips"><span class="chip">🏨 Kathmandu Nepal</span><span class="chip">★★★★★ 5 Star</span><span class="chip">24/7 Service</span></div>'+
    '</div></div>'+
    '<div class="stats">'+sc('📋',d.total_bookings,'Total Bookings','All time','c-blue')+sc('✅',d.active_bookings,'Active','Current','c-teal')+sc('💰','NPR '+d.total_spent,'Total Spent','All bookings','c-purple','sm')+'</div>'+
    '<div class="card"><div class="card-hdr"><div class="card-title">🚀 Quick Actions</div></div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:20px">'+
    '<button class="btn btn-primary" style="width:100%;padding:15px" onclick="nav(\'browse\')">🏨 Browse & Book Rooms</button>'+
    '<button class="btn btn-ghost" style="width:100%;padding:15px" onclick="nav(\'my_bookings\')">📋 View My Bookings</button>'+
    '</div></div>';
    return;
  }

  var tot=parseInt(d.rooms_total)||1;
  var rows=(d.recent||[]).map(b=>'<tr><td><code class="ref">'+b.booking_ref+'</code></td><td><b>'+b.gn+'</b></td><td>Rm '+b.room_number+'</td><td>'+fdate(b.check_in)+'</td><td>'+fdate(b.check_out)+'</td><td>'+bdg(b.status)+'</td><td class="cg">'+fmoney(b.total_amount)+'</td></tr>').join('');
  pb.innerHTML=
  '<div class="hero"><div class="hero-inner">'+
    '<div class="hero-greet">Welcome back, <em>'+UNAME+'</em></div>'+
    '<div class="hero-sub">Here is your hotel overview for today</div>'+
    '<div class="hero-chips"><span class="chip">🏨 Grand Imperial</span><span class="chip">'+new Date().toLocaleDateString('en-GB',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})+'</span></div>'+
  '</div></div>'+
  '<div class="stats">'+
    sc('🏨',d.rooms_total,'Total Rooms',d.rooms_available+' available','c-blue')+
    sc('🛏️',d.rooms_occupied,'Occupied',Math.round(d.rooms_occupied/tot*100)+'% rate','c-teal')+
    sc('📋',d.bookings_active,'Active Bookings',d.bookings_total+' total','c-amber')+
    sc('👥',d.guests_total,'Guests','Registered','c-purple')+
    sc('👨‍💼',d.staff_active,'Staff','Active','c-green')+
    sc('💰','NPR '+d.monthly_revenue,'Revenue','This month','c-red','sm')+
  '</div>'+
  '<div class="tc">'+
    '<div class="card"><div class="card-hdr"><div class="card-title">📊 Recent Bookings</div><button class="btn btn-ghost btn-sm" onclick="nav(\'bookings\')">View All</button></div>'+
    '<div class="tw"><table><thead><tr><th>Ref</th><th>Guest</th><th>Room</th><th>Check-in</th><th>Check-out</th><th>Status</th><th>Amount</th></tr></thead><tbody>'+
    (rows||'<tr><td colspan="7"><div class="empty" style="padding:28px"><div class="ei">📋</div><div class="em">No bookings yet. <a href="#" onclick="nav(\'bookings\')">Create one</a></div></div></td></tr>')+
    '</tbody></table></div></div>'+
    '<div class="card"><div class="card-hdr"><div class="card-title">🏨 Room Occupancy</div></div>'+
    '<div style="padding:20px">'+
      ob('Available',d.rooms_available,tot,'#22c55e')+
      ob('Occupied', d.rooms_occupied, tot,'var(--blue)')+
      ob('Reserved', d.rooms_reserved, tot,'var(--amber)')+
      '<div style="display:flex;flex-direction:column;gap:8px;margin-top:18px">'+
        '<button class="btn btn-primary" style="width:100%" onclick="nav(\'rooms\')">🏨 Manage Rooms</button>'+
        '<button class="btn btn-ghost"   style="width:100%" onclick="nav(\'bookings\')">📋 New Booking</button>'+
        (ROLE==='Admin'?'<button class="btn btn-ghost" style="width:100%" onclick="nav(\'users\')">🔐 Manage Users</button>':'')+
      '</div>'+
    '</div></div>'+
  '</div>';
}
function sc(icon,val,lbl,note,cls,sm){return'<div class="sc '+(cls||'')+'"><div class="sc-icon">'+icon+'</div><div class="sc-val'+(sm?' sc-val-sm':'')+'">'+val+'</div><div class="sc-lbl">'+lbl+'</div><div class="sc-note">'+note+'</div></div>';}
function ob(lbl,cur,tot,color){var p=Math.round(cur/tot*100)||0;return'<div class="occ-i"><div class="occ-l"><span>'+lbl+'</span><span>'+cur+'/'+tot+' ('+p+'%)</span></div><div class="occ-b"><div class="occ-f" style="width:'+p+'%;background:'+color+'"></div></div></div>';}

/* ================================================================
   ROOMS
   ================================================================ */
async function pgRooms(){
  var isAdmin=ROLE==='Admin';
  g('pg').innerHTML=
  '<div class="card"><div class="card-hdr"><div class="card-title">🏨 Rooms</div><div class="card-acts">'+
    '<div class="vtgl"><div class="vb on" id="vg" onclick="setRv(\'grid\')">⊞</div><div class="vb" id="vt" onclick="setRv(\'table\')">☰</div></div>'+
    (isAdmin?'<button class="btn btn-primary" onclick="openRM()">+ Add Room</button>':'')+
  '</div></div>'+
  '<div class="toolbar"><div class="sb-box"><span class="ico">🔍</span><input id="rq" placeholder="Search room…" oninput="filterRooms()"></div>'+
  '<select class="filt" id="rs" onchange="filterRooms()"><option value="">All Status</option><option>Available</option><option>Occupied</option><option>Reserved</option><option>Maintenance</option></select>'+
  '<select class="filt" id="rt2" onchange="filterRooms()"><option value="">All Types</option><option>Standard</option><option>Deluxe</option><option>Suite</option><option>Presidential</option></select></div>'+
  '<div id="ro"></div></div>'+(isAdmin?rmModal():'');
  spn('ro');
  var d=await api('rooms_list');
  _rooms=d.rooms||[];
  renderRooms(_rooms);
}
function filterRooms(){
  var q=v('rq').toLowerCase(),s=v('rs'),t=v('rt2');
  renderRooms(_rooms.filter(r=>(!q||r.room_number.toLowerCase().includes(q)||r.room_type.toLowerCase().includes(q))&&(!s||r.status===s)&&(!t||r.room_type===t)));
}
function setRv(m){rv=m;['vg','vt'].forEach(id=>{var e=g(id);if(e)e.classList.toggle('on',id===(m==='grid'?'vg':'vt'));});renderRooms(_rooms);}
var rte={Standard:'🛏️',Deluxe:'🛋️',Suite:'🏩',Presidential:'👑'};
var rtc={Standard:'rs',Deluxe:'rd',Suite:'rsu',Presidential:'rp'};
function renderRooms(rooms){
  var c=g('ro'),isAdmin=ROLE==='Admin';
  if(!rooms.length){emp('ro','🏨','No rooms found.');return;}
  if(rv==='grid'){
    c.innerHTML='<div class="rgrid">'+rooms.map(r=>'<div class="rc"><div class="rt '+(rtc[r.room_type]||'')+'">'+(rte[r.room_type]||'🏠')+'<span class="rtag">'+r.room_type+'</span></div><div class="rb"><div class="rnum">Room '+r.room_number+'</div>'+bdg(r.status)+'<div class="rpr" style="margin-top:6px">'+fmoney(r.price_per_night)+'<span>/night</span></div><div class="rmeta">Floor '+r.floor+' · '+r.capacity+' guests</div><div class="ramen">'+(r.amenities||'').split(',').slice(0,4).join(' · ')+'</div><div class="rbtns">'+(isAdmin?'<button class="btn btn-ghost btn-sm" onclick="editRM('+r.id+')">✏️ Edit</button><button class="btn btn-red btn-sm btn-icon" onclick="delRM('+r.id+',\''+r.room_number+'\')">🗑️</button>':'')+'</div></div></div>').join('')+'</div>';
  }else{
    c.innerHTML='<div class="tw"><table><thead><tr><th>Room</th><th>Type</th><th>Floor</th><th>Cap.</th><th>Price/Night</th><th>Status</th><th>Amenities</th>'+(isAdmin?'<th>Actions</th>':'')+'</tr></thead><tbody>'+rooms.map(r=>'<tr><td class="cg">'+r.room_number+'</td><td>'+r.room_type+'</td><td>'+r.floor+'</td><td>'+r.capacity+'</td><td class="cg">'+fmoney(r.price_per_night)+'</td><td>'+bdg(r.status)+'</td><td class="cm">'+(r.amenities||'—').split(',').slice(0,3).join(', ')+'</td>'+(isAdmin?'<td><div style="display:flex;gap:5px"><button class="btn btn-ghost btn-sm" onclick="editRM('+r.id+')">✏️</button><button class="btn btn-red btn-sm btn-icon" onclick="delRM('+r.id+',\''+r.room_number+'\')">🗑️</button></div></td>':'')+'</tr>').join('')+'</tbody></table></div>';
  }
}
function rmModal(){return'<div class="ov" id="rm-ov"><div class="modal"><div class="mhdr"><div class="mt" id="rm-t">🏨 Add Room</div><div class="mx" onclick="closeM(\'rm-ov\')">✕</div></div><div class="mbdy"><div id="rm-al"></div><input type="hidden" id="rm-id"><div class="fg2"><div class="fg"><label>Room Number *</label><input id="rm-n" placeholder="101"></div><div class="fg"><label>Type *</label><select id="rm-tp"><option>Standard</option><option>Deluxe</option><option>Suite</option><option>Presidential</option></select></div><div class="fg"><label>Floor</label><input type="number" id="rm-fl" min="1" value="1"></div><div class="fg"><label>Capacity</label><input type="number" id="rm-cp" min="1" value="2"></div><div class="fg"><label>Price/Night (NPR) *</label><input type="number" id="rm-pr" min="1" step="0.01" placeholder="0.00"></div><div class="fg"><label>Status</label><select id="rm-st"><option>Available</option><option>Occupied</option><option>Reserved</option><option>Maintenance</option></select></div><div class="fg fspan"><label>Amenities (comma-separated)</label><input id="rm-am" placeholder="WiFi, TV, AC, Mini Bar"></div><div class="fg fspan"><label>Description</label><textarea id="rm-de" placeholder="Room description…"></textarea></div></div></div><div class="mft"><button class="btn btn-ghost" onclick="closeM(\'rm-ov\')">Cancel</button><button class="btn btn-primary" onclick="saveRM()">💾 Save Room</button></div></div></div>';}
function openRM(r){cal('rm-al');g('rm-t').textContent=r?'✏️ Edit Room':'🏨 Add Room';sv('rm-id',r?r.id:'');sv('rm-n',r?r.room_number:'');g('rm-n').disabled=!!r;sv('rm-tp',r?r.room_type:'Standard');sv('rm-fl',r?r.floor:'1');sv('rm-cp',r?r.capacity:'2');sv('rm-pr',r?r.price_per_night:'');sv('rm-st',r?r.status:'Available');sv('rm-am',r?r.amenities:'');sv('rm-de',r?r.description:'');openM('rm-ov');}
function editRM(id){openRM(_rooms.find(x=>x.id==id));}
async function saveRM(){
  cal('rm-al');var id=v('rm-id'),rn=v('rm-n').trim(),pr=parseFloat(v('rm-pr'));
  if(!rn){sal('rm-al','Room number required.');return;}if(isNaN(pr)||pr<=0){sal('rm-al','Valid price required.');return;}
  var d=await api(id?'rooms_update':'rooms_add','POST',{id:id||undefined,room_number:rn,room_type:v('rm-tp'),floor:parseInt(v('rm-fl'))||1,capacity:parseInt(v('rm-cp'))||1,price_per_night:pr,status:v('rm-st'),amenities:v('rm-am'),description:v('rm-de')});
  if(d.success){toast(d.message,'ok');closeM('rm-ov');var r2=await api('rooms_list');_rooms=r2.rooms||[];renderRooms(_rooms);}else sal('rm-al',d.error);
}
async function delRM(id,num){if(!confirm('Delete Room '+num+'?'))return;var d=await api('rooms_delete','POST',{id});if(d.success){toast(d.message,'ok');_rooms=_rooms.filter(r=>r.id!=id);renderRooms(_rooms);}else toast(d.error,'err');}

/* ================================================================
   GUESTS
   ================================================================ */
async function pgGuests(){
  g('pg').innerHTML='<div class="card"><div class="card-hdr"><div class="card-title">👥 Guest Registry</div><button class="btn btn-primary" onclick="openGM()">+ Register Guest</button></div><div class="toolbar"><div class="sb-box"><span class="ico">🔍</span><input id="gq" placeholder="Search name, email, phone…" oninput="filterGuests()"></div></div><div id="go"></div></div>'+gmModal();
  spn('go');var d=await api('guests_list');_guests=d.guests||[];renderGuests(_guests);
}
function filterGuests(){var q=v('gq').toLowerCase();renderGuests(_guests.filter(g2=>(g2.first_name+' '+g2.last_name+' '+g2.email+' '+(g2.phone||'')).toLowerCase().includes(q)));}
function renderGuests(list){
  if(!list.length){emp('go','👥','No guests yet. Click "+ Register Guest".');return;}
  g('go').innerHTML='<div class="tw"><table><thead><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Nationality</th><th>ID</th><th>Registered</th><th>Actions</th></tr></thead><tbody>'+list.map((gx,i)=>'<tr><td class="cm">'+(i+1)+'</td><td><b>'+gx.first_name+' '+gx.last_name+'</b></td><td class="cm">'+gx.email+'</td><td>'+(gx.phone||'—')+'</td><td>'+(gx.nationality||'—')+'</td><td class="cm">'+(gx.id_type||'—')+': '+(gx.id_number||'—')+'</td><td class="cm">'+fdate(gx.created_at)+'</td><td><div style="display:flex;gap:5px"><button class="btn btn-ghost btn-sm" onclick="editGM('+gx.id+')">✏️</button>'+(ROLE==='Admin'?'<button class="btn btn-red btn-sm btn-icon" onclick="delGM('+gx.id+',\''+gx.first_name+' '+gx.last_name+'\')">🗑️</button>':'')+'</div></td></tr>').join('')+'</tbody></table></div>';
}
function gmModal(){return'<div class="ov" id="gm-ov"><div class="modal"><div class="mhdr"><div class="mt" id="gm-t">👤 Register Guest</div><div class="mx" onclick="closeM(\'gm-ov\')">✕</div></div><div class="mbdy"><div id="gm-al"></div><input type="hidden" id="gm-id"><div class="fg2"><div class="fg"><label>First Name *</label><input id="gm-fn" placeholder="First name"></div><div class="fg"><label>Last Name *</label><input id="gm-ln" placeholder="Last name"></div><div class="fg"><label>Email *</label><input type="email" id="gm-em" placeholder="email@example.com"></div><div class="fg"><label>Phone</label><input id="gm-ph" placeholder="+977-9800000000"></div><div class="fg"><label>Nationality</label><input id="gm-nat" placeholder="e.g. Nepali"></div><div class="fg"><label>Date of Birth</label><input type="date" id="gm-dob"></div><div class="fg"><label>ID Type</label><select id="gm-idt"><option>Passport</option><option>National ID</option><option>Driver License</option></select></div><div class="fg"><label>ID Number</label><input id="gm-idn" placeholder="ID number"></div><div class="fg fspan"><label>Address</label><textarea id="gm-addr" placeholder="Full address…"></textarea></div></div></div><div class="mft"><button class="btn btn-ghost" onclick="closeM(\'gm-ov\')">Cancel</button><button class="btn btn-primary" onclick="saveGM()">💾 Save Guest</button></div></div></div>';}
function openGM(gx){cal('gm-al');g('gm-t').textContent=gx?'✏️ Edit Guest':'👤 Register Guest';sv('gm-id',gx?gx.id:'');sv('gm-fn',gx?gx.first_name:'');sv('gm-ln',gx?gx.last_name:'');sv('gm-em',gx?gx.email:'');sv('gm-ph',gx?gx.phone:'');sv('gm-nat',gx?gx.nationality:'');sv('gm-dob',gx?gx.date_of_birth:'');sv('gm-idt',gx?gx.id_type:'Passport');sv('gm-idn',gx?gx.id_number:'');sv('gm-addr',gx?gx.address:'');openM('gm-ov');}
function editGM(id){openGM(_guests.find(x=>x.id==id));}
async function saveGM(){
  cal('gm-al');var id=v('gm-id'),fn=v('gm-fn').trim(),ln=v('gm-ln').trim(),em=v('gm-em').trim();
  if(!fn||!ln){sal('gm-al','Name required.');return;}if(!em){sal('gm-al','Email required.');return;}
  var d=await api(id?'guests_update':'guests_add','POST',{id:id||undefined,first_name:fn,last_name:ln,email:em,phone:v('gm-ph'),nationality:v('gm-nat'),dob:v('gm-dob'),id_type:v('gm-idt'),id_number:v('gm-idn'),address:v('gm-addr')});
  if(d.success){toast(d.message,'ok');closeM('gm-ov');var r2=await api('guests_list');_guests=r2.guests||[];renderGuests(_guests);}else sal('gm-al',d.error);
}
async function delGM(id,name){if(!confirm('Delete "'+name+'"?'))return;var d=await api('guests_delete','POST',{id});if(d.success){toast(d.message,'ok');_guests=_guests.filter(x=>x.id!=id);renderGuests(_guests);}else toast(d.error,'err');}

/* ================================================================
   BOOKINGS
   ================================================================ */
async function pgBookings(){
  g('pg').innerHTML='<div class="card"><div class="card-hdr"><div class="card-title">📋 Reservations</div><button class="btn btn-primary" onclick="openBM()">+ New Booking</button></div><div class="toolbar"><div class="sb-box"><span class="ico">🔍</span><input id="bq" placeholder="Search ref, guest, room…" oninput="filterBk()"></div><select class="filt" id="bs" onchange="filterBk()"><option value="">All Status</option><option>Confirmed</option><option>Checked-In</option><option>Checked-Out</option><option>Cancelled</option></select></div><div id="bo"></div></div>'+bmModal();
  spn('bo');await reloadBk();
}
async function reloadBk(){var d=await api('bookings_list');_bookings=d.bookings||[];renderBk(_bookings);}
function filterBk(){var q=v('bq').toLowerCase(),s=v('bs');renderBk(_bookings.filter(b=>(!q||(b.booking_ref+' '+b.gn+' '+b.room_number).toLowerCase().includes(q))&&(!s||b.status===s)));}
function renderBk(list){
  if(!list.length){emp('bo','📋','No bookings yet. Click "+ New Booking".');return;}
  var isAdmin=ROLE==='Admin';
  g('bo').innerHTML='<div class="tw"><table><thead><tr><th>Ref</th><th>Guest</th><th>Room</th><th>Check-in</th><th>Check-out</th><th>Guests</th><th>Total</th><th>Paid</th><th>Status</th><th>Actions</th></tr></thead><tbody>'+list.map(b=>{
    var btns='';
    if(b.status==='Confirmed') btns+='<button class="btn btn-blue2 btn-sm" onclick="bkSt('+b.id+',\'Checked-In\')">Check-In</button>';
    if(b.status==='Checked-In') btns+='<button class="btn btn-green btn-sm" onclick="bkSt('+b.id+',\'Checked-Out\')">Check-Out</button>';
    if(b.status!=='Cancelled'&&b.status!=='Checked-Out') btns+='<button class="btn btn-red btn-sm" onclick="bkSt('+b.id+',\'Cancelled\')">Cancel</button>';
    if(isAdmin) btns+='<button class="btn btn-ghost btn-sm btn-icon" onclick="delBk('+b.id+')">🗑️</button>';
    return'<tr><td><code class="ref">'+b.booking_ref+'</code></td><td><b>'+b.gn+'</b><div class="csb">'+b.ge+'</div></td><td><b>'+b.room_number+'</b><div class="csb">'+b.room_type+'</div></td><td>'+fdate(b.check_in)+'</td><td>'+fdate(b.check_out)+'</td><td>'+b.num_guests+'</td><td class="cg">'+fmoney(b.total_amount)+'</td><td style="color:#16a34a">'+fmoney(b.paid_amount)+'</td><td>'+bdg(b.status)+'</td><td><div style="display:flex;flex-wrap:wrap;gap:4px">'+btns+'</div></td></tr>';
  }).join('')+'</tbody></table></div>';
}
async function bkSt(id,st){if(!confirm('Set status: "'+st+'"?'))return;var d=await api('bookings_status','POST',{id,status:st});if(d.success){toast(d.message,'ok');await reloadBk();}else toast(d.error,'err');}
async function delBk(id){if(!confirm('Delete booking?'))return;var d=await api('bookings_delete','POST',{id});if(d.success){toast(d.message,'ok');await reloadBk();}else toast(d.error,'err');}
var _avRooms=[];
function bmModal(){return'<div class="ov" id="bm-ov"><div class="modal modal-lg"><div class="mhdr"><div class="mt">📋 New Booking</div><div class="mx" onclick="closeM(\'bm-ov\')">✕</div></div><div class="mbdy"><div id="bm-al"></div><div class="fg2"><div class="fg"><label>Check-in *</label><input type="date" id="bm-ci" onchange="bkAvail()"></div><div class="fg"><label>Check-out *</label><input type="date" id="bm-co" onchange="bkAvail()"></div><div class="fg"><label>Guest *</label><select id="bm-g"><option value="">— Select Guest —</option></select></div><div class="fg"><label>No. of Guests</label><input type="number" id="bm-ng" min="1" value="1"></div><div class="fg fspan"><label>Available Room *</label><select id="bm-r" onchange="bkCalc()"><option value="">— Select dates first —</option></select></div><div class="fg fspan" id="bm-sw" style="display:none"><div class="bksum" id="bm-sum"></div></div><div class="fg fspan"><label>Special Requests</label><textarea id="bm-req" placeholder="Any special requests…"></textarea></div></div></div><div class="mft"><button class="btn btn-ghost" onclick="closeM(\'bm-ov\')">Cancel</button><button class="btn btn-primary" onclick="saveBk()">✅ Confirm Booking</button></div></div></div>';}
async function openBM(){
  cal('bm-al');
  var gd=await api('guests_all');
  g('bm-g').innerHTML='<option value="">— Select Guest —</option>'+(gd.guests||[]).map(gx=>'<option value="'+gx.id+'">'+gx.first_name+' '+gx.last_name+' ('+gx.email+')</option>').join('');
  g('bm-r').innerHTML='<option value="">— Select dates first —</option>';
  sv('bm-ci','');sv('bm-co','');sv('bm-ng','1');sv('bm-req','');
  g('bm-sw').style.display='none';_avRooms=[];
  g('bm-ci').min=new Date().toISOString().split('T')[0];
  openM('bm-ov');
}
async function bkAvail(){
  var ci=v('bm-ci'),co=v('bm-co');if(!ci||!co||ci>=co){g('bm-sw').style.display='none';return;}
  g('bm-r').innerHTML='<option>Loading…</option>';
  var d=await api('rooms_available','GET',{check_in:ci,check_out:co});
  _avRooms=d.rooms||[];
  g('bm-r').innerHTML=_avRooms.length
    ?'<option value="">— Select a room —</option>'+_avRooms.map(r=>'<option value="'+r.id+'" data-p="'+r.price_per_night+'">Room '+r.room_number+' — '+r.room_type+' | '+fmoney(r.price_per_night)+'/night | Cap: '+r.capacity+'</option>').join('')
    :'<option value="">No rooms available for these dates</option>';
  bkCalc();
}
function bkCalc(){
  var ci=v('bm-ci'),co=v('bm-co');
  var sel=g('bm-r'),opt=sel&&sel.selectedOptions&&sel.selectedOptions[0];
  var price=opt?parseFloat(opt.dataset.p):0;
  if(!ci||!co||!price){g('bm-sw').style.display='none';return 0;}
  var nights=Math.ceil((new Date(co)-new Date(ci))/86400000);
  var total=nights*price;
  g('bm-sw').style.display='';
  g('bm-sum').innerHTML='<div class="bkr"><span>Rate</span><span>'+fmoney(price)+'/night</span></div><div class="bkr"><span>Nights</span><span>'+nights+'</span></div><div class="bkr"><span>Total</span><span>'+fmoney(total)+'</span></div>';
  return total;
}
async function saveBk(){
  cal('bm-al');var ci=v('bm-ci'),co=v('bm-co'),gid=v('bm-g'),rid=v('bm-r');
  if(!ci){sal('bm-al','Check-in required.');return;}if(!co){sal('bm-al','Check-out required.');return;}
  if(ci>=co){sal('bm-al','Check-out must be after check-in.');return;}
  if(!gid){sal('bm-al','Select a guest. Register one first in Guests section.');return;}
  if(!rid){sal('bm-al','Select an available room.');return;}
  var total=bkCalc();if(!total){sal('bm-al','Cannot calculate total. Select a room first.');return;}
  var d=await api('bookings_add','POST',{guest_id:gid,room_id:rid,check_in:ci,check_out:co,num_guests:parseInt(v('bm-ng'))||1,total_amount:total,special_requests:v('bm-req')});
  if(d.success){toast('✅ '+d.message,'ok');closeM('bm-ov');await reloadBk();}else sal('bm-al',d.error);
}

/* ================================================================
   STAFF
   ================================================================ */
async function pgStaff(){
  g('pg').innerHTML='<div class="card"><div class="card-hdr"><div class="card-title">👨‍💼 Staff</div><button class="btn btn-primary" onclick="openSM()">+ Add Staff</button></div><div class="toolbar"><div class="sb-box"><span class="ico">🔍</span><input id="sq" placeholder="Search…" oninput="filterSt()"></div><select class="filt" id="sr" onchange="filterSt()"><option value="">All Roles</option><option>Manager</option><option>Receptionist</option><option>Housekeeping</option><option>Maintenance</option><option>Chef</option><option>Security</option></select></div><div id="so"></div></div>'+smModal();
  spn('so');var d=await api('staff_list');_staff=d.staff||[];renderSt(_staff);
}
function filterSt(){var q=v('sq').toLowerCase(),r=v('sr');renderSt(_staff.filter(s=>(!q||(s.first_name+' '+s.last_name+' '+s.email).toLowerCase().includes(q))&&(!r||s.role===r)));}
function renderSt(list){
  if(!list.length){emp('so','👨‍💼','No staff yet.');return;}
  g('so').innerHTML='<div class="tw"><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Department</th><th>Salary</th><th>Hire Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>'+list.map(s=>'<tr><td><b>'+s.first_name+' '+s.last_name+'</b></td><td class="cm">'+s.email+'</td><td>'+(s.phone||'—')+'</td><td><span class="badge b-blue">'+s.role+'</span></td><td>'+(s.department||'—')+'</td><td class="cg">'+(s.salary?fmoney(s.salary):'—')+'</td><td class="cm">'+fdate(s.hire_date)+'</td><td>'+bdg(s.status)+'</td><td><div style="display:flex;gap:5px"><button class="btn btn-ghost btn-sm" onclick="editSM('+s.id+')">✏️</button><button class="btn btn-red btn-sm btn-icon" onclick="delSM('+s.id+',\''+s.first_name+' '+s.last_name+'\')">🗑️</button></div></td></tr>').join('')+'</tbody></table></div>';
}
function smModal(){return'<div class="ov" id="sm-ov"><div class="modal"><div class="mhdr"><div class="mt" id="sm-t">👤 Add Staff</div><div class="mx" onclick="closeM(\'sm-ov\')">✕</div></div><div class="mbdy"><div id="sm-al"></div><input type="hidden" id="sm-id"><div class="fg2"><div class="fg"><label>First Name *</label><input id="sm-fn" placeholder="First name"></div><div class="fg"><label>Last Name *</label><input id="sm-ln" placeholder="Last name"></div><div class="fg"><label>Email *</label><input type="email" id="sm-em" placeholder="staff@hotel.com"></div><div class="fg"><label>Phone</label><input id="sm-ph" placeholder="+977-9800000000"></div><div class="fg"><label>Role *</label><select id="sm-ro"><option>Manager</option><option>Receptionist</option><option>Housekeeping</option><option>Maintenance</option><option>Chef</option><option>Security</option></select></div><div class="fg"><label>Department</label><input id="sm-de" placeholder="e.g. Front Desk"></div><div class="fg"><label>Salary (NPR)</label><input type="number" id="sm-sa" min="0" step="0.01" placeholder="0.00"></div><div class="fg"><label>Hire Date</label><input type="date" id="sm-hd"></div><div class="fg"><label>Status</label><select id="sm-st"><option>Active</option><option>Inactive</option></select></div></div></div><div class="mft"><button class="btn btn-ghost" onclick="closeM(\'sm-ov\')">Cancel</button><button class="btn btn-primary" onclick="saveSM()">💾 Save</button></div></div></div>';}
function openSM(s){cal('sm-al');g('sm-t').textContent=s?'✏️ Edit Staff':'👤 Add Staff';sv('sm-id',s?s.id:'');sv('sm-fn',s?s.first_name:'');sv('sm-ln',s?s.last_name:'');sv('sm-em',s?s.email:'');sv('sm-ph',s?s.phone:'');sv('sm-ro',s?s.role:'Receptionist');sv('sm-de',s?s.department:'');sv('sm-sa',s?s.salary:'');sv('sm-hd',s?s.hire_date:'');sv('sm-st',s?s.status:'Active');openM('sm-ov');}
function editSM(id){openSM(_staff.find(x=>x.id==id));}
async function saveSM(){
  cal('sm-al');var id=v('sm-id'),fn=v('sm-fn').trim(),ln=v('sm-ln').trim(),em=v('sm-em').trim();
  if(!fn||!ln){sal('sm-al','Name required.');return;}if(!em){sal('sm-al','Email required.');return;}
  var d=await api(id?'staff_update':'staff_add','POST',{id:id||undefined,first_name:fn,last_name:ln,email:em,phone:v('sm-ph'),role:v('sm-ro'),department:v('sm-de'),salary:v('sm-sa'),hire_date:v('sm-hd'),status:v('sm-st')});
  if(d.success){toast(d.message,'ok');closeM('sm-ov');var r2=await api('staff_list');_staff=r2.staff||[];renderSt(_staff);}else sal('sm-al',d.error);
}
async function delSM(id,name){if(!confirm('Remove "'+name+'"?'))return;var d=await api('staff_delete','POST',{id});if(d.success){toast(d.message,'ok');_staff=_staff.filter(x=>x.id!=id);renderSt(_staff);}else toast(d.error,'err');}

/* ================================================================
   PAYMENTS
   ================================================================ */
async function pgPayments(){
  g('pg').innerHTML='<div class="card"><div class="card-hdr"><div class="card-title">💰 Payments</div><button class="btn btn-primary" onclick="openPM()">+ Record Payment</button></div><div id="po"></div></div>'+pmModal();
  spn('po');var d=await api('payments_list');var list=d.payments||[];
  if(!list.length){emp('po','💰','No payments yet.');return;}
  g('po').innerHTML='<div class="tw"><table><thead><tr><th>#</th><th>Booking</th><th>Guest</th><th>Amount</th><th>Method</th><th>Reference</th><th>Date</th></tr></thead><tbody>'+list.map((p,i)=>'<tr><td class="cm">'+(i+1)+'</td><td><code class="ref">'+p.booking_ref+'</code></td><td>'+p.gn+'</td><td style="color:#16a34a;font-weight:700">'+fmoney(p.amount)+'</td><td>'+p.payment_method+'</td><td class="cm">'+(p.reference_number||'—')+'</td><td class="cm">'+fdate(p.payment_date)+'</td></tr>').join('')+'</tbody></table></div>';
}
function pmModal(){return'<div class="ov" id="pm-ov"><div class="modal"><div class="mhdr"><div class="mt">💳 Record Payment</div><div class="mx" onclick="closeM(\'pm-ov\')">✕</div></div><div class="mbdy"><div id="pm-al"></div><div class="fg2"><div class="fg fspan"><label>Booking *</label><select id="pm-bk"><option value="">— Select Booking —</option></select></div><div class="fg"><label>Amount (NPR) *</label><input type="number" id="pm-am" min="0.01" step="0.01" placeholder="0.00"></div><div class="fg"><label>Method *</label><select id="pm-me"><option>Cash</option><option>Credit Card</option><option>Debit Card</option><option>Bank Transfer</option><option>Online</option></select></div><div class="fg fspan"><label>Reference/Receipt</label><input id="pm-re" placeholder="Transaction number"></div><div class="fg fspan"><label>Notes</label><textarea id="pm-no" placeholder="Notes…"></textarea></div></div></div><div class="mft"><button class="btn btn-ghost" onclick="closeM(\'pm-ov\')">Cancel</button><button class="btn btn-primary" onclick="savePM()">✅ Record</button></div></div></div>';}
async function openPM(){
  cal('pm-al');var d=await api('bookings_active');
  g('pm-bk').innerHTML='<option value="">— Select Booking —</option>'+(d.bookings||[]).map(b=>'<option value="'+b.id+'">'+b.booking_ref+' — '+b.gn+' | Due: '+fmoney(parseFloat(b.total_amount)-parseFloat(b.paid_amount))+'</option>').join('');
  sv('pm-am','');sv('pm-re','');sv('pm-no','');openM('pm-ov');
}
async function savePM(){
  cal('pm-al');var bid=v('pm-bk'),amt=parseFloat(v('pm-am'));
  if(!bid){sal('pm-al','Select a booking.');return;}if(!amt||amt<=0){sal('pm-al','Valid amount required.');return;}
  var d=await api('payments_add','POST',{booking_id:bid,amount:amt,payment_method:v('pm-me'),reference_number:v('pm-re'),notes:v('pm-no')});
  if(d.success){toast(d.message,'ok');closeM('pm-ov');pgPayments();}else sal('pm-al',d.error);
}

/* ================================================================
   SERVICES
   ================================================================ */
async function pgServices(){
  g('pg').innerHTML='<div class="card"><div class="card-hdr"><div class="card-title">🛎️ Services</div><button class="btn btn-primary" onclick="openSV()">+ Add Service</button></div><div id="svo"></div></div>'+svModal();
  spn('svo');var d=await api('services_list');var list=d.services||[];
  if(!list.length){emp('svo','🛎️','No services yet.');return;}
  g('svo').innerHTML='<div class="tw"><table><thead><tr><th>Booking</th><th>Guest</th><th>Service</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody>'+list.map(s=>'<tr><td><code class="ref">'+s.booking_ref+'</code></td><td>'+s.gn+'</td><td><b>'+s.service_name+'</b></td><td>'+s.service_type+'</td><td class="cg">'+fmoney(s.amount)+'</td><td>'+bdg(s.status)+'</td><td class="cm">'+fdate(s.service_date)+'</td><td><div style="display:flex;gap:4px">'+(s.status==='Pending'?'<button class="btn btn-green btn-sm" onclick="svSt('+s.id+',\'Completed\')">✓ Done</button>':'')+(s.status!=='Cancelled'?'<button class="btn btn-red btn-sm" onclick="svSt('+s.id+',\'Cancelled\')">✕</button>':'')+'</div></td></tr>').join('')+'</tbody></table></div>';
}
function svModal(){return'<div class="ov" id="sv-ov"><div class="modal"><div class="mhdr"><div class="mt">🛎️ Add Service</div><div class="mx" onclick="closeM(\'sv-ov\')">✕</div></div><div class="mbdy"><div id="sv-al"></div><div class="fg2"><div class="fg fspan"><label>Booking *</label><select id="sv-bk"><option value="">— Select Booking —</option></select></div><div class="fg fspan"><label>Service Name *</label><input id="sv-nm" placeholder="e.g. Room Service — Breakfast"></div><div class="fg"><label>Type</label><select id="sv-tp"><option>Room Service</option><option>Laundry</option><option>Spa</option><option>Gym</option><option>Restaurant</option><option>Transport</option><option>Other</option></select></div><div class="fg"><label>Amount (NPR) *</label><input type="number" id="sv-am" min="0.01" step="0.01" placeholder="0.00"></div></div></div><div class="mft"><button class="btn btn-ghost" onclick="closeM(\'sv-ov\')">Cancel</button><button class="btn btn-primary" onclick="saveSV()">✅ Add</button></div></div></div>';}
async function openSV(){
  cal('sv-al');var d=await api('bookings_active');
  g('sv-bk').innerHTML='<option value="">— Select Booking —</option>'+(d.bookings||[]).map(b=>'<option value="'+b.id+'">'+b.booking_ref+' — '+b.gn+'</option>').join('');
  sv('sv-nm','');sv('sv-am','');openM('sv-ov');
}
async function saveSV(){
  cal('sv-al');var bid=v('sv-bk'),nm=v('sv-nm').trim(),amt=parseFloat(v('sv-am'));
  if(!bid){sal('sv-al','Select a booking.');return;}if(!nm){sal('sv-al','Service name required.');return;}if(!amt||amt<=0){sal('sv-al','Valid amount required.');return;}
  var d=await api('services_add','POST',{booking_id:bid,service_name:nm,service_type:v('sv-tp'),amount:amt});
  if(d.success){toast(d.message,'ok');closeM('sv-ov');pgServices();}else sal('sv-al',d.error);
}
async function svSt(id,st){var d=await api('services_status','POST',{id,status:st});if(d.success){toast(d.message,'ok');pgServices();}else toast(d.error,'err');}

/* ================================================================
   USERS  (Admin)
   ================================================================ */
async function pgUsers(){
  g('pg').innerHTML=
  '<div class="card"><div class="card-hdr"><div class="card-title">🔐 User Accounts</div><button class="btn btn-primary" onclick="openUM()">+ Add User</button></div>'+
  '<div style="padding:12px 20px;background:#fffbeb;border-bottom:1px solid #fde68a;font-size:.8rem;color:#92400e">'+
  '⚠️ <b>Roles:</b> Admin = full access · Staff = rooms/guests/bookings/payments/services · Guest = browse rooms & own bookings</div>'+
  '<div id="uo"></div></div>'+umModal();
  spn('uo');var d=await api('users_list');_users=d.users||[];renderUsers(_users);
}
function renderUsers(list){
  if(!list.length){emp('uo','🔐','No users.');return;}
  g('uo').innerHTML='<div class="tw"><table><thead><tr><th>#</th><th>Username</th><th>Full Name</th><th>Role</th><th>Status</th><th>Last Login</th><th>Actions</th></tr></thead><tbody>'+list.map((u,i)=>'<tr><td class="cm">'+(i+1)+'</td><td><b>'+u.username+'</b></td><td>'+u.full_name+'</td><td>'+rpill(u.role)+'</td><td>'+bdg(u.status)+'</td><td class="cm">'+(u.last_login?fdate(u.last_login):'Never')+'</td><td><div style="display:flex;gap:4px"><button class="btn btn-ghost btn-sm" onclick="toggleU('+u.id+')">'+(u.status==='Active'?'Deactivate':'Activate')+'</button><button class="btn btn-blue2 btn-sm" onclick="openPW('+u.id+',\''+u.username+'\')">🔑 Password</button><button class="btn btn-red btn-sm btn-icon" onclick="delU('+u.id+',\''+u.username+'\')">🗑️</button></div></td></tr>').join('')+'</tbody></table></div>';
}
function umModal(){
  return'<div class="ov" id="um-ov"><div class="modal"><div class="mhdr"><div class="mt">🔐 Add User Account</div><div class="mx" onclick="closeM(\'um-ov\')">✕</div></div><div class="mbdy"><div id="um-al"></div><div class="fg2"><div class="fg"><label>Username *</label><input id="um-un" placeholder="e.g. john_staff"></div><div class="fg"><label>Full Name *</label><input id="um-fn" placeholder="Full name"></div><div class="fg"><label>Password *</label><input type="password" id="um-pw" placeholder="Min 4 characters"></div><div class="fg"><label>Role *</label><select id="um-ro"><option>Admin</option><option>Staff</option><option>Guest</option></select></div><div class="fg"><label>Status</label><select id="um-st"><option>Active</option><option>Inactive</option></select></div></div></div><div class="mft"><button class="btn btn-ghost" onclick="closeM(\'um-ov\')">Cancel</button><button class="btn btn-primary" onclick="saveUM()">✅ Create User</button></div></div></div>'+
  '<div class="ov" id="pw-ov"><div class="modal"><div class="mhdr"><div class="mt">🔑 Reset Password</div><div class="mx" onclick="closeM(\'pw-ov\')">✕</div></div><div class="mbdy"><div id="pw-al"></div><p style="font-size:.84rem;color:var(--txt2);margin-bottom:14px">Resetting password for: <b id="pw-un" style="color:var(--navy)"></b></p><input type="hidden" id="pw-id"><div class="fg"><label>New Password *</label><input type="password" id="pw-pw" placeholder="Min 4 characters"></div></div><div class="mft"><button class="btn btn-ghost" onclick="closeM(\'pw-ov\')">Cancel</button><button class="btn btn-primary" onclick="savePW()">🔑 Update</button></div></div></div>';
}
function openUM(){cal('um-al');sv('um-un','');sv('um-fn','');sv('um-pw','');sv('um-ro','Staff');sv('um-st','Active');openM('um-ov');}
async function saveUM(){
  cal('um-al');var un=v('um-un').trim(),fn=v('um-fn').trim(),pw=v('um-pw');
  if(!un){sal('um-al','Username required.');return;}if(!fn){sal('um-al','Full name required.');return;}if(pw.length<4){sal('um-al','Password min 4 characters.');return;}
  var d=await api('users_add','POST',{username:un,full_name:fn,password:pw,role:v('um-ro'),status:v('um-st')});
  if(d.success){toast(d.message,'ok');closeM('um-ov');var r2=await api('users_list');_users=r2.users||[];renderUsers(_users);}else sal('um-al',d.error);
}
async function toggleU(id){var d=await api('users_toggle','POST',{id});if(d.success){toast(d.message,'ok');var r2=await api('users_list');_users=r2.users||[];renderUsers(_users);}else toast(d.error,'err');}
function openPW(id,un){cal('pw-al');sv('pw-id',id);g('pw-un').textContent=un;sv('pw-pw','');openM('pw-ov');}
async function savePW(){cal('pw-al');var id=v('pw-id'),pw=v('pw-pw');if(pw.length<4){sal('pw-al','Min 4 chars.');return;}var d=await api('users_set_password','POST',{id,password:pw});if(d.success){toast(d.message,'ok');closeM('pw-ov');}else sal('pw-al',d.error);}
async function delU(id,un){if(!confirm('Delete user "'+un+'"?'))return;var d=await api('users_delete','POST',{id});if(d.success){toast(d.message,'ok');_users=_users.filter(u=>u.id!=id);renderUsers(_users);}else toast(d.error,'err');}

/* ================================================================
   GUEST — Browse & Book Rooms
   ================================================================ */
async function pgBrowse(){
  g('pg').innerHTML=
  '<div class="hero"><div class="hero-inner">'+
    '<div class="hero-greet" style="font-size:1.5rem">🏨 Browse Our Rooms</div>'+
    '<div class="hero-sub">Select your dates to see available rooms and rates</div>'+
    '<div class="hero-chips"><span class="chip">🛁 Jacuzzi Available</span><span class="chip">🍽️ Room Service</span><span class="chip">📶 Free WiFi</span><span class="chip">🌿 Mountain View</span></div>'+
  '</div></div>'+
  '<div class="card"><div class="card-hdr"><div class="card-title">🔍 Check Availability</div></div>'+
  '<div class="toolbar" style="flex-wrap:wrap;gap:12px">'+
    '<div class="fg" style="flex-direction:row;align-items:flex-end;gap:12px;flex-wrap:wrap">'+
      '<div style="display:flex;flex-direction:column;gap:4px"><label style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--txt2)">Check-in Date</label><input type="date" id="br-ci" class="filt" style="color:var(--txt)"></div>'+
      '<div style="display:flex;flex-direction:column;gap:4px"><label style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--txt2)">Check-out Date</label><input type="date" id="br-co" class="filt" style="color:var(--txt)"></div>'+
      '<button class="btn btn-primary" onclick="searchBrowse()">🔍 Search Rooms</button>'+
    '</div>'+
  '</div>'+
  '<div id="br-out"><div class="empty"><div class="ei">🗓️</div><div class="em">Select check-in and check-out dates above, then click Search.</div></div></div></div>';
  g('br-ci').min=new Date().toISOString().split('T')[0];
}
async function searchBrowse(){
  var ci=v('br-ci'),co=v('br-co');
  if(!ci||!co){toast('Select both dates.','warn');return;}
  if(ci>=co){toast('Check-out must be after check-in.','warn');return;}
  spn('br-out');
  var d=await api('rooms_available','GET',{check_in:ci,check_out:co});
  var rooms=d.rooms||[];
  if(!rooms.length){emp('br-out','🏨','No rooms available for selected dates. Try different dates.');return;}
  var nights=Math.ceil((new Date(co)-new Date(ci))/86400000);
  g('br-out').innerHTML='<div class="rgrid">'+rooms.map(r=>'<div class="rc"><div class="rt '+(rtc[r.room_type]||'')+'">'+(rte[r.room_type]||'🏠')+'<div style="position:absolute;bottom:9px;left:9px;background:rgba(15,52,96,.85);color:#fff;border-radius:8px;padding:3px 10px;font-size:.75rem;font-weight:700">'+fmoney(r.price_per_night)+'/night</div></div><div class="rb"><div class="rnum">Room '+r.room_number+' — '+r.room_type+'</div>'+bdg(r.status)+'<div class="rmeta" style="margin-top:5px">Floor '+r.floor+' · Up to '+r.capacity+' guests</div><div class="ramen">'+(r.amenities||'').split(',').slice(0,4).join(' · ')+'</div><div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px"><div style="color:var(--blue);font-weight:700">'+fmoney(r.price_per_night*nights)+'<span style="font-size:.68rem;color:var(--txt3);font-weight:400"> / '+nights+' night'+(nights>1?'s':'')+'</span></div><button class="btn btn-primary btn-sm" onclick="openGbk('+r.id+',\''+r.room_number+'\',\''+r.room_type+'\','+r.price_per_night+',\''+ci+'\',\''+co+'\')">Book Now</button></div></div></div>').join('')+'</div>'+gbkModal();
}
function gbkModal(){return'<div class="ov" id="gb-ov"><div class="modal"><div class="mhdr"><div class="mt" id="gb-t">📋 Book Room</div><div class="mx" onclick="closeM(\'gb-ov\')">✕</div></div><div class="mbdy"><div id="gb-al"></div><input type="hidden" id="gb-rid"><input type="hidden" id="gb-ci"><input type="hidden" id="gb-co"><input type="hidden" id="gb-pr"><div class="bksum" id="gb-sum"></div><div class="fg2"><div class="fg"><label>No. of Guests</label><input type="number" id="gb-ng" min="1" value="1"></div><div class="fg fspan"><label>Special Requests</label><textarea id="gb-req" placeholder="Any special requests…"></textarea></div></div></div><div class="mft"><button class="btn btn-ghost" onclick="closeM(\'gb-ov\')">Cancel</button><button class="btn btn-primary" onclick="saveGbk()">✅ Confirm Booking</button></div></div></div>';}
function openGbk(rid,rnum,rtype,price,ci,co){
  cal('gb-al');sv('gb-rid',rid);sv('gb-ci',ci);sv('gb-co',co);sv('gb-pr',price);
  g('gb-t').textContent='📋 Book Room '+rnum;
  var nights=Math.ceil((new Date(co)-new Date(ci))/86400000);
  g('gb-sum').innerHTML='<div class="bkr"><span>Room</span><span>'+rnum+' — '+rtype+'</span></div><div class="bkr"><span>Check-in</span><span>'+fdate(ci)+'</span></div><div class="bkr"><span>Check-out</span><span>'+fdate(co)+'</span></div><div class="bkr"><span>Rate</span><span>'+fmoney(price)+'/night</span></div><div class="bkr"><span>Nights</span><span>'+nights+'</span></div><div class="bkr"><span>Total</span><span>'+fmoney(price*nights)+'</span></div>';
  sv('gb-ng','1');sv('gb-req','');openM('gb-ov');
}
async function saveGbk(){
  cal('gb-al');
  if(!GUEST_ID){sal('gb-al','Your account has no guest profile linked. Ask hotel staff to link your account to a guest record.');return;}
  var rid=v('gb-rid'),ci=v('gb-ci'),co=v('gb-co'),pr=parseFloat(v('gb-pr'));
  var nights=Math.ceil((new Date(co)-new Date(ci))/86400000);
  var total=nights*pr;
  var d=await api('bookings_add','POST',{guest_id:GUEST_ID,room_id:rid,check_in:ci,check_out:co,num_guests:parseInt(v('gb-ng'))||1,total_amount:total,special_requests:v('gb-req')});
  if(d.success){toast('✅ '+d.message,'ok');closeM('gb-ov');nav('my_bookings');}else sal('gb-al',d.error);
}

/* ================================================================
   GUEST — My Bookings
   ================================================================ */
async function pgMyBk(){
  g('pg').innerHTML='<div class="card"><div class="card-hdr"><div class="card-title">📋 My Bookings</div><button class="btn btn-primary" onclick="nav(\'browse\')">+ New Booking</button></div><div id="mb"></div></div>';
  spn('mb');var d=await api('bookings_list');var list=d.bookings||[];
  if(!list.length){emp('mb','📋','No bookings yet. <a href="#" onclick="nav(\'browse\')">Browse rooms →</a>');return;}
  g('mb').innerHTML='<div class="tw"><table><thead><tr><th>Ref</th><th>Room</th><th>Check-in</th><th>Check-out</th><th>Guests</th><th>Total</th><th>Paid</th><th>Status</th><th>Requests</th></tr></thead><tbody>'+list.map(b=>'<tr><td><code class="ref">'+b.booking_ref+'</code></td><td><b>'+b.room_number+'</b><div class="csb">'+b.room_type+'</div></td><td>'+fdate(b.check_in)+'</td><td>'+fdate(b.check_out)+'</td><td>'+b.num_guests+'</td><td class="cg">'+fmoney(b.total_amount)+'</td><td style="color:#16a34a">'+fmoney(b.paid_amount)+'</td><td>'+bdg(b.status)+'</td><td class="cm" style="max-width:140px">'+(b.special_requests||'—')+'</td></tr>').join('')+'</tbody></table></div>';
}

/* ================================================================
   INIT
   ================================================================ */
document.addEventListener('DOMContentLoaded',()=>{
  buildSidebar();
  clock(); setInterval(clock,1000);
  nav('dashboard');
  document.addEventListener('click',e=>{ if(e.target.classList.contains('ov')) e.target.classList.remove('show'); });
});
