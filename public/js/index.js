var socket = io();

socket.on('connect',function (){
  console.log('Connected to server');

  // socket.emit('createMessage',{
  //   from: 'Me',
  //   text: 'this is me.'
  // });
});

socket.on('disconnect',function (){
  console.log('disconnected to server');
});

socket.on('newMessage',function (message){
  console.log('new message',message);
  var formattedTime = moment(message.createdAt).format('h:mm a');
  var li = jQuery('<li></li>');
  li.text(`${message.from} ${formattedTime}: ${message.text}`);

  jQuery('#messages').append(li);
});

socket.on('newLocationMessage',function(message){
  console.log('new location message',message);
  var formattedTime = moment(message.createdAt).format('h:mm a');
  var li = jQuery('<li></li>');
  var a = jQuery('<a target="_blank">Current Location</a>')
  li.text(`${message.from} ${formattedTime} `);
  a.attr('href',message.url);
  li.append(a);
  jQuery('#messages').append(li);
});

// socket.emit('createMessage',{
//   from: 'Baba',
//   text: 'Hi'
// },function(data){
//   console.log(data);
// });

jQuery('#message-form').on('submit',function(e){
  e.preventDefault();

  var messageTextBox = jQuery('[name=message]');
  socket.emit('createMessage',{
    from: 'User',
    text: messageTextBox.val()
  },function(){
    messageTextBox.val('')
  });
});

var locationButton = jQuery('#send-location');
locationButton.on('click',function(){
  if(!navigator.geolocation){
    return alert('Geolocation is not supported.');
  }

  locationButton.attr('disabled','disabled');
  navigator.geolocation.getCurrentPosition(function(position){
    locationButton.removeAttr('disabled');
    console.log(position);
    socket.emit('createLocationMessage',{
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    },function(message){
      console.log(message);
    });
  },function(){
    alert('Unable to fetch location.')
  });
});
