let jobs = JSON.parse(localStorage.getItem("jobs")) || [];

let editId = null;
let currentFilter = "all";

document.addEventListener("DOMContentLoaded", () => {

    initializeDateFields();

    showTodayDate();

    initLegend();

    renderJobs();
});

function showTodayDate() {

    const today = new Date();

    let text = today.toLocaleDateString(
        "fr-FR",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

    text =
        text.charAt(0).toUpperCase() +
        text.slice(1);

    document.getElementById("todayDate").textContent =
        text;
}

function initLegend() {

    const btn =
        document.getElementById("legendBtn");

    const modal =
        document.getElementById("legendModal");

    const close =
        document.getElementById("closeLegend");

    btn.onclick = () => {
        modal.style.display = "block";
    };

    close.onclick = () => {
        modal.style.display = "none";
    };

    modal.onclick = (e) => {

        if (e.target === modal) {
            modal.style.display = "none";
        }
    };
}

function initializeDateFields() {

    const year = new Date().getFullYear();

    [
        "deadlineYear",
        "applicationYear",
        "preYear",
        "testYear",
        "interviewYear"
    ].forEach(id => {

        const field =
            document.getElementById(id);

        if (field) {
            field.value = year;
        }
    });

    autoJump("deadlineDay", "deadlineMonth");
    autoJump("deadlineMonth", "deadlineYear");

    autoJump("applicationDay", "applicationMonth");
    autoJump("applicationMonth", "applicationYear");

    autoJump("preDay", "preMonth");
    autoJump("preMonth", "preYear");

    autoJump("testDay", "testMonth");
    autoJump("testMonth", "testYear");

    autoJump("interviewDay", "interviewMonth");
    autoJump("interviewMonth", "interviewYear");
}

function autoJump(from, to) {

    const source =
        document.getElementById(from);

    source.addEventListener("input", () => {

        if (source.value.length >= 2) {

            document
                .getElementById(to)
                .focus();
        }
    });
}

function buildDate(prefix) {

    const day =
        document.getElementById(prefix + "Day").value;

    const month =
        document.getElementById(prefix + "Month").value;

    const year =
        document.getElementById(prefix + "Year").value;

    if (!day || !month) return "";

    return `${day}/${month}/${year}`;
}

function saveJobs() {

    localStorage.setItem(
        "jobs",
        JSON.stringify(jobs)
    );
}

function clearForm() {

    document.getElementById("employer").value = "";
    document.getElementById("position").value = "";
    document.getElementById("grade").value = "";
    document.getElementById("location").value = "";
    document.getElementById("jobLink").value = "";
    document.getElementById("notes").value = "";

    document.getElementById("status").value =
        "À envoyer";

    editId = null;

    document.getElementById("saveBtn").textContent =
        "Ajouter";
}

function addCandidate() {

    const employer =
        document.getElementById("employer")
            .value.trim();

    const position =
        document.getElementById("position")
            .value.trim();

    if (!employer) {

        alert("Employeur obligatoire");
        return;
    }

    if (!position) {

        alert("Poste obligatoire");
        return;
    }

    const job = {

        id: editId || Date.now(),

        employer,

        position,

        grade:
            document.getElementById("grade").value,

        location:
            document.getElementById("location").value,

        jobLink:
            document.getElementById("jobLink").value,

        status:
            document.getElementById("status").value,

        deadline:
            buildDate("deadline"),

        applicationDate:
            buildDate("application"),

        preInterview:
            buildDate("pre"),

        writtenTest:
            buildDate("test"),

        interviewDate:
            buildDate("interview"),

        notes:
            document.getElementById("notes").value
    };

    if (editId) {

        jobs = jobs.map(j =>
            j.id === editId ? job : j
        );

    } else {

        jobs.push(job);
    }

    saveJobs();

    clearForm();

    renderJobs();
}

function editJob(id) {

    const job =
        jobs.find(j => j.id === id);

    if (!job) return;

    editId = id;

    document.getElementById("employer").value =
        job.employer || "";

    document.getElementById("position").value =
        job.position || "";

    document.getElementById("grade").value =
        job.grade || "";

    document.getElementById("location").value =
        job.location || "";

    document.getElementById("jobLink").value =
        job.jobLink || "";

    document.getElementById("status").value =
        job.status || "À envoyer";

    document.getElementById("notes").value =
        job.notes || "";

    document.getElementById("saveBtn").textContent =
        "Enregistrer";
}

function deleteJob(id) {

    if (!confirm("Supprimer cette candidature ?")) {
        return;
    }

    jobs =
        jobs.filter(job => job.id !== id);

    saveJobs();

    renderJobs();
}

function getStatusIcon(status) {

    switch(status){

        case "À envoyer": return "🟡";
        case "En attente": return "🔵";
        case "Roster": return "🟣";
        case "Pré-entretien": return "🟦";
        case "Test écrit": return "🟧";
        case "Entretien": return "🟩";
        case "Offre reçue": return "🟢";
        case "Offre acceptée": return "✅";
        case "Refus": return "🔴";
        case "Retirée": return "⚫";

        default:
            return "⚪";
    }
}

function setFilter(filter) {

    currentFilter = filter;

    renderJobs();
}

function matchesFilter(job) {

    switch(currentFilter) {

        case "a_envoyer":
            return job.status === "À envoyer";

        case "process":
            return [
                "En attente",
                "Roster",
                "Pré-entretien",
                "Test écrit",
                "Entretien"
            ].includes(job.status);

        case "offer":
            return [
                "Offre reçue",
                "Offre acceptée"
            ].includes(job.status);

        case "refus":
            return job.status === "Refus";

        default:
            return true;
    }
}

function renderJobs() {

    const container =
        document.getElementById("cardsContainer");

    const search =
        document.getElementById("searchInput")
            .value
            .toLowerCase();

    container.innerHTML = "";

    jobs
        .filter(matchesFilter)
        .filter(job => {

            const text = (
                job.employer +
                " " +
                job.position +
                " " +
                job.grade
            ).toLowerCase();

            return text.includes(search);

        })
        .forEach(job => {

            const card =
                document.createElement("div");

            card.className = "card";

            card.onclick =
                () => editJob(job.id);

            const icon =
                getStatusIcon(job.status);

            card.innerHTML = `

                <div class="card-header">

                    <div class="status-icon">
                        ${icon}
                    </div>

                    <div class="card-title">

                        ${job.employer}
                        •
                        ${job.position}
                        •
                        ${job.grade || "-"}

                    </div>

                </div>

                <div class="line">
                    ${job.location || "-"}
                </div>

                <div class="line">
                    Limite : ${job.deadline || "-"}
                </div>

                <div class="line">
                    Envoi : ${job.applicationDate || "-"}
                </div>

                <div class="line">
                    Pré-entretien : ${job.preInterview || "-"}
                </div>

                <div class="line">
                    Test écrit : ${job.writtenTest || "-"}
                </div>

                <div class="line">
                    Entretien : ${job.interviewDate || "-"}
                </div>

                <div class="line">
                    <strong>${job.status}</strong>
                </div>

                <div class="card-actions">

                    <button
                        class="delete-btn"
                        onclick="event.stopPropagation();deleteJob(${job.id});">

                        Supprimer

                    </button>

                </div>

            `;

            container.appendChild(card);
        });

    updateStats();
}

function updateStats() {

    document.getElementById("totalCount")
        .textContent = jobs.length;

    document.getElementById("todoCount")
        .textContent =
            jobs.filter(j =>
                j.status === "À envoyer"
            ).length;

    document.getElementById("processCount")
        .textContent =
            jobs.filter(j =>
                [
                    "En attente",
                    "Roster",
                    "Pré-entretien",
                    "Test écrit",
                    "Entretien"
                ].includes(j.status)
            ).length;

    document.getElementById("offerCount")
        .textContent =
            jobs.filter(j =>
                [
                    "Offre reçue",
                    "Offre acceptée"
                ].includes(j.status)
            ).length;

    document.getElementById("refusCount")
        .textContent =
            jobs.filter(j =>
                j.status === "Refus"
            ).length;
}

function exportData() {

    const blob =
        new Blob(
            [
                JSON.stringify(
                    jobs,
                    null,
                    2
                )
            ],
            {
                type:
                "application/json"
            }
        );

    const link =
        document.createElement("a");

    link.href =
        URL.createObjectURL(blob);

    link.download =
        "jobtracker-v3-5.json";

    link.click();
}

function importData(event) {

    const file =
        event.target.files[0];

    if (!file) return;

    const reader =
        new FileReader();

    reader.onload = function(e){

        jobs =
            JSON.parse(
                e.target.result
            );

        saveJobs();

        renderJobs();
    };

    reader.readAsText(file);
}
