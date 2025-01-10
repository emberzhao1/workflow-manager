// Socket.IO initialization
const socket = io.connect('/cards');

// preventing duplication when adding card
var saveCardInProgress = false;

// can only press enter to save when edit is clicked  
var editSelected = false;  
document.addEventListener('DOMContentLoaded', function() {  
   // Fetch the current cards from the server on page load  
   fetch('/loadData', {  
      method: 'POST',  
      headers: {  
        'Content-Type': 'application/json'  
      }  
   })  
   .then(response => response.json())  
   .then(cards => {  
      console.log('Rendering cards from server:', cards);  
  
      // Loop over the lists in the cards object  
      Object.keys(cards).forEach(function(listId) {  
        console.log('Processing list ID:', listId);  
        console.log('Cards for this list:', cards[listId]);  
  
        // Map listId to the corresponding list name in your HTML (e.g., 1 -> "ToDo")  
        const listName = getListNameById((listId % 3) || 3);  // This function will map listId to "ToDo", "Doing", "Completed"  
        const listElement = document.querySelector(`#list-${listName}`); // Use listId directly in the selector  
  
        console.log('listElement:', listElement);  
  
        // Iterate over the list of cards for the current listId  
        cards[listId].forEach(function(card) {  
           console.log('Processing card:', card);  
  
           if (listElement) {  
              // Create a new div element for each card  
              const cardElement = document.createElement('div');  
              cardElement.className = 'card';  
              cardElement.setAttribute('draggable','true');  
              cardElement.setAttribute('data-card-id', card.card_id); // Add card ID for future reference  
  
              // Create the card description element  
              const descriptionElement = document.createElement('p');  
              descriptionElement.textContent = card.description;  
              cardElement.appendChild(descriptionElement);  
  
              // Create the card actions element  
              const actionsElement = document.createElement('div');  
              actionsElement.className = 'card-actions';  
              cardElement.appendChild(actionsElement);  
  
              // Create the edit button  
              const editButton = document.createElement('input');  
              editButton.type = 'button';  
              editButton.className = 'edit-card';  
              editButton.value = 'Edit';  
              editButton.setAttribute('data-card-id', card.card_id);  
              actionsElement.appendChild(editButton);  
  
              // Create the delete button  
              const deleteButton = document.createElement('input');  
              deleteButton.type = 'button';  
              deleteButton.className = 'delete-card';  
              deleteButton.value = 'Delete';  
              deleteButton.setAttribute('data-card-id', card.card_id);  
              actionsElement.appendChild(deleteButton);  
  
              // Append the card element to the list element  
              listElement.appendChild(cardElement);  
  
              // Add event listeners for Edit and Delete buttons  
              editButton.addEventListener('click', function() {  
                editCard(card.card_id); // Call your editCard function to allow editing the card  
              });  
               
              deleteButton.addEventListener('click', function() {  
                deleteCard(card.card_id); // Call your deleteCard function to handle deletion  
              });  
           } else {  
              console.error(`List ID list-${listName} not found in the DOM.`);  
           }  
        });  
      });  
   })  
   .catch(error => console.error('Error loading cards:', error));  
});


const listNameToIdMap = {};  
  
function getListNameById(listId) {  
   const listNames = {  
      1: "ToDo",  
      2: "Doing",  
      3: "Completed"  
   };  
   const listName = listNames[(listId % 3) || 3];  
   listNameToIdMap[listName] = listNameToIdMap[listName] || [];  
   listNameToIdMap[listName].push(listId);  
   return listName;  
}  
  
function getListIdByName(listName) {  
    return listNameToIdMap[listName][0];
}

function initalizeCard(card) {
    card.setAttribute('draggable','true');
    card.addEventListener('dragstart',function(event) {
        event.dataTransfer.setData('text/plain', cardElement.getAttribute('data-card-id'))
    });
}

// Function to handle Enter key press for saving the card  
function handleEnterKey(event, category) { 
    console.log("handleEnterKey called");
   if (event.key === "Enter" && event.target.id === `card-description-entry-${category}` && !saveCardInProgress) {  
      event.preventDefault(); // Prevent any default action (like form submission or new lines in textarea)  
    //   alert("about to call saveCard")  
      saveCardInProgress = true;  
      saveCard(category);  // Call the saveCard function  
      setTimeout(() => {  
        saveCardInProgress = false;  
      }, 500); // Reset the flag after 500ms  
   }  
}
 
// Function to show the card input form
function addCardForm(category) {
    // Show the input section for adding a card
    const cardInputSection = document.getElementById(`card-input-section-${category}`);
    cardInputSection.style.display = 'block';
    
    // Reset fields
    document.getElementById(`card-description-entry-${category}`).value = '';

    // Hide "Save" button initially
    document.getElementById(`save-card-btn-${category}`).style.display = 'none';
    document.getElementById(`edit-card-btn-${category}`).style.display = 'inline-block';

    // Store the category to use later when adding/editing
    currentCategory = category;
    currentCardId = null;  // Reset current card id since it's a new card

    // Get the description fields
    const descriptionField = document.getElementById(`card-description-entry-${category}`);
    
    // Ensure no old event listeners are attached to the  description fields
    descriptionField.removeEventListener('keydown', handleEnterKey);

    // Add event listeners for Enter key press while editing
    descriptionField.addEventListener('keydown', (event) => handleEnterKey(event, category));
    
}

// Function to save the card (either new or edited)
function saveCard(category) {
    // alert('saveCard called');
    if (editSelected) {
        const description = document.getElementById(`card-description-entry-${category}`).value.trim();

        if (!description) {
            alert('description is required.');
            return;
        }

        const cardData = {
            description: description,
            list_id: category
        };

        // If we have an existing card id, we are editing an existing card
        if (currentCardId) {
            cardData.card_id = currentCardId;
            socket.emit('editCard', cardData); 
        } else {
            // Otherwise, we are adding a new card
            socket.emit('addCard', cardData);
        }

        // Hide the input section after saving
        document.getElementById(`card-input-section-${category}`).style.display = 'none';
        editSelected = false;  
    }
    
}

// Add the same key handling for the card edit form
function enableEdit(category) {
    // alert("Enable edit js called");
    editSelected = true;  
    const descriptionField = document.getElementById(`card-description-entry-${category}`);
    
    descriptionField.removeAttribute('disabled'); // Make the description field editable
    
    // Replace the "Edit" button with "Save"
    document.getElementById(`edit-card-btn-${category}`).style.display = 'none';
    document.getElementById(`save-card-btn-${category}`).style.display = 'inline-block';

    // Ensure no old event listeners are attached to the description fields
    descriptionField.removeEventListener('keydown', handleEnterKey);

    // Add event listeners for Enter key press while editing
    descriptionField.addEventListener('keydown', (event) => handleEnterKey(event, category));
}

// Function to delete the card
function deleteCard(cardId = null, category = null) {
    if (confirm('Are you sure you want to delete this card?')) {
        if (cardId) {
            // Handle deletion of an added card
            socket.emit('deleteCard', { card_id: cardId });

            // Remove the card from the DOM
            const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
            if (cardElement) {
                cardElement.remove();
            }
        } else if (category) {
            // Handle unsaved card (reset the input fields)
            const cardInputSection = document.getElementById(`card-input-section-${category}`);
            if (cardInputSection) {
                cardInputSection.style.display = 'none'; // Hide the input section
                const descriptionField = document.getElementById(`card-description-entry-${category}`);
                if (descriptionField) {
                    descriptionField.value = ''; // Clear the input field
                }
            }
        }
    }
}

document.body.addEventListener('click', function (event) {  
    // Check if an Edit input was clicked  
    if (event.target.classList.contains('edit-card')) {  
       const cardId = event.target.getAttribute('data-card-id');  
       const listId = event.target.parentNode.parentNode.parentNode.id.split('-')[1];  
       editSelected = true;  
       editCard(cardId, listId);  
    }
 

    // Check if a Delete input was clicked
    if (event.target.classList.contains('delete-card')) {
        const cardId = event.target.getAttribute('data-card-id'); // For dynamically added cards
        const category = event.target.getAttribute('data-category'); // For unsaved cards

        if (cardId) {
            deleteCard(cardId); // Delete a saved card
        } else if (category) {
            deleteCard(null, category); // Reset input fields for unsaved card
        }
    }
});

// Listen for the event where a card is successfully added  
socket.on('cardAdded', function (card_info) {  
    const cardElement = document.createElement('div');  
    cardElement.className = 'card';  
    cardElement.setAttribute('draggable', 'true');  
    cardElement.setAttribute('data-card-id', card_info.card_id);  
   
    const descriptionElement = document.createElement('p');  
    descriptionElement.textContent = card_info.description;  
    cardElement.appendChild(descriptionElement);  
   
    const actionsElement = document.createElement('div');  
    actionsElement.className = 'card-actions';  
    cardElement.appendChild(actionsElement);  
   
    const editButton = document.createElement('input');  
    editButton.type = 'button';  
    editButton.className = 'edit-card';  
    editButton.value = 'Edit';  
    editButton.setAttribute('data-card-id', card_info.card_id);  
    actionsElement.appendChild(editButton);  
   
    const deleteButton = document.createElement('input');  
    deleteButton.type = 'button';  
    deleteButton.className = 'delete-card';  
    deleteButton.value = 'Delete';  
    deleteButton.setAttribute('data-card-id', card_info.card_id);  
    actionsElement.appendChild(deleteButton);  
   
    const listElement = document.querySelector(`#list-${card_info.list_id}`);  
    if (listElement) {  
       listElement.appendChild(cardElement);  
    } else {  
       alert('List ID not found for the new card.');  
    }  
 });
 



// Listen for card edit events and update the card's display  
socket.on('cardEdited', function(cardData) {  
    const card = document.querySelector(`[data-card-id="${cardData.card_id}"]`);  
    if (card) {  
       card.querySelector('p').textContent = cardData.description;  
    }  
 });
 

// Function to handle editing an existing card (when "Edit" is clicked)
function editCard(cardId, category) {  
    console.log("editCard clicked");
    currentCardId = cardId;  
    currentCategory = category;  
   
    // Retrieve card data from the DOM  
    const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);  
    if (!cardElement) {  
       console.error(`Card element with ID ${cardId} not found.`);  
       return;  
    }  
    const cardDesc = cardElement.querySelector('p').textContent;  
   
    // Replace the paragraph element with a textarea element  
    const descElement = cardElement.querySelector('p');  
    const textarea = document.createElement('textarea');  
    textarea.value = cardDesc;  
    textarea.style.width = '100%';  
    textarea.style.height = '100px';  
    textarea.style.resize = 'vertical';  
    descElement.parentNode.replaceChild(textarea, descElement); 
    editSelected = true; 
      // Add event listener to the textarea to listen for Enter key press  
 
   
    
    // Show "Save" button, hide "Edit" button  
    const editBtn = cardElement.querySelector('.edit-card');  
    if (!editBtn) {  
       console.error(`Edit button for card ${cardId} not found.`);  
       return;  
    }  
    editBtn.style.display = 'none';  
   
    const saveBtn = document.createElement('input');  
    saveBtn.type = 'button';  
    saveBtn.value = 'Save';  
    saveBtn.className = 'save-card';  
    saveBtn.style.display = 'inline-block';  
    editSelected = true;
    editBtn.parentNode.appendChild(saveBtn);  
   
    // Add event listener to the save button  
    saveBtn.addEventListener('click', function() {  
       // Replace the textarea element with a paragraph element  
       const newDesc = textarea.value;  
       const newDescElement = document.createElement('p');  
       newDescElement.textContent = newDesc;  
       textarea.parentNode.replaceChild(newDescElement, textarea);  
   
       // Hide "Save" button, show "Edit" button  
       saveBtn.style.display = 'none';  
       editBtn.style.display = 'inline-block';  
   
       // Save the new description  
       const cardData = {  
         description: newDesc,  
         card_id: cardId  
       };  
       socket.emit('editCard', cardData);  
    });  
    saveBtn.addEventListener('keydown', (event) => handleEnterKey(event, currentCategory));
        // Add event listener to the textarea to listen for Enter key press   
        textarea.addEventListener('keydown', (event) => {   
            if (event.key === 'Enter') {   
                event.preventDefault();   
                // Replace the textarea element with a paragraph element  
                const newDesc = textarea.value;  
                const newDescElement = document.createElement('p');  
                newDescElement.textContent = newDesc;  
                textarea.parentNode.replaceChild(newDescElement, textarea);  
            
                // Hide "Save" button, show "Edit" button  
                saveBtn.style.display = 'none';  
                editBtn.style.display = 'inline-block';  
            
                // Save the new description  
                const cardData = {  
                    description: newDesc,  
                    card_id: cardId  
                };  
                socket.emit('editCard', cardData);  
                saveBtn.click();   
            }   
        });   

 }
 
 
 // drag & drop functionalities
// Define card containers  
const cardContainers = document.querySelectorAll('.drop-list');  
 // if a card is clicked on & dragged
 cardContainers.forEach(cardContainer => {
    cardContainer.addEventListener('dragstart', function(event){
        var card = event.target.closest('.card');
        if (card) {
            event.dataTransfer.setData('text/plain', card.getAttribute('data-card-id'));
            // add class to change CSS forit being dragged
            card.classList.add('drag-in-action');
            console.log("card being dragged")
        }
    });
 });
// Make all cards draggable  
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('dragend', event => {
        const cardId = card.dataset.cardId;
        const newListId = event.target.closest('.list').dataset.listId; // Target list's ID.

        // Emit the movecard event to the server.
        socket.emit('movecard', { card_id: cardId, new_list_id: newListId });
    });
});
  
// Add event listeners for drag-and-drop functionality  
cardContainers.forEach(cardContainer => {  
   cardContainer.addEventListener('dragover', function(event) {  
      event.preventDefault();  
      // css class to change background of class when dragged over  
      cardContainer.classList.add('dragged');  
   });  
  
   cardContainer.addEventListener('drop', function(event) {  
      event.preventDefault();  
      cardContainer.classList.remove('dragged');
      const card_id = event.dataTransfer.getData('text');  
      const card = document.querySelector(`.card[data-card-id="${card_id}"]`);  
      const card_container = cardContainer.querySelector('.cards');  
      if (card && card_container) {
        card_container.appendChild(card);  
        updateCardLocation(card_id, cardContainer.getAttribute('data-list-id'));  
      }
      cardContainer.classList.remove('dragged');  
   });  
  
   cardContainer.addEventListener('dragleave', function(event) {  
      cardContainer.classList.remove('dragged');  
   });  
});  
  
// Update the database once a card is moved  
function updateCardLocation(card_id, new_list_id) {  
   var formData = {'card_id': card_id, 'new_list_id': new_list_id};  
   socket.emit('movecard', formData);  
}

// Listen for the move_success event
socket.on('move_success', (cardData) => {  
    console.log('Card moved successfully:', cardData);  
    const cardElement = document.querySelector(`[data-card-id="${cardData.card_id}"]`);  
    const newListElement = document.querySelector(`#list-${cardData.new_list_id} .cards`);  
    if (cardElement && newListElement) {  
       newListElement.appendChild(cardElement);  
    }  
 });
 

function updateCardInUI(cardData) {
    console.log('Updating card in UI:', cardData);
    const cardElement = document.querySelector(`[data-card-id="${cardData.card_id}"]`);
    const newListElement = document.querySelector(`#list-${cardDaa.new_list_id}`);
    if (cardElement & newListElement) {
        cardElement.parentNode.removeChild(cardElement);
        newListElement.appendChild(cardElement);
    }
}
socket.on('cardDeleted', (cardData) => {  
    console.log('Card deleted successfully:', cardData);  
    const cardElement = document.querySelector(`[data-card-id="${cardData.card_id}"]`);  
    if (cardElement) {  
       cardElement.remove();  
    }  
 });
 
