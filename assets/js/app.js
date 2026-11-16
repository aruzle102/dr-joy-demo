/* Dr. Joy clinic-system demo — client-side store + rendering.
   All records are SAMPLE DATA for the demonstration only (banner on every page).
   No real patient data, no real prices. Persists in localStorage so the flows
   (book, add/edit appointment, add patient) work while browsing. */
(function () {
  'use strict';

  var KEY = 'drjoy_demo_v2';

  /* Bootstrap comes bundled INSIDE tabler.min.js (window.tabler.bootstrap);
     there is no global window.bootstrap and loading bootstrap.bundle.min.js
     as well registers the data-API handlers TWICE, so dropdown clicks
     open-then-close. Use Tabler's bundled copy, fall back to a global. */
  var BS = (window.tabler && window.tabler.bootstrap) || window.bootstrap || null;

  /* ---- Verified clinic facts (drjoydentalclinic.com, checked 2026-11-09) ---- */
  var BRANCHES = [
    { name: 'Palm Jumeirah Clinic', phone: '+971 4 243 5888' },
    { name: 'Umm Suqeim Pediatric & Orthodontic Center Clinic', phone: '+971 4 346 8333' },
    { name: 'Jumeirah Al Wasl Road Clinic', phone: '+971 4 328 5332' },
    { name: 'Jumeirah Beach Road Clinic', phone: '+971 4 579 9871' },
    { name: 'Dubai Marina Clinic', phone: '+971 4 579 9871' },
    { name: 'Jumeirah Park Clinic', phone: '+971 4 328 5332' },
    { name: 'Jumeirah Village Circle Clinic', phone: '+971 4 579 9871' },
    { name: 'Jumeirah Golf Estates Clinic', phone: '800 DRJOY (37569)' },
    { name: 'Dubai Hills Mall Clinic', phone: '+971 4 320 1307' },
    { name: 'BurJuman Mall Clinic', phone: '+971 4 355 5357' },
    { name: 'Mirdif Sport Society Clinic', phone: '+971 4 257 3867' },
    { name: 'Mirdif Central Mall Clinic', phone: '+971 4 284 5722' },
    { name: 'Dubai Silicon Oasis Clinic', phone: '+971 4 320 1307' },
    { name: 'Town Square Clinic', phone: '+971 4 284 5722' }
  ];

  var DOCTORS = [
    'General Dentist', 'Orthodontist (Invisalign)', 'Prosthodontist',
    'Cosmetic Dentist', 'Pediatric Dentist'
  ];

  /* Services with typical durations (demo values, no prices anywhere). */
  var TREATMENTS = [
    { name: 'General Check-up & Cleaning', category: 'General Dentistry', minutes: 45 },
    { name: 'Invisalign Consultation', category: 'Orthodontics', minutes: 60 },
    { name: 'Veneers Consultation', category: 'Cosmetic Dentistry', minutes: 45 },
    { name: 'Dental Implants Consultation', category: 'Prosthodontics & Implants', minutes: 60 },
    { name: 'Pediatric Check-up', category: 'Pediatric Dentistry', minutes: 30 },
    { name: 'Full Mouth Rehabilitation Consultation', category: 'Prosthodontics', minutes: 90 },
    { name: 'Teeth Whitening', category: 'Cosmetic Dentistry', minutes: 60 },
    { name: 'Root Canal Treatment', category: 'Endodontics', minutes: 90 }
  ];

  /* ---- Seed data (sample patients / appointments / invoices) ---- */
  function todayAt(h, m) {
    var d = new Date(); d.setHours(h, m, 0, 0); return d.toISOString();
  }
  function tomorrowAt(h, m) {
    var d = new Date(); d.setDate(d.getDate() + 1); d.setHours(h, m, 0, 0); return d.toISOString();
  }

  function seed() {
    return {
      patients: [
        { id: 1, name: 'Sara A.', phone: '+971 50 ••• 1234', branch: 'Palm Jumeirah Clinic', since: '2024' },
        { id: 2, name: 'Omar K.', phone: '+971 55 ••• 5678', branch: 'Dubai Hills Mall Clinic', since: '2023' },
        { id: 3, name: 'Layla M.', phone: '+971 52 ••• 9012', branch: 'Jumeirah Beach Road Clinic', since: '2025' },
        { id: 4, name: 'James W.', phone: '+971 56 ••• 3456', branch: 'Dubai Marina Clinic', since: '2022' },
        { id: 5, name: 'Fatima R.', phone: '+971 50 ••• 7890', branch: 'Umm Suqeim Pediatric & Orthodontic Center Clinic', since: '2024' },
        { id: 6, name: 'Chen L.', phone: '+971 54 ••• 2345', branch: 'BurJuman Mall Clinic', since: '2025' },
        { id: 7, name: 'Priya S.', phone: '+971 55 ••• 6789', branch: 'Mirdif Central Mall Clinic', since: '2023' },
        { id: 8, name: 'Ahmed H.', phone: '+971 52 ••• 0123', branch: 'Town Square Clinic', since: '2025' }
      ],
      appointments: [
        { id: 1, patient: 'Sara A.', treatment: 'General Check-up & Cleaning', doctor: 'General Dentist', branch: 'Palm Jumeirah Clinic', when: todayAt(9, 0), status: 'Completed' },
        { id: 2, patient: 'Omar K.', treatment: 'Invisalign Consultation', doctor: 'Orthodontist (Invisalign)', branch: 'Dubai Hills Mall Clinic', when: todayAt(9, 30), status: 'Checked in' },
        { id: 3, patient: 'Layla M.', treatment: 'Veneers Consultation', doctor: 'Cosmetic Dentist', branch: 'Jumeirah Beach Road Clinic', when: todayAt(10, 0), status: 'Confirmed' },
        { id: 4, patient: 'James W.', treatment: 'Dental Implants Consultation', doctor: 'Prosthodontist', branch: 'Dubai Marina Clinic', when: todayAt(10, 30), status: 'Confirmed' },
        { id: 5, patient: 'Fatima R.', treatment: 'Pediatric Check-up', doctor: 'Pediatric Dentist', branch: 'Umm Suqeim Pediatric & Orthodontic Center Clinic', when: todayAt(11, 0), status: 'Confirmed' },
        { id: 6, patient: 'Chen L.', treatment: 'Teeth Whitening', doctor: 'Cosmetic Dentist', branch: 'BurJuman Mall Clinic', when: todayAt(11, 30), status: 'Confirmed' },
        { id: 7, patient: 'Priya S.', treatment: 'Root Canal Treatment', doctor: 'General Dentist', branch: 'Mirdif Central Mall Clinic', when: todayAt(13, 0), status: 'Confirmed' },
        { id: 8, patient: 'Ahmed H.', treatment: 'Full Mouth Rehabilitation Consultation', doctor: 'Prosthodontist', branch: 'Town Square Clinic', when: todayAt(14, 0), status: 'Confirmed' },
        { id: 9, patient: 'Sara A.', treatment: 'Teeth Whitening', doctor: 'Cosmetic Dentist', branch: 'Palm Jumeirah Clinic', when: tomorrowAt(10, 0), status: 'Confirmed' },
        { id: 10, patient: 'Omar K.', treatment: 'General Check-up & Cleaning', doctor: 'General Dentist', branch: 'Dubai Hills Mall Clinic', when: tomorrowAt(11, 0), status: 'Confirmed' }
      ],
      invoices: [
        { no: 'INV-2026-1041', patient: 'Sara A.', treatment: 'General Check-up & Cleaning', date: '2026-11-09', status: 'Paid' },
        { no: 'INV-2026-1040', patient: 'Omar K.', treatment: 'Invisalign Consultation', date: '2026-11-09', status: 'Pending' },
        { no: 'INV-2026-1039', patient: 'Layla M.', treatment: 'Veneers Consultation', date: '2026-11-08', status: 'Paid' },
        { no: 'INV-2026-1038', patient: 'James W.', treatment: 'Dental Implants Consultation', date: '2026-11-08', status: 'Paid' },
        { no: 'INV-2026-1037', patient: 'Fatima R.', treatment: 'Pediatric Check-up', date: '2026-11-07', status: 'Paid' },
        { no: 'INV-2026-1036', patient: 'Chen L.', treatment: 'Teeth Whitening', date: '2026-11-07', status: 'Pending' },
        { no: 'INV-2026-1035', patient: 'Priya S.', treatment: 'Root Canal Treatment', date: '2026-11-06', status: 'Paid' },
        { no: 'INV-2026-1034', patient: 'Ahmed H.', treatment: 'Full Mouth Rehabilitation Consultation', date: '2026-11-06', status: 'Pending' }
      ]
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* fresh seed on corrupt store */ }
    var data = seed();
    save(data);
    return data;
  }
  function save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* demo only */ }
  }
  function resetDemo() { localStorage.removeItem(KEY); location.reload(); }

  var store = load();

  /* ---- Helpers ---- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtTime(iso) {
    var d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  function fmtDate(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });
  }
  function isToday(iso) {
    var d = new Date(iso), n = new Date();
    return d.toDateString() === n.toDateString();
  }
  function statusBadge(status) {
    var map = {
      'Confirmed': 'bg-blue', 'Checked in': 'bg-teal', 'Completed': 'bg-green',
      'Cancelled': 'bg-red', 'Paid': 'bg-green', 'Pending': 'bg-yellow'
    };
    return '<span class="badge ' + (map[status] || 'bg-secondary') + '">' + esc(status) + '</span>';
  }
  function initials(name) {
    return name.split(' ').map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase();
  }
  function avatar(name) {
    return '<span class="avatar avatar-sm" style="background-color:#0a2540;color:#fff">' + esc(initials(name)) + '</span>';
  }

  /* ---- Icons (verbatim Tabler Icons, injected from icons.js) ---- */
  function injectIcons(root) {
    if (typeof DJ_ICONS === 'undefined') return;
    (root || document).querySelectorAll('[data-icon]').forEach(function (el) {
      var svg = DJ_ICONS[el.getAttribute('data-icon')];
      if (svg) el.innerHTML = svg;
    });
  }

  /* ---- Shared option builders ---- */
  function branchOptions(selected) {
    return BRANCHES.map(function (b) {
      return '<option value="' + esc(b.name) + '"' + (b.name === selected ? ' selected' : '') + '>' + esc(b.name) + '</option>';
    }).join('');
  }
  function treatmentOptions(selected) {
    return TREATMENTS.map(function (t) {
      return '<option value="' + esc(t.name) + '"' + (t.name === selected ? ' selected' : '') + '>' + esc(t.name) + ' — ' + t.minutes + ' min</option>';
    }).join('');
  }
  function doctorOptions(selected) {
    return DOCTORS.map(function (d) {
      return '<option' + (d === selected ? ' selected' : '') + '>' + esc(d) + '</option>';
    }).join('');
  }
  function patientOptions(selected) {
    return store.patients.map(function (p) {
      return '<option' + (p.name === selected ? ' selected' : '') + '>' + esc(p.name) + '</option>';
    }).join('');
  }

  /* ---- Dashboard ---- */
  function renderDashboard() {
    var today = store.appointments.filter(function (a) { return isToday(a.when); });
    var el;
    el = document.getElementById('stat-today'); if (el) el.textContent = today.length;
    el = document.getElementById('stat-patients'); if (el) el.textContent = store.patients.length;
    el = document.getElementById('stat-treatments'); if (el) el.textContent = TREATMENTS.length;
    el = document.getElementById('stat-branches'); if (el) el.textContent = BRANCHES.length;
    var tb = document.getElementById('today-rows');
    if (tb) {
      tb.innerHTML = today.slice(0, 6).map(function (a) {
        return '<tr><td>' + fmtTime(a.when) + '</td><td>' + avatar(a.patient) + ' <span class="ms-1">' + esc(a.patient) + '</span></td>' +
          '<td>' + esc(a.treatment) + '</td><td>' + esc(a.doctor) + '</td><td>' + esc(a.branch) + '</td><td>' + statusBadge(a.status) + '</td></tr>';
      }).join('') || '<tr><td colspan="6" class="text-secondary">No appointments today yet — book one from the booking page.</td></tr>';
    }
    var pr = document.getElementById('recent-patients');
    if (pr) {
      pr.innerHTML = store.patients.slice(0, 5).map(function (p) {
        return '<div class="list-group-item"><div class="row align-items-center"><div class="col-auto">' + avatar(p.name) +
          '</div><div class="col text-truncate"><a href="patients.html" class="text-reset d-block">' + esc(p.name) +
          '</a><div class="d-block text-secondary text-truncate mt-n1">' + esc(p.branch) + '</div></div>' +
          '<div class="col-auto text-secondary">Patient since ' + esc(p.since) + '</div></div></div>';
      }).join('');
    }
  }

  /* ---- Appointments page ---- */
  var apptFilter = { q: '', status: '' };
  function renderAppointments() {
    var tb = document.getElementById('appt-rows');
    if (!tb) return;
    var rows = store.appointments.slice().sort(function (a, b) { return new Date(a.when) - new Date(b.when); })
      .filter(function (a) {
        var hay = (a.patient + ' ' + a.treatment + ' ' + a.doctor + ' ' + a.branch).toLowerCase();
        return (!apptFilter.q || hay.indexOf(apptFilter.q.toLowerCase()) !== -1) &&
          (!apptFilter.status || a.status === apptFilter.status);
      });
    tb.innerHTML = rows.map(function (a) {
      return '<tr><td>' + fmtDate(a.when) + '<div class="text-secondary">' + fmtTime(a.when) + '</div></td>' +
        '<td>' + avatar(a.patient) + ' <span class="ms-1">' + esc(a.patient) + '</span></td>' +
        '<td>' + esc(a.treatment) + '</td><td>' + esc(a.doctor) + '</td><td>' + esc(a.branch) + '</td>' +
        '<td>' + statusBadge(a.status) + '</td>' +
        '<td class="text-end"><div class="btn-list flex-nowrap">' +
        '<button class="btn btn-sm" data-act="edit" data-id="' + a.id + '">Edit</button>' +
        '<button class="btn btn-sm btn-outline-danger" data-act="del" data-id="' + a.id + '">Delete</button>' +
        '</div></td></tr>';
    }).join('') || '<tr><td colspan="7" class="text-secondary">No appointments match this filter.</td></tr>';
    var c = document.getElementById('appt-count');
    if (c) c.textContent = rows.length + ' appointment' + (rows.length === 1 ? '' : 's');
  }
  function bindAppointments() {
    var q = document.getElementById('appt-search');
    if (q) q.addEventListener('input', function () { apptFilter.q = q.value; renderAppointments(); });
    var s = document.getElementById('appt-status');
    if (s) s.addEventListener('change', function () { apptFilter.status = s.value; renderAppointments(); });
    var tb = document.getElementById('appt-rows');
    if (tb) tb.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-act]'); if (!btn) return;
      var id = +btn.getAttribute('data-id');
      if (btn.getAttribute('data-act') === 'del') {
        store.appointments = store.appointments.filter(function (a) { return a.id !== id; });
        save(store); renderAppointments(); renderDashboardCountsOnly();
      } else { openApptModal(id); }
    });
    var addBtn = document.getElementById('appt-add');
    if (addBtn) addBtn.addEventListener('click', function () { openApptModal(null); });
    var form = document.getElementById('appt-form');
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var id = +document.getElementById('f-id').value;
      var rec = {
        patient: document.getElementById('f-patient').value,
        treatment: document.getElementById('f-treatment').value,
        doctor: document.getElementById('f-doctor').value,
        branch: document.getElementById('f-branch').value,
        when: document.getElementById('f-date').value + 'T' + document.getElementById('f-time').value + ':00',
        status: document.getElementById('f-status').value
      };
      if (id) {
        var i = store.appointments.findIndex(function (a) { return a.id === id; });
        if (i > -1) store.appointments[i] = Object.assign({ id: id }, rec);
      } else {
        rec.id = Math.max.apply(null, store.appointments.map(function (a) { return a.id; }).concat([0])) + 1;
        store.appointments.push(rec);
      }
      save(store);
      var modalEl = document.getElementById('appt-modal');
      if (BS && modalEl) BS.Modal.getInstance(modalEl).hide();
      renderAppointments(); renderDashboardCountsOnly();
    });
    renderAppointments();
  }
  function renderDashboardCountsOnly() {
    var today = store.appointments.filter(function (a) { return isToday(a.when); });
    var el = document.getElementById('stat-today'); if (el) el.textContent = today.length;
  }
  function openApptModal(id) {
    var a = id ? store.appointments.find(function (x) { return x.id === id; }) : null;
    var d = a ? new Date(a.when) : new Date();
    document.getElementById('f-id').value = a ? a.id : 0;
    document.getElementById('f-patient').innerHTML = patientOptions(a ? a.patient : null);
    document.getElementById('f-treatment').innerHTML = treatmentOptions(a ? a.treatment : null);
    document.getElementById('f-doctor').innerHTML = doctorOptions(a ? a.doctor : null);
    document.getElementById('f-branch').innerHTML = branchOptions(a ? a.branch : null);
    document.getElementById('f-date').value = d.toISOString().slice(0, 10);
    document.getElementById('f-time').value = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    document.getElementById('f-status').value = a ? a.status : 'Confirmed';
    document.getElementById('appt-modal-title').textContent = a ? 'Edit appointment' : 'New appointment';
    if (BS) new BS.Modal(document.getElementById('appt-modal')).show();
  }

  /* ---- Patients page ---- */
  var patFilter = '';
  function renderPatients() {
    var tb = document.getElementById('patient-rows');
    if (!tb) return;
    var rows = store.patients.filter(function (p) {
      var hay = (p.name + ' ' + p.branch + ' ' + p.phone).toLowerCase();
      return !patFilter || hay.indexOf(patFilter.toLowerCase()) !== -1;
    });
    tb.innerHTML = rows.map(function (p) {
      return '<tr><td>' + avatar(p.name) + ' <span class="ms-1">' + esc(p.name) + '</span></td>' +
        '<td>' + esc(p.phone) + '</td><td>' + esc(p.branch) + '</td><td>' + esc(p.since) + '</td>' +
        '<td class="text-end"><a class="btn btn-sm" href="appointments.html">Appointments</a></td></tr>';
    }).join('') || '<tr><td colspan="5" class="text-secondary">No patients match this search.</td></tr>';
    var c = document.getElementById('patient-count');
    if (c) c.textContent = rows.length + ' patient' + (rows.length === 1 ? '' : 's');
  }
  function bindPatients() {
    var q = document.getElementById('patient-search');
    if (q) q.addEventListener('input', function () { patFilter = q.value; renderPatients(); });
    var form = document.getElementById('patient-form');
    if (form) {
      document.getElementById('p-branch').innerHTML = branchOptions(null);
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = document.getElementById('p-name').value.trim();
        if (!name) return;
        var rec = {
          id: Math.max.apply(null, store.patients.map(function (p) { return p.id; }).concat([0])) + 1,
          name: name, phone: document.getElementById('p-phone').value.trim() || '—',
          branch: document.getElementById('p-branch').value, since: String(new Date().getFullYear())
        };
        store.patients.push(rec); save(store); renderPatients(); form.reset();
      });
    }
    renderPatients();
  }

  /* ---- Treatments page ---- */
  function renderTreatments() {
    var tb = document.getElementById('treatment-rows');
    if (!tb) return;
    tb.innerHTML = TREATMENTS.map(function (t) {
      return '<tr><td>' + esc(t.name) + '</td><td>' + esc(t.category) + '</td><td>' + t.minutes + ' min</td>' +
        '<td><span class="badge bg-teal">Available</span></td></tr>';
    }).join('');
  }

  /* ---- Billing page ---- */
  function renderBilling() {
    var tb = document.getElementById('invoice-rows');
    if (!tb) return;
    tb.innerHTML = store.invoices.map(function (v) {
      return '<tr><td>' + esc(v.no) + '</td><td>' + avatar(v.patient) + ' <span class="ms-1">' + esc(v.patient) + '</span></td>' +
        '<td>' + esc(v.treatment) + '</td><td>' + esc(v.date) + '</td><td>' + statusBadge(v.status) + '</td>' +
        '<td class="text-end"><button class="btn btn-sm" onclick="window.print()">Print</button></td></tr>';
    }).join('');
    var paid = store.invoices.filter(function (v) { return v.status === 'Paid'; }).length;
    var el;
    el = document.getElementById('inv-total'); if (el) el.textContent = store.invoices.length;
    el = document.getElementById('inv-paid'); if (el) el.textContent = paid;
    el = document.getElementById('inv-pending'); if (el) el.textContent = store.invoices.length - paid;
  }

  /* ---- Branches page ---- */
  function renderBranches() {
    var grid = document.getElementById('branch-cards');
    if (!grid) return;
    grid.innerHTML = BRANCHES.map(function (b) {
      return '<div class="col-md-6 col-lg-4"><div class="card h-100"><div class="card-body">' +
        '<h3 class="card-title"><span data-icon="building-hospital"></span> ' + esc(b.name) + '</h3>' +
        '<div class="text-secondary"><span data-icon="phone"></span> ' + esc(b.phone) + '</div>' +
        '<div class="text-secondary mt-1"><span data-icon="clock"></span> Open daily — call to confirm hours</div>' +
        '<div class="mt-3"><a class="btn btn-primary btn-sm" href="book.html?branch=' + encodeURIComponent(b.name) + '">Book at this clinic</a></div>' +
        '</div></div></div>';
    }).join('');
    injectIcons(grid);
  }

  /* ---- Public booking form ---- */
  function bindBooking() {
    var form = document.getElementById('book-form');
    if (!form) return;
    var branchSel = document.getElementById('b-branch');
    var treatSel = document.getElementById('b-treatment');
    if (branchSel) branchSel.innerHTML = branchOptions(null);
    if (treatSel) treatSel.innerHTML = treatmentOptions(null);
    var params = new URLSearchParams(location.search);
    var pre = params.get('branch');
    if (pre && branchSel) branchSel.value = pre;
    var preT = params.get('treatment');
    if (preT && treatSel) treatSel.value = preT;
    var d = document.getElementById('b-date');
    if (d) d.value = new Date().toISOString().slice(0, 10);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var rec = {
        id: Math.max.apply(null, store.appointments.map(function (a) { return a.id; }).concat([0])) + 1,
        patient: document.getElementById('b-name').value.trim(),
        treatment: treatSel.value,
        doctor: document.getElementById('b-doctor').value,
        branch: branchSel.value,
        when: d.value + 'T' + document.getElementById('b-time').value + ':00',
        status: 'Confirmed'
      };
      store.appointments.push(rec);
      if (store.patients.findIndex(function (p) { return p.name === rec.patient; }) === -1) {
        store.patients.push({
          id: Math.max.apply(null, store.patients.map(function (p) { return p.id; }).concat([0])) + 1,
          name: rec.patient, phone: document.getElementById('b-phone').value.trim() || '—',
          branch: rec.branch, since: String(new Date().getFullYear())
        });
      }
      save(store);
      var ok = document.getElementById('book-success');
      if (ok) {
        ok.classList.remove('d-none');
        document.getElementById('book-success-text').textContent =
          'Thank you, ' + rec.patient + '. Your ' + rec.treatment + ' at ' + rec.branch +
          ' is booked for ' + fmtDate(rec.when) + ' at ' + fmtTime(rec.when) + '. The clinic will confirm by phone.';
        form.reset();
        if (d) d.value = new Date().toISOString().slice(0, 10);
        ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  /* ---- Sign-in (demo: any credentials open the dashboard) ---- */
  function bindSignIn() {
    var form = document.getElementById('signin-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      location.href = 'admin/index.html';
    });
  }

  /* ---- Boot ---- */
  document.addEventListener('DOMContentLoaded', function () {
    injectIcons(document);
    renderDashboard();
    renderTreatments();
    renderBilling();
    renderBranches();
    bindAppointments();
    bindPatients();
    bindBooking();
    bindSignIn();
    var reset = document.getElementById('reset-demo');
    if (reset) reset.addEventListener('click', function (e) { e.preventDefault(); resetDemo(); });
  });

  /* expose for debugging from the console only */
  window.DJ = { store: store, branches: BRANCHES, treatments: TREATMENTS, reset: resetDemo };
})();
