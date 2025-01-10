function checkSignUp(event) {
    event.preventDefault();

    const email = document.querySelector('input[name="email"]').value;
    const password = document.querySelector('input[name="password"]').value;

    // Show the email and password in alerts (for debugging purposes)
    // alert("Email: " + email);
    // alert("Password: " + password);

    var data_d = {'email': email, 'password': password};

    // SEND DATA TO SERVER VIA jQuery.ajax({})
    jQuery.ajax({
        url: "/signup",
        data: data_d,
        type: "POST",
        success: function(retruned_data) {
            if (retruned_data.success === 1) {
                window.location.href = "/home";
            } else {
                document.getElementById("sign-up-error").textContent = retruned_data.message;
            }
        }
    });
}