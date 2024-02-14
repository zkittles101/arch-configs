/*
##
##  Enhancer for YouTube™
##  =====================
##
##  Author: Maxime RF <https://www.mrfdev.com>
##
##  This file is protected by copyright laws and international copyright
##  treaties, as well as other intellectual property laws and treaties.
##
##  All rights not expressly granted to you are retained by the author.
##  Read the license.txt file for more details.
##
##  © MRFDEV.com - All Rights Reserved
##
*/
(function(){function C(){chrome.storage.local.get({blockads:!0,blockadsexceptforsubs:!1,blockautoplay:!0,blockhfrformats:!1,blockwebmformats:!1,controlspeed:!0,controlspeedmousebutton:!1,controlvolume:!1,controlvolumemousebutton:!1,customcolors:{"--main-color":"#00adee","--main-background":"#111111","--second-background":"#181818","--hover-background":"#232323","--main-text":"#eff0f1","--dimmer-text":"#cccccc","--shadow":"#000000"},customcssrules:"",customtheme:!1,darktheme:!1,defaultvolume:!1,
disableautoplay:!1,hidecardsendscreens:!1,hidechat:!1,hidecomments:!1,hiderelated:!1,ignoreplaylists:!0,ignorepopupplayer:!0,overridespeeds:!0,pauseforegroundtab:!1,pausevideos:!0,qualityembeds:"medium",qualityembedsfullscreen:"hd1080",qualityplaylists:"hd720",qualityvideos:"hd720",reversemousewheeldirection:!1,selectquality:!1,selectqualityfullscreenoff:!1,selectqualityfullscreenon:!1,speed:1,speedvariation:.1,stopvideos:!1,theme:"default-dark",themevariant:"youtube-deep-dark.css",volume:50,volumevariation:5,
whitelist:""},function(h){var c=document.createElement("script");c.textContent="("+function(q){document.dispatchEvent(new CustomEvent("efyt-update-preferences",{detail:{prefs:q}}))}.toString()+")("+JSON.stringify(h)+")";document.head.appendChild(c);c.remove()})}chrome.runtime.onMessage.addListener(function(h,c,q){"pause-video"===h.message&&document.hidden&&document.dispatchEvent(new Event("efyt-pause-video"))});chrome.storage.onChanged.addListener(C);document.addEventListener("efyt-get-preferences",
C);document.addEventListener("efyt-pause-videos",function(h){try{chrome.runtime.sendMessage({request:"pause-videos"})}catch(c){}});var x=document.createElement("script");x.textContent="("+function(h,c,q){if(!h.EnhancerForYouTube&&!h.efyt){h.efyt=!0;function r(){try{var e=d.getAvailableQualityLevels(),b=c.fullscreenElement?a.qualityembedsfullscreen:a.qualityembeds;0<=e.indexOf(b)?d.setPlaybackQualityRange(b,b):d.setPlaybackQualityRange(e[0],e[0]);y=!0}catch(f){}}function z(){l.setAttribute("style",
"display:block!important");clearTimeout(D);D=setTimeout(function(){l.setAttribute("style","display:none!important")},1500)}function E(){var e=c.querySelector(".ytp-popup.ytp-contextmenu");e&&0<e.getBoundingClientRect().height&&(e.style.display="none");c.body.classList.remove("ytp-contextmenu-hidden")}function F(){var e=c.createElement("style");e.type="text/css";e.textContent="#efyt-player-info{background-color:rgba(0,0,0,0.3);color:#fff;display:none;font-size:17px;left:0;padding:7px 0;position:absolute;text-align:center;top:0;width:100%;z-index:2147483647} body.ytp-contextmenu-hidden .ytp-contextmenu{visibility:hidden!important} .ytp-pause-overlay-hidden .ytp-pause-overlay{display:none!important}";
c.head.appendChild(e);l=c.createElement("div");l.id="efyt-player-info";d.appendChild(l);d.addEventListener("onStateChange",function(b){1!==b||!a.pausevideos||a.ignorepopupplayer||c.hidden||A||(A=!0,c.dispatchEvent(new Event("efyt-pause-videos")),setTimeout(function(){A=!1},1E3));1!==b&&3!==b||!a.selectquality||y||r();1===b?k.classList.add("ytp-pause-overlay-hidden"):2===b?setTimeout(function(){d.classList.remove("ytp-expand-pause-overlay");k.classList.remove("ytp-pause-overlay-hidden")},1E3):0===
b&&(y=!1)});k.classList.add("ytp-pause-overlay-hidden");k.addEventListener("wheel",function(b){if(!d.classList.contains("ytp-settings-shown")&&!d.classList.contains("ytp-menu-shown"))if(b.ctrlKey&&a.controlspeed&&(a.controlspeedmousebutton&&t||!a.controlspeedmousebutton)){b.preventDefault();try{if(a.overridespeeds){var f=g.playbackRate;if(!a.reversemousewheeldirection&&0<b.deltaY||a.reversemousewheeldirection&&0>b.deltaY)f=parseFloat((f-a.speedvariation).toFixed(2)),0>=f&&(f=a.speedvariation),g.playbackRate=
f;else if(!a.reversemousewheeldirection&&0>b.deltaY||a.reversemousewheeldirection&&0<b.deltaY)f=parseFloat((f+a.speedvariation).toFixed(2)),g.playbackRate=f}else{var u=d.getAvailablePlaybackRates();f=d.getPlaybackRate();var v=u.indexOf(f);(!a.reversemousewheeldirection&&0<b.deltaY||a.reversemousewheeldirection&&0>b.deltaY)&&0<v?(f=u[v-1],d.setPlaybackRate(f)):(!a.reversemousewheeldirection&&0>b.deltaY||a.reversemousewheeldirection&&0<b.deltaY)&&v<u.length-1&&(f=u[v+1],d.setPlaybackRate(f))}n=!0;l.textContent=
f+"x";z()}catch(H){}}else if(a.controlvolume&&(a.controlvolumemousebutton&&t||!a.controlvolumemousebutton)){b.preventDefault();try{var m=d.getVolume();!a.reversemousewheeldirection&&0<b.deltaY||a.reversemousewheeldirection&&0>b.deltaY?(m-=a.volumevariation,0>m&&(m=0)):(m+=a.volumevariation,100<m&&(m=100),d.isMuted()&&d.unMute());p=!0;d.setVolume(m);l.textContent=m;z()}catch(H){}}});k.addEventListener("mousedown",function(b){2===b.button&&(a.controlvolumemousebutton||a.controlspeedmousebutton)&&(t=
!0,c.body.classList.add("ytp-contextmenu-hidden"))},!0);k.addEventListener("mouseup",function(b){2===b.button&&(a.controlvolumemousebutton||a.controlspeedmousebutton)&&(t=!1,G?p||n?setTimeout(E,500):c.body.classList.remove("ytp-contextmenu-hidden"):(p||n?(w=!0,setTimeout(E,500)):(w=!1,c.body.classList.remove("ytp-contextmenu-hidden")),p=n=!1))},!0);k.addEventListener("mouseleave",function(){t=p=n=!1;c.body.classList.remove("ytp-contextmenu-hidden")});k.addEventListener("contextmenu",function(b){if(G&&
(a.controlvolumemousebutton&&p||a.controlspeedmousebutton&&n))return b.stopPropagation(),b.preventDefault(),p=n=!1;if((a.controlvolumemousebutton||a.controlspeedmousebutton)&&w)return b.preventDefault(),w=!1},!0);g.addEventListener("click",function(b){if(b.ctrlKey){b.preventDefault();try{var f=b.shiftKey?1:a.speed;a.overridespeeds?g.playbackRate=f:d.setPlaybackRate(f);l.textContent=f+"x";z()}catch(u){}}});a.defaultvolume&&d.setVolume(a.volume);a.overridespeeds?(g.playbackRate=a.speed,g.defaultPlaybackRate=
a.speed):d.setPlaybackRate(a.speed)}c.addEventListener("efyt-update-preferences",function(e){a=e.detail.prefs;d&&(a.selectquality&&r(),a.defaultvolume&&d.setVolume(a.volume),a.overridespeeds?(g.playbackRate=a.speed,g.defaultPlaybackRate=a.speed):d.setPlaybackRate(a.speed))});c.addEventListener("efyt-pause-video",function(e){a.ignorepopupplayer||d.pauseVideo()});var B;"onfullscreenchange"in c?B="fullscreenchange":"onmozfullscreenchange"in c&&(B="mozfullscreenchange");c.addEventListener(B,function(e){setTimeout(function(){d&&
c.fullscreenElement&&a.selectquality&&a.selectqualityfullscreenon?r():d&&!c.fullscreenElement&&a.selectquality&&a.selectqualityfullscreenoff&&r()},500)});var G="Win32"===navigator.platform||"Win64"===navigator.platform,t=!1,n=!1,p=!1,y,A,w,D,l,g;try{var a=JSON.parse(localStorage.getItem("enhancer-for-youtube"))||{}}catch(e){a={},q||c.dispatchEvent(new Event("efyt-get-preferences"))}q&&c.dispatchEvent(new Event("efyt-get-preferences"));"undefined"===typeof a.controlspeed&&(a.controlspeed=!0);"undefined"===
typeof a.ignorepopupplayer&&(a.ignorepopupplayer=!0);"undefined"===typeof a.overridespeeds&&(a.overridespeeds=!0);"undefined"===typeof a.pausevideos&&(a.pausevideos=!0);a.qualityembeds||(a.qualityembeds="medium");a.qualityembedsfullscreen||(a.qualityembedsfullscreen="hd1080");a.speed||(a.speed=1);a.volume||(a.volume=50);a.volumevariation||(a.volumevariation=5);a.whitelist||(a.whitelist="");if("complete"===c.readyState)if(g=c.querySelector(".html5-main-video")){var d=g.parentNode.parentNode;var k=
d.parentNode;F()}else c.location.reload();HTMLVideoElement.prototype.play=function(e){return function(){!this.hasAttribute("efyt")&&this.classList.contains("html5-main-video")&&(this.setAttribute("efyt",""),g=this,d=this.parentNode.parentNode,k=d.parentNode,a.selectquality&&r(),F());return e.apply(this,arguments)}}(HTMLVideoElement.prototype.play);h.MediaSource&&(MediaSource.isTypeSupported=function(e){return function(b){return a.blockhfrformats&&/framerate=([4-6]\d|\d{3,})/.test(b)||a.blockwebmformats&&
/video\/webm/.test(b)?!1:e(b)}}(MediaSource.isTypeSupported))}}.toString()+")(window, document, "+chrome.extension.inIncognitoContext+")";document.documentElement.appendChild(x);x.remove()})();