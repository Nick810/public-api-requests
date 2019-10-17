// ----- Variables Declaration ----- //
const $employeesInfo = [];
const $searchBar = `
    <form action="#" method="get">
        <input type="search" id="search-input" class="search-input" placeholder="Search...">
        <input type="submit" value="&#x1F50D;" id="serach-submit" class="search-submit">
    </form>
  `;
let $currentIndex = 0;
let $animationComplete = false;

//  ----- Functions ----- //
// Generate Cards HTML
function generateHTML(data) {
  $employeesInfo.push(data)
  const $card = `
      <div class="card" data-index="${$employeesInfo.length}">
        <div class="card-img-container">
          <img class="card-img" src="${data.picture.large}"
          alt="A profile picture of ${data.name.first} ${data.name.last}">
        </div>
        <div class="card-info-container">
          <h3 class="card-name cap">${data.name.first} ${data.name.last}</h3>
          <p class="card-text">${data.email}</p>
          <p class="card-text cap">${data.location.city}, ${data.location.state}</p>
        </div>
      </div>
    `;
  $($card).appendTo('#gallery');
}

// Generate modal HTML
function generateModalHTML(index) {
  const {name, dob, cell, email, location: {city, street, state, postcode}, picture} = $employeesInfo[index];
  let $date = new Date(dob.date);
  const $modalHTML = `
      <div class="modal">
        <button type="button" id="modal-close-btn" class="modal-close-btn"><strong>X</strong></button>
        <div class="modal-info-container">
          <img class="modal-img" src="${picture.large}" alt="A picture of ${name.first} ${name.last}" data-index="${index}">
          <h3 id="name" class="modal-name cap">${name.first} ${name.last}</h3>
          <p class="modal-text">${email}</p>
          <p class="modal-text cap">${city}</p>
          <hr>
          <p class="modal-text">${cell}</p>
          <p class="modal-text">${street.number} ${street.name}, ${state} ${postcode}</p>
          <p class="modal-text">Birthday: ${$date.getMonth()}/${$date.getDate()}/${$date.getFullYear()}</p>
        </div>
      </div>

      <div class="modal-btn-container">
        <button type="button" id="modal-prev" class="modal-prev btn">Prev</button>
        <button type="button" id="modal-next" class="modal-next btn">Next</button>
      </div>
    `;

  $($modalHTML).appendTo('.modal-container');
  $(document).on('keyup', navigateModal);
  checkDataIndex(index);
}

// Navigate through modal using left and right arrow keys or escape to close modal.
function navigateModal(e) {
  if (!$animationComplete) {
    if (e.code === 'ArrowLeft') {
      $currentIndex = $currentIndex - 1;
      if ($currentIndex < 0) {
        $currentIndex = $currentIndex + 1;
        return false;
      } else {
        $animationComplete = !$animationComplete;
        switchModal($currentIndex, 20);
      }
    } else if (e.code === 'ArrowRight') {
      $currentIndex = $currentIndex + 1;
      if ($currentIndex > $employeesInfo.length - 1) {
        $currentIndex = $currentIndex - 1;
        return false;
      } else {
        $animationComplete = !$animationComplete;
        switchModal($currentIndex, -20);
      }
    } else if (e.code === 'Escape') {
      modalClose();
    }
  }
}

// Animate closing modal
function modalClose() {
  $(document).off('keyup', navigateModal);
  $('.modal-container').fadeToggle();
  $('.modal-container').html('');
}

/* Check for modal index. If index is 0, remove the previous button.
   If index is the last index of all the employeees, remove next button.
*/
function checkDataIndex(index) {
  if (index === 0) {
    $('#modal-prev').hide();
    $('#modal-next').show();
  } else if (index === $employeesInfo.length - 1) {
    $('#modal-next').hide();
    $('#modal-prev').show();
  } else {
    $('#modal-next').show();
    $('#modal-prev').show();
  }
}

// Enable previous and next button after animation is completed.
function enableButton() {
  $animationComplete = false;
  return $('#modal-prev, #modal-next').css('pointer-events', 'initial');
}

// Switching modal animation.
function switchModal(index, translateDistance) {
  const {name, dob, cell, email, location: {city, street, state, postcode}, picture} = $employeesInfo[index];
  let $date = new Date(dob.date);

  $('.modal-info-container').children().css({
    'transition': 'transform 0.4s ease-out, opacity 0.4s ease-out',
    'opacity': '0',
    'transform': `translateX(${translateDistance}px)`,
    'will-change': 'transform, opacity'
  });

  setTimeout(() => {
    $('.modal-img').attr({'src': `${picture.large}`,
      'alt': `A picture of ${name.first} ${name.last}`,
      'data-index': `${index}`
    });

    $('.modal-name').text(`${name.first} ${name.last}`);
    $('.modal-text:eq(0)').text(`${email}`);
    $('.modal-text:eq(1)').text(`${city}`);
    $('.modal-text:eq(2)').text(`${cell}`);
    $('.modal-text:eq(3)').text(`${street.number} ${street.name}, ${state} ${postcode}`);
    $('.modal-text:eq(4)').text(`Birthday: ${$date.getMonth()}/${$date.getDate()}/${$date.getFullYear()}`);
  }, 400);

  setTimeout(() => {
    $('.modal-info-container').children().css({
      'transition': 'transform 0.4s ease-out, opacity 0.4s ease-out',
      'opacity': '1',
      'transform': `translateX(0px)`,
      'will-change': 'transform, opacity'
    });
  }, 410);

  setTimeout(() => {
    enableButton();
  }, 810)

  checkDataIndex(parseInt(`${index}`));
}

// ----- When the page ready do the followings ----- //
$(document).ready(() => {
  // Append modal container to the page and hide it.
  $(`<div class="modal-container"></div>`).appendTo('body');
  $('.modal-container').hide()

  // Append search bar to the page.
  $($searchBar).appendTo('.search-container');

  // Request API data from randomuser.me and append each data onto the page.
  $.ajax({
    url: 'https://randomuser.me/api/?inc=gender,name,location,email,dob,cell,picture&results=12',
    dataType: 'json',
    success: function(data) {
      let $people = data.results;
      return $people.map(employee => generateHTML(employee));
    }
  });

  // Search employees according to thier names.
  $('#search-input').on('keyup', () => {
    const $inputValue = $('#search-input').val().toLowerCase();

    $('h3.card-name').each((index, value) => {
      if ($(value).text().toLowerCase().includes($inputValue)) {
        $(value).parent().parent().show();
      } else {
        $(value).parent().parent().hide();
      }
    });
  });

  /* - Show-Modal listener
     - Animate modal
  */
  $('#gallery').click((e) => {
    if (e.target.id !== 'gallery') {
      const $index = parseInt($(e.target).closest('.card').attr('data-index')) - 1;
      generateModalHTML($index);
      $('.modal').css({
        'opacity': '0',
        'transform': 'translateY(200px) scale(0.5)'
      });
      $('.modal-btn-container').css('opacity', '0');

      $('.modal-container').fadeToggle();
      $('.modal').css({
        'opacity': '1',
        'transform': 'translateY(0px) scale(1)'
      });

      $('.modal-btn-container').animate({opacity: 1}, 1000);
    }
  })
});

/* - Listen for click on close button to close the modal
   - Listen for click on next, previous button on the modal
*/
$(document).click((e) => {
  $currentIndex = parseInt($('.modal-img').attr('data-index'));
  if (e.target.id === 'modal-close-btn' || e.target.tagName === 'STRONG') {
    modalClose();
  } else if (e.target.id === 'modal-prev') {
    $(e.target).css('pointerEvents', 'none');
    $currentIndex = $currentIndex - 1;
    switchModal($currentIndex, 20);
  } else if (e.target.id === 'modal-next') {
    $(e.target).css('pointerEvents', 'none');
    $currentIndex = $currentIndex + 1;
    switchModal($currentIndex, -20);
  }
});
