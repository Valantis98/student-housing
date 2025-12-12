// student.js (frontend φοιτητή)

function loadRooms() {
fetch('/rooms')
.then(response => response.json())
.then(rooms => {
const container = document.getElementById('roomsList');
container.innerHTML = '';


rooms.forEach(room => {
const div = document.createElement('div');
div.innerHTML = `
<p><strong>${room.room_number}</strong> - ${room.is_available ? 'Διαθέσιμο' : 'Κατειλημμένο'}</p>
${room.is_available ? `<button onclick="reserve(${room.id})">Κράτηση</button>` : ''}
`;
container.appendChild(div);
});
})
.catch(err => {
console.error('Σφάλμα φόρτωσης δωματίων:', err);
document.getElementById('roomsList').innerHTML = 'Σφάλμα σύνδεσης.';
});
}


function reserve(roomId) {
fetch('/reserve', {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify({ room_id: roomId })
})
.then(response => response.json())
.then(result => {
if (result.reservationId) {
alert('Η κράτηση πραγματοποιήθηκε με επιτυχία!');
loadRooms();
} else {
alert('Αποτυχία κράτησης.');
}
})
.catch(err => {
console.error('Σφάλμα κράτησης:', err);
alert('Σφάλμα σύνδεσης κατά την κράτηση.');
});
}


document.addEventListener('DOMContentLoaded', function () {
loadRooms();
});