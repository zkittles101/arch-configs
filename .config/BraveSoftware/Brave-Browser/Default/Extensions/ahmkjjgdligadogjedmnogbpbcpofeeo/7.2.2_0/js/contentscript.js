!function(){"use strict";let e=!1,t=!1,o=!1,n=!1;function r(e){if(!t&&!n&&event.keyCode>=48&&event.keyCode<=90&&event.target.tagName&&("INPUT"===event.target.tagName.toUpperCase()||"TEXTAREA"===event.target.tagName.toUpperCase()||"FORM"===event.target.tagName.toUpperCase()||!0===event.target.isContentEditable)){if(t=!0,!function(){try{var e=chrome.runtime.connect();return!!e&&(e.disconnect(),!0)}catch(e){return!1}}())return!1;chrome.runtime.sendMessage(i())}}function s(){chrome.runtime.onMessage.addListener((function(s,c,a){return s.hasOwnProperty("action")&&"requestInfo"===s.action?(a(i()),!1):(s.hasOwnProperty("scrollPos")&&""!==s.scrollPos&&"0"!==s.scrollPos&&(document.body.scrollTop=s.scrollPos,document.documentElement.scrollTop=s.scrollPos),s.hasOwnProperty("ignoreForms")&&(o=s.ignoreForms,o&&(e||(window.addEventListener("keydown",r),e=!0)),t=t&&o),s.hasOwnProperty("tempWhitelist")&&(t&&!s.tempWhitelist&&(t=!1),n=s.tempWhitelist),a(i()),!1)}))}function i(){return{action:"reportTabState",status:o&&t?"formInput":n?"tempWhitelist":"normal",scrollPos:document.body.scrollTop||document.documentElement.scrollTop||0}}(function e(t){return t=t||0,new Promise((e=>e(chrome.runtime))).then((o=>o?Promise.resolve():t>3?Promise.reject("Failed waiting for chrome.runtime"):(t+=1,new Promise((e=>window.setTimeout(e,500))).then((()=>e(t))))))})().then(s).catch((e=>{setTimeout((()=>{s()}),200)}))}();