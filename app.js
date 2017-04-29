const state = {
  url:"https://api.foursquare.com/v2/venues/search",
  near: "",
  query: "donut"
};

let get4SqApi = (state, success) => {
   let data = {
     near:state.near,
     query:state.query,
     v:20170428,
     client_id:'YDX2K0BAAOAEQJ0MMPBPBP0ZPI3TAXN4OEZVBPF5KA2GAAMZ',
     client_secret: 'TTS0TSSO44RW0H5PAGRVMKUXJ52FNB5PCKC5VL2OBJDAYRKE'
   };
   $.getJSON(state.url, data, success);
};
/*============ Display Functions ================= */
function keepSizeRatio(){
  let sameHeight = $('.option').width();
  $('.option').css({'height':sameHeight+'px'});
  $('.option-row').css({'height':sameHeight+ 5 + 'px'});
}
keepSizeRatio();

$(window).resize(function() {
  keepSizeRatio();
});

let displayVenues = data => {
  console.log(data);
};

$('.js-form').submit(e => {
  e.preventDefault();
  state.near = $('.js-input').val();
  get4SqApi(state, displayVenues);
});

$('.option').click(function(e){
  let margin = $(this).css('marginLeft');
  //Lower opacity of surrounding options
  $('.option').not(this).each(function(e){
    $(this).animate({
      opacity: '.5'
    });
  });
  //remove sibling option from DOM
  $(this).siblings().animate({
    opacity: '.0',
    display: 'none'
  }, 200);
  // increase size of option to reveal venues
  $(this).delay(1000).animate({
    width: $(this).parent().width() - (parseInt(margin) * 2),
    height: '100%'
  });
  if($(window).width() > 750){
    $(this).closest('.option-container').find('.option-row').delay(1000).animate({
      height: '70vh'
    });
    $(this).closest('.option-container').delay(1000).animate({
      height: '70vh'
    });

  } else {
    $(this).parent().delay(1000).animate({
      height: '80vh'
    });
  }
});
