// Home = (maybe) shows medications, next doses (24 hours?) with checkbox when taken  -> overview
// medications = edit (add/remove?)
// calendar = month list of past medications (all that have been checked?)

// LOCAL STORAGE ONLY STORES IN TEXT FORMAT (so found way to convert medication objects
// in array into text): JSON.stringify makes into string, JSON.parse = back to oject when retrieve
// in medications form, '?' stops js from crashing if is undefined/ null value, just does nothing


document.addEventListener("DOMContentLoaded", function () {
    // Get references to UI elements
    const medicationForm = document.getElementById("medicationForm");
    const medicationList = document.getElementById("medicationList");
    const upcomingList = document.getElementById("upcomingList");
    const modal = document.getElementById("medicationModal");
    const closeModal = document.querySelector(".close");
    const editForm = document.getElementById("editMedicationForm");
    
    // Load medications from localStorage, handling errors
    let medications = [];
    try {
        const storedData = localStorage.getItem("medications");
        medications = storedData ? JSON.parse(storedData) : [];
    } catch (error) {
        console.error("Error parsing medications from localStorage:", error);
        medications = [];
    }
    window.medications = medications; // Gives temporary global access to test, were console.log errors before


    let currentEditIndex = null; // Tracks which medication is being edited


    // Displays all medications
    function displayMedications() {
        if (medicationList) medicationList.innerHTML = "";
        medications.forEach((med, index) => {
            const listItem = document.createElement("li");
            listItem.textContent = `${med.name} - ${med.hoursBetweenDoses} hours between doses`;


            // Opens edit modal on click
            listItem.addEventListener("click", function () {
                openEditModal(index);
            });


            // Delete button
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.addEventListener("click", function (event) {
                event.stopPropagation();
                deleteMedication(index);
            });


            listItem.appendChild(deleteBtn);
            medicationList.appendChild(listItem);
        });


        displayUpcomingMedications(); // Refresh upcoming section
    }


    // Opens the edit modal
    function openEditModal(index) {
        currentEditIndex = index;
        const med = medications[index];
        document.getElementById("editMedName").value = med.name;
        document.getElementById("editMedDetails").value = med.details;
        document.getElementById("editMedHoursBetweenDoses").value = med.hoursBetweenDoses;
        document.getElementById("editMedNextDoseTime").value = med.nextDoseTime;
        document.getElementById("editMedNotes").value = med.notes;
        modal.classList.add("show");
    }


    // Marks a medication as taken and updates next dose
    function markAsTaken(index) {
        const now = new Date();
        medications[index].lastDoseTime = now.toISOString();
        const hours = parseInt(medications[index].hoursBetweenDoses, 10);
        const nextDose = new Date(now.getTime() + hours * 60 * 60 * 1000);
        medications[index].nextDoseTime = nextDose.toISOString();
        updateStorage();
    }


    // Deletes a medication
    function deleteMedication(index) {
        medications.splice(index, 1);
        updateStorage();
    }


    // Saves medications to localStorage and updates UI
    function updateStorage() {
        localStorage.setItem("medications", JSON.stringify(medications));
        if (medicationList) displayMedications();
        if (upcomingList) displayUpcomingMedications();
    }


    // Handles adding a new medication
    if (medicationForm) {
        medicationForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const now = new Date();
            const hours = parseInt(document.getElementById("medHoursBetweenDoses").value, 10);
            const nextDose = new Date(now.getTime() + hours * 60 * 60 * 1000);
            const newMed = {
                name: document.getElementById("medName").value,
                details: document.getElementById("medDetails").value,
                hoursBetweenDoses: hours,
                notes: document.getElementById("medNotes").value,
                nextDoseTime: nextDose.toISOString()
            };
            medications.push(newMed);
            updateStorage();
            medicationForm.reset();
        });
    }


    // Saves edited medication
    if (editForm) {
        editForm.addEventListener("submit", function (event) {
            event.preventDefault();
            if (currentEditIndex !== null) {
                const med = medications[currentEditIndex];
    
                // Preserve `nextDoseTime` if it wasn't changed
                const editedNextDose = document.getElementById("editMedNextDoseTime").value || med.nextDoseTime;
    
                medications[currentEditIndex] = {
                    name: document.getElementById("editMedName").value,
                    details: document.getElementById("editMedDetails").value,
                    hoursBetweenDoses: parseInt(document.getElementById("editMedHoursBetweenDoses").value, 10) || 0,
                    nextDoseTime: editedNextDose, // Preserve existing nextDoseTime
                    notes: document.getElementById("editMedNotes").value
                };
    
                updateStorage();
                modal.classList.remove("show");
            }
        });
    }


    // Closes modal
    if (closeModal) {
        closeModal.addEventListener("click", function () {
            modal.classList.remove("show");
        });
    }


    // Displays upcoming medications
    function displayUpcomingMedications() {
        if (!upcomingList) return;
        upcomingList.innerHTML = "";
        const now = new Date();


        // Filter and sort medications by nextDoseTime
        const upcomingMeds = medications.filter(med => new Date(med.nextDoseTime) > now)
            .sort((a, b) => new Date(a.nextDoseTime) - new Date(b.nextDoseTime));
        upcomingMeds.forEach((med) => {
            const originalIndex = medications.findIndex(m => m.name === med.name);
            if (originalIndex === -1) return; // Error proof in case it isn't found


            const listItem = document.createElement("li");
            listItem.textContent = `${med.name} - Next dose: ${new Date(med.nextDoseTime).toLocaleString()}`;


            const takenBtn = document.createElement("button");
            takenBtn.textContent = "Mark as Taken";
            takenBtn.addEventListener("click", function (event) {
                event.stopPropagation();
                markAsTaken(originalIndex); // Use original index
            });


            listItem.appendChild(takenBtn);
            upcomingList.appendChild(listItem);
        });
    }


    // Initializes calendar if present
    if (document.getElementById("calendar") && typeof FullCalendar !== "undefined") {
        let pastMedications = medications.filter(med => med.lastDoseTime && !isNaN(new Date(med.lastDoseTime)));
        let events = pastMedications.map(med => ({
            title: med.name,
            start: new Date(med.lastDoseTime).toISOString(),
            allDay: true
        }));
        let calendarEl = document.getElementById("calendar");
        let calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: "dayGridMonth",
            events: events
        });
        calendar.render();
    }


    // Initialize display
    if (medicationList) displayMedications();
    if (upcomingList) displayUpcomingMedications();
});


//python -m http.server