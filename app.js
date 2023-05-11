
var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.maxHeight){
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
}

const flipCards = document.querySelectorAll('.flip-card');

flipCards.forEach((flipCard) => {
  const flipCardBack = flipCard.querySelector('.flip-card-back');
  const flipCardInner = flipCard.querySelector('.flip-card-inner');

  flipCardBack.addEventListener('click', function() {
    flipCardInner.style.transform = 'rotateY(0deg)';
  });

  flipCardBack.addEventListener('mouseleave', function() {
    flipCardInner.style.transform = 'rotateY(0deg)';
  });

  const btnMasInfo = flipCard.querySelector('.butcard');
  btnMasInfo.addEventListener('click', function() {
    flipCardInner.style.transform = 'rotateY(180deg)';
  });
});
function myFunction() {
  var x = document.getElementById("myNavbar");
  var menuIcon = document.getElementById("menuIcon");

  if (x.classList.contains("responsive")) {
    x.classList.remove("responsive");
    x.style.backgroundColor = ""; // Elimina el color de fondo personalizado
    menuIcon.innerHTML = "&#9776;"; // Cambia el ícono de vuelta a "&#9776;"
    menuIcon.classList.remove("close-icon"); // Elimina la clase "close-icon"
    menuIcon.classList.add("menu-icon"); // Agrega la clase "menu-icon"
  } else {
    x.classList.add("responsive");
    x.style.backgroundColor = "white"; // Agrega el color de fondo blanco
    menuIcon.innerHTML = "&#10006;"; // Cambia el ícono a "X"
    menuIcon.classList.remove("menu-icon"); // Elimina la clase "menu-icon"
    menuIcon.classList.add("close-icon"); // Agrega la clase "close-icon"
  }
}
function closeNavbar() {
  var x = document.getElementById("myNavbar");
  if (x.classList.contains("responsive")) {
    x.classList.remove("responsive");
    var menuIcon = document.getElementById("menuIcon");
    menuIcon.innerHTML = "&#9776;"; // Cambia el ícono de vuelta a "&#9776;"
    x.style.backgroundColor = "";
  }
}

AOS.init();

window.addEventListener('scroll', function() {
  const navbar = document.querySelector('.navbar');
  const scrolled = window.scrollY > 0;
  navbar.classList.toggle('scrolled', scrolled);
});
window.addEventListener('scroll', function() {
  const navbar = document.querySelector('.navbar');
  const menuIcon = document.getElementById('menuIcon');
  const scrolled = window.scrollY > 0;
  
  navbar.classList.toggle('scrolled', scrolled);
  menuIcon.style.color = scrolled ? '#2eb39a' : '';
});
window.addEventListener('scroll', function() {
  const navbar = document.querySelector('.navbar');
  const links = navbar.querySelectorAll('a');
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  const scrolled = window.scrollY > 0;
  
  navbar.classList.toggle('scrolled', scrolled);
  
  for (const link of links) {
    if (!isMobile) {
      link.style.color = scrolled ? '#2eb39a' : '';
    }
  }
});