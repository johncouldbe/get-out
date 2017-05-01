const state = {
  optionSelected:false,
  id: "",
  addresses: {},
  ajax: {
    url:"https://api.foursquare.com/v2/venues/explore",
    near: "",
    query: ""
  }
};

//AIzaSyCHlf61q8MgJfM8kLez1L0X7VvoyIiRwXg

function logLocation(){
  state.ajax.near = $('.js-input').val();
  console.log(state.ajax.near);
}

let get4SqApi = (state, success) => {
   let data = {
     near:state.ajax.near,
     query:state.ajax.query,
     v:20170428,
     client_id:'YDX2K0BAAOAEQJ0MMPBPBP0ZPI3TAXN4OEZVBPF5KA2GAAMZ',
     client_secret: 'TTS0TSSO44RW0H5PAGRVMKUXJ52FNB5PCKC5VL2OBJDAYRKE'
   };
   $.getJSON(state.ajax.url, data, success);
};
/*============ Display Functions ================= */
//Initial animation when user enters their location search
function initiatedDisplay(){
  $('header, .form-section').addClass('position-top');
  $('.form-section').addClass('hidden');
  $('.options').delay(1000).fadeIn(1000);
}
//Displays the venues in the dropdown
let displayVenues = (data, venueContainer) => {
  console.log(data);
  let venue = '';
  data.response.groups[0].items.forEach(function(obj){
    //Adds a location address key value pair in our state object to use later for when we need to pull up the map
    state.addresses[obj.venue.name] = obj.venue.location.formattedAddress[0] +
    ' ' + obj.venue.location.formattedAddress[1].split(' ').join('+').replace(/[{()}]/g, '');
    //creates the displayed venues
    venue += `
    <div class="venue">
      <div class="title-address">
        <h2 class="venue-name">${obj.venue.name}</h2>
        <p>${obj.venue.location.formattedAddress[0]} ${obj.venue.location.formattedAddress[1]}</p>
      </div>`;
      //Make sure theres a user rating before displaying
      if(obj.venue.rating > 0){
        venue +=`
        <div class="rating" style="background-color:#${obj.venue.ratingColor}">
          <p>${obj.venue.rating}</p>
        </div>`;
      } else {
        venue +=`
        <div class="rating" style="background-color:tomato">
          <p>N/A</p>
        </div>`;
      }

      venue +=
      `<img src="map-marker-icon.png" class="map-icon" id="${obj.venue.name}"/>
      <img src="arrow.svg" class="share-icon"/>
    </div>`;
  });
  $('#' + state.id).html(venue);
   /*`
      <img src="profile-pic.jpg" class="venue-img"/>
` */
};
//Display google maps
function displayMap(query, map){
  let newMap = `
  <div class="close-map">
    <h1>Close</h1>
  </div>
  <iframe
  frameborder="0" style="border:0"
  src="https://www.google.com/maps/embed/v1/place?key=AIzaSyCHlf61q8MgJfM8kLez1L0X7VvoyIiRwXg&q=${state.addresses[query]}" allowfullscreen>
</iframe>`;
map.html(newMap);
}

/*============ Event Functions ================= */
$('.js-form').submit(e => {
  e.preventDefault();
  initiatedDisplay();
  logLocation();
});

$('.option').click(function(e){
  if(state.optionSelected === false){
    state.optionSelected = true;
    state.id = $(this).find('.venues').attr('id');
    state.ajax.query = $(this).find('.venues').attr('id').replace(/-/g, ' ');
    get4SqApi(state, displayVenues);
    //Lower opacity of surrounding options
    $('.option').not(this).not($(this).siblings()).each(function(e){
      $(this).addClass('not-selected-option');
    });
    //remove selected's sibling option from DOM
    $(this).siblings().addClass('hidden');
    // increase size of option to reveal venues
    $(this).closest('.option-row, .option-container').addClass('selected-option');
    $(this).parent('.option-row').siblings().addClass('selected-option-row-sibling');
    //Show venues

    $(this).find('.venues').removeClass('hidden');
  }
});

$('.option-name').click(function(e){
  e.stopPropagation();

  if(state.optionSelected === true){
    state.optionSelected = false;
    //Raise opacity of surrounding options
    $('.option').not(this).not($(this).siblings()).each(function(e){
      $(this).removeClass('not-selected-option');
    });
    //add selected's sibling option from DOM
    $(this).closest('.option').siblings().removeClass('hidden');

    // decrease size of option to hide venues
    $(this).closest('.option-row, .option-container').removeClass('selected-option');
    $(this).closest('.option-row').siblings().removeClass('selected-option-row-sibling');
    //Hide venues
    $(this).siblings('.venues').addClass('hidden');
  }
});

$('.g-map').on('click', '.close-map', function(){
  $('.g-map').fadeOut();
});

$('.venues').on('click', '.map-icon', function(e){
  var query = $(this).attr('id');
  displayMap(query, $('.g-map'));
  $('.g-map').fadeIn();
});
