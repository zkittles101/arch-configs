!function(e){"use strict";try{chrome.extension.getBackgroundPage().tgs.setViewGlobals(e)}catch(e){return void window.setTimeout((()=>window.location.reload()),1e3)}function t(e){document.getElementById("restartExtensionBtn").onclick=async function(e){const t=await gsSession.buildCurrentSession();if(t){var n=chrome.runtime.getManifest().version;await gsIndexedDb.createOrUpdateSessionRestorePoint(t,n)}chrome.runtime.reload()}}gsUtils.documentReadyAndLocalisedAsPromsied(document).then((function(){document.getElementById("sessionManagerLink").onclick=function(e){e.preventDefault(),chrome.tabs.create({url:chrome.extension.getURL("html/history.html")}),t()},t(),document.getElementById("exportBackupBtn").onclick=async function(e){const n=await gsSession.buildCurrentSession();historyUtils.exportSession(n,(function(){document.getElementById("exportBackupBtn").style.display="none",t()}))};var e=chrome.runtime.getManifest().version;gsIndexedDb.fetchSessionRestorePoint(e).then((function(e){e||(gsUtils.warning("update","Couldnt find session restore point. Something has gone horribly wrong!!"),document.getElementById("noBackupInfo").style.display="block",document.getElementById("backupInfo").style.display="none",document.getElementById("exportBackupBtn").style.display="none")}))}))}(this);