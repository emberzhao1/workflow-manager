let count = 0; // Initialize count at the beginning
function checkCredentials() {
    const email = document.querySelector('input[name="login-email"]').value;
    const password = document.querySelector('input[name="password"]').value;

    // Show the email and password in alerts (for debugging purposes)
    // alert("Email: " + email);
    // alert("Password: " + password);

    var data_d = {'login-email': email, 'password': password};

    // SEND DATA TO SERVER VIA jQuery.ajax({})
    jQuery.ajax({
        url: "/processlogin",
        data: data_d,
        type: "POST",
        success: function(retruned_data) {
            retruned_data = JSON.parse(retruned_data);
            if (retruned_data.success === 1) {
                window.location.href = "/home";
            } else {
                count++;
                document.getElementById("login-error").textContent = `Authentication Failure ${count}`;
            }
        }
    });
}
