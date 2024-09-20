$(document).ready(function() {
    // Initialize the application with the login page
    initLoginPage();

    // User database mockup
    let users = {};
    let notes = {};

    // Login page
    function initLoginPage() {
        $("body").empty(); // Clear the body
        $("body").append(`
            <div>
            <h2>Login</h2>
            <form id="loginForm">
                <label for="email">Email:</label><br>
                <input type="email" id="email" name="email"><br>
                <label for="password">Password:</label><br>
                <input type="password" id="password" name="password"><br><br>
                <input type="submit" value="Login">
            </form>
            <p>Don't have an account? <a href="#" id="showRegistration">Register here</a></p>
            </div>
        `);

        // Handle login
        $("#loginForm").submit(function(event) {
            event.preventDefault();
            let email = $("#email").val();
            let password = $("#password").val();
            if (users[email] && users[email].password === password) {
                initNotesPage(email); 
            } else {
                alert("Invalid email or password.");
            }
        });

        // Show registration form
        $("#showRegistration").click(function() {
            initRegistrationPage();
        });
    }

    // Registration page
    function initRegistrationPage() {
        $("body").empty(); // Clear the body
        $("body").append(`
            <div>
            <h2>Register</h2>
            <form id="registrationForm">
                <label for="newEmail">Email:</label><br>
                <input type="email" id="newEmail" name="newEmail"><br>
                <label for="newPassword">Password:</label><br>
                <input type="password" id="newPassword" name="newPassword"><br><br>
                <input type="submit" value="Register">
            </form>
            <p>Already have an account? <a href="#" id="showLogin">Login here</a></p>
            <div>
        `);

        // Handle registration
        $("#registrationForm").submit(function(event) {
            event.preventDefault();
            let Email = $("#newEmail").val();
            let newPassword = $("#newPassword").val();
            if (users[Email]) {
                alert("Email already exists.");
            } else {
                users[Email] = { password: newPassword };
                notes[Email] = []; // Initialize an empty notes array for the new user
                alert("Registration successful! Please log in.");
                initLoginPage();
            }
        });

        // Show login form
        $("#showLogin").click(function() {
            initLoginPage();
        });
    }

    // Notes page
    function initNotesPage(email) {
        $("body").empty(); 
        $("body").append(`
            <div>
            <h2>Welcome, ${email}</h2>
            <button id="logout">Logout</button>
            <h3>Create a new note</h3>
            <form id="noteForm">
                <textarea id="noteContent" placeholder="Write your note here..."></textarea><br><br>
                <input type="submit" value="Add Note">
            </form>
            <h3>Your Notes</h3>
            <div id="notesList"></div>
            <div>
        `);

        // Load existing notes
        displayNotes(email);

        // Handle new note submission
        $("#noteForm").submit(function(event) {
            event.preventDefault();
            let noteContent = $("#noteContent").val();
            if (noteContent.trim()) {
                notes[email].push(noteContent);
                $("#noteContent").val(""); // Clear the text area
                displayNotes(email);    // Refresh notes list
            } else {
                alert("Note cannot be empty.");
            }
        });

        // Logout functionality
        $("#logout").click(function() {
            initLoginPage();
        });
    }

    // Function to display the user's notes
    function displayNotes(email) {
        $("#notesList").empty(); // Clear previous notes
        let userNotes = notes[email];
        if (userNotes.length > 0) {
            userNotes.forEach(function(note, index) {
                $("#notesList").append(`<p>${index + 1}: ${note}</p>`);
            });
        } else {
            $("#notesList").append("<p>No notes available.</p>");
        }
    }
});