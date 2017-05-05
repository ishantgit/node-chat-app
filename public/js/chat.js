var socket = io();

function scrollToBottom(){
  var messages = jQuery('#messages');
  var newMessage = messages.children('li:last-child');

  var clientHeight = messages.prop('clientHeight');
  var scrollTop = messages.prop('scrollTop');
  var scrollHeight = messages.prop('scrollHeight');
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight();

  if(clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight){
    messages.scrollTop(scrollHeight);
  }
};
socket.on('connect',function (){
  var params = jQuery.deparam(window.location.search);
  socket.emit('join',params,function(err){
    if(err){
      alert(err)
      window.location.href = '/'
    }else{
      console.log('no error');
    }
  });
  console.log('Connected to server');

  // socket.emit('createMessage',{
  //   from: 'Me',
  //   text: 'this is me.'
  // });
});

socket.on('disconnect',function (){
  console.log('disconnected to server');
});

socket.on('updateUserList',function(users){
  var ol = jQuery('<ol></ol>');

  users.forEach(function(user){
    ol.append(jQuery('<li> </li>').text(user));
  });

  jQuery('#users').html(ol);
});

socket.on('newMessage',function (message){
  var formattedTime = moment(message.createdAt).format('h:mm a');
  var template = jQuery('#message-template').html();
  var html = Mustache.render(template,{
    text: message.text,
    from: message.from,
    createdAt: formattedTime
  });
  jQuery('#messages').append(html);
  scrollToBottom();
  // console.log('new message',message);
  // var li = jQuery('<li></li>');
  // li.text(`${message.from} ${formattedTime}: ${message.text}`);
  //
  // jQuery('#messages').append(li);
});

socket.on('newLocationMessage',function(message){
  console.log('new location message',message);
  var formattedTime = moment(message.createdAt).format('h:mm a');
  var template = jQuery('#location-message-template').html();
  var html = Mustache.render(template,{
    url: message.text,
    from: message.from,
    createdAt: formattedTime
  });
  jQuery('#messages').append(html);
  scrollToBottom();
  // var li = jQuery('<li></li>');
  // var a = jQuery('<a target="_blank">Current Location</a>')
  // li.text(`${message.from} ${formattedTime} `);
  // a.attr('href',message.url);
  // li.append(a);
  // jQuery('#messages').append(li);
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
