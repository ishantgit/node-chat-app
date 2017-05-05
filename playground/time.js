// Jan 1st 1970 00:00:00 am UTC
//+ positive numbers future
// -ve numbers past

var moment = require('moment');
//java script
var someTimeStamp = moment().valueOf();
console.log(someTimeStamp);
var createdAt = 12344;
var date = moment(someTimeStamp);
console.log(date.format('h:mm a'));
