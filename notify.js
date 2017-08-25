//https://www.twilio.com/docs/libraries/node
//https://www.npmjs.com/package/node.bittrex.api
function notify(BITTREX_API,BITTREX_SECRET,to_num){
	var twilio = require('twilio');
	var bittrex = require('node.bittrex.api');
	var date = new Date()
	var settings = require('./settings.json')

	var ACCOUNT_SID = settings.ACCOUNT_SID	
	var AUTH_TOKEN = settings.AUTH_TOKEN
	var from_num = settings.FROM_NUM
	var client = new twilio(ACCOUNT_SID, AUTH_TOKEN);

	bittrex.options({
		'apikey':BITTREX_API,
		'apisecret':BITTREX_SECRET,
	})

	function send(bs,to_num,coin_num,coin_name,closed,total) {
		message = client.messages.create({
			to:to_num, 
			from:from_num,
			body:"This is a message from Traders.pm.\nYour "+bs+" order of "+coin_num+" "+coin_name+" closed at "+closed+" for a total of "+total+"!"}).then((message)=>console.log(message.sid))
	}

	var orders = new Array();
	bittrex.getorderhistory({depth:100},function(data,err){
	    for(i=0;i<Object.keys(data.result).length;i++){
	        open=data.result[i].OrderUuid
			orders.push(open)
	    }
		// Do other shit here
		for(i=0;i<orders.length;i++){
			bittrex.getorder({uuid: orders[i]},function(data,err){
				if(!err){
					var NOW = new Date().getTime()
					var TIME = new Date(data.result.Closed)
					var FIVE = 60 * 5 * 1000
					if(data.result.Closed != null && ((NOW - TIME) < FIVE)){
						send(data.result.Type,to_num,data.result.Quantity,data.result.Exchange,data.result.Closed,data.result.Price)
//						console.log(data.result.Type,to_num,data.result.Quantity,data.result.Exchange,data.result.Price,data.result.Closed)
					} else {console.log(data.result.OrderUuid+" not yet completed or closed prior to start time")}
				} else {console.log(err)}
			})
		}
	})
}
