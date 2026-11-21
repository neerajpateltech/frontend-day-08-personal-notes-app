
const newNoteBtn = document.getElementById("newNoteBtn");
const noteModal = document.getElementById("noteModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");

const noteForm = document.getElementById("noteForm");
const noteIdInput = document.getElementById("noteId");
const noteTitleInput = document.getElementById("noteTitle");
const noteContentInput = document.getElementById("noteContent");

const modalTitle = document.getElementById("modalTitle");
const notesGrid = document.getElementById("notesGrid");
const notesCount = document.getElementById("notesCount");
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("emptyState");

let notes = JSON.parse(localStorage.getItem("personalNotes")) || [];

// Save notes in browser
function saveNotes() {
    localStorage.setItem("personalNotes", JSON.stringify(notes));
}

// Open modal for creating a note
function openCreateModal() {
    noteForm.reset();
    noteIdInput.value = "";
    modalTitle.textContent = "Create Note";
    noteModal.classList.add("show");
    noteTitleInput.focus();
}

// Close modal
function closeModal() {
    noteModal.classList.remove("show");
}

// Create or update note
noteForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();
    const id = noteIdInput.value;

    if (title === "" || content === "") {
        alert("Please enter title and content.");
        return;
    }

    if (id) {
        // Update existing note
        const note = notes.find(function (item) {
            return item.id === Number(id);
        });

        if (note) {
            note.title = title;
            note.content = content;
            note.updatedAt = new Date().toISOString();
        }
    } else {
        // Create new note
        const newNote = {
            id: Date.now(),
            title: title,
            content: content,
            pinned: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        notes.unshift(newNote);
    }

    saveNotes();
    renderNotes();
    closeModal();
});

// Edit note
function editNote(id) {
    const note = notes.find(function (item) {
        return item.id === id;
    });

    if (!note) return;

    noteIdInput.value = note.id;
    noteTitleInput.value = note.title;
    noteContentInput.value = note.content;

    modalTitle.textContent = "Edit Note";
    noteModal.classList.add("show");
    noteTitleInput.focus();
}

// Delete note
function deleteNote(id) {
    const confirmed = confirm("Are you sure you want to delete this note?");

    if (!confirmed) return;

    notes = notes.filter(function (item) {
        return item.id !== id;
    });

    saveNotes();
    renderNotes();
}

// Pin or unpin note
function togglePin(id) {
    const note = notes.find(function (item) {
        return item.id === id;
    });

    if (!note) return;

    note.pinned = !note.pinned;

    saveNotes();
    renderNotes();
}

// Format date
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

// Display notes
function renderNotes() {
    notesGrid.textContent = "";

    const searchText = searchInput.value.toLowerCase().trim();

    const filteredNotes = notes.filter(function (note) {
        return (
            note.title.toLowerCase().includes(searchText) ||
            note.content.toLowerCase().includes(searchText)
        );
    });

    // Pinned notes first
    filteredNotes.sort(function (a, b) {
        return Number(b.pinned) - Number(a.pinned);
    });

    notesCount.textContent =
        filteredNotes.length +
        (filteredNotes.length === 1 ? " note" : " notes");

    if (filteredNotes.length === 0) {
        emptyState.style.display = "block";
    } else {
        emptyState.style.display = "none";
    }

    filteredNotes.forEach(function (note) {
        const card = document.createElement("article");
        card.className = "note-card";

        if (note.pinned) {
            card.classList.add("pinned");
        }

        const title = document.createElement("h3");
        title.textContent = note.title;

        const content = document.createElement("p");
        content.className = "note-content";
        content.textContent = note.content;

        const date = document.createElement("p");
        date.className = "note-date";
        date.textContent = "Updated: " + formatDate(note.updatedAt);

        const actions = document.createElement("div");
        actions.className = "note-actions";

        const pinButton = document.createElement("button");
        pinButton.textContent = note.pinned ? "Unpin" : "Pin";
        pinButton.addEventListener("click", function () {
            togglePin(note.id);
        });

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.addEventListener("click", function () {
            editNote(note.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.addEventListener("click", function () {
            deleteNote(note.id);
        });

        actions.append(pinButton, editButton, deleteButton);
        card.append(title, content, date, actions);
        notesGrid.appendChild(card);
    });
}

// Event listeners
newNoteBtn.addEventListener("click", openCreateModal);
closeModalBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);

searchInput.addEventListener("input", renderNotes);

// Close modal when clicking outside
noteModal.addEventListener("click", function (event) {
    if (event.target === noteModal) {
        closeModal();
    }
});

// Initial display
renderNotes();
