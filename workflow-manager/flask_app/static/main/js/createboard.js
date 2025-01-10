
// Function to handle form submission
function createBoard(event) {

    // Prevent the form from submitting the traditional way
    event.preventDefault();

    // Get input values
    const project = document.getElementById('project-name').value.trim();
    const members = document.getElementById('list-of-members').value
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

    // alert("Project Name: " + project + "Member Emails: " + members);

    // Create the formData object
    const formData = {
        'project-name': project,
        'list-of-members': members,
    };


    // AJAX Request to process the form
    jQuery.ajax({
        url: "/process_create_board",
        data: formData,
        traditional: true,
        type: "POST",
        success: function (response) {
            if (response.success === 1) {
                // alert("Board Created Successfully!");
        
                // Encode the query parameters
                const boardName = encodeURIComponent(response.board_name);
                const members = encodeURIComponent(response.members.join(',')); // Join members with commas
        
                // Redirect to create_board with query parameters
                window.location.href = `/create_board?board_name=${boardName}&members=${members}`;
            } else {
                alert("Error: " + response.error);
            }
        }
        ,
        error: function (xhr, status, error) {
            alert("Error Occurred:", status, error);
        }
    });
}
