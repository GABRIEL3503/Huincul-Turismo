const swiper = new Swiper('.swiper', {
    // Optional parameters
   effect:"fade",
    loop: true,
    autoplay:{
        delay:2000,
        pauseOnMouseEnter:true,
        disableOnInteraction:false,
    },
  
    // If we need pagination
    pagination: {
      el: '.swiper-pagination',
      clickable:true,
  
    
    },
  
    // Navigation arrows
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  
    
  });

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


  const flipCardBack = document.querySelector('.flip-card-back');

  flipCardBack.addEventListener('click', function() {
    const flipCardInner = flipCardBack.parentNode;
    flipCardInner.style.transform = 'rotateY(0deg)';
  });
  const btnMasInfo = document.querySelector('.button-card');
  btnMasInfo.addEventListener('click', function() {
    const cardInner = document.querySelector('.flip-card-inner');
    cardInner.style.transform = 'rotateY(180deg)';
  });