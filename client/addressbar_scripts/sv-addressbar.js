var browser = browser || chrome; /* Backward compatibility code: A little story
	There was a company called "Google" and they offer a internet browser called "Google Chrome" or just "Chrome".
	They thought it is a good idea and good practise to put its chrome extension APIs under the namespace "chrome".
	Then Mozilla came and had the idea to offer compatibility to chrome extension APIs for compatibility reason.
	For compatibility reasons other browser vendors adapted this behaviour.
	But Mozilla had the idea of generalizing it and decided to offer its extension APIs which were nearly identical to the chrome extension APIs under the namespace "browser" while also supporting the "chrome" namespace.
	Since then, Google did not learn and is still only supporting its own namespace "chrome"
*/
var protocol = "https://";
var tab;
var domain;
var title = document.getElementById("sv-toolbar-title");
var message = document.getElementById("sv-toolbar-message");
function getError(error) {
	title.innerHTML = "Error!";
	message.innerHTML = error;
}
function sendToBackground(tabs) {
	tab = tabs[0];
	let com = browser.runtime.connect({name:"cachedDomains"});
	let url = tab.url.replace(protocol, "");
	
	url = url.split("/")[0];
	domain = url;
	let m = {"domain": url, "tabId": tab.id};
	com.postMessage(m);
	com.onMessage.addListener(getFromBackground);
}
function getFromBackground(m) {
	title.innerHTML = String(m);
	if (m.state == "verified") {
		title.innerHTML = browser.i18n.getMessage("verified_title");
		message.innerHTML = browser.i18n.getMessage("verified_message").replace("%s", domain);
		document.body.classList.add("verified");
		return 0;
	} else if (m.state == "unverified") {
		title.innerHTML = browser.i18n.getMessage("notVerified_title");
		message.innerHTML = browser.i18n.getMessage("notVerified_message").replace("%s", domain);
	} else if (m.state == "canting") {
		title.innerHTML = browser.i18n.getMessage("canting_title");
		message.innerHTML = browser.i18n.getMessage("canting_message").replace("%s", domain);
	} else if (m.state == "unknownVerifier") {
		title.innerHTML = browser.i18n.getMessage("verifierNotKnown_title");
		message.innerHTML = browser.i18n.getMessage("verifierNotKnown_message").replace("%s", domain);
	} else if (m.state == "pendingVerification") {
		title.innerHTML = browser.i18n.getMessage("pendingVerification_title");
		message.innerHTML = browser.i18n.getMessage("pendingVerification_message").replace("%s", domain);
	} else {
		title.innerHTML = browser.i18n.getMessage("notSupported_title");
		message.innerHTML = browser.i18n.getMessage("notSupported_message").replace("%s", domain);
	}
	document.body.classList.add("unverified");
}
function refreshData() {
	let activeTab = browser.tabs.query({active: true});
	activeTab.then(sendToBackground, function(error) {return false});
}
document.getElementById("refreshBtn").addEventListener("click", refreshData);
document.getElementById("refreshBtn").innerHTML = browser.i18n.getMessage("refreshDataBtn");
refreshData();
