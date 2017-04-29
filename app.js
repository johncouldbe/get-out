//Quandle api key: MMEWNbNkaZjfXhnunMUC
const state = {
  url:"https://api.foursquare.com/v2/venues/search?ll=40.7,-74&client_id=CLIENT_ID&client_secret=CLIENT_SECRET&v=YYYYMMDD",
  query: ""
};

let get4SqApi = (state, success) => {
   let data = {
     key:'f745ab7094c0f909d532ee47b57726e8',
     format:'json'
   };
   $.getJSON(state.url, data, success);
};

let displayPets = data => {
  console.log(data);
};

$('.js-form').submit(e => {
  e.preventDefault();
  state.query = $('.js-input').val();
  //get4SqApi(state, displayVenues);
  getter();
});
