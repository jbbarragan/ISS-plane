// Inicializar el mapa
const map = L.map('map').setView([0, 0], 2); // Centro inicial (latitud, longitud)

// Cargar una capa de mapa (tiles)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Crear un marcador para la ISS
const issIcon = L.icon({
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg',
    iconSize: [50, 32], // Tamaño del icono
    iconAnchor: [25, 16] // Punto de anclaje del icono
});
const issMarker = L.marker([0, 0], { icon: issIcon }).addTo(map);

// Elementos del cuadro de datos
const latElement = document.getElementById('lat');
const lonElement = document.getElementById('lon');
const altElement = document.getElementById('alt');
const velElement = document.getElementById('vel');

// Crear una polilínea para la órbita
const orbitPath = L.polyline([], { color: 'yellow', weight: 2 }).addTo(map);

// Verificar si el usuario ya está registrado
const userLogo = document.getElementById('user-logo');
const userForm = document.getElementById('user-form');
const emailInput = document.getElementById('email');
const registerForm = document.getElementById('register-form');

// Revisar si el usuario está registrado en el localStorage
const storedUser = localStorage.getItem('user');
if (storedUser) {
    const userData = JSON.parse(storedUser);
    // Si está registrado, cargar la ubicación guardada
    const { email, lat, lon } = userData;
    emailInput.value = email;
    // Aproximar la ubicación guardada en el mapa
    map.setView([lat, lon], 4);
    L.marker([lat, lon]).addTo(map).bindPopup(`Usuario: ${email}`).openPopup();
} else {
    userForm.style.display = 'block'; // Mostrar formulario si no está registrado
}

// Mostrar/Ocultar el formulario de registro
userLogo.addEventListener('click', () => {
    userForm.style.display = userForm.style.display === 'none' ? 'block' : 'none';
});

// Manejar el envío del formulario
registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = emailInput.value;
    
    // Obtener la ubicación actual del usuario (si está permitido)
    navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Guardar la información del usuario en localStorage
        const userData = { email, lat, lon };
        localStorage.setItem('user', JSON.stringify(userData));

        // Actualizar el mapa con la nueva ubicación
        map.setView([lat, lon], 4);
        L.marker([lat, lon]).addTo(map).bindPopup(`Usuario: ${email}`).openPopup();

        alert(`Usuario registrado con el correo: ${email}`);
        userForm.style.display = 'none'; // Ocultar formulario
    }, (error) => {
        console.error('Error al obtener la ubicación:', error);
    });
});

// Función para actualizar la posición y datos de la ISS
async function updateISSData() {
    try {
        const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
        const data = await response.json();

        const lat = data.latitude;
        const lon = data.longitude;
        const alt = data.altitude.toFixed(2); // Altitud en kilómetros
        const vel = data.velocity.toFixed(2); // Velocidad en km/h

        // Actualizar marcador en el mapa
        issMarker.setLatLng([lat, lon]);

        // Agregar el punto actual al camino de la órbita
        orbitPath.addLatLng([lat, lon]);

        // Actualizar datos en el cuadro de información
        latElement.textContent = `Latitud: ${lat.toFixed(2)}°`;
        lonElement.textContent = `Longitud: ${lon.toFixed(2)}°`;
        altElement.textContent = `Altitud: ${alt} km`;
        velElement.textContent = `Velocidad: ${vel} km/h`;

        // Centrar el mapa en la ISS (opcional)
        map.setView([lat, lon], map.getZoom());

        // Verificar si la ISS está sobre México (aproximación)
        if (lat >= 14.5 && lat <= 32.7 && lon >= -118.5 && lon <= -86) {
            sendEmail();
        }
    } catch (error) {
        console.error('Error al obtener los datos de la ISS:', error);
    }
}

// Función para enviar un correo electrónico
function sendEmail() {
    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
        to_email: 'jbbarragan23@gmail.com',
        subject: 'La ISS ha pasado sobre México',
        message: 'La Estación Espacial Internacional ha pasado sobre México. ¡Observa el cielo!',
    })
    .then((response) => {
        console.log('Correo enviado', response);
    })
    .catch((error) => {
        console.error('Error al enviar el correo', error);
    });
}

// Actualizar los datos cada 5 segundos
setInterval(updateISSData, 5000);

// Llamar a la función al cargar el mapa
updateISSData();
