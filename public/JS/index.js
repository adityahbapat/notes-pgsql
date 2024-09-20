$(document).ready(function () {
  const token = localStorage.getItem("token");

  if (token) {
    // Validate the token by fetching the notes
    initNotesPage();
  } else {
    // No token found, show the login page
    initLoginPage();
  }

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
    $("#loginForm").submit(function (event) {
      event.preventDefault();
      let email = $("#email").val();
      let password = $("#password").val();
      if (email.trim().length > 0 && password.trim().length > 0) {
        $.ajax({
          type: "POST",
          url: "/login", // API endpoint for login
          contentType: "application/json",
          data: JSON.stringify({ email, password }),
          success: function (response) {
            // console.log("res:", response);
            localStorage.setItem("token", response.token);
            // alert("Login successful!");
            initNotesPage();
          },
          error: function () {
            alert("Invalid email or password.");
          },
        });
      } else {
        alert("Invalid email or password.");
      }
    });

    // Show registration form
    $("#showRegistration").click(function () {
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
    $("#registrationForm").submit(function (event) {
      event.preventDefault();
      let Email = $("#newEmail").val();
      let newPassword = $("#newPassword").val();

      $.ajax({
        type: "POST",
        url: "/register",
        contentType: "application/json", // Data is sent in JSON format
        data: JSON.stringify({ email: Email, password: newPassword }),
        success: function (response) {
          alert("Registration successful! You can now log in.");
          // Redirect or load the login page
          initLoginPage();
        },
        error: function (xhr, _, _) {
          alert(
            "Registration failed: " + xhr.responseJSON.error || "Unknown error"
          );
        },
      });
    });

    // Show login form
    $("#showLogin").click(function () {
      initLoginPage();
    });
  }

  // Notes page
  function initNotesPage() {
    let notes = [];
    let user = {};
    const token = localStorage.getItem("token");
    // console.log("notes token:", token)
    $.ajax({
      type: "GET",
      url: "/notes", // Fetch user's notes to validate token
      headers: { Authorization: token }, // Send token in the Authorization header
      success: function (res) {
        user = res.user;
        console.log("res:", res);
        notes = res.data;
        $("body").empty();
        $("body").append(`
                <div>
                <h2 id="notesPageHeader">Welcome ${user.email}</h2>
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
        displayNotes(notes);

        // Handle new note submission
        $("#noteForm").submit(function (event) {
          event.preventDefault();
          let noteContent = $("#noteContent").val();
          if (noteContent.trim()) {
            $("#noteContent").val(""); // Clear the text area

            $.ajax({
              type: "POST",
              url: "/notes", // API endpoint to add a new note
              headers: { Authorization: token }, // Send token in the Authorization header
              contentType: "application/json", // Set content type to JSON
              data: JSON.stringify({ content: noteContent }), // Send the note content as JSON
              success: function (newNote) {
                notes.unshift(newNote.data);
                displayNotes(notes); // Refresh notes list
                // Append the new note to the notes list
                // $("#notesList").append(`<p>${newNote.content}</p>`);
                $("#noteContent").val(""); // Clear the textarea
              },
              error: function (xhr) {
                alert(
                  "Failed to add note: " +
                    (xhr.responseJSON.error || "Unknown error")
                );
              },
            });
          } else {
            alert("Note cannot be empty.");
          }
        });

        // Logout functionality
        $("#logout").click(function () {
          localStorage.removeItem("token");
          initLoginPage();
        });
      },
      error: function () {
        localStorage.removeItem("token");
        initLoginPage(); // Display login page
      },
    });
  }

  // Function to display the user's notes
  function displayNotes(notes) {
    $("#notesList").empty(); // Clear previous notes
    if (notes.length > 0) {
      notes.forEach(function (note, index) {
        $("#notesList").append(`<p>${index + 1}: ${note.content}</p>`);
      });
    } else {
      $("#notesList").append("<p>No notes available.</p>");
    }
  }
});
