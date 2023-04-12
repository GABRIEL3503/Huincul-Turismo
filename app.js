

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
  