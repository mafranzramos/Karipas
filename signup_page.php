<?php

 // EMPTY FIRST NAME

if (empty($_POST["firstname"])) {
    die("First name is required");
}

// EMPTY LAST NAME

if (empty($_POST["lastname"])) {
    die("Last name is required");
}

// EMPTY USERNAME & USERNAME IS LESS THAN 6 CHARACTERS

if (empty($_POST["username"]) && strlen($_POST["username"] < 6 ) && strlen($_POST["username"])) {
    die("Username needs to be atleast 6-20 characters");
}

// EMPTY PASSWORD 
$uppercase = preg_match('@[A-Z]@', $password);
$lowercase = preg_match('@[a-z]@', $password);
$number    = preg_match('@[0-9]@', $password);
$specialChars = preg_match('@[^\w]@', $password);

if (empty($_POST["password"]) && strlen($_POST["password"] < 6 ) && strlen($_POST["password"])) {
    die("Username needs to be atleast 6-20 characters");
}

if (!$uppercase || !$lowercase || !$number || !$specialChars || strlen($password) < 8) {
    die("Password should be at least 8 characters in length and should include at least one upper case letter, one number, and one special character.");
}
else die("Strong password");
  
print_r($_POST);
