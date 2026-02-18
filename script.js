// ==========================
// REGISTER USER
// ==========================
function registerUser() {
    let users = JSON.parse(localStorage.getItem("users")) || [];

    let user = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        role: document.getElementById("role").value
    };

    if (users.find(u => u.email === user.email)) {
        alert("Email already registered!");
        return;
    }

    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));

    alert("Registration Successful!");
    window.location.href = "index.html";
}

// ==========================
// LOGIN USER
// ==========================
function loginUser() {
    let users = JSON.parse(localStorage.getItem("users")) || [];

    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    let foundUser = users.find(u => u.email === email && u.password === password);

    if (!foundUser) {
        alert("Invalid Credentials");
        return;
    }

    localStorage.setItem("currentUser", foundUser.email);
    localStorage.setItem("currentRole", foundUser.role);

    if (foundUser.role === "Admin") window.location.href = "admin.html";
    else if (foundUser.role === "Speaker") window.location.href = "speaker.html";
    else window.location.href = "attendee.html";
}

// ==========================
// LOGOUT
// ==========================
function logout() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentRole");
    window.location.href = "index.html";
}

// ==========================
// ADMIN FUNCTIONS
// ==========================
function loadAdminData() {
    displayConferences();
    displayPapers();
}

function createConference() {
    let conferences = JSON.parse(localStorage.getItem("conferences")) || [];

    let conf = {
        title: document.getElementById("title").value,
        date: document.getElementById("date").value,
        venue: document.getElementById("venue").value
    };

    conferences.push(conf);
    localStorage.setItem("conferences", JSON.stringify(conferences));

    alert("Conference Created!");
    displayConferences();
}

function displayConferences() {
    let conferences = JSON.parse(localStorage.getItem("conferences")) || [];
    let output = "";

    conferences.forEach(conf => {
        output += `<p>${conf.title} - ${conf.date} - ${conf.venue}</p>`;
    });

    document.getElementById("conferenceList").innerHTML =
        output || "<p>No Conferences Created</p>";
}

// ==========================
// SPEAKER FUNCTIONS
// ==========================
function loadSpeakerPage() {
    loadConferenceDropdown();
}

function loadConferenceDropdown() {
    let conferences = JSON.parse(localStorage.getItem("conferences")) || [];
    let dropdown = document.getElementById("conferenceSelect");

    if (conferences.length === 0) {
        dropdown.innerHTML = "<option>No Conferences Available</option>";
        return;
    }

    let options = "<option value=''>-- Select Conference --</option>";

    conferences.forEach(conf => {
        options += `<option value="${conf.title}">
                        ${conf.title} - ${conf.date}
                    </option>`;
    });

    dropdown.innerHTML = options;
}

function submitPaper() {
    let papers = JSON.parse(localStorage.getItem("papers")) || [];
    let currentUser = localStorage.getItem("currentUser");

    let title = document.getElementById("paperTitle").value;
    let conference = document.getElementById("conferenceSelect").value;

    if (!title || !conference) {
        alert("Enter title and select conference!");
        return;
    }

    let paper = {
        title: title,
        conference: conference,
        author: currentUser,
        status: "Pending"
    };

    papers.push(paper);
    localStorage.setItem("papers", JSON.stringify(papers));

    alert("Paper Submitted!");
}

// ==========================
// ADMIN PAPER CONTROL
// ==========================
function displayPapers() {
    let papers = JSON.parse(localStorage.getItem("papers")) || [];
    let output = "";

    papers.forEach((paper, index) => {
        output += `
            <p>
                <strong>${paper.title}</strong><br>
                Conference: ${paper.conference}<br>
                Author: ${paper.author}<br>
                Status: ${paper.status}<br>
                <button onclick="approvePaper(${index})">Approve</button>
                <button onclick="rejectPaper(${index})">Reject</button>
            </p>
            <hr>
        `;
    });

    document.getElementById("paperList").innerHTML =
        output || "<p>No Papers Submitted</p>";
}

function approvePaper(index) {
    let papers = JSON.parse(localStorage.getItem("papers")) || [];
    papers[index].status = "Approved";
    localStorage.setItem("papers", JSON.stringify(papers));
    displayPapers();
}

function rejectPaper(index) {
    let papers = JSON.parse(localStorage.getItem("papers")) || [];
    papers[index].status = "Rejected";
    localStorage.setItem("papers", JSON.stringify(papers));
    displayPapers();
}

// ==========================
// ATTENDEE FUNCTIONS
// ==========================
function loadAttendeePage() {
    displayAvailableConferences();
    displayMyRegistrations();
}

function displayAvailableConferences() {
    let conferences = JSON.parse(localStorage.getItem("conferences")) || [];
    let registrations = JSON.parse(localStorage.getItem("registrations")) || [];
    let currentUser = localStorage.getItem("currentUser");

    let output = "";

    conferences.forEach((conf, index) => {

        let alreadyRegistered = registrations.find(reg =>
            reg.user === currentUser && reg.title === conf.title
        );

        output += `
            <p>
                ${conf.title} - ${conf.date} - ${conf.venue}
                ${
                    alreadyRegistered
                        ? "<button disabled>Registered</button>"
                        : `<button onclick="registerConference(${index})">Register</button>`
                }
            </p>
        `;
    });

    document.getElementById("conferenceList").innerHTML =
        output || "<p>No Conferences Available</p>";
}

function registerConference(index) {
    let conferences = JSON.parse(localStorage.getItem("conferences")) || [];
    let registrations = JSON.parse(localStorage.getItem("registrations")) || [];
    let currentUser = localStorage.getItem("currentUser");

    let selectedConference = conferences[index];

    registrations.push({
        user: currentUser,
        title: selectedConference.title,
        date: selectedConference.date
    });

    localStorage.setItem("registrations", JSON.stringify(registrations));

    alert("Registered Successfully!");
    loadAttendeePage();
}

function displayMyRegistrations() {
    let registrations = JSON.parse(localStorage.getItem("registrations")) || [];
    let currentUser = localStorage.getItem("currentUser");

    let output = "";

    registrations.forEach(reg => {
        if (reg.user === currentUser) {
            output += `<p>${reg.title} - ${reg.date}</p>`;
        }
    });

    document.getElementById("myRegistrations").innerHTML =
        output || "<p>No Registrations Yet</p>";
}