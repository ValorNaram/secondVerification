var browser = browser || chrome; /* Backward compatibility code: A little story
	There was a company called "Google" and they offer a internet browser called "Google Chrome" or just "Chrome".
	They thought it is a good idea and good practise to put its chrome extension APIs under the namespace "chrome".
	Then Mozilla came and had the idea to offer compatibility to chrome extension APIs for compatibility reason.
	For compatibility reasons other browser vendors adapted this behaviour.
	But Mozilla had the idea of generalizing it and decided to offer its extension APIs which were nearly identical to the chrome extension APIs under the namespace "browser" while also supporting the "chrome" namespace.
	Since then, Google did not learn and is still only supporting its own namespace "chrome"
*/
var protocol = "https://";
var checkedDomain = {};
var template = {
	"verifiedSite": {"state": "verified", "icons": {
		16: "../assets/verified16.png",
		32: "../assets/verified32.png"
	}},
	"otherSite": {"state": "unverified", "icons": {
		16: "../assets/unverified16.png",
		32: "../assets/unverified32.png"
	}},
	"cantingSite": {"state": "canting", "icons": {
		16: "../assets/unverified16.png",
		32: "../assets/unverified32.png"
	}},
	"verifierNotKnown": {"state": "unknownVerifier", "icons": {
		16: "../assets/unverified16.png",
		32: "../assets/unverified32.png"
	}},
	"verificationPending": {"state": "pendingVerification", "icons": {
		16: "../assets/unverified16.png",
		32: "../assets/unverified32.png"
	}},
	"notSupportedUrl": {"state": "nosupport", "icons": { //pseudo template (called manually if the domain of an url is not in 'checkedDomain' object)
		16: "../assets/unverified16.png",
		32: "../assets/unverified32.png"
	}}
}
var responseFilter = {"urls": ["http://*/", "https://*/*"]};
var requestHeader = {"User-Agent": "secondVerification", "Accept-Language": "en"};

/* First Part: Domain verification
	a1) fetch resource through webRequest (recording all requests made by websites)
	a2) filter the requests and for which we can request a verification of the domain belonging to the target of the request
	a3) send verification request to the verifier specified by the request from a2) and fetch the response
	a4) store the verification result
*/

/* Second part: Provide the result to the user by instant review (toolbar icon toggle)
	b1) determine changes in the tabs
	b2) fetch cached verification result and change addressbar icon for the corresponding tab (if data exists)
*/

/* Third part (optional): The user manually refreshes the addressbar icon
	c1) listen for a message of the popup script (addressbar menu script)
	c2) send back the data we have about the specified domain
		each tab has its own version of the addressbar menu from secondVerification because it has to display data that only belongs to an individual tab or the icon does not show at all if no data is available (depends on the browser)
*/
function saveResult(name, domain) { // a4)
	checkedDomain[domain] = template[name]; //Cache the verification result so we don't have to make a request for the same domain again
}
function showPageAction(tabId, domain) {
	browser.pageAction.show(tabId);
	browser.pageAction.setIcon({"path": checkedDomain[domain].icons, tabId: tabId});
}
function verifiedOrNot(resp, domain) { // a4)
	if (resp == "true") { // The domain is on the whitelist of the whitelist service and is therefore a 'trusted domain'
		saveResult("verifiedSite", domain);
		let matchPattern = protocol + domain + "/*" 
		let tab = browser.tabs.query({url: matchPattern});
		tab.then(function (tabs) {
			for (let tab of tabs) {
				showPageAction(tab.id, domain);
			}
		}, function(error) {return false;})
	} else {
		saveResult("cantingSite", domain);
	}
}
function verifyDomainByRequest(m) { // a3)
	if (checkedDomain[m.domain] && checkedDomain[m.domain].state == "pendingVerification") {
		return 0;
	} 
	if (checkedDomain[m.domain] == undefined) {
		checkedDomain[m.domain] = template["verificationPending"];
		if (service[m.whitelistservice] == undefined) { // True if the whitelist service the domain specified does not exist
			saveResult("verifierNotKnown");
			return 0;
		}
		let res = new Request(service[m.whitelistservice]); // The whitelist service the domain specified exists and will be asked to verify said domain
		fetch(res, {method: "post", body: m.domain, headers: requestHeader}).then(function (resp) {
			return resp.text();
		}).then(
			function (resp) {verifiedOrNot(resp, m.domain)}
		);
	}
}

function verifyDomainByCache(m, Port) { // c2)
	if (checkedDomain[m.domain] != undefined) { // if true, then it means that the verification result has been cached
		Port.postMessage(checkedDomain[m.domain]); //Send the verification result
		browser.pageAction.setIcon({"path": checkedDomain[m.domain].icons, tabId: m.tabId});
	} else {
		Port.postMessage(template["notSupportedUrl"]);
		browser.pageAction.setIcon({"path": template["notSupportedUrl"].icons, tabId: m.tabId});
	}
}

function checkResponse(resp) { // a2)
	var sv_header = false;
	var ContentType = false;
	var url = resp.url;
	
	resp.responseHeaders.forEach(function (header) {
		if (header.name.toLowerCase() == "x-sv-whitelist") {
			sv_header = header.value.toLowerCase();
		} else if (header.name.toLowerCase() == "content-type") {
			ContentType = header.value.toLowerCase();
		}
	});
	if (sv_header && ContentType.indexOf("text/html") > -1 || sv_header && ContentType.indexOf("text/xml") > -1) {
		url = url.replace(protocol, "");
		url = url.split("/")[0];
		verifyDomainByRequest({domain: url, whitelistservice: sv_header});
	} else if (ContentType.indexOf("text/html") > -1 || sv_header && ContentType.indexOf("text/xml") > -1) {
		if (url.startsWith(protocol)) {
			url = url.replace(protocol, "");
			url = url.split("/")[0];
			checkedDomain[url] = template["otherSite"];
		}
	}
}

browser.runtime.onConnect.addListener(function(Port) { // c1)
if (Port.name == "cachedDomains") {
	Port.onMessage.addListener(function(m) {verifyDomainByCache(m, Port)});
}
});
browser.webRequest.onResponseStarted.addListener(checkResponse, responseFilter, ["responseHeaders"]); // a1)
browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) { // b1)
	let url = tab.url.replace(protocol, "");
	url = url.split("/")[0];
	if (checkedDomain[url] != undefined) { // b2)
		showPageAction(tabId, url);
	} else {
		browser.pageAction.setIcon({"path": template["notSupportedUrl"].icons, tabId: tabId});
		browser.pageAction.show(tabId);
	}
})
