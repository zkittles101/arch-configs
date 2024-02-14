(function () {
  // setup
  var WELCOME_URL = 'https://nimbus.everhelper.me/app-update/misc.php?v={VERSION}',
    BADGE_TEXT = 'new!';
  // end setup

  var LAST_VERSION_KEY = 'welcomemod:lastversion',
    SHOULD_SHOW_WELCOME_KEY = 'welcomemode:show_welcome',
    restoreData = null;

  chrome.runtime.onInstalled.addListener(function (info) {
    if (info.reason == 'update') {
      // localStorage[SHOULD_SHOW_WELCOME_KEY] = '1';
      chrome.storage.local.set({ SHOULD_SHOW_WELCOME_KEY: '1' });
    } else if (info.reason == 'install') {
      openWelcomeUrl();
    }
  });

  var WELCOME_URL_EN = 'https://www.everhelper.me/eversyncmanual.php',
    WELCOME_URL_RU = 'https://www.everhelper.me/eversyncmanualru.php';

  function openWelcomeUrl() {
    chrome.i18n.getAcceptLanguages(function (languages) {
      let URL;

      if (languages.indexOf('ru') != -1) {
        URL = WELCOME_URL_RU;
      } else {
        URL = WELCOME_URL_EN;
      }

      chrome.tabs.create({
        url: URL,
        active: true,
      });
    });
  }
})();
