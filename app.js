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

function myFunction() {
    var x = document.getElementById("myNavbar");
    if (x.className === "navbar") {
      x.className += " responsive";
      document.querySelector('.close-icon').innerHTML = 'X';
    } else {
      x.className = "navbar";
      document.querySelector('.close-icon').innerHTML = '&#9776;';
    }
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
  
    const btnMasInfo = flipCard.querySelector('.button-card');
    btnMasInfo.addEventListener('click', function() {
      flipCardInner.style.transform = 'rotateY(180deg)';
    });
  });
  const summaryElement = document.getElementById('summary-element');

summaryElement.addEventListener('click', function() {
  // Obtener el elemento de detalles
  const detailsElement = this.parentNode;
  
  // Obtener el estado actual de los detalles (abierto o cerrado)
  const isOpen = detailsElement.hasAttribute('open');
  
  if (isOpen) {
    // Si los detalles están abiertos, retrasar el cierre por 500ms (medio segundo)
    setTimeout(function() {
      detailsElement.removeAttribute('open');
    }, 500);
  }
});

