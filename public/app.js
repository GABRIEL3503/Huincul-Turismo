emailjs.init('7xOT0tOQ-zRw7sDZJ')

document.getElementById('form').addEventListener('submit', function(event) {
  event.preventDefault();

  if (validateForm()) {
    const btn = document.getElementById('button');
    btn.value = 'Sending...';

    const serviceID = 'default_service';
    const templateID = 'template_4psdx72';

    emailjs.sendForm(serviceID, templateID, this)
      .then(() => {
        btn.value = 'Send Email';
        Swal.fire('Enviado!', 'El formulario se envió correctamente.', 'success').then(() => {
          resetForm();
        });
      })
      .catch((err) => {
        btn.value = 'Send Email';
        Swal.fire('Error!', 'Hubo un error al enviar el formulario.', 'error');
      });
  }
});

function validateForm() {
  var name = document.getElementById("name").value;
  var email = document.getElementById("email").value;
  var phone = document.getElementById("phone").value;
  var message = document.getElementById("message").value;

  if (name === "" || email === "" || phone === "" || message === "") {
    Swal.fire('Campos incompletos!', 'Por favor, completa todos los campos del formulario.', 'warning');
    return false;
  }

  var regex = /^\d+$/;
  if (!regex.test(phone)) {
    Swal.fire('Formato incorrecto!', 'El campo "Teléfono" solo puede contener valores numéricos.', 'warning');
    return false;
  }

  return true;
}

function resetForm() {
  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("message").value = "";
}

function validateForm() {
  var name = document.getElementById("name").value;
  var email = document.getElementById("email").value;
  var phone = document.getElementById("phone").value;
  var message = document.getElementById("message").value;

  if (name === "" || email === "" || phone === "" || message === "") {
    Swal.fire("Por favor, completa todos los campos del formulario.");
    return false;
  }

  var regex = /^\d+$/;
  if (!regex.test(phone)) {
    Swal.fire("El campo 'Teléfono' solo puede contener valores numéricos.");
    return false;
  }

  return true;
}

function resetForm() {
  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("message").value = "";
}

// Funcionalidad de los elementos "collapsible"
var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  // Agregar evento de clic a cada elemento "collapsible"
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active"); // Alternar la clase "active" para expandir o contraer el contenido
    var content = this.nextElementSibling;
    if (content.style.maxHeight) {
      content.style.maxHeight = null; // Si ya tiene altura máxima, se elimina para contraer el contenido
    } else {
      content.style.maxHeight = content.scrollHeight + "px"; // Si no tiene altura máxima, se establece para expandir el contenido
    }
  });
}

// // Funcionalidad de las tarjetas de volteo ("flip-card")
// const flipCards = document.querySelectorAll('.flip-card');

// flipCards.forEach((flipCard) => {
//   const flipCardBack = flipCard.querySelector('.flip-card-back');
//   const flipCardInner = flipCard.querySelector('.flip-card-inner');

//   // Girar la tarjeta hacia adelante al hacer clic en la parte trasera
//   flipCardBack.addEventListener('click', function() {
//     flipCardInner.style.transform = 'rotateY(0deg)';
//   });

//   // Volver a girar la tarjeta hacia adelante cuando se sale de la parte trasera
//   flipCardBack.addEventListener('mouseleave', function() {
//     flipCardInner.style.transform = 'rotateY(0deg)';
//   });

//   const btnMasInfo = flipCard.querySelector('.butcard');

//   // Girar la tarjeta hacia atrás al hacer clic en el botón "btnMasInfo"
//   btnMasInfo.addEventListener('click', function() {
//     flipCardInner.style.transform = 'rotateY(180deg)';
//   });
// });

// Funcionalidad del menú responsivo
function myFunction() {
  var x = document.getElementById("myNavbar");
  var menuIcon = document.getElementById("menuIcon");

  if (x.classList.contains("responsive")) {
    // Si el menú ya está en modo responsivo, se vuelve al modo normal
    x.classList.remove("responsive");
   
    menuIcon.innerHTML = "&#9776;"; // Cambia el ícono de vuelta a "&#9776;"
    menuIcon.classList.remove("close-icon"); // Elimina la clase "close-icon"
    menuIcon.classList.add("menu-icon"); // Agrega la clase "menu-icon"
  } else {
    // Si el menú no está en modo responsivo, se activa el modo responsivo
    x.classList.add("responsive");
    x.style.backgroundColor = "white"; // Agrega el color de fondo blanco
    menuIcon.innerHTML = "&#10006;"; // Cambia el ícono a "X"
    menuIcon.classList.remove("menu-icon"); // Elimina la clase "menu-icon"
    menuIcon.classList.add("close-icon"); // Agrega la clase "close-icon"
  }
}

// Función para cerrar el menú responsivo
function closeNavbar() {
  var x = document.getElementById("myNavbar");
  if (x.classList.contains("responsive")) {
    x.classList.remove("responsive");
    var menuIcon = document.getElementById("menuIcon");
    menuIcon.innerHTML = "&#9776;"; // Cambia el ícono de vuelta a "&#9776;"
    x.style.backgroundColor = "";
  }
}

// Inicialización de la biblioteca AOS para animaciones en el desplazamiento
AOS.init();

// // Cambio de estilo de la barra de navegación al desplazarse
// window.addEventListener('scroll', function() {
//   const navbar = document.querySelector('.navbar');
//   const scrolled = window.scrollY > 0;
//   navbar.classList.toggle('scrolled', scrolled);
// });

// // Cambio de estilo de la barra de navegación y el ícono del menú al desplazarse
// window.addEventListener('scroll', function() {
//   const navbar = document.querySelector('.navbar');
//   const menuIcon = document.getElementById('menuIcon');
//   const scrolled = window.scrollY > 0;

//   navbar.classList.toggle('scrolled', scrolled);
//   menuIcon.style.color = scrolled ? '#2eb39a' : '';
// });

// // Cambio de color de los enlaces de navegación al desplazarse (solo en dispositivos no móviles)
// window.addEventListener('scroll', function() {
//   const navbar = document.querySelector('.navbar');
//   const links = navbar.querySelectorAll('a');
//   const isMobile = window.matchMedia('(max-width: 767px)').matches;
//   const scrolled = window.scrollY > 0;

//   navbar.classList.toggle('scrolled', scrolled);

//   for (const link of links) {
//     if (!isMobile) {
//       link.style.color = scrolled ? '#2eb39a' : '';
//     }
//   }
// });

// Funcionalidad de los botones de alerta "btn-alert-opcion"
const elements = document.querySelectorAll(".btn-alert-opcion");

elements.forEach(element => {
  element.addEventListener("click", () => {
    Swal.fire({
      text: 'Pagá en efectivo y asegura tu próximo viaje, también podes combinar con otros medios de pago!',
      customClass: {
        content: 'my-swal-text'
      },
      showConfirmButton: true,
      confirmButtonColor: "#2eb39a",
      confirmButtonText: 'Entendido'
    });
  });
});

// Funcionalidad de los botones de alerta "btn-alert-opcion1"
const elementsUno = document.querySelectorAll(".btn-alert-opcion1");

elementsUno.forEach(element => {
  element.addEventListener("click", () => {
    Swal.fire({
      text: 'Realizá tu pago de forma segura y confiable a través de transferencia bancaria. Además, tenes la opción de combinarlo con otros medios de pago para mayor comodidad.',
      customClass: {
        content: 'my-swal-text'
      },
      showConfirmButton: true,
      confirmButtonColor: "#2eb39a",
      confirmButtonText: 'Entendido'
    });
  });
});

// Funcionalidad de los botones de alerta "btn-alert-opcion2"
const elementsDos = document.querySelectorAll(".btn-alert-opcion2");

elementsDos.forEach(element => {
  element.addEventListener("click", () => {
    Swal.fire({
      text: 'Flexibilidad en tus manos. Aceptamos tarjetas de crédito y débito para que puedas reservar fácilmente tus aventuras.',
      customClass: {
        content: 'my-swal-text'
      },
      showConfirmButton: true,
      confirmButtonColor: "#2eb39a",
      confirmButtonText: 'Entendido'
    });
  });
});

// Funcionalidad de los botones de alerta "btn-alert-opcion3"
const elementsTres = document.querySelectorAll(".btn-alert-opcion3");

elementsTres.forEach(element => {
  element.addEventListener("click", () => {
    Swal.fire({
      text: 'En colaboración con Crédito Argentino, podemos ofrecer opciones de financiamiento más amplias para aquellos que necesiten una mayor flexibilidad en el pago.',
      customClass: {
        content: 'my-swal-text'
      },
      showConfirmButton: true,
      confirmButtonColor: "#2eb39a",
      confirmButtonText: 'Entendido'
    });
  });
});

// Funcionalidad de los botones de alerta "btn-alert-opcion4"
const elementsCuatro = document.querySelectorAll(".btn-alert-opcion4");

elementsCuatro.forEach(element => {
  element.addEventListener("click", () => {
    Swal.fire({
      text: 'Utilizá Mercado Pago para abonar tus reservas de forma segura y práctica.',
      customClass: {
        content: 'my-swal-text'
      },
      showConfirmButton: true,
      confirmButtonColor: "#2eb39a",
      confirmButtonText: 'Entendido'
    });
  });
});

const elementsCinco = document.querySelectorAll(".btn-alert-opcion5");

elementsCinco.forEach(element => {
  element.addEventListener("click", () => {
    Swal.fire({
      text: 'En colaboración con Crediquen, podemos ofrecer opciones de financiamiento más amplias para aquellos que necesiten una mayor flexibilidad en el pago.',
      customClass: {
        content: 'my-swal-text'
      },
      showConfirmButton: true,
      confirmButtonColor: "#2eb39a",
      confirmButtonText: 'Entendido'
    });
  });
});

// formulario
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('myForm');

  form.addEventListener('submit', function(event) {
    event.preventDefault(); // Evitar el envío del formulario por defecto

    const formData = new FormData(form);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://formspree.io/f/xzbqlllj', true);
    xhr.setRequestHeader('Accept', 'application/json');

    xhr.onload = function() {
      if (xhr.status === 200) {
        form.reset(); // Limpiar los campos del formulario

        // Mostrar alerta exitosa con SweetAlert2
        Swal.fire({
          icon: 'success',
          title: 'Genial!',
          text: 'Tu mensaje ha sido enviado. ¡Gracias!',
        });
      } else {
        // Mostrar alerta de error con SweetAlert2
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ha ocurrido un error al enviar el mensaje. Por favor, inténtalo de nuevo más tarde.',
        });
      }
    };

    xhr.send(formData);
  });
});



var swiper = new Swiper(".mySwiper", {
  spaceBetween: 30,
  centeredSlides: true,
  speed: 2000, // Aquí está la opción de velocidad
  autoplay: {
    delay: 3200,
    disableOnInteraction: false,
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});


document.addEventListener("DOMContentLoaded", function() {
  const darkModeSwitch = document.querySelector(".switch__input");

  darkModeSwitch.addEventListener("change", function() {
    if (this.checked) {
      document.body.classList.add("dark-mode");
      const swalPopups = document.querySelectorAll('.my-swal');
      swalPopups.forEach(popup => {
        popup.classList.add('dark-mode');
      });
    } else {
      document.body.classList.remove("dark-mode");
      const swalPopups = document.querySelectorAll('.my-swal');
      swalPopups.forEach(popup => {
        popup.classList.remove('dark-mode');
      });
    }
  });
});
