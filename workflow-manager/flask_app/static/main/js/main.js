function toggle_visibility() {
    var e = document.getElementById('feedback-main');
    if(e.style.display === 'block')
       e.style.display = 'none';
    else
       e.style.display = 'block';
 }
//  creating the board form asking for board name and members
 function createBoardForm() {
   var e = document.getElementById('create-board-inputs');
   if(e.style.display === 'block')
       e.style.display = 'none';
    else
       e.style.display = 'block';
    
 }