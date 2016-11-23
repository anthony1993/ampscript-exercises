

define( function( require ) {
	var Postmonger = require( 'postmonger' );
	var $ = require( 'vendor/jquery.min' );

    var connection = new Postmonger.Session();
	var tokens;
	var endpoints;
	var inArgPayload = {};

    $(window).ready(function() {
        connection.trigger('ready');
		connection.trigger('requestTokens');
		connection.trigger('requestEndpoints');
		//connection.trigger('requestPayload');
    });

	// This listens for Journey Builder to send tokens
	// Parameter is either the tokens data or an object with an
	// "error" property containing the error message
	connection.on('getTokens', function( data ) {
		if( data.error ) {
			console.error( data.error );
		} else {
			tokens = data;
		}
	});
	
	connection.on('initActivity', function(payload) {
        if (payload) {
        	inArgPayload = payload;
            console.log('payload',JSON.stringify(payload));

			var jsonPayload = payload['arguments'].execute.inArguments;

			if (typeof jsonPayload != "undefined" && jsonPayload.length > 0) {

				var message = inArgPayload['arguments'].execute.inArguments[0].displayMessage;
				
				$("#messageInput").val(message);
			}			

        }
        
		$('#firstCall' ).show();

    });

	/**
		If you want to have a multi-step configuration view, you need to manage the DOM manually.
		You can filter what changes to make by implementing the following type of logic when Postmonger from the server triggers an "updateStep" call.
		// connection.on('updateStep', step ) {

			if( step  >= 1 && step <= 3 ) {
				$('.step').hide(); // All DOM elements which are steps should have this class (this hides them all)
				$('#step' + step ).show(); // This selectively only displays the current step
				// Allow the user to make any changes and when you're ready, use:
				connection.trigger( 'updateStep', step ); 
			}
		}
	**/
	connection.on('updateStep', function( data ) {

		preparePayload();

        connection.trigger('updateActivity',inArgPayload);
		
	});
	// This listens for Journey Builder to send endpoints
	// Parameter is either the endpoints data or an object with an
	// "error" property containing the error message
	connection.on('getEndpoints', function( data ) {
		if( data.error ) {
			console.error( data.error );
		} else {
			endpoints = data;
		}
	});

    connection.on('requestPayload', function() {
	 var payload = {};
 
        payload.options = {
           
        };

		//TODO: Shouldn't this come from the data?
        payload.flowDisplayName = 'Sirius XM';
 
        connection.trigger('getPayload', payload);
    });

	// Journey Builder broadcasts this event to us after this module
	// sends the "ready" method. JB parses the serialized object which
	// consists of the Event Data and passes it to the
	// "config.js.save.uri" as a POST
    connection.on('populateFields', function(payload) {
    });
	
	connection.on('clickedNext', function() {

		preparePayload();
        connection.trigger('updateActivity',inArgPayload);
    });


    function preparePayload() {    

		var value = getMessage();		

console.log("inArgPayload: " + JSON.stringify(inArgPayload));


		inArgPayload['arguments'].execute.inArguments = []; // remove all the args, only save the last one
		inArgPayload['arguments'].execute.inArguments.push({"displayMessage": value});

		console.log('Message: ' + value);
		
		inArgPayload.metaData.isConfigured = true;
	}

	function getMessage () {		
		return $('#messageInput').val().trim();	
	}
});
