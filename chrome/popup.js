
window.onload = function() {
  	chrome.storage.sync.get(['url', 'time'], function(items) {
	    console.log(
	    	items, 
	    	items.url, 
	    	items.time,
	    	' loaded '
	    );

  		if (items.time != -1) {
  			// since facebook waits for 3 minutes of inactivity before marking you as offline
  			var sinceOffline = moment.duration(moment(Date.now()).diff(items.time)).asMinutes();
  			console.log('Minutes since offline: ', sinceOffline);
  			if (sinceOffline > 3) {
  				document.getElementById('approx-time').innerHTML = 'About ';
	  			document.getElementById('approx-time').innerHTML += moment(items.time).add(3, 'minutes').fromNow();
	  			document.getElementById('exact-time').innerHTML += 
	  				moment.duration(
	 					moment(Date.now())
	  						.diff(moment(items.time)
	  							.add(3, 'minutes')))
	  								.format('d [days], h [hr], m [min], s [sec]');
	  		} else {
	  			document.getElementById('approx-time').innerHTML = 'About a few seconds ago';
	  		}
	  	} else {
	  		document.getElementById('approx-time').innerHTML = 'Active now';
	  	}
	});
}
