!function(e){"use strict";try{chrome.extension.getBackgroundPage().tgs.setViewGlobals(e)}catch(e){return void window.setTimeout((()=>window.location.reload()),1e3)}function t(){document.getElementById("updating").style.display="none",document.getElementById("updated").style.display="block"}gsUtils.documentReadyAndLocalisedAsPromsied(document).then((function(){document.getElementById("updatedVersion").innerHTML="v"+chrome.runtime.getManifest().version,document.getElementById("sessionManagerLink").onclick=function(e){e.preventDefault(),chrome.tabs.create({url:chrome.extension.getURL("html/history.html")})};var e=gsSession.getUpdateType();"major"===e?(document.getElementById("patchMessage").style.display="none",document.getElementById("minorUpdateDetail").style.display="none"):"minor"===e?(document.getElementById("patchMessage").style.display="none",document.getElementById("majorUpdateDetail").style.display="none"):document.getElementById("updateDetail").style.display="none",gsSession.isUpdated()&&t()})),e.exports={toggleUpdated:t}}(this);