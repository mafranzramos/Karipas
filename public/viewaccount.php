<?php
session_start();

// check if the user is logged in
if (!isset($_SESSION["user_id"])) {
    header("Location: src/log-in.php"); 
    exit;
}

// check id in database
$userId = $_SESSION["user_id"];
$mysqli = require "../src/dtbconnect.php";

$sql = "SELECT * FROM users WHERE id = ?";
if ($stmt = $mysqli->prepare($sql)) {
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
} else {
    echo "Error fetching user information";
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <title>View Account</title>
    <link rel="stylesheet" href="../css/teststyle.css">
</head>
<body>

    <!-- header: logo + links-->
    <header>
        <nav>
            <div class = "logo"> <img src="../elements/images/logo.png"> </div>
            <div class = "nav-links"> <ul>
                <li> <a href="index.php"> Home </a></li>
                <li id="logOut"> <a href="../src/log-out.php"> Log Out </a></li>
            </ul></div>
        </nav>
    </header>

    <section>
    <div class = "user-detail">
        <p>View Account</p>

        <p>Username: <?php echo $user["username"]; ?><p>
        <button class="changeusername" onclick="openChangeForm('changeUsernameForm')">Change username</button>
            <div class="form-popup" id="changeUsernameForm">
                <form action="../src/change.php" method="post" class="form-container">
                <input type="hidden" name="field_to_update" value="username">

                <b>Change username</b><br>
                <label for="username"><b>New Username</b></label>
                <input type="text" placeholder="Enter new username" name="new_value" required><br>

                <label for="password"><b>Password</b></label>
                <input type="password" placeholder="Enter your password to verify the changes:" name="password" required> <br>
                
                <button type="submit" class="btn">Submit</button> <br>
                <button type="button" class="btn close" onclick="closeChangeForm('changeUsernameForm')">Close</button> <br>
                </form>
            </div>

        <p>First Name: <?php echo $user["first_name"]; ?></p>
        <button class="changefirstname" onclick="openChangeForm('changeFirstNameForm')">Change first name</button>
            <div class="form-popup" id="changeFirstNameForm">
                <form action="../src/change.php" method="post" class="form-container">
                <input type="hidden" name="field_to_update" value="firstname">

                <b>Change first name</b><br>
                <label for="firstname"><b>New First Name</b></label>
                <input type="text" placeholder="Enter new first name" name="new_value" required><br>

                <label for="password"><b>Password</b></label>
                <input type="password" placeholder="Enter your password to verify the changes:" name="password" required> <br>
                
                <button type="submit" class="btn">Submit</button> <br>
                <button type="button" class="btn close" onclick="closeChangeForm('changeFirstNameForm')">Close</button> <br>
                </form>
            </div>

        <p>Last Name: <?php echo $user["last_name"]; ?></p>
        <button class ="changelastname" onclick="openChangeForm('changeLastNameForm')"> Change last name</button>
        <div class="form-popup" id="changeLastNameForm">
                <form action="../src/change.php" method="post" class="form-container">
                <input type="hidden" name="field_to_update" value="lastname">

                <b>Change last name</b><br>
                <label for="lastname"><b>New Last Name</b></label>
                <input type="text" placeholder="Enter new last name" name="new_value" required><br>

                <label for="password"><b>Password</b></label>
                <input type="password" placeholder="Enter your password to verify the changes:" name="password" required> <br>
                
                <button type="submit" class="btn">Submit</button> <br>
                <button type="button" class="btn close" onclick="closeChangeForm('changeLastNameForm')">Close</button> <br>
                </form>
            </div>

    </div>
    </section>

    <section>
    <div>
    <li onclick="openConfirmation()"><a>Delete account</a></li>
    </div>

    <!-- confirmation popup -->
    <div id="confirmationPopup" class="form-popup">
    <form action="../src/deleteacc.php" method="post" class="form-container" onsubmit="confirmDelete()">
        <b>Delete Account</b><br>
        <p>Are you sure you want to delete your account?</p>

        <label for="password"><b>Password</b></label>
        <input type="password" placeholder="Enter your password" name="password" required><br>

        <button type="submit" class="btn">Yes, delete my account</button>
        <button type="button" class="btn close" onclick="closeConfirmation()">No, cancel</button>
    </form>
    </div>
    </section>

    <!-- invalid password popup -->
    <div class="form-popup" id="invalid-password">
        YER DUN!!!!!!
    </div>


    <script src="../js/confirmInfo.js"></script>
</body>
</html>
