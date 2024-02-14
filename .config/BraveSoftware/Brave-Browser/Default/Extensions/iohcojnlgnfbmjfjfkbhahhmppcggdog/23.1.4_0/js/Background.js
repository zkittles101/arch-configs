import { EventType } from './types.js';

const BackgroundModule = function (fvdSynchronizer) {
  this.Background = new (function () {
    fvdSynchronizer.addEventListener(
      EventType.LOAD,
      function () {
        // refresh setting tabs
        chrome.tabs.query(
          {
            url: chrome.runtime.getURL('options.html'),
          },
          function (tabs) {
            tabs.forEach(function (tab) {
              chrome.tabs.reload(tab.id);
            });
          }
        );

        fvdSynchronizer.Utils.isVersionChanged((versionChanged) => {
          if (versionChanged) {
            // reset display chrome sync message
            fvdSynchronizer.Prefs.set('dont_display_ds_chromesync_message', false);
          }
        });

        // fvdSynchronizer.Localizer.localizeCurrentPage();

        function mainSyncChangeListener() {}

        // listen driver change state
        for (var driverName in fvdSynchronizer.Driver) {
          if (fvdSynchronizer.Driver[driverName].addChangeMainSyncStateListener) {
            fvdSynchronizer.Driver[driverName].addChangeMainSyncStateListener(
              mainSyncChangeListener
            );
          }
        }

        function setSyncAfterLogin() {
          for (var driverName in fvdSynchronizer.Driver) {
            if (fvdSynchronizer.Driver[driverName].setFirstSyncAfter) {
              fvdSynchronizer.Driver[driverName].setFirstSyncAfter('login');
            }
          }
        }

        function processRegisterEvent() {
          // user has been registered
          // upload data of all drivers to the server
          var drivers = Object.keys(fvdSynchronizer.Driver);
          fvdSynchronizer.Utils.Async.arrayProcess(drivers, function (driverName, next) {
            var driver = fvdSynchronizer.Driver[driverName];
            driver.isAllowed(function (allowed) {
              if (!allowed) {
                return next();
              }
              fvdSynchronizer.Utils.getOptionsPagesOpenedTabsIds(function (err, tabsIds) {
                if (!tabsIds || !tabsIds.length) {
                  driver.overwriteServerData(function () {
                    next();
                  });
                } else {
                  chrome.tabs.sendMessage(
                    tabsIds[0],
                    {
                      action: 'runSync',
                      driver: driverName,
                      type: 'overwriteServerData',
                    },
                    function () {
                      next();
                    }
                  );
                }
              });
            });
          });
        }

        fvdSynchronizer.Observer.registerCallback('event:login', setSyncAfterLogin);
        fvdSynchronizer.Observer.registerCallback('event:register', processRegisterEvent);
        fvdSynchronizer.Observer.registerCallback('event:logout', setSyncAfterLogin);

        fvdSynchronizer.Observer.registerCallback('event:openURL', function (data) {
          const { url } = data.hasOwnProperty('url') ? data : data[0];
          chrome.tabs.create({ url });
        });

        fvdSynchronizer.Server.Sync.getAuthState(function (error, authorized) {
          if (!authorized) {
            // user not authorized - be sure that auth cookie is removed
            fvdSynchronizer.Server.Sync.removeAuthCookie();
          }
        });
      },
      false
    );
  })();
};

export default BackgroundModule;
