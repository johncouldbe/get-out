$(function(){
/*================= State Variable ============*/
  const state = {
    optionSelected:false,
    id: "",
    addresses: {},
    option: {},
    venuePhotos:[],
    lastPick:'',
    ajax: {
      url:"https://api.foursquare.com/v2/venues/explore",
      photosURL:"",
      near: "",
      query: "hike"
    }
  };

  function logItemsToState(){
    //Get the users location input
    state.ajax.near = $('.js-input').val();
    /*Gets the query parameter to use later in api call and sets it to false.
    Once the option is set clicked its set to true and will not make a second api call*/
    $('.option-name').each(function(option){
      state.option[$(this).text()] = {isTrue:false};
    });
  }

  function getOptionInfo(e){
    state.currentOption = $(e).find('.option-name').text();
    state.id = $(e).find('.venues').attr('id');
    state.ajax.query = $(e).find('.venues').attr('id').replace(/-/g, ' ');
  }

  let get4SqPhoto = (state, success) => {
     let data = {
       v:20170428,
       client_id:'YDX2K0BAAOAEQJ0MMPBPBP0ZPI3TAXN4OEZVBPF5KA2GAAMZ',
       client_secret: 'TTS0TSSO44RW0H5PAGRVMKUXJ52FNB5PCKC5VL2OBJDAYRKE'
     };
     $.getJSON(state.ajax.photosURL,data ,success);
  };

  let checkValidLocation = (state, success) => {

     $.ajax({
       method:"GET",
       url: state.ajax.url,
       data: {
         near:state.ajax.near,
         query:state.ajax.query,
         v:20170428,
         client_id:'YDX2K0BAAOAEQJ0MMPBPBP0ZPI3TAXN4OEZVBPF5KA2GAAMZ',
         client_secret: 'TTS0TSSO44RW0H5PAGRVMKUXJ52FNB5PCKC5VL2OBJDAYRKE'
       },
       success: success,
       error: function(err){
         alert("Uh Oh! It appears the location you entered is invalid. Please try again.");
       }
     });
  };

  let get4SqVenueData = (state, success) => {
     let data = {
       near:state.ajax.near,
       query:state.ajax.query,
       v:20170428,
       client_id:'YDX2K0BAAOAEQJ0MMPBPBP0ZPI3TAXN4OEZVBPF5KA2GAAMZ',
       client_secret: 'TTS0TSSO44RW0H5PAGRVMKUXJ52FNB5PCKC5VL2OBJDAYRKE'
     };
     $.getJSON(state.ajax.url, data, success);
  };

  function createPhotoURLS(data){
    /*If there's a photo in the venue obj then add the url
    to our array we'll use later else set it to a default photo*/
    if(data.response.photos.count > 0){
      state.venuePhotos.push(`${data.response.photos.items[0].prefix}300x300${data.response.photos.items[0].suffix}`);
    } else{
      state.venuePhotos.push('assets/no-pic.png');
    }
  }

  function getPhotoURLS(data){
    //Retrieve photo data for each venue
    data.response.groups[0].items.forEach(function(obj){
      //Creates the URL to add as a parameter in our photo api call
      state.ajax.photosURL = `https://api.foursquare.com/v2/venues/${obj.venue.id}/photos`;
      //API call
      get4SqPhoto(state, createPhotoURLS);
    });
  }

  function createAdresses(obj){
  state.addresses[obj.venue.name] = (obj.venue.location.formattedAddress[0] +
    ' ' + obj.venue.location.formattedAddress[1]).replace(/&/g, "").replace(/ *\([^)]*\) */g, " ").split(' ').join('+');
  }
  /*============ Display Functions ================= */

  //Initial animation when user enters their location search
  function initiatedDisplay(){
    $('header').addClass('position-top');
    $('.form-section').html('');
    $('.options').delay(1000).fadeIn(1000);
    $('header p, .description-prompt, footer').fadeOut();
    $('header h1').html(`<span style="font-size:.7em;">${state.ajax.near}</span><br /><span class="js-search">Search New Location</span>`);
    $('header h1').addClass('point');
  }

  //Animation of selected and venue showing
  function selectedAnimation(e){
    //Lower opacity of surrounding options
    $('.option').not($(e)).not($(this).siblings()).each(function(e){
      $(this).addClass('not-selected-option');
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
    $('.option').not($(e)).not($(this).siblings()).each(function(e){
      $(this).removeClass('not-selected-option');
    });
    //add selected's sibling option from DOM
    $(e).closest('.option').siblings().removeClass('hidden');

    // decrease size of option to hide venues
    $(e).closest('.option-row, .option-container').removeClass('selected-option');
    $(e).closest('.option-row').siblings().removeClass('selected-option-row-sibling');
    //Hide venues
    if(state.lastPick == $(e).find('.venues').attr('id')){
    $(e).find('.venues').addClass('hidden');
  } else {
      $(e).addClass('hidden');
    }
  }

  //Displays the venues in the dropdown
  let displayVenues = (data, venueContainer) => {
    var i = 0;
    let venue = '';
    getPhotoURLS(data);
    setTimeout(function(){
      data.response.groups[0].items.forEach(function(obj){
        /*Adds a location address key value pair in our state object
        to use later for when we need to pull up the map*/
        createAdresses(obj);
        //creates the displayed venues
        venue += `
        <div class="venue">
          <img src="${state.venuePhotos[i]}" class="venue-img"/>
          <div class="title-address">
          <h2 class="venue-name">`;

          if(obj.venue.url != undefined){
            venue += `<a href="${obj.venue.url}" target="_blank">${obj.venue.name}</a>`;
          } else{
            venue += `${obj.venue.name}`;
          }

          venue += `</h2>
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
          `<img src="assets/map-marker-icon.png" class="map-icon" id="${obj.venue.name}"/>
          </div>`;
          i++;
        });
        state.venuePhotos = [];
        $('#' + state.id).html(venue);

      }, 2000);
  };
  //Clear out all venue divs to not confuse our user after new search
  function resetVenues(){
    $('.venues').each(function(){
      $(this).html(`
        <div class="clock">
        </div>`);
    });
  }

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
  //Create our new Form
  function renderNewSearch(form){
    $('.new-search label').fadeIn(2000);
    $('header h1').addClass('hidden');
    let newForm = `
    <div class="search-box">
      <input type="text" name="text"  class="js-input input" />
    </div>
    <button class="new-form-submit" type="image">
      <img src="assets/search-icon.svg" />
    </button>
    <div class="cancel">
      <img src="assets/cancel-icon.svg" />
    </div>`;
  form.append(newForm);
  $('.new-search').animate({
    top:0
  }, 1000);
  $('.options').css('margin-top', '-64px');
}
//Hide New Form
function hideNewSearch(canceled){
  if(canceled == 'canceled'){
    $('.new-search').animate({
      top:'-150px'
    }, 1000);
    $('header h1').removeClass('hidden');
    $('.options').css('margin-top', '-150px');
    $('.new-form').html('');
    $('.loading').fadeOut();
  } else {
    $('.loading').fadeIn();
    setTimeout(function(){
      $('.new-search').animate({
        top:'-150px'
      }, 1000);
      $('header h1').removeClass('hidden');
      $('.options').css('margin-top', '-150px');
      $('.new-form').html('');
      $('.loading').fadeOut();
    }, 2000);
  }
}

  /*============ Event Functions ================= */
  //Initial Locations Submit
  $('.js-form').submit(e => {
    e.preventDefault();
    logItemsToState();
    checkValidLocation(state, initiatedDisplay);
  });

  //When user picks an option
  $('.option').click(function(event){
    var e = event.currentTarget;
    event.stopPropagation();
    state.currentOption = '';

    getOptionInfo(e);
    //If option has been selected before don't make API call
    if(state.option[state.currentOption].isTrue === false){
      get4SqVenueData(state, displayVenues);
      state.option[state.currentOption] = true;
    }
    //If user clicks on another option while current option is still open
    if($(this).hasClass('not-selected-option')){
      state.optionSelected = true;
      deSelectedAnimation($(`#${state.lastPick}`));
      getOptionInfo(e);
      //Check if API call is needed
      if(state.option[state.currentOption].isTrue === false){
        get4SqVenueData(state, displayVenues);
        state.option[state.currentOption] = true;
      }
      //Show new venues
      $(this).removeClass('not-selected-option');
      selectedAnimation(e);
    }
    //If user clicks on an option and no others are open
    else {
      if(state.optionSelected === false){
        state.optionSelected = true;
        selectedAnimation(e);
      } else { //If it's open close it
        state.optionSelected = false;
        deSelectedAnimation(e);
      }
    }
    //Keeps up with the last picked option
    state.lastPick = $(this).find('.venues').attr('id');
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
  //Show/Hide Description
  $('.description-prompt').hover(function(){
    $('.description').toggleClass('hidden');
  });

  //Show the New Search Bar
  $('header h1').on('click','.js-search', function(){
    renderNewSearch($('.new-form'));
  });
  //Hide the New Search Bar
  $('.new-search').on('click','.cancel', function(event){
    let canceled = 'canceled';
    hideNewSearch(canceled);
  });
  //New Search Bar Submit
  $('.new-search .js-form').submit(e => {
    e.preventDefault();
    logItemsToState();
    checkValidLocation(state, hideNewSearch);
    state.optionSelected = false;
    deSelectedAnimation($(`#${state.lastPick}`));
    resetVenues();
  });

  //Hover effect for the options
  $('.option').hover(function() {
    $(this).addClass('hoveredOption');
    $(this).find('.option-name').css('color','#ffffff');
  }, function(){
    $(this).removeClass('hoveredOption');
    $(this).find('.option-name').css('color','#0C83E8');
  });
  //Click anywhere outside of the box to close it
  $('.options').click(function(){
    state.optionSelected = false;
    deSelectedAnimation($(`#${state.lastPick}`));
  });
  //Keeps the outside click to close box function happy
  $('.option').on('click','.venues', function(e){
    e.stopPropagation();
  });

/*================= End of Program ==================== */
});
