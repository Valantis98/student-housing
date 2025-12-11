// /public/javascript/topbar_buttons.js

// Εναλλαγή φόρμας login (αν υπάρχει)
function toggleLoginForm() {
    var form = document.getElementById("loginForm");
    if (!form) return;

    if (form.style.display === "none" || form.style.display === "") {
        form.style.display = "block";
    } else {
        form.style.display = "none";
    }
}

// Submit login (μόνο αν υπάρχει loginForm στη σελίδα)
const loginFormEl = document.getElementById('loginForm');
if (loginFormEl) {
    loginFormEl.addEventListener('submit', function(event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/login', true);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    window.location.href = response.redirect;
                } else {
                    alert('Λανθασμένο username ή κωδικός πρόσβασης');
                }
            }
        };
        xhr.send(JSON.stringify({ username, password }));
    });
}

// Κοινό logout για όλες τις σελίδες (student + admin)
function logout() {
    if (confirm("Είστε σίγουρος ότι θέλετε να αποσυνδεθείτε;")) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/logout', true);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    window.location.href = response.redirect;
                } else {
                    alert('Σφάλμα κατά την αποσύνδεση');
                }
            }
        };
        xhr.send();
    }
}

// Γενική συνάρτηση εμφάνισης/κρυψίματος element
function toggleElementDisplay(elementId, displayStyle = "block") {
    var element = document.getElementById(elementId);
    if (!element) return;

    if (element.style.display === "none" || element.style.display === "") {
        element.style.display = displayStyle;
    } else {
        element.style.display = "none";
    }

    // Κρύβει το dropdown menu όταν ανοίγουμε άλλη φόρμα
    if (elementId !== "dropdownMenu") {
        var menu = document.getElementById("dropdownMenu");
        if (menu) {
            menu.style.display = "none";
        }
    }
}

// Alias για χρήση στο HTML (onclick="toggleElement(...)")
function toggleElement(elementId, displayStyle = "block") {
    toggleElementDisplay(elementId, displayStyle);
}
