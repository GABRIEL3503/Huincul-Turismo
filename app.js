
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
  if (x.className === "navbar") {
    x.className += " responsive";
  } else {
    x.className = "navbar";
  }
}
AOS.init();
