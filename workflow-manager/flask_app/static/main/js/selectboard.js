document.addEventListener("DOMContentLoaded", () => {
    // Handle the "Open an Existing Board" button click
    const existingBoardInput = document.getElementById("existing-board-input");
    if (existingBoardInput) {
        existingBoardInput.addEventListener("click", displayExistingBoards);
    }

    // Handle dynamic board button clicks
    const boardList = document.getElementById("board-list");
    if (boardList) {
        boardList.addEventListener("click", (event) => {
            if (event.target.classList.contains("board-button")) {
                const boardName = event.target.getAttribute("data-board-name");
                console.log("Clicked board name:", boardName);  // Debugging log
                // alert("Board name from click event: " + boardName);
                
                openBoard(boardName);
            }
        });
    }
});
// function to display boards that already exist
function displayExistingBoards() {
    console.log("Fetching existing boards...");
    fetch("/existing_board", {
        headers: {
            "X-Requested-With": "XMLHttpRequest"
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const boardList = document.getElementById("board-list");
            boardList.innerHTML = ""; // Clear existing list
            data.boards.forEach(board => {
                const li = document.createElement("li");
                const button = document.createElement("button");
                button.textContent = board.name;
                button.setAttribute("data-board-name", board.name);
                button.classList.add("board-button");
                li.appendChild(button);
                boardList.appendChild(li);
            });
        } else {
            console.error("Failed to fetch boards:", data.message);
        }
    })
    .catch(error => console.error("Error fetching boards:", error));
}

// Function to open a specific board
function openBoard(boardName) {
    console.log("Opening board with name:", boardName);  // Debugging log
    // alert("Opening board with name: " + boardName); // Confirm if it's getting the name
    window.location.href = `/board/${encodeURIComponent(boardName)}`;  // Pass board_name in URL
}

socket.on('move_success', data => {
    console.log('Card moved successfully:', data);

});

socket.on('move_error', error => {
    console.error('Error moving card:', error.message);

});