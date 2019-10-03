// ----- Variables Declaration ----- //
const $employeesInfo = [];
const $searchBar = `
    <form action="#" method="get">
        <input type="search" id="search-input" class="search-input" placeholder="Search...">
        <input type="submit" value="&#x1F50D;" id="serach-submit" class="search-submit">
    </form>
  `;
let $indexCounter = 0;
let $currentIndex = 0;

//  ----- Functions ----- //
// Generate Cards HTML
function generateHTML(data) {
  $employeesInfo.push(data)
  const $card = `
      <div class="card" data-index="${$indexCounter}">
        <div class="card-img-container">
          <img class="card-img" src="${data.picture.large}"
          alt="A profile picture of ${data.name.first} ${data.name.last}">
        </div>
        <div class="card-info-container">
          <h3 id="name" class="card-name cap">${data.name.first} ${data.name.last}</h3>
          <p class="card-text">${data.email}</p>
          <p class="card-text cap">${data.location.city}, ${data.location.state}</p>
        </div>
      </div>
    `;
  $($card).appendTo('#gallery');
  $indexCounter += 1;
}


function displayModal(index) {
  const {name, dob, phone, email, location: {city, street, state, postcode}, picture} = $employeesInfo[index];
  let $date = new Date(dob.date);
  const $modalHTML = `
      <div class="modal">
        <div class="modal-info-container">
        <button type="button" id="modal-close-btn" class="modal-close-btn"><strong>X</strong></button>
          <img class="modal-img" src="${picture.large}" alt="A picture of ${name.first} ${name.last}" data-index="${index}">
          <h3 id="name" class="modal-name cap">${name.first} ${name.last}</h3>
          <p class="modal-text">${email}</p>
          <p class="modal-text cap">${city}</p>
          <hr>
          <p class="modal-text">${phone}</p>
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
  checkDataIndex(index);
}


function checkDataIndex(index) {
  console.log(index)
  if (index === 0) {
    $('#modal-prev').hide();
    $('#modal-next').show();
  } else if (index === 11) {
    $('#modal-next').hide();
    $('#modal-prev').show();
  } else {
    $('#modal-next').show();
    $('#modal-prev').show();
  }
}


function switchModal(index, translate) {
  const {name, dob, phone, email, location: {city, street, state, postcode}, picture} = $employeesInfo[index];
  let $date = new Date(dob.date);

  checkDataIndex(index);

  $('#modal-close-btn').remove();
  $(`<button type="button" id="modal-close-btn" class="modal-close-btn"><strong>X</strong></button>`).insertBefore('.modal-info-container');

  $('.modal').children().css({
    'transition': 'transform 0.4s ease-out, opacity 0.4s ease-out',
    'opacity': '0',
    'transform': `translateX(${translate}px)`
  });

  setTimeout(() => {
    $('.modal-img').attr({'src': `${picture.large}`,
      'alt': `A picture of ${name.first} ${name.last}`,
      'data-index': `${index}`
    });

    $('.modal-name').text(`${name.first} ${name.last}`);
    $('.modal-text:eq(0)').text(`${email}`);
    $('.modal-text:eq(1)').text(`${city}`);
    $('.modal-text:eq(2)').text(`${phone}`);
    $('.modal-text:eq(3)').text(`${street.number} ${street.name}, ${state} ${postcode}`);
    $('.modal-text:eq(4)').text(`Birthday: ${$date.getMonth()}/${$date.getDate()}/${$date.getFullYear()}`);
  }, 400);

  setTimeout(() => {
    $('.modal').children().css({
      'transition': 'transform 0.4s ease-out, opacity 0.4s ease-out',
      'opacity': '1',
      'transform': `translateX(0px)`
    });
  }, 410);
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
    url: 'https://randomuser.me/api/?inc=gender,name,location,email,dob,phone,picture&results=12',
    dataType: 'json',
    success: function(data) {
      let $people = data.results;
      return $people.map((employee) => generateHTML(employee));
    }
  });

  // Search employees according to thier names.
  $('#search-input').on('keyup', () => {
    const $inputValue = $('#search-input').val().toLowerCase();
  });

  // Show Modal Listener
  $('#gallery').click((e) => {
    if (e.target.id !== gallery) {
      const $index = parseInt($(e.target).closest('.card').attr('data-index'));
      displayModal($index);
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

// Listen for click on close button to close the modal
$(document).click((e) => {
  $currentIndex = parseInt($('.modal-img').attr('data-index'));
  if (e.target.id === 'modal-close-btn' || e.target.tagName === 'STRONG') {
    $('.modal-container').fadeToggle();
    $('.modal-container').html('');
  } else if (e.target.id === 'modal-prev') {
    $currentIndex = $currentIndex - 1;
    switchModal($currentIndex, 20);
  } else if (e.target.id === 'modal-next') {
    $currentIndex = $currentIndex + 1;
    switchModal($currentIndex, -20);
  }
})
