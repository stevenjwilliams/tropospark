var url = "https://acmetsp-n.webex.com/WBXService/XMLService";

var header = 	'<?xml version="1.0" encoding="UTF-8"?>' +
  				'<serv:message xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
      			'<header>' +
              		'<securityContext>' +
                  		'<webExID>ridhillo</webExID>' +
                  		'<password>P@ss1234</password>' +
                  		'<siteName>acmetsp-n</siteName>' +
              		'</securityContext>' +
          		'</header>';

var names = ["Joseph Hitchcock", "Steven Williams", "Alexandra Miller-Browne"];
var attendees;

function getAttendees() {

	var meetingKey = $("#meetingNumber").val();

	var user = 		'<body>' +
	              		'<bodyContent xsi:type="java:com.webex.service.binding.user.GetUser">' +
	                  		'<webExId>johitchc</webExId>' +
	              		'</bodyContent>' +
	          		'</body>' +
	      			'</serv:message>';

	var meeting = 	'<body>' +
        				'<bodyContent xsi:type="java:com.webex.service.binding.meeting.GetMeeting">' +
            				'<meetingKey>' + meetingKey + '</meetingKey>' +
        				'</bodyContent>' +
    				'</body>' +
    				'</serv:message>';

	$.ajax({

	    url: url,
	    type: 'POST',
	    data: header + meeting,
	    dataType: 'text',

	    success: function (result) {

	    	var com = "http://www.webex.com/schemas/2002/06/common";
	    	var parser = new DOMParser();
	    	var xml = parser.parseFromString(result, "text/xml");
	    	
	    	attendees = xml.getElementsByTagNameNS(com, "email");

	        $("#entry").remove();

	        var listHTML = '';

	        for (i = 0; i < attendees.length; i++) {
	        	var email = attendees[i].textContent;
	        	username = email.substring(0, email.indexOf('@'));
	        	listHTML += '<div id="select">' +
	        				'<div class="row">' +
	        				'<div class="col">' +
	        				'<p>' +
      							'<input type="checkbox" class="filled-in checkbox-blue" id="' + username + '"/>' +
      							'<label for="' + username + '">' + names[i] + '</label>' +
    						'</p>' +
    						'</div>' +
    						'</div>';
	        }

	        listHTML += 	'<div class="row">' +
    						'<div class="input-field col s12 m6">' +
    							'<select>' +
    								'<optgroup label="Casual">' +
        								'<option value="2">Just in case you forgot, you\'re missing a WebEx meeting right now</option>' +
      								'</optgroup>' +
      								'<optgroup label="Nagging">' +
        								'<option value="1">Really guys? I can never count on you to do anything right</option>' +
      								'</optgroup>' +
      								'<optgroup label="Professional">' +
        								'<option value="3">Dear sir or madam, we hope you\'re obliged to attend the meeting you were cordially invited to</option>' +
      								'</optgroup>' +
    							'</select>' +
    							'<label>Choose a message</label>' +
 							'</div>' +
 							'</div>';

	        listHTML +=     '<div class="row">' +
					        	'<div class="col">' +
        							'<button class="btn waves-effect waves-light blue lighten-2" id="sendReminderButton" type="submit" name="action" onclick="sendReminders()">Send Reminders</button>' +
      							'</div>' +
    						'</div>' +
    						'</div>';

	        $("#attendeeList").html(listHTML);
	        $('select').material_select();
	    },

	    error: function (jqXHR, tranStatus, errorThrown) {
	        alert(
	            'Status: ' + jqXHR.status + ' ' + jqXHR.statusText + '. ' +
	            'Response: ' + jqXHR.responseText
	        );
	    }

	});
}

function SparkClient(spark_token) {

    if (!spark_token) {
        console.log("SPARK_CLIENT : bad configuration, no API token, exiting...");
        throw createError("SparkClient configuration error: no API token specified");
    }
    this.token = spark_token;

    console.log("SPARK_CLIENT: all set; ready to invoke spark");
}

// Returns a status code
SparkClient.prototype.createMemberShip = function(roomID, email) {

    // Robustify
    if (!roomID) {
        return 400;
    }
    if (!email) {
        return 400;
    }

    var result;
    try {
        // Open Connection
        var url = "https://api.ciscospark.com/v1/memberships";
        var connection = new java.net.URL(url).openConnection();

        // Set timeout to 10s
        connection.setReadTimeout(10000);
        connection.setConnectTimeout(10000);

        // Method == POST
        connection.setRequestMethod("POST");
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setRequestProperty("Authorization", "Bearer " + this.token);

        // Prepare payload
        var payload = '{ "roomId": "' + roomID + '", "personEmail": "' + email + '", "isModerator": "false" }'

        // [TODO] Check if this cannot be removed
        connection.setRequestProperty("Content-Length", payload.length);
        connection.setUseCaches(false);
        connection.setDoInput(true);
        connection.setDoOutput(true);

        //Send Post Data
        var bodyWriter = new java.io.DataOutputStream(connection.getOutputStream());
        console.log("SPARK_CLIENT: posting: " + payload + " to: " + url);
        bodyWriter.writeBytes(payload);
        bodyWriter.flush();
        bodyWriter.close();

        result = connection.getResponseCode();
        console.log("SPARK_CLIENT: read response code: " + result);

    }
    catch (e) {
        console.log("SPARK_CLIENT: could not log to Spark, socket Exception or Server Timeout");
        return 500;
    }

    if (result < 200 || result > 299) {
        console.log("SPARK_CLIENT: could not add user with email: " + email + " to room:" + roomID);
    }
    else {
        console.log("SPARK_CLIENT: user with email: " + email + " added to room:" + roomID);
    }

    return result; // success
}

// Adds the user with email to the room,
// Returns an HTTP status referenced here: https://developer.ciscospark.com/endpoint-memberships-post.html
function addToQuizRoom(email) {
    var client = new SparkClient("NDQzMDViYzUtNzc5MS00YTJlLWJhMTUtYjBiZWNiMDM0NmU1N2QyYmRmNGYtYzEw");
    var result = client.createMemberShip("Y2lzY29zcGFyazovL3VzL1JPT00vZWEwMTNlMjAtNTQ0Ny0xMWU2LWE3YWItYjlmZTBkNDBjZDJl", email);
    return result;
}

function sendReminders() {

	for (i = 0; i < attendees.length; i++) {
		var email = attendees[i].textContent;
	    username = email.substring(0, email.indexOf('@'));
		if($("#" + username).prop('checked')) {

			console.log("Sending message to: " + email);

		    if (!email) { // send Welcome message
		        say("Welcome to the WebEx-Alert System via Spark. Text your email to join the WebEx Alert room");
		    }
		    else { // register to the Sandbox Room
		        var statusCode = addToQuizRoom(email);
		        switch (statusCode) {
		            case 200:
		                say("Thanks for adding, " + email + " is now part of the 'WebEx Meeting Alert' room");
		                break;
		            case 409:
		                say("You're all set, " + email + " is already a member of the 'WebEx Meeting Alert' room");
		                break;
		            default:
		                say("sorry but we could not add " + email + " to the 'WebEx Meeting Alert' room, try again...");
		                break;
		        }
		    }


		}
	}

	$("#select").remove();

	var successHTML = 	'<div class="row">' +
						'<div class="col">' +
							'<p>Successfully sent messages</p>' +
						'</div>' +
						'</div>';

	$('#successMessage').html(successHTML);

}