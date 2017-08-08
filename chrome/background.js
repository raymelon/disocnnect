var trackedTabs = {};
var previousUrl = '';
var toRecord = null;

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if( changeInfo.status == 'complete') {
	    if( tab.url.search('facebook.com') != -1 ) {
	    	console.log('Opened new facebook.com tab', Date());
	    	trackedTabs[tabId] = { 'url': tab.url, 'time': -1 };

	    	setTimeout(function() {
		      	chrome.storage.sync.set(trackedTabs[tabId], function() {
					console.log('Initial tab ', trackedTabs[tabId], ' saved');
				});
	    	}, 2000);
	    }
	}
});

chrome.webNavigation.onCompleted.addListener(function (data) {
	// when the browser is freshly-opened
	if (previousUrl === '') {
		previousUrl = data.url;
		return;
	}

	if (data.url.search('facebook.com') === -1) {
		if (previousUrl.search('facebook.com') != -1)
			trackFBOnlineOffline(data.tabId);
	}

	previousUrl = data.url;

});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {

    if (trackedTabs[tabId] != undefined) {
    	trackFBOnlineOffline(tabId);
    }
});

var checkConnection = function() {
	var pageIsUp = true;
	ping('https://facebook.com/').then(function(delta) {
		//alert(delta);
		console.log("facebook.com's ping: ", delta);
		pageIsUp = true;
	}).catch(function(error) {
		//alert(String(error));
		console.log(String(error));
		pageIsUp = false;
	});
	return pageIsUp;
};

var trackFBOnlineOffline = function(tabId) {

	if (trackedTabs[tabId] != undefined)
		if (trackedTabs[tabId].url.search('facebook.com') != -1) {
			if (checkConnection() === true) {
				checkForOtherFBTabs();
				
			} else {
				toRecord = false;
			}
			setTimeout(function() { 
				saveNewTime(tabId); 
			}, 2000);
		}
};

var saveNewTime = function(tabId) {
	console.log('record is: ' + toRecord);
	if( toRecord === null ) {
		// do nothing. like a more restricted else. what?

	} else if( toRecord === true ) {
		trackedTabs[tabId].time = moment(Date.now()).toJSON();

		chrome.storage.sync.set(trackedTabs[tabId], function() {
		    console.log('Closed tab ', trackedTabs[tabId], ' saved');
		});
		setTimeout(function() {
			delete trackedTabs[tabId];
		}, 500);

	} else if( toRecord === false ) {
		trackedTabs[tabId].time = -1;
		chrome.storage.sync.set(trackedTabs[tabId], function() {
		    console.log('Closed tab ', trackedTabs[tabId], ' discarded');
		});
		setTimeout(function() {
			delete trackedTabs[tabId];
		}, 500);
	}
};

var checkForOtherFBTabs = function() {

	toRecord = true;
	chrome.windows.getAll({populate:true}, function(windows) {
		windows.forEach(function(window) {
			window.tabs.forEach(function(tab) {
			      if (tab.url.search('facebook.com') != -1) {
			      		console.log('More than one facebook.com tab', Date());
			      		toRecord = false;
			      }
			});
		});
	});
};
