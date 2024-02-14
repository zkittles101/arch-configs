import { EventType } from './types.js';

const ButtonControllerModule = function (fvdSynchronizer) {
  var ButtonController = function () {
    function refreshButton() {
      fvdSynchronizer.Server.Sync.activityState(function (activityState) {
        var image = '/images/icons/24x24_nosync.png';
        if (activityState === 'logged') {
          image = '/images/icons/24x24.png';
          switch (fvdSynchronizer.Server.Sync.syncState()) {
            case 'sync':
              image = '/images/icons/24x24_sync.png';
              break;
            case 'hasDataToSync':
              break;
          }
        }
        chrome.action.setIcon({
          path: image,
        });
      });
    }
    /*
    chrome.runtime.onMessage.addListener(function (request) {
      if (request.subject == 'changeSyncState') {
        refreshButton();
      }
    });
    */

    this.refreshButton = function () {
      refreshButton();
    };

    fvdSynchronizer.addEventListener(
      EventType.LOAD,
      function () {
        refreshButton();
      },
      false
    );
  };

  fvdSynchronizer.Observer.registerCallback('event:login', function () {
    fvdSynchronizer.ButtonController.refreshButton();
  });
  fvdSynchronizer.Observer.registerCallback('event:logout', function () {
    fvdSynchronizer.ButtonController.refreshButton();
  });

  fvdSynchronizer.ButtonController = new ButtonController();
};

export default ButtonControllerModule;
