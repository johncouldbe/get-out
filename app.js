$(function(){
/*================= State Variable ============*/
  const state = {
    optionSelected:false,
    id: "",
    addresses: {},
    option: {},
    venuePhotos:[],
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

  let get4SqPhoto = (state, success) => {
     let data = {
       v:20170428,
       client_id:'YDX2K0BAAOAEQJ0MMPBPBP0ZPI3TAXN4OEZVBPF5KA2GAAMZ',
       client_secret: 'TTS0TSSO44RW0H5PAGRVMKUXJ52FNB5PCKC5VL2OBJDAYRKE'
     };
     $.getJSON(state.ajax.photosURL,data ,success);
  };

  let checkValidLocation = (state, success) => {
     /*let data = {
       near:state.ajax.near,
       query:state.ajax.query,
       v:20170428,
       client_id:'YDX2K0BAAOAEQJ0MMPBPBP0ZPI3TAXN4OEZVBPF5KA2GAAMZ',
       client_secret: 'TTS0TSSO44RW0H5PAGRVMKUXJ52FNB5PCKC5VL2OBJDAYRKE'
     };
     $.getJSON(state.ajax.url, data, success); */

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
    $('header, .form-section').addClass('position-top');
    $('.form-section').addClass('hidden');
    $('.options').delay(1000).fadeIn(1000);
    $('header p').fadeOut();
    $('footer').fadeOut();
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
    $(e).siblings('.venues').addClass('hidden');
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
    logItemsToState();
    checkValidLocation(state, initiatedDisplay);
  });

  //When user picks an option
  $('.option').click(function(event){
    var e = event.currentTarget;
    var currentOption = $(this).find('.option-name').text();

    if(state.optionSelected === false){
      state.optionSelected = true;
      state.id = $(this).find('.venues').attr('id');
      state.ajax.query = $(this).find('.venues').attr('id').replace(/-/g, ' ');

      if(state.option[currentOption].isTrue === false){
        get4SqVenueData(state, displayVenues);
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
/*================= End of Program ==================== */
});
