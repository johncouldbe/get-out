const state = {
  optionSelected:false,
  ajax: {
    url:"https://api.foursquare.com/v2/venues/search",
    near: "",
    query: "donut"
  }
};

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

let displayVenues = data => {
  console.log(data);
};

$('.js-form').submit(e => {
  e.preventDefault();
  state.ajax.near = $('.js-input').val();
  get4SqApi(state, displayVenues);
});

$('.option').click(function(e){
  if(state.optionSelected === false){
    state.optionSelected = true;
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
