//https://www.twilio.com/docs/libraries/node
//https://www.npmjs.com/package/node.bittrex.api
function notify(BITTREX_API,BITTREX_SECRET,to_num){
	var twilio = require('twilio');
	var bittrex = require('node.bittrex.api');
	var settings = require('./settings.json')

	var ACCOUNT_SID = settings.ACCOUNT_SID	
	var AUTH_TOKEN = settings.AUTH_TOKEN
	var from_num = settings.FROM_NUM
	var client = new twilio(ACCOUNT_SID, AUTH_TOKEN);

	bittrex.options({
		'apikey':BITTREX_API,
		'apisecret':BITTREX_SECRET,
	})

	function send(bs,to_num,coin_num,coin_name,total) {
		message = client.messages.create({
			to:to_num, 
			from:from_num,
			body:"This is a message from Traders.pm.\nYour "+bs+" order of "+coin_num+" "+coin_name+" has completed for a total of "+total+"!"}).then((message)=>console.log(message.sid))
	}

	var orders = new Array();
	bittrex.getopenorders({},function(data,err){
	    for(i=0;i<Object.keys(data.result).length;i++){
	        open=data.result[i].OrderUuid
			orders.push(open)
	    }
		// Do other shit here
		for(i=0;i<orders.length;i++){
			bittrex.getorder({uuid: orders[i]},function(data,err){
				if(!err){
					if(data.result.Closed != null){
						send(data.result.Type,to_num,data.result.Quantity,data.result.Exchange,data.result.Price)
					} else {console.log(data.result.OrderUuid+" not yet completed")}
				} else {console.log(err)}
			})
		}
	})
}
