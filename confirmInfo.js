var sessionId;
var isLoggedIn;

function checkSession() {
  var callName = document.getElementById("callName");
  if (callName && callName.textContent.trim().length > 0) {
    isLoggedIn = true;
  } else {
    isLoggedIn = false;
  }
}

/* log in pop-up functions */
function openLogInForm() {
  document.getElementById("logForm").style.display = "block";
}

function closeLogInForm() {
  document.getElementById("logForm").style.display = "none";
}

/* sign up pop-up functions */
function openSignUpForm() {
  document.getElementById("logForm").style.display = "none";
  document.getElementById("signForm").style.display = "block";
}

function closeSignUpForm() {
  document.getElementById("signForm").style.display = "none";
}


/* header: to change "log in" to "view account" if user = logged in */
function loggedLink() {
  var logInLink = document.getElementById("logInLink");

    if (isLoggedIn) {
      logInLink.innerHTML = '<a href="viewaccount.php"> View Account </a>';
    } else {
      logInLink.innerHTML = '<a> Log In </a>';
      logInLink.addEventListener("click", openLogInForm);
    }
  } 



checkSession();
loggedLink();
window.onload = loggedLink;

/* view account php */

function openChangeForm(formId) {
  document.getElementById(formId).style.display = "block";
}

function closeChangeForm(formId) {
  document.getElementById(formId).style.display = "none";
}

function openConfirmation() {
  document.getElementById("confirmationPopup").style.display = "block";
}

function closeConfirmation() {
  document.getElementById("confirmationPopup").style.display = "none";
}

function confirmDelete() {
  closeConfirmation();
  return false; 
}
