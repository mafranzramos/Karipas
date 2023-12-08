<?php 
session_start();

if (isset($_SESSION["user_id"])) {
    
    $mysqli = require "../src/dtbconnect.php";
    
    $sql = "SELECT * FROM users
            WHERE id = {$_SESSION["user_id"]}";
            
    $result = $mysqli->query($sql);
    
    $user = $result->fetch_assoc();
}
?>


<!DOCTYPE html>
<html lang="en">
<head>
    <title>Karipas: Your Batangueno Transport Partner!</title>
    <!-- <link rel="stylesheet" href="../css/style.css"> -->
    <link rel="stylesheet" href="../css/teststyle.css">
    <link rel="icon" type="image/x-icon" href="../elements/images/logo.png">
    <link href="https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css" rel="stylesheet">
    <script src="https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.js"></script>
    <style>
        body { margin: 0; padding: 0; }
        #map { position: absolute; top: 0; bottom: 0; width: 100%; }
    </style>
</head>
<body>

    <!-- header: logo + links-->
    <header>
        <nav>
            <div class = "logo"> <img src="../elements/images/logo.png"> </div>
            <div class = "nav-links"> <ul>
                <li> <a href="#home"> Home </a></li>
                <li id="logInLink"> <a> Log In </a></li>
                <li> <a href="#about"> About </a></li>
                <li> <a href="#contact"> Contact </a></li>
            </ul></div>
        </nav>
    </header>

    <!-- home: ask destination from user-->
    <section>
        <div class = "home" id = "home">

            <!-- log in pop-up: ask log-in details from the user -->
            <div class="form-popup" id="logForm">
                <form action="../src/log-in.php" method = "post" class="form-container" onsubmit = "return logInUser()" >
                    <b>Log In</b><br>
                    
                    <label for = "username"><b>Username</b></label>
                    <input type = "text" placeholder="Enter username" name="username" class="sign-in-input" required><br>
        
                    <label for = "password"><b>Password</b></label>
                    <input type = "password" placeholder="Enter password" name="password" class="sign-in-input" required> <br>

                    
                    <button type = "submit" class = "btn"> Log in</button> <br>

                    <label for ="sign-up">Don't have an account yet?</label><br>
                    <button type = "button" onclick="openSignUpForm()" id="signUpLink"> Sign up </button> <br>

                    <button type = "button" class = "btn cancel" onclick = "closeLogInForm()"> Close </button>
                </form>
            </div>

            <!-- sign up pop-up: ask sign-up details from the user -->
            <div class="form-popup" id="signForm">
                <form action="../src/sign-up.php" method="post" class="form-container" >
                    <b>Sign up</b><br>
                    
                    <div> <!-- FOR FIRST NAME-->
                    <label for = "firstName"><b>First Name</b></label>
                    <input type = "text" placeholder="Enter your first name" name="firstname" required><br>
                    </div>

                    <div> <!-- FOR LAST NAME-->
                    <label for = "lastName"><b>Last Name</b></label>
                    <input type = "text" placeholder="Enter last name" id= "lastname" name="lastname" required> <br>
                    </div>
                    
                    <div> <!-- FOR USERNAME -->
                    <label for = "username"><b>Username</b></label>
                    <input type = "text" placeholder="Enter username" id= "username" name="username" required> <br>
                    </div>
                    
                    <div> <!-- FOR EMAIL -->
                    <label for = "email"><b>Email</b></label>
                    <input type = "text" placeholder="Enter email" id= "email" name="email" required> <br>
                    </div>

                    <div> <!-- FOR PASSWORD -->
                    <label for = "password"><b>Password</b></label>
                    <input type = "password" placeholder="Enter password" id= "password" name="password" required> <br>
                    </div>

                    <div> <!-- FOR CONFIRMING PASSWORD -->
                    <label for = "password_confirmation"><b>Repeat password</b></label>
                    <input type = "password" placeholder="Enter password" id= "password_confirmation" name="password_confirmation" required> <br>
                    </div>

                    <div> <!-- FOR DISCOUNTED -->
                    <label for = "discounted"><b>Are you a student, PWD or a senior citizen?</b></label>
                    <input type = "checkbox" name="discounted"> <br>
                    </div>

                    <button type = "submit" class = "btn"> Submit</button> <br>

                    <button type = "button" class = "btn cancel" onclick = "closeSignUpForm()"> Close </button>
                </form>
            </div>

            <?php if (isset($user)): ?>
        
            <p>Hello <span id="callName"><?= htmlspecialchars($user["first_name"]) ?></span>
            ! Where are you going?</p>
            <?php else: ?>
                <a> Hi user! Where are you going? </a> <br>
            <?php endif; ?>
            <script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.min.js"></script>
            <link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.css" type="text/css">
            
            <style>
                #geocoder {
                    z-index: 1;
                    margin: auto;
                    width: 50%;
                }
                .mapboxgl-ctrl-geocoder {
                    min-width: 100%;
                }
            </style>
            
            <div id="geocoder"></div>
            <pre id="result"></pre>
            
            <script>
                mapboxgl.accessToken = 'pk.eyJ1IjoiY3p5bm9uam9obiIsImEiOiJjbG9xZWVzcnIwaDBpMmttenpza2I1ajZqIn0.SXmiSmtjjBMSmMA_rmVwiw';
                const geocoder = new MapboxGeocoder({
                    accessToken: mapboxgl.accessToken,
                    bbox: [121.005306,13.749348,121.071997,13.798157] // alangilan, bauan, balagtas
                    /*bbox: [121.005306,13.749348,121.074228,13.798157] if including capitolio*/ 
                });
            
                geocoder.addTo('#geocoder');
            
                // Get the geocoder results container.
                const results = document.getElementById('result');
            
                // Add geocoder result to container.
                geocoder.on('result', (e) => {
                    results.innerText = JSON.stringify(e.result, null, 2);
                });
            
                // Clear results container when search is cleared.
                geocoder.on('clear', () => {
                    results.innerText = '';
                });
            </script>
        </div>

    </section>

    <!-- about: insert brief desc + SDG -->
    <section>
        <div class = "about" id = "about">
            <h1 class = "aboutK">ABOUT KARIPAS</h1>
            <a> Karipas is a Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus suscipit, sem non sagittis varius, turpis diam tempor nulla, sed tincidunt mi ipsum ac erat. Quisque non tempus diam. Nam at nisl et velit ullamcorper bibendum vitae ut ipsum. Integer sed ipsum sit amet augue iaculis iaculis vel eget quam. Ut porta quam in urna varius interdum. Fusce eu justo sit amet eros maximus molestie. Vestibulum scelerisque, nisl id porttitor molestie, justo nibh elementum massa, vitae pulvinar dolor nisi eget odio. Duis id consectetur ante. Nullam mollis dapibus placerat. Maecenas lectus massa, cursus at nulla in, sagittis mattis erat. Etiam euismod nunc est, in molestie urna ultrices nec. Sed fermentum lacus at odio condimentum, rutrum eleifend mauris tincidunt. Vestibulum tellus ipsum, interdum sit amet euismod ullamcorper, auctor et mauris. </a>
        </div>
    </section>

    <!-- contact: add members + contact info -->
    <section>
        <div class = "contact" id = "contact">
            <h1 class = "aboutK">CONTACT US!</h1>
            <a> email chuchu </a>
        </div>
    </section>
    <script src="../js/confirmInfo.js"></script>
    </body>
    </html>