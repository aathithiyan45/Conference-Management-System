// ==========================
// TOAST NOTIFICATIONS
// ==========================
function showToast(msg, type = "info") {
    let container = document.getElementById("toastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        container.className = "toast-container";
        document.body.appendChild(container);
    }
    const icons = { success: "✅", error: "❌", info: "ℹ️" };
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type]}</span> ${msg}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
}

// ==========================
// STATUS BADGE
// ==========================
function getStatusBadge(status) {
    if (status === "Approved") return `<span class="badge approved">Approved</span>`;
    if (status === "Rejected") return `<span class="badge rejected">Rejected</span>`;
    return `<span class="badge pending">Pending</span>`;
}

// ==========================
// REGISTER USER
// ==========================
function registerUser() {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let name  = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value;
    let role  = document.getElementById("role").value;

    if (!name || !email || !password) {
        showToast("Please fill in all fields.", "error"); return;
    }

    if (users.find(u => u.email === email)) {
        showToast("Email already registered!", "error"); return;
    }

    users.push({ name, email, password, role });
    localStorage.setItem("users", JSON.stringify(users));
    showToast("Registration Successful!", "success");
    setTimeout(() => window.location.href = "index.html", 1200);
}

// ==========================
// LOGIN USER
// ==========================
function loginUser() {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let email    = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value;

    let foundUser = users.find(u => u.email === email && u.password === password);
    if (!foundUser) { showToast("Invalid credentials. Try again.", "error"); return; }

    localStorage.setItem("currentUser", foundUser.email);
    localStorage.setItem("currentRole", foundUser.role);
    localStorage.setItem("currentName", foundUser.name);

    showToast(`Welcome back, ${foundUser.name}!`, "success");
    setTimeout(() => {
        if (foundUser.role === "Admin")    window.location.href = "admin.html";
        else if (foundUser.role === "Speaker") window.location.href = "speaker.html";
        else window.location.href = "attendee.html";
    }, 900);
}

// ==========================
// LOGOUT
// ==========================
function logout() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentRole");
    localStorage.removeItem("currentName");
    window.location.href = "index.html";
}

// ==========================
// ADMIN FUNCTIONS
// ==========================
function loadAdminData() {
    showStats();
    displayConferences();
    displayPapers();
}

function showStats() {
    let users       = JSON.parse(localStorage.getItem("users"))         || [];
    let conferences = JSON.parse(localStorage.getItem("conferences"))   || [];
    let papers      = JSON.parse(localStorage.getItem("papers"))        || [];
    let registrations = JSON.parse(localStorage.getItem("registrations")) || [];

    let el = document.getElementById("stats");
    if (!el) return;
    el.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Total Users</div>
                <div class="stat-value">${users.length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Conferences</div>
                <div class="stat-value">${conferences.length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Papers Submitted</div>
                <div class="stat-value">${papers.length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Registrations</div>
                <div class="stat-value">${registrations.length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label" style="color:var(--green)">Approved Papers</div>
                <div class="stat-value" style="color:var(--green)">${papers.filter(p => p.status === "Approved").length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label" style="color:var(--yellow)">Pending Papers</div>
                <div class="stat-value" style="color:var(--yellow)">${papers.filter(p => p.status === "Pending").length}</div>
            </div>
        </div>
    `;
}

function createConference() {
    let conferences = JSON.parse(localStorage.getItem("conferences")) || [];

    let title    = document.getElementById("title").value.trim();
    let date     = document.getElementById("date").value;
    let venue    = document.getElementById("venue").value.trim();
    let capacity = parseInt(document.getElementById("capacity").value) || 100;

    if (!title || !date || !venue) {
        showToast("Please fill all conference fields.", "error"); return;
    }

    conferences.push({ title, date, venue, capacity });
    localStorage.setItem("conferences", JSON.stringify(conferences));

    // clear fields
    document.getElementById("title").value = "";
    document.getElementById("date").value  = "";
    document.getElementById("venue").value = "";
    document.getElementById("capacity").value = "";

    showToast("Conference created!", "success");
    displayConferences();
    showStats();
}

function displayConferences() {
    let conferences   = JSON.parse(localStorage.getItem("conferences"))   || [];
    let registrations = JSON.parse(localStorage.getItem("registrations")) || [];
    let el = document.getElementById("conferenceList");
    if (!el) return;

    if (!conferences.length) {
        el.innerHTML = `<div class="empty"><span class="empty-icon">📭</span>No conferences created yet.</div>`;
        return;
    }

    el.innerHTML = conferences.map((conf, i) => {
        let regCount = registrations.filter(r => r.title === conf.title).length;
        let isFull   = regCount >= conf.capacity;
        return `
        <div class="item-card">
            <div class="item-card-info">
                <h4>${conf.title}</h4>
                <p>${conf.date} &nbsp;|&nbsp; ${conf.venue} &nbsp;|&nbsp; Registered: ${regCount} / ${conf.capacity} registered</p>
                ${isFull ? '<span class="badge rejected" style="margin-top:6px;display:inline-flex;">Full</span>' : ''}
            </div>
            <div class="item-card-actions">
                <button class="btn-danger" onclick="deleteConference(${i})">Delete</button>
            </div>
        </div>`;
    }).join('');
}

function deleteConference(index) {
    if (!confirm("Delete this conference? This cannot be undone.")) return;
    let conferences = JSON.parse(localStorage.getItem("conferences")) || [];
    conferences.splice(index, 1);
    localStorage.setItem("conferences", JSON.stringify(conferences));
    showToast("Conference deleted.", "info");
    displayConferences();
    showStats();
}

// ==========================
// ADMIN PAPER CONTROL
// ==========================
function displayPapers() {
    let papers = JSON.parse(localStorage.getItem("papers")) || [];
    let el     = document.getElementById("paperList");
    if (!el) return;

    if (!papers.length) {
        el.innerHTML = `<div class="empty"><span class="empty-icon">📂</span>No papers submitted yet.</div>`;
        return;
    }

    el.innerHTML = papers.map((paper, i) => `
        <div class="item-card">
            <div class="item-card-info">
                <h4>${paper.title}</h4>
                <p>Conference: ${paper.conference} &nbsp;|&nbsp; Author: ${paper.author}</p>
                <div style="margin-top:8px;">${getStatusBadge(paper.status)}</div>
            </div>
            <div class="item-card-actions">
                ${paper.status !== "Approved" ? `<button class="btn-success" onclick="approvePaper(${i})">Approve</button>` : ''}
                ${paper.status !== "Rejected" ? `<button class="btn-danger"  onclick="rejectPaper(${i})">Reject</button>`  : ''}
            </div>
        </div>
    `).join('');
}

function approvePaper(index) {
    let papers = JSON.parse(localStorage.getItem("papers")) || [];
    papers[index].status = "Approved";
    localStorage.setItem("papers", JSON.stringify(papers));
    showToast("Paper approved!", "success");
    displayPapers(); showStats();
}

function rejectPaper(index) {
    let papers = JSON.parse(localStorage.getItem("papers")) || [];
    papers[index].status = "Rejected";
    localStorage.setItem("papers", JSON.stringify(papers));
    showToast("Paper rejected.", "info");
    displayPapers(); showStats();
}

// ==========================
// SPEAKER FUNCTIONS
// ==========================
function loadSpeakerPage() {
    loadConferenceDropdown();
    displayMyPapers();
}

function loadConferenceDropdown() {
    let conferences = JSON.parse(localStorage.getItem("conferences")) || [];
    let dropdown    = document.getElementById("conferenceSelect");
    if (!dropdown) return;

    if (!conferences.length) {
        dropdown.innerHTML = "<option>No Conferences Available</option>"; return;
    }

    dropdown.innerHTML = "<option value=''>-- Select Conference --</option>" +
        conferences.map(c => `<option value="${c.title}">${c.title} — ${c.date}</option>`).join('');
}

function submitPaper() {
    let papers      = JSON.parse(localStorage.getItem("papers")) || [];
    let currentUser = localStorage.getItem("currentUser");
    let title       = document.getElementById("paperTitle").value.trim();
    let conference  = document.getElementById("conferenceSelect").value;

    if (!title || !conference) {
        showToast("Enter a title and select a conference.", "error"); return;
    }

    // Duplicate check
    let alreadySubmitted = papers.find(p => p.author === currentUser && p.conference === conference);
    if (alreadySubmitted) {
        showToast("You already submitted a paper for this conference!", "error"); return;
    }

    papers.push({ title, conference, author: currentUser, status: "Pending" });
    localStorage.setItem("papers", JSON.stringify(papers));

    document.getElementById("paperTitle").value = "";
    document.getElementById("conferenceSelect").value = "";

    showToast("Paper submitted successfully!", "success");
    displayMyPapers();
}

function displayMyPapers() {
    let papers      = JSON.parse(localStorage.getItem("papers")) || [];
    let currentUser = localStorage.getItem("currentUser");
    let el          = document.getElementById("myPapers");
    if (!el) return;

    let myPapers = papers.filter(p => p.author === currentUser);

    if (!myPapers.length) {
        el.innerHTML = `<div class="empty"><span class="empty-icon">📋</span>No papers submitted yet.</div>`;
        return;
    }

    el.innerHTML = myPapers.map(p => `
        <div class="item-card">
            <div class="item-card-info">
                <h4>${p.title}</h4>
                <p>${p.conference}</p>
                <div style="margin-top:8px;">${getStatusBadge(p.status)}</div>
            </div>
        </div>
    `).join('');
}

// ==========================
// ATTENDEE FUNCTIONS
// ==========================
function loadAttendeePage() {
    displayAvailableConferences();
    displayMyRegistrations();
}

function displayAvailableConferences() {
    let conferences   = JSON.parse(localStorage.getItem("conferences"))   || [];
    let registrations = JSON.parse(localStorage.getItem("registrations")) || [];
    let currentUser   = localStorage.getItem("currentUser");
    let el            = document.getElementById("conferenceList");
    if (!el) return;

    if (!conferences.length) {
        el.innerHTML = `<div class="empty"><span class="empty-icon">📭</span>No conferences available yet.</div>`;
        return;
    }

    el.innerHTML = conferences.map((conf, i) => {
        let regCount = registrations.filter(r => r.title === conf.title).length;
        let alreadyRegistered = registrations.find(r => r.user === currentUser && r.title === conf.title);
        let isFull = regCount >= conf.capacity;

        return `
        <div class="item-card">
            <div class="item-card-info">
                <h4>${conf.title}</h4>
                <p>${conf.date} &nbsp;|&nbsp; ${conf.venue} &nbsp;|&nbsp; Registered: ${regCount}/${conf.capacity} spots</p>
                ${isFull ? '<span class="badge rejected" style="margin-top:6px;display:inline-flex;">Fully Booked</span>' : ''}
            </div>
            <div class="item-card-actions">
                ${alreadyRegistered
                    ? `<button disabled>Registered</button>`
                    : isFull
                        ? `<button disabled>Full</button>`
                        : `<button onclick="registerConference(${i})">Register</button>`}
            </div>
        </div>`;
    }).join('');
}

function registerConference(index) {
    let conferences   = JSON.parse(localStorage.getItem("conferences"))   || [];
    let registrations = JSON.parse(localStorage.getItem("registrations")) || [];
    let currentUser   = localStorage.getItem("currentUser");

    let conf     = conferences[index];
    let regCount = registrations.filter(r => r.title === conf.title).length;

    if (regCount >= conf.capacity) {
        showToast("Sorry, this conference is fully booked!", "error"); return;
    }

    registrations.push({ user: currentUser, title: conf.title, date: conf.date });
    localStorage.setItem("registrations", JSON.stringify(registrations));

    showToast("Registered successfully! ", "success");
    loadAttendeePage();
}

function displayMyRegistrations() {
    let registrations = JSON.parse(localStorage.getItem("registrations")) || [];
    let currentUser   = localStorage.getItem("currentUser");
    let el            = document.getElementById("myRegistrations");
    if (!el) return;

    let mine = registrations.filter(r => r.user === currentUser);

    if (!mine.length) {
        el.innerHTML = `<div class="empty"><span class="empty-icon">🎟️</span>No registrations yet.</div>`;
        return;
    }

    el.innerHTML = mine.map(reg => `
        <div class="item-card">
            <div class="item-card-info">
                <h4>${reg.title}</h4>
                <p>${reg.date}</p>
            </div>
            <span class="badge approved">Registered</span>
        </div>
    `).join('');
}