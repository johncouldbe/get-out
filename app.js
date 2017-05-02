const state = {
  optionSelected:false,
  id: "",
  addresses: {},
  option: {},
  ajax: {
    url:"https://api.foursquare.com/v2/venues/explore",
    near: "",
    query: ""
  }
};

function logItemsToState(){

  state.ajax.near = $('.js-input').val();

  $('.option-name').each(function(option){
    state.option[$(this).text()] = false;
  });
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

//Animation of selected and venue showing
function selectedAnimation(e){
  //Lower opacity of surrounding options
  $('.option').not($(e)).not($(e).siblings()).each(function(e){
    $(e).addClass('not-selected-option');
  });
  //remove selected's sibling option from DOM
  $(e).siblings().addClass('hidden');
  // increase size of option to reveal venues
  $(e).closest('.option-row, .option-container').addClass('selected-option');
  $(e).parent('.option-row').siblings().addClass('selected-option-row-sibling');
  //Show venues

  $(e).find('.venues').removeClass('hidden');
}
//Animation of De-Selected and venue hiding
function deSelectedAnimation(e){
  //Raise opacity of surrounding options
  $('.option').not($(e)).not($(e).siblings()).each(function(e){
    $(e).removeClass('not-selected-option');
  });
  //add selected's sibling option from DOM
  $(e).closest('.option').siblings().removeClass('hidden');

  // decrease size of option to hide venues
  $(e).closest('.option-row, .option-container').removeClass('selected-option');
  $(e).closest('.option-row').siblings().removeClass('selected-option-row-sibling');
  //Hide venues
  $(e).siblings('.venues').addClass('hidden');
}

//Displays the venues in the dropdown
let displayVenues = (data, venueContainer) => {
  console.log(data);
  let venue = '';
  data.response.groups[0].items.forEach(function(obj){
    //Adds a location address key value pair in our state object to use later for when we need to pull up the map
    state.addresses[obj.venue.name] = (obj.venue.location.formattedAddress[0] +
    ' ' + obj.venue.location.formattedAddress[1]).replace(/&/g, "").replace(/ *\([^)]*\) */g, " ").split(' ').join('+');
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
  logItemsToState();
});

//When user picks an option
$('.option').click(function(event){
  var e = event.currentTarget;
  var currentOption = $(this).find('.option-name').text();

  if(state.optionSelected === false){
    state.optionSelected = true;
    state.id = $(this).find('.venues').attr('id');
    state.ajax.query = $(this).find('.venues').attr('id').replace(/-/g, ' ');

    if(state.option[currentOption] === false){
      get4SqApi(state, displayVenues);
      state.option[currentOption] = true;
    }
    selectedAnimation(e);
  }
});
//When user closes an option
$('.option-name').click(function(event){
  event.stopPropagation();
  var e = event.currentTarget;

  if(state.optionSelected === true){
    state.optionSelected = false;
    deSelectedAnimation(e);
  }
});
//Display google map
$('.venues').on('click', '.map-icon', function(e){
  var query = $(this).attr('id');
  displayMap(query, $('.g-map'));
  $('.g-map').fadeIn();
});
//Hide google map
$('.g-map').on('click', '.close-map', function(){
  $('.g-map').fadeOut();
});
