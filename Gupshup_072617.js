function MessageHandler(context, event) {
	if (event.message.startsWith("Search for holidays") && event.messageobj.refmsgid == 'welcomeMsg') {
		var msg = "Where would you like to go?";
		context.sendResponse(msg);
	} else if (event.message.startsWith("Know more") && event.messageobj.refmsgid == 'welcomeMsg') {
		context.simpledb.roomleveldata.chatstate = "KnowMore";
		var knowMore = {
			"type": "survey",
			"question": "Click to know about",
			"msgid": "knowMore",
			"options": [
				"Trending deals",
				"Popular hotels",
				"Customer reviews"
			]
		};
		context.sendResponse(JSON.stringify(knowMore));

	} else if ((event.message.startsWith("Trending deals") && event.messageobj.refmsgid == 'knowMore') ||
		((event.message.startsWith("Explore ")) && event.messageobj.refmsgid == 'trendingDeals')) {

		//context.sendResponse(hotelName);
		if (event.message.startsWith("Explore ")) {
			var tempHotelName1 = event.message;
			var split = tempHotelName1.split(" ");
			var hotelName = split.slice(1, split.length - 1).join(" ") + " ";
			context.simpledb.roomleveldata.trendingHotel = hotelName;
			context.simpledb.roomleveldata.chatstate = 13;
		} else if (event.message.startsWith("Trending deals")) {
			context.simpledb.roomleveldata.chatstate = 12;
		}
		var getHome = "https://contentservice.teletextholidays.co.uk/GetJsonService.svc/GetSectionObjects?sectionIds=Homepage_pod4,Homepage_pod3,Homepage_pod2,Homepage_Pod5,Homepage_pod9,NewHomePage_Box12,Homepage_Hotels";
		context.simplehttp.makeGet(getHome);
		//context.sendResponse("trendingDeals")
	} else if (event.message.startsWith("Popular hotels") && event.messageobj.refmsgid == 'knowMore') {
		context.simpledb.roomleveldata.chatstate = 14;
		var getHome = "https://contentservice.teletextholidays.co.uk/GetJsonService.svc/GetSectionObjects?sectionIds=Homepage_pod4,Homepage_pod3,Homepage_pod2,Homepage_Pod5,Homepage_pod9,NewHomePage_Box12,Homepage_Hotels";
		context.simplehttp.makeGet(getHome);
		//context.sendResponse("trendingDeals")
	} else if (event.message.startsWith("Customer reviews") && event.messageobj.refmsgid == 'knowMore') {
		context.simpledb.roomleveldata.chatstate = 15;
		var getRevwsHome = "https://contentservice.teletextholidays.co.uk/GetJsonService.svc/GetAllPublishedReviews?limit=30&startIndex=0&reviewType=all";
		context.simplehttp.makeGet(getRevwsHome);
		//context.sendResponse(getRevwsHome)
	} else if (event.messageobj.refmsgid == "notFound") {
		if (event.message.startsWith("Any London Airport")) {
			var destination = context.simpledb.roomleveldata.destination.split("_");
			var destinationId = destination[0];
			context.simpledb.roomleveldata.destinationName = destination[1];

			var newDeparture = "-1_Any London";
			var departure = newDeparture.split("_");
			var departureId = departure[0];
			var departureName = departure[1];

			mDate = new Date(context.simpledb.roomleveldata.ddate);
			var traveldate = new Date(mDate).toUTCString().substr(0, 16);

			var query = "?departureDate=" + context.simpledb.roomleveldata.ddate + "&dateMin=" + context.simpledb.roomleveldata.ddate + "&dateMax=" + context.simpledb.roomleveldata.ddate + "&destinationIds=" + destinationId + "&departureIds=" + departureId;

			context.simpledb.roomleveldata.query = query;
			context.simpledb.roomleveldata.chatstate = 1;

			var ttapiurl = 'https://dataservice.teletextholidays.co.uk/GetJsonService.svc/ESHolidaySearch' + query;

			var contextParam = JSON.stringify(event.contextobj);
			var url = "https://api.gupshup.io/sm/api/bot/" + event.botname + "/msg";
			var param = "context=" + contextParam + "&message=";
			var header = {
				"apikey": "9c934633fe20407bc0262610b5b9fe04",
				"Content-Type": "application/x-www-form-urlencoded"
			};

			var msg = "Let us show you the best holidays we have in " + context.simpledb.roomleveldata.destinationName + " from " + traveldate + " for " + context.simpledb.roomleveldata.duration + " nights from " + departureName + " airport.\nBack in a few seconds ??";
			param = "context=" + contextParam + "&message=" + msg;

			context.simplehttp.makePost(url, param, header, function() {
				context.simplehttp.makeGet(ttapiurl);
				//context.sendResponse(ttapiurl)
			});
			//
		} else if (event.message.startsWith("Change Destination")) {
			context.simpledb.roomleveldata.chatstate = 51;
			var msg = "Where would you like to go?";
			context.sendResponse(msg);
		} else if (event.message.startsWith("Talk to expert")) {
			//Display survey
			var talkToExpert = {
				"type": "survey",
				"question": "Click to proceed",
				"msgid": "talkToExpert",
				"options": [
					"Chat", {
						"type": "phone_number",
						"title": "Call Us",
						"phone_number": "02030010608"
					}
				]
			};
			context.sendResponse(JSON.stringify(talkToExpert));
		}
	} else if (event.messageobj.refmsgid == 'talkToExpert') {
		if (event.message.startsWith("Chat")) {
			context.sendResponse("All our agents are busy right now. You may call us or explore our trending deals or come back later");
		}
	} else if (event.message.startsWith("Select ") && event.messageobj.refmsgid == 'cat_212') {
		var msg = event.message + "";
		var selectedHotelIndex = parseInt(msg.split(' ').pop());
		var hotelObj = (JSON.parse(context.simpledb.roomleveldata.hotelArrData)).data;
		var selectedHotel = JSON.parse(hotelObj[selectedHotelIndex - 1]);
		var query = context.simpledb.roomleveldata.query + "&hotelKeys=" + selectedHotel.hotelId;

		context.simpledb.roomleveldata.chatstate = 2;

		//Prepare URL
		var ttapiurl = 'https://dataservice.teletextholidays.co.uk/GetJsonService.svc/ESHolidaySearch' + query;
		context.simplehttp.makeGet(ttapiurl);
		//context.sendResponse(ttapiurl)
	} else if (event.messageobj.refmsgid == 'cat_213' ||
		event.messageobj.refmsgid == 'cat_214' ||
		event.messageobj.refmsgid == 'cat_nearby' ||
		event.messageobj.refmsgid == 'places_go' ||
		event.messageobj.refmsgid == 'survey1') {

		if (event.message.startsWith("About selected hotel")) {
			//Display survey
			var aboutHotel = {
				"type": "survey",
				"question": "Click to know about this hotel's",
				"msgid": "aboutHotel",
				"options": [
					"Facilities",
					"Pictures",
					"Reviews & Ratings"
				]
			};
			context.sendResponse(JSON.stringify(aboutHotel));
		} else if ((event.messageobj.refmsgid == 'places_go' ||
				event.messageobj.refmsgid == 'cat_213' ||
				event.messageobj.refmsgid == 'cat_214' ||
				event.messageobj.refmsgid == 'cat_nearby') &&
			event.message.startsWith("Explore nearby")) {

			//Display survey
			var exploreNearby = {
				"type": "survey",
				"question": "Click to know",
				"msgid": "exploreNearby",
				"options": [
					"Other Hotels nearby",
					"Places nearby",
					"Getting around"
				]
			};
			var contextParam = JSON.stringify(event.contextobj);
			var url = "https://api.gupshup.io/sm/api/bot/" + event.botname + "/msg";
			var param = "context=" + contextParam + "&message=";
			var header = {
				"apikey": "9c934633fe20407bc0262610b5b9fe04",
				"Content-Type": "application/x-www-form-urlencoded"
			};

			var msg = JSON.stringify(exploreNearby);
			param = "context=" + contextParam + "&message=" + msg;

			context.simplehttp.makePost(url, param, header, function() {
				//Display survey
				var moreNearby = {
					"type": "survey",
					"question": " ",
					"msgid": "moreNearby",
					"options": [
						"Weather",
						"Map"
					]
				};
				context.sendResponse(JSON.stringify(moreNearby));
			});

			//
		}
	} else if (event.messageobj.refmsgid == 'aboutHotel') {
		if (event.message.startsWith("Facilities")) {
			context.simpledb.roomleveldata.chatstate = 8;
			context.simpledb.doGet(context.simpledb.roomleveldata.selectedHotel);
		} else if (event.message.startsWith("Pictures")) {
			context.simpledb.roomleveldata.chatstate = 4;

			//Show Hotel Pictures
			var contextParam = JSON.stringify(event.contextobj);
			var url = "https://api.gupshup.io/sm/api/bot/" + event.botname + "/msg";
			var param = "context=" + contextParam + "&message=";
			var header = {
				"apikey": "9c934633fe20407bc0262610b5b9fe04",
				"Content-Type": "application/x-www-form-urlencoded"
			};

			var msg = "Getting you the pictures of hotel. Back in a few seconds😀 ";
			param = "context=" + contextParam + "&message=" + msg;

			context.simplehttp.makePost(url, param, header, function() {
				var imageCatalogue = {
					"type": "catalogue",
					"imageaspectratio": "horizontal",
					"msgid": "imageCatalogue",
					"items": []
				}
				for (var i = 0; i < 10; i++) {
					var j = i + 1;
					var item = {
						"title": context.simpledb.roomleveldata.selectedHotelData.hotel.name + ", Image " + j,
						"subtitle": "",
						"imgurl": context.simpledb.roomleveldata.selectedHotelData.hotel.images[i],
						"options": [{
							"type": "text",
							"title": "About selected hotel"
						}, {
							"type": "text",
							"title": "Choose another hotel"
						}]
					};
					imageCatalogue.items.push(item);
				}
				//carousel ends
				context.sendResponse(JSON.stringify(imageCatalogue));
			});

		} else if (event.message.startsWith("Reviews & Ratings")) {
			context.simpledb.roomleveldata.chatstate = 7;

			//Show Hotel Ratings
			var contextParam = JSON.stringify(event.contextobj);
			var url = "https://api.gupshup.io/sm/api/bot/" + event.botname + "/msg";
			var param = "context=" + contextParam + "&message=";
			var header = {
				"apikey": "9c934633fe20407bc0262610b5b9fe04",
				"Content-Type": "application/x-www-form-urlencoded"
			};

			var msg = "Getting you FIVE latest TripAdvisor reviews of the hotel. Back in a few seconds ??";
			param = "context=" + contextParam + "&message=" + msg;

			context.simplehttp.makePost(url, param, header, function() {
				var getTAID = "https://contentservice.teletextholidays.co.uk/GetJsonService.svc/TAReviews?TAID=" + context.simpledb.roomleveldata.selectedHotelData.hotel.rating.tripAdvisorId;
				context.simplehttp.makeGet(getTAID);
			});
		}
	} else if (event.messageobj.refmsgid == 'exploreNearby') {
		if (event.message.startsWith("Other Hotels nearby")) {
			context.simpledb.roomleveldata.chatstate = 5;
			var query = context.simpledb.roomleveldata.query + "&hotelKeysToExclude=" + context.simpledb.roomleveldata.selectedHotelData.hotel.iff;
			//Prepare URL
			var ttapiurl = 'https://dataservice.teletextholidays.co.uk/GetJsonService.svc/ESHolidaySearch' + query;
			context.simplehttp.makeGet(ttapiurl);
		} else if (event.message.startsWith("Places nearby")) {
			context.simpledb.roomleveldata.chatstate = 6;
			//parentRegionId can be 0 for some hotels
			if (context.simpledb.roomleveldata.selectedHotelData.journey.parentRegion != null) {
				//Show places nearby
				var contextParam = JSON.stringify(event.contextobj);
				var url = "https://api.gupshup.io/sm/api/bot/" + event.botname + "/msg";
				var param = "context=" + contextParam + "&message=";
				var header = {
					"apikey": "9c934633fe20407bc0262610b5b9fe04",
					"Content-Type": "application/x-www-form-urlencoded"
				};

				var msg = "Getting you the places to go to and things to do near the hotel. Back in a few seconds ??";
				param = "context=" + contextParam + "&message=" + msg;
				context.simplehttp.makePost(url, param, header, function() {
					var getguide = " https://contentservice.teletextholidays.co.uk/GetJsonService.svc/GetGuideLandingPageInfo/" + context.simpledb.roomleveldata.selectedHotelData.journey.parentRegionId;
					context.simplehttp.makeGet(getguide);
					//context.sendResponse(context.simpledb.roomleveldata.chatstate);
				});
			} else {
				context.sendResponse("Places nearby not available for this hotel");
			}
		}
	} else if (event.messageobj.refmsgid == 'moreNearby') {
		if (event.message.startsWith("Getting around")) {
			context.simpledb.roomleveldata.chatstate = 9;
			//parentRegionId can be 0 for some hotels
			if (context.simpledb.roomleveldata.selectedHotelData.journey.parentRegionId != null) {
				//Show places nearby
				var contextParam = JSON.stringify(event.contextobj);
				var url = "https://api.gupshup.io/sm/api/bot/" + event.botname + "/msg";
				var param = "context=" + contextParam + "&message=";
				var header = {
					"apikey": "9c934633fe20407bc0262610b5b9fe04",
					"Content-Type": "application/x-www-form-urlencoded"
				};

				var msg = "Getting you the information on how to get around nearby. Back in a few seconds😀 ";
				param = "context=" + contextParam + "&message=" + msg;
				context.simplehttp.makePost(url, param, header, function() {
					var getguide = "https://contentservice.teletextholidays.co.uk/GetJsonService.svc/GetGuideLandingPageInfo/" + context.simpledb.roomleveldata.selectedHotelData.journey.parentRegionId;
					context.simplehttp.makeGet(getguide);
					//context.sendResponse(getguide);
				});
			} else {
				context.sendResponse("Getting Around data not available for this hotel");
			}
		} else if (event.message.startsWith("Weather")) {
			context.simpledb.roomleveldata.chatstate = 10;
			context.simpledb.doGet(context.simpledb.roomleveldata.selectedHotel);
		} else if (event.message.startsWith("Map")) {
			context.simpledb.roomleveldata.chatstate = 11;
			context.simpledb.doGet(context.simpledb.roomleveldata.selectedHotel);
		}
	} else {
		if (context.simpledb.roomleveldata.chatstate == 51) {
			event.message = "" + "show me deals to " + event.message + " on " + context.simpledb.roomleveldata.ddate + " leaving from " + context.simpledb.roomleveldata.departure.split("_").pop() + " for " + context.simpledb.roomleveldata.duration + " nights ";
			context.simpledb.roomleveldata.chatstate = 0;
		}
		prepareMsgForApiAi(event, context);
	}
}

function sendMessageToApiAi(options, botcontext) {

	var message = options.message; // Mandatory
	var sessionId = options.sessionId || ""; // optinal
	var callback = options.callback;
	if (!(callback && typeof callback == 'function')) {
		return botcontext.sendResponse("ERROR : type of options.callback should be function and its Mandatory");
	}
	var nlpToken = options.nlpToken;

	if (!nlpToken) {
		if (!botcontext.simpledb.botleveldata.config || !botcontext.simpledb.botleveldata.config.nlpToken) {
			return botcontext.sendResponse("ERROR : token not set. Please set Api.ai Token to options.nlpToken or context.simpledb.botleveldata.config.nlpToken");
		} else {
			nlpToken = botcontext.simpledb.botleveldata.config.nlpToken;
		}
	}
	var query = '?v=20150910&query=' + encodeURIComponent(message) + '&sessionId=' + sessionId + '&timezone=Asia/Calcutta&lang=en';
	var apiurl = "https://api.api.ai/api/query" + query;
	var headers = {
		"Authorization": "Bearer " + nlpToken
	};
	botcontext.simplehttp.makeGet(apiurl, headers, function(context, event) {
		if (event.getresp) {

			callback(event.getresp);
		} else {
			callback({});
		}
	});

}
/** Functions declared below are required **/

function EventHandler(context, event) {
	if (!context.simpledb.botleveldata.numinstance)
		context.simpledb.botleveldata.numinstance = 0;
	numinstances = parseInt(context.simpledb.botleveldata.numinstance) + 1;
	context.simpledb.botleveldata.numinstance = numinstances;
	context.sendResponse("Thanks for adding me. You are:" + numinstances);
}


function createBucket(inputArray, bucketingProperty, ignoredPropertyValue) {
	var result = {};
	for (var i = 0; i < inputArray.length; i++) {
		if (inputArray[i][bucketingProperty] === ignoredPropertyValue)
			continue;
		var bucketingPropertyValue = inputArray[i][bucketingProperty];

		if (result.hasOwnProperty(bucketingPropertyValue.replace('&amp;', '&'))) {
			result[bucketingPropertyValue.replace('&amp;', '&')].push(inputArray[i]);
		} else {
			result[bucketingPropertyValue.replace('&amp;', '&')] = [];
			result[bucketingPropertyValue.replace('&amp;', '&')].push(inputArray[i]);
		}
	}

	return result;
}

function HttpResponseHandler(context, event) {
	var hotelsList = JSON.parse(event.getresp);

	if (hotelsList.hasOwnProperty("totalHotels") && hotelsList.totalHotels == 0) {
		var contextParam = JSON.stringify(event.contextobj);
		var url = "https://api.gupshup.io/sm/api/bot/" + event.botname + "/msg";
		var param = "context=" + contextParam + "&message=";
		var header = {
			"apikey": "9c934633fe20407bc0262610b5b9fe04",
			"Content-Type": "application/x-www-form-urlencoded"
		};

		var msg = "We are sorry! No results found for this holiday. ??";
		param = "context=" + contextParam + "&message=" + msg;

		context.simplehttp.makePost(url, param, header, function() {
			//Display survey
			var notFound = {
				"type": "survey",
				"question": "Click to change departure airport or change holiday destination or talk to our expert",
				"msgid": "notFound",
				"options": [
					"Any London Airport",
					"Change Destination",
					"Talk to expert"
				]
			};
			context.sendResponse(JSON.stringify(notFound));
		});
	}

	if (context.simpledb.roomleveldata.chatstate == 1) {

		var hotels = hotelsList.offers;
		//carousel starts

		var hotelsListCatalogue = {
			"type": "catalogue",
			"imageaspectratio": "horizontal",
			"msgid": "cat_212",
			"items": []
		};

		var hotelArr = [];
		for (var i = 0; i < 10; i++) {
			//Put hotel name and it's id in the DB
			var hotelArrItem = "{\"hotelId\":\"" + hotels[i].hotel.iff + "\", \"parentRegionId\":\"" + hotels[i].journey.parentRegionId + "\", \"tripAdvisorId\":\"" + hotels[i].hotel.rating.tripAdvisorId + "\"}";
			hotelArr.push(hotelArrItem);

			var mDate = new Date(hotels[i].journey.outboundArrivalDate);
			var arrDate = new Date(mDate.getTime()).toISOString().substr(0, 10);
			var rating = parseInt(hotels[i].accommodation.rating);
			var starRating = "";
			while (rating) {
				rating--;
				starRating = starRating + "?"; //star symbol
			}
			var parentRegion = (hotels[i].journey.parentRegion == null) ? context.simpledb.roomleveldata.destinationName : hotels[i].journey.parentRegion;

			var item = {
				"title": hotels[i].hotel.name + " " + starRating,
				"subtitle": hotels[i].journey.destination + ", " + parentRegion + "\nFly from " + hotels[i].journey.outboundDepartureAirportName + " airport. Click on price to see details.",
				"imgurl": hotels[i].hotel.images[0],
				"options": [{
					"type": "url",
					"title": "£" + hotels[i].price + "pp",
					"url": "https://www.teletextholidays.co.uk/serp-es#/overseas/" + context.simpledb.roomleveldata.destinationName + "/" + arrDate + "/" + hotels[i].journey.outboundDepartureAirportName + "/boardtype=" + hotels[i].accommodation.boardTypeCode + "/nights=" + hotels[i].journey.duration + "/adults=" + hotels[i].accommodation.adults + "/minstars=" + hotels[i].accommodation.rating + "/children=" + hotels[i].accommodation.children + "/hotel=" + hotels[i].hotel.iff
				}, {
					"type": "text",
					"title": "Select " + hotels[i].hotel.name
				}, {
					"type": "phone_number",
					"title": "Call to book",
					"phone_number": "02380167249"
				}]
			};
			hotelsListCatalogue.items.push(item);
		}

		var hotelArrData = {
			data: hotelArr
		};
		context.simpledb.roomleveldata.hotelArrData = JSON.stringify(hotelArrData);

		//carousel ends
		//context.sendResponse(JSON.stringify(hotelArrData));
		context.sendResponse(JSON.stringify(hotelsListCatalogue));
	} else if (context.simpledb.roomleveldata.chatstate == 2) {
		var hotelSelected = hotelsList.offers;
		context.simpledb.roomleveldata.selectedHotelData = hotelSelected[0];
		//carousel starts

		var hotelCatalogue = {
			"type": "catalogue",
			"imageaspectratio": "horizontal",
			"msgid": "cat_213",
			"items": []
		}

		var mDate = new Date(hotelSelected[0].journey.outboundArrivalDate);
		var arrDate = new Date(mDate.getTime()).toISOString().substr(0, 10);

		var rating = parseInt(hotelSelected[0].accommodation.rating);
		var starRating = "";
		while (rating) {
			rating--;
			starRating = starRating + "?"; //star symbol
		}
		var parentRegion = (hotelSelected[0].journey.parentRegion == null) ? context.simpledb.roomleveldata.destinationName : hotelSelected[0].journey.parentRegion;
		var item = {
			"title": hotelSelected[0].hotel.name + " " + starRating,
			"subtitle": hotelSelected[0].journey.destination + ", " + parentRegion + "\nFly from " + hotelSelected[0].journey.outboundDepartureAirportName + " airport",
			"imgurl": hotelSelected[0].hotel.images[0],
			"options": [{
				"type": "text",
				"title": "About selected hotel"
			}, {
				"type": "text",
				"title": "Explore nearby"
			}, {
				"type": "text",
				"title": "Choose another hotel",
			}]
		};
		hotelCatalogue.items.push(item);

		//carousel ends
		//context.sendResponse("Today's hotels are : "+ hotels[0].hotel.name);
		context.sendResponse(JSON.stringify(hotelCatalogue));
	} else if (context.simpledb.roomleveldata.chatstate == 4) {

		var hotels = hotelsList.offers;
		//carousel starts

		var imageCatalogue = {
			"type": "catalogue",
			"imageaspectratio": "horizontal",
			"msgid": "cat_214",
			"items": []
		}
		for (var i = 0; i < 10; i++) {
			var mDate = new Date(hotels[0].journey.outboundArrivalDate);
			var arrDate = new Date(mDate.getTime()).toISOString().substr(0, 10);
			var j = i + 1;
			var item = {
				"title": hotels[0].hotel.name + ", Image " + j,
				"subtitle": "",
				"imgurl": hotels[0].hotel.images[i],
				"options": [{
						"type": "text",
						"title": "About selected hotel"
					}, {
						"type": "text",
						"title": "More"
					}

				]
			};
			imageCatalogue.items.push(item);
		}
		//carousel ends
		context.sendResponse(JSON.stringify(imageCatalogue));
		//context.sendResponse("test");
	} else if (context.simpledb.roomleveldata.chatstate == 5) {

		var hotels = hotelsList.offers;
		//carousel starts

		var hotelsListNearby = {
			"type": "catalogue",
			"imageaspectratio": "horizontal",
			"msgid": "cat_nearby",
			"items": []
		}

		for (var i = 0; i < 5; i++) {
			//Put hotel name and it's id in the DB
			var hotelIdForDB = "{\"hotelId\":\"" + hotels[i].hotel.iff + "\", \"parentRegionId\":\"" + hotels[i].journey.parentRegionId + "\"}";
			var hotelKeyForDB = hotels[i].hotel.name.split(" ").join("");
			context.simpledb.doPut(hotelKeyForDB, hotelIdForDB);
			var mDate = new Date(hotels[i].journey.outboundArrivalDate);
			var arrDate = new Date(mDate.getTime()).toISOString().substr(0, 10);
			var rating = parseInt(hotels[i].accommodation.rating);
			var starRating = "";
			while (rating) {
				rating--;
				starRating = starRating + "?"; //star symbol
			}
			var parentRegion = (hotels[i].journey.parentRegion == null) ? context.simpledb.roomleveldata.destinationName : hotels[i].journey.parentRegion;

			var item = {
				"title": hotels[i].hotel.name + " " + starRating,
				"subtitle": hotels[i].journey.destination + ", " + parentRegion,
				"imgurl": hotels[i].hotel.images[0],
				"options": [{
					"type": "url",
					"title": "£" + hotels[i].price + "pp",
					"url": "https://www.teletextholidays.co.uk/serp-es#/overseas/" + hotels[i].journey.destination + "/" + arrDate + "/" + hotels[i].journey.outboundDepartureAirportName + "/boardtype=" + hotels[i].accommodation.boardTypeCode + "/nights=" + hotels[i].journey.duration + "/adults=" + hotels[i].accommodation.adults + "/minstars=" + hotels[i].accommodation.rating + "/children=" + hotels[i].accommodation.children + "/hotel=" + hotels[i].hotel.iff
				}, {
					"type": "text",
					"title": "About selected hotel"
				}, {
					"type": "text",
					"title": "Choose another hotel",
				}]
			};
			hotelsListNearby.items.push(item);
		}
		//carousel ends
		//context.sendResponse("Today's hotels are : "+ hotels[0].hotel.name);
		context.sendResponse(JSON.stringify(hotelsListNearby));
	} else if (context.simpledb.roomleveldata.chatstate == 6) {

		var foundPlacesNearby = false;
		for (var i = 0; i < hotelsList.sections.length; i++) {
			if (hotelsList.sections[i].sname == "Places to Go" && hotelsList.sections[i].surl == "#places") {

				var hotels = hotelsList.sections[i].subsections;

				//carousel starts
				var placestoGO = {
					"type": "catalogue",
					"imageaspectratio": "horizontal",
					"msgid": "places_go",
					"items": []
				}

				for (var k = 0; k < 10; k++) {
					var item = {
						"title": hotels[k].subheader,
						"subtitle": "",
						"imgurl": hotels[k].imageurl,
						"options": [{
							"type": "text",
							"title": "About selected hotel"
						}, {
							"type": "text",
							"title": "Choose another hotel"
						}]
					};
					placestoGO.items.push(item);
				}
				//carousel ends
				foundPlacesNearby = true;
				context.sendResponse(JSON.stringify(placestoGO));
				//context.sendResponse(hotels);
			}
		}
		if (!foundPlacesNearby) {
			var contextParam = JSON.stringify(event.contextobj);
			var url = "https://api.gupshup.io/sm/api/bot/" + event.botname + "/msg";
			var param = "context=" + contextParam + "&message=";
			var header = {
				"apikey": "9c934633fe20407bc0262610b5b9fe04",
				"Content-Type": "application/x-www-form-urlencoded"
			};

			var msg = "We are sorry! No results found for places nearby for this hotel. ";
			param = "context=" + contextParam + "&message=" + msg;

			context.simplehttp.makePost(url, param, header, function() {
				//Display survey
				var notFoundPlaces = {
					"type": "survey",
					"question": "Click to know more about the selected hotel or choose another hotel",
					"msgid": "notFoundPlaces",
					"options": [
						"About selected hotel",
						"Choose another hotel"
					]
				};
				context.sendResponse(JSON.stringify(notFoundPlaces));
			});
		}
	} else if (context.simpledb.roomleveldata.chatstate == 11) {
		var hotels = hotelsList.offers;
		var url = "https://contentservice.teletextholidays.co.uk/GetJsonService.svc/GetImage?lat=" + hotels[0].journey.glat + "&lng=" + hotels[0].journey.glong + "&zoom=13"

		var map = {
			"type": "image",
			"originalUrl": url,
			"previewUrl": url
		};
		context.sendResponse(JSON.stringify(map));
	} else if (context.simpledb.roomleveldata.chatstate == 8) {
		var hotels = hotelsList.description;
		//var url = "https://contentservice.teletextholidays.co.uk/GetJsonService.svc/GetImage?lat="+hotels[0].journey.glat+"&lng="+hotels[0].journey.glong+"&zoom=13"

		//var map = {"type":"image","originalUrl":url,"previewUrl":url};
		context.sendResponse("We do not have the Facilities information available right now");
	} else if (context.simpledb.roomleveldata.chatstate == 7) {
		var taData = hotelsList.data;
		//We are getting 5 tripadvisor reviews
		var taIndex = 0;

		function sendReview() {
			if (taIndex < 5) {
				var msg = "";
				var pDate = new Date(taData[taIndex].published_date);
				var pubDate = new Date(pDate.getTime()).toUTCString().substr(0, 16);
				var taNbr = taIndex + 1;
				var starRating = "";
				var rating = taData[taIndex].rating;
				while (rating) {
					rating--;
					starRating = starRating + "?"; //star symbol
				}

				msg = taNbr + ") " + taData[taIndex].title + "\t" + pubDate + "\t" + starRating + "\n\n" + taData[taIndex].text + "\n\n" + taData[taIndex].user.username;

				var contextParam = JSON.stringify(event.contextobj);
				var url = "https://api.gupshup.io/sm/api/bot/" + event.botname + "/msg";
				var param = "context=" + contextParam + "&message=";
				var header = {
					"apikey": "9c934633fe20407bc0262610b5b9fe04",
					"Content-Type": "application/x-www-form-urlencoded"
				};

				param = "context=" + contextParam + "&message=" + msg;
				taIndex++;
				context.simplehttp.makePost(url, param, header, sendReview);

			} else {
				var survey1 = {
					"type": "survey",
					"question": "What would like to do next?",
					"msgid": "survey1",
					"options": [
						"About selected hotel",
						"Choose another hotel", {
							"type": "phone_number",
							"title": "Book this hotel",
							"phone_number": "02030010608"
						}
					]
				};
				context.sendResponse(JSON.stringify(survey1));
			}
		}
		sendReview();

	} else if (context.simpledb.roomleveldata.chatstate == 9) {
		context.sendResponse("We do not have the Getting Around information available right now");
	} else if (context.simpledb.roomleveldata.chatstate == 10) {
		var hotels = hotelsList.description;
		//var url = "https://contentservice.teletextholidays.co.uk/GetJsonService.svc/GetImage?lat="+hotels[0].journey.glat+"&lng="+hotels[0].journey.glong+"&zoom=13"

		//var map = {"type":"image","originalUrl":url,"previewUrl":url};
		context.sendResponse("We do not have the Weather information available right now");
	} else if (context.simpledb.roomleveldata.chatstate == 12) {
		var trendingDealsSelected = createBucket(hotelsList, 'displaySectionName', 'Homepage_Hotels');
		//carousel starts

		//context.sendResponse(trendingDealsSelected[0].displaySectionName);

		var trendingDealsCatalogue = {
			"type": "catalogue",
			"imageaspectratio": "horizontal",
			"msgid": "trendingDeals",
			"items": []
		}

		var keys = Object.keys(trendingDealsSelected);

		for (var i = 0; i < keys.length; i++) {
			var item = {
				"title": trendingDealsSelected[keys[i]][0].displaySectionName,
				"subtitle": "",
				"imgurl": trendingDealsSelected[keys[i]][0].image,
				"options": [{
					"type": "text",
					"title": "Explore " + trendingDealsSelected[keys[i]][0].displaySectionName
				}]
			};
			trendingDealsCatalogue.items.push(item);
		}

		context.sendResponse(JSON.stringify(trendingDealsCatalogue));
	} else if (context.simpledb.roomleveldata.chatstate == 13) {
		var trendingDealsSelected = hotelsList;
		//carousel starts

		//context.sendResponse(context.simpledb.roomleveldata.trendingHotel);
		var summerDealsCatalogue = {
			"type": "catalogue",
			"imageaspectratio": "horizontal",
			"msgid": "trendingDeals",
			"items": []
		}
		var summerDealsIndex = [];
		for (var i = 0; i < trendingDealsSelected.length - 1; i++) {
			if (trendingDealsSelected[i].displaySectionName.trim() == context.simpledb.roomleveldata.trendingHotel.trim()) {
				summerDealsIndex.push(i);
			}
		}
		for (var i = 0; i < summerDealsIndex.length; i++) {
			var item = {
				"title": trendingDealsSelected[summerDealsIndex[i]].query.description,
				"subtitle": trendingDealsSelected[summerDealsIndex[i]].query.duration + " Nights, " + trendingDealsSelected[summerDealsIndex[i]].boardBasis,
				"imgurl": trendingDealsSelected[summerDealsIndex[i]].image,
				"options": [{
					"type": "url",
					"title": "�" + trendingDealsSelected[summerDealsIndex[i]].minPrice + "pp",
					"url": trendingDealsSelected[summerDealsIndex[i]].query.websiteUrl
				}]
			};
			//context.sendResponse(trendingDealsSelected[i].displaySectionName.length);

			summerDealsCatalogue.items.push(item);
		}

		context.sendResponse(JSON.stringify(summerDealsCatalogue));
	} else if (context.simpledb.roomleveldata.chatstate == 14) {
		var trendingDealsSelected = hotelsList;
		//carousel starts

		//context.sendResponse(trendingDealsSelected[0].displaySectionName);
		var canariesDealsCatalogue = {
			"type": "catalogue",
			"imageaspectratio": "horizontal",
			"msgid": "trendingDeals",
			"items": []
		}
		var summerDealsIndex = [];
		for (var i = 0; i < trendingDealsSelected.length - 1; i++) {
			if (trendingDealsSelected[i].displaySectionName == "Homepage_Hotels") {
				summerDealsIndex.push(i);
			}
		}
		for (var i = 0; i < summerDealsIndex.length; i++) {
			var item = {
				"title": trendingDealsSelected[summerDealsIndex[i]].displayParentRegion + ", " + trendingDealsSelected[summerDealsIndex[i]].starRating + " Star",
				"subtitle": trendingDealsSelected[summerDealsIndex[i]].query.name + "\n" + trendingDealsSelected[summerDealsIndex[i]].hotelLocation + "\n" + trendingDealsSelected[summerDealsIndex[i]].query.duration + " Nights, " + trendingDealsSelected[summerDealsIndex[i]].boardBasis,
				"imgurl": trendingDealsSelected[summerDealsIndex[i]].image,
				"options": [{
					"type": "url",
					"title": "From �" + trendingDealsSelected[summerDealsIndex[i]].minPrice + "pp",
					"url": trendingDealsSelected[summerDealsIndex[i]].query.websiteUrl
				}]
			};
			//context.sendResponse(trendingDealsSelected[i].displaySectionName.length);

			canariesDealsCatalogue.items.push(item);
		}

		context.sendResponse(JSON.stringify(canariesDealsCatalogue));
	} else if (context.simpledb.roomleveldata.chatstate == 15) {
		var reviewsSelected = hotelsList.reviews;
		//carousel starts






		//context.sendResponse(reviewsSelected[0].id);
		var reviewsCatalogue = {
			"type": "catalogue",
			"msgid": "review",
			"items": []
		}

		for (var i = 0; i < 9; i++) {
			var item = {
				"title": "Rating " + reviewsSelected[i].reviewRating,
				"subtitle": reviewsSelected[i].description,
				"imgurl": "",
				"options": [{
						"type": "url",
						"title": reviewsSelected[i].customer.postedBy,
						"url": "https://www.teletextholidays.co.uk/reviews#returnUrl=" + reviewsSelected[i].id
					}

				]
			};
			reviewsCatalogue.items.push(item);
		}

		context.sendResponse(JSON.stringify(reviewsCatalogue));
	}

}

function DbGetHandler(context, event) {
	var hotelObj = JSON.parse(event.dbval);
	if (context.simpledb.roomleveldata.chatstate == 5) {
		var query = context.simpledb.roomleveldata.query + "&hotelKeysToExclude=" + hotelObj.hotelId;
		//context.sendResponse(query);
	} else if (context.simpledb.roomleveldata.chatstate == 6 || context.simpledb.roomleveldata.chatstate == 9) {
		//parentRegionId can be 0 for some hotels
		if (hotelObj.parentRegionId != "0") {
			var getguide = "https://contentservice.teletextholidays.co.uk/GetJsonService.svc/GetGuideLandingPageInfo/" + hotelObj.parentRegionId;
			context.simplehttp.makeGet(getguide);
			//context.sendResponse(getguide);
		} else {
			context.sendResponse("Data not available for this hotel");
		}
	} else if (context.simpledb.roomleveldata.chatstate == 7) {
		var getTAID = "https://contentservice.teletextholidays.co.uk/GetJsonService.svc/TAReviews?TAID=" + hotelObj.tripAdvisorId;
		context.simplehttp.makeGet(getTAID);
		//context.sendResponse(getTAID);
	} else if (context.simpledb.roomleveldata.chatstate == 8) {
		var getguide = "https://contentservice.teletextholidays.co.uk/GetJsonService.svc/GetMasterHotelDescription?MHID=" + hotelObj.hotelId;
		context.simplehttp.makeGet(getguide);
		//context.sendResponse(getguide);
	} else if (context.simpledb.roomleveldata.chatstate == 10) {
		if (hotelObj.parentRegionId != "0") {
			var weatherURL = "https://resources.teletextholidays.co.uk/mob/weather/" + hotelObj.parentRegionId + ".jpg";
			//context.simplehttp.makeGet(getguide);
			context.sendResponse(getguide);
		} else {
			context.sendResponse("Data not available for this hotel");
		}
	} else {
		var query = context.simpledb.roomleveldata.query + "&hotelKeys=" + hotelObj.hotelId;
	}

	//Prepare URL
	var ttapiurl = 'https://dataservice.teletextholidays.co.uk/GetJsonService.svc/ESHolidaySearch' + query;
	context.simplehttp.makeGet(ttapiurl);
	//context.sendResponse(ttapiurl);
}

function DbPutHandler(context, event) {
	context.sendResponse("");
}

function prepareMsgForApiAi(event, context) {
	context.simpledb.roomleveldata.sender = event.senderobj.display;

	var contextParam = JSON.stringify(event.contextobj);
	var url = "https://api.gupshup.io/sm/api/bot/" + event.botname + "/msg";

	sendMessageToApiAi({
		message: event.message,
		sessionId: event.senderobj.channelid.substring(0, 30),
		nlpToken: "a2ee83c6002a4131912f20658a08b603",
		callback: function(res) {

			//Sample response from apiai here.
			if (res !== undefined) {
				parsedResult = JSON.parse(res);

				if (!parsedResult.result.actionIncomplete && parsedResult.result.action == "DealSearch") {
					context.simpledb.roomleveldata.ddate = parsedResult.result.parameters.dDate;
					var ddate = parsedResult.result.parameters.dDate;

					context.simpledb.roomleveldata.destination = parsedResult.result.parameters.loc;
					var destination = parsedResult.result.parameters.loc.split("_");
					var destinationId = destination[0];
					context.simpledb.roomleveldata.destinationName = destination[1];

					context.simpledb.roomleveldata.departure = parsedResult.result.parameters.Departure;
					var departure = parsedResult.result.parameters.Departure.split("_");
					var departureId = departure[0];
					var departureName = departure[1];

					context.simpledb.roomleveldata.duration = parsedResult.result.parameters.Days;
					var duration = parsedResult.result.parameters.Days;

					var adults = "1";
					var child = "0";
					var rating = "3,4,5";
					var boardType = "anyboard";

					if (ddate == "next month") {
						var now = new Date();
						if (now.getMonth() == 11) {
							ddate = new Date(now.getFullYear() + 1, 0, 1).toISOString().substr(0, 10);
						} else {
							ddate = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().substr(0, 10);
						}
					} else if (ddate == "next week") {
						var now = new Date();
						ddate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10);
					} else if (ddate == "next year") {
						var now = new Date();
						ddate = new Date(now.getFullYear() + 1, 0, 1).toISOString().substr(0, 10);
					}

					mDate = new Date(ddate);
					var traveldate = new Date(mDate).toUTCString().substr(0, 16);
					maxDate = new Date(mDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10);
					minDate = new Date(mDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10);

					//var query = "?adults=" + adults + "&children=" + child + "&ratings=" + rating + "&departureDate=" + ddate + "&dateMin=" + minDate + "&dateMax=" + maxDate + "&durationMin=" + duration + "&durationMax=" + duration + "&destinationIds=" + destinationId + "&priceMin=" + priceMin + "&departureIds=" + departureId + "&channelId=" + channelId + "&boardType=" + boardType;
					var query = "?departureDate=" + ddate + "&dateMin=" + ddate + "&dateMax=" + ddate + "&destinationIds=" + destinationId + "&departureIds=" + departureId;

					context.simpledb.roomleveldata.query = query;
					context.simpledb.roomleveldata.chatstate = 1;

					var ttapiurl = 'https://dataservice.teletextholidays.co.uk/GetJsonService.svc/ESHolidaySearch' + query;

					var param = "context=" + contextParam + "&message=";
					var header = {
						"apikey": "9c934633fe20407bc0262610b5b9fe04",
						"Content-Type": "application/x-www-form-urlencoded"
					};

					var msg = "Let us show you the best holidays we have in " + context.simpledb.roomleveldata.destinationName + " from " + traveldate + " for " + duration + " nights from " + departureName + " airport.\nBack in a few seconds ??";
					param = "context=" + contextParam + "&message=" + msg;

					context.simplehttp.makePost(url, param, header, function() {
						context.simplehttp.makeGet(ttapiurl)
						//context.sendResponse(ttapiurl)
					});

					//context.sendResponse(msg);

				} else if (parsedResult.result.action == "input.welcome") {

					//context.sendResponse(parsedResult.result.fulfillment.messages[0].speech);

					var msg = "	Hi, " + context.simpledb.roomleveldata.sender + "! ??. Thanks for choosing Teletext Holidays. We are here to help you plan your next holiday.\nWhat would you like to do ?"
					//Display survey
					var welcomeMsg = {
						"type": "survey",
						"question": msg,
						"msgid": "welcomeMsg",
						"options": [
							"Search for holidays",
							"Know more"
						]
					};
					context.sendResponse(JSON.stringify(welcomeMsg));
				} else {
					context.sendResponse(parsedResult.result.fulfillment.messages[0].speech);
				}
			}
		}
	}, context);
}

//######
//Auto generated code from devbox
//######

exports.onMessage = MessageHandler;
exports.onEvent = EventHandler;
exports.onHttpResponse = HttpResponseHandler;
exports.onDbGet = DbGetHandler;
exports.onDbPut = DbPutHandler;
if (typeof LocationHandler == 'function') {
	exports.onLocation = LocationHandler;
}
if (typeof HttpEndpointHandler == 'function') {
	exports.onHttpEndpoint = HttpEndpointHandler;
}