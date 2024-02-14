import { EventType } from '../types.js';
import { _ } from '../Localizer.js';

function setHeightAsElem(elem) {
  let childrenHeight = 0;
  for (let i = 0; i != elem.children.length; i++) {
    childrenHeight += elem.children[i].offsetHeight;
  }
  let newHeight = childrenHeight + 80;
  chrome.windows.getCurrent(function (current) {
    if (current) {
      chrome.windows.update(current.id, {
        height: newHeight,
      });
    }
  });
}

const AlertModule = function (fvdSynchronizer) {
  fvdSynchronizer.addEventListener(EventType.LOAD, function () {
    function getUrlVars() {
      let vars = {};
      let parts = window.location.href.split('?')[1].split('&');
      for (let i in parts) {
        let val = parts[i].split('=');
        vars[val[0]] = val[1];
      }
      return vars;
    }

    let SpecialWindows = new (function () {
      this.needSyncSoftware = function () {
        document.getElementById('specialMessage_needSyncSoftware').removeAttribute('hidden');
        document.title = _('alert_window_need_sync_software_title');

        document.querySelector('.doDownloadAndInstallEversyncDesktop').addEventListener(
          'click',
          function () {
            chrome.tabs.create({
              url: 'https://everhelper.me/eversyncdesktop',
              active: true,
            });
            window.close();
          },
          false
        );
        document
          .querySelector('#specialMessage_needSyncSoftware .dontDisplayAgain')
          .addEventListener(
            'change',
            function (ev) {
              if (ev.target.checked) {
                fvdSynchronizer.Prefs.set('dont_display_alert_sync_software', true);
              } else {
                fvdSynchronizer.Prefs.set('dont_display_alert_sync_software', false);
              }
            },
            false
          );
      };

      this.cannotMovieUnsorted = function () {
        document.getElementById('specialMessage_cannotMovieUnsorted').removeAttribute('hidden');
        document.title = _('alert_window_remove_unsorted_folder_title');

        document
          .querySelector('#specialMessage_cannotMovieUnsorted .buttons .main')
          .addEventListener('click', function () {
            window.close();
          });
      };

      this.syncQuotaExceed = function () {
        document.getElementById('specialMessage_syncQuotaExceed').removeAttribute('hidden');
        document.title = _('dlg_alert_sync_quota_exceed_title');

        let quota = null;

        if (vars.count) {
          vars.category = vars.category || 'bookmarks_count';

          fvdSynchronizer.Utils.Async.chain([
            function (chainCallback) {
              fvdSynchronizer.Server.Sync.getQuota(function (error, _data) {
                quota = _data;

                chainCallback();
              });
            },

            function (chainCallback) {
              document.querySelector('#specialMessage_syncQuotaExceed .uploadAttempt').textContent =
                vars.count;

              chainCallback();
            },

            function (chainCallback) {
              document.querySelector('#specialMessage_syncQuotaExceed .alreadyItems').textContent =
                quota[vars.category]['count_'];

              chainCallback();
            },

            function (chainCallback) {
              document.querySelector('#specialMessage_syncQuotaExceed .maxItems').textContent =
                quota[vars.category][''];

              chainCallback();
            },

            function (chainCallback) {
              document.querySelector(
                '#specialMessage_syncQuotaExceed .maxItemsTrashed'
              ).textContent = quota[vars.category]['trashed'];

              chainCallback();
            },

            function () {
              document
                .querySelector('#specialMessage_syncQuotaExceed .limits')
                .removeAttribute('hidden');

              setHeightAsElem(document.getElementById('specialMessage_syncQuotaExceed'));
            },
          ]);
        }

        document.querySelector('#specialMessage_syncQuotaExceed .buttons .main').addEventListener(
          'click',
          function () {
            fvdSynchronizer.Server.Sync.loginInAdminPanel(function (result) {
              chrome.tabs.create({
                url: 'https://everhelper.me/client/?l=/components/MainOptions/quota',
                active: true,
              });
            });

            return false;
          },
          false
        );
      };

      this.actionAfterPluginSync = function () {
        document.getElementById('specialMessage_actionAfterPluginSync').removeAttribute('hidden');
        document.title = _('alert_window_action_after_plugin_sync_title');

        document
          .querySelector('#specialMessage_actionAfterPluginSync .buttons .main')
          .addEventListener('click', function () {
            window.close();
          });

        let cb = document.querySelector('#specialMessage_actionAfterPluginSync .dontDisplayAgain');
        cb.addEventListener('click', function () {
          setTimeout(function () {
            fvdSynchronizer.Prefs.set('dont_display_after_plugin_sync_action_alert', cb.checked);
          }, 0);
        });
      };

      this.restartAfterPluginSync = function () {
        document.getElementById('specialMessage_restartAfterPluginSync').removeAttribute('hidden');
        document.title = _('alert_window_must_restart_after_large_sync_title');

        document
          .querySelector('#specialMessage_restartAfterPluginSync .buttons .main')
          .addEventListener('click', function () {
            window.close();
          });
      };

      this.largeSyncConfirm = function () {
        document.getElementById('specialMessage_largeSyncConfirm').removeAttribute('hidden');

        document.title = _('alert_window_large_sync_title');

        document
          .querySelector('#specialMessage_largeSyncConfirm .buttons .main')
          .addEventListener('click', function () {
            fvdSynchronizer.Observer.fireSingleEvent(vars.eventId, [true]);

            window.close();
          });

        document
          .querySelector('#specialMessage_largeSyncConfirm .buttons .cancel')
          .addEventListener('click', function () {
            fvdSynchronizer.Observer.fireSingleEvent(vars.eventId, [false]);

            window.close();
          });

        window.onbeforeunload = function () {
          fvdSynchronizer.Observer.fireSingleEvent(vars.eventId, [false]);
        };
      };
    })();

    let vars = getUrlVars();

    if (vars.type) {
      SpecialWindows[vars.type]();
    } else {
      if (vars.title) {
        document.title = decodeURIComponent(vars.title);
      }

      if (vars.text) {
        let container = document.getElementById('alertContentSimple');

        container.removeAttribute('hidden');

        container.querySelector('.fvdButton').addEventListener(
          'click',
          function () {
            if (vars.btn_link) {
              chrome.tabs.create({
                url: decodeURIComponent(vars.btn_link),
                active: true,
              });
            }

            window.close();
          },
          false
        );

        document.getElementById('simpleText').innerHTML = decodeURIComponent(vars.text);
        if (String(vars.text).indexOf('%3Cb') !== -1) {
          document.getElementById('simpleText').className = 'weight-normal';
        }
        document.getElementsByTagName('body')[0].className = 'simple';
      }

      if (vars.btn_text) {
        let buttons = document.getElementById('alertContentSimple').querySelectorAll('.fvdButton');
        for (let k in buttons) {
          if (buttons[k]) {
            buttons[k].innerHTML = decodeURIComponent(vars.btn_text);
            if (typeof buttons[k].removeAttribute == 'function') buttons[k].removeAttribute('msg');
          }
        }
      }
    }

    fvdSynchronizer.Localizer.localizeCurrentPage();

    setTimeout(function () {
      let texts = document.querySelectorAll('.alertContent > .text');
      for (let i = 0; i != texts.length; i++) {
        let text = texts[i];
        if (text.offsetHeight < 40) {
          text.style.height = '40px';
        }
      }
    }, 0);
  });
};

export default AlertModule;
