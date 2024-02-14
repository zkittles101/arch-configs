import { _ } from '../Localizer.js';

const ServerConnectionModule = function (fvdSynchronizer) {
  var BLOCKED_COOKIES_EN =
    'https://everhelper.desk.com/customer/en/portal/articles/2963404-why-do-i-get-an-%22incorrect-username-or-password%22-error-in-google-chrome-';
  var BLOCKED_COOKIES_RU =
    'https://everhelper.desk.com/customer/portal/articles/2963403-%D0%9F%D0%BE%D1%87%D0%B5%D0%BC%D1%83-%D0%B2%D0%BE%D0%B7%D0%BD%D0%B8%D0%BA%D0%B0%D0%B5%D1%82-%D0%BE%D1%88%D0%B8%D0%B1%D0%BA%D0%B0-%22%D0%9D%D0%B5%D0%BF%D1%80%D0%B0%D0%B2%D0%B8%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9-%D0%BB%D0%BE%D0%B3%D0%B8%D0%BD-%D0%B8%D0%BB%D0%B8-%D0%BF%D0%B0%D1%80%D0%BE%D0%BB%D1%8C%22-%D0%B2-google-chrome-?b_id=11251';

  var Errors = fvdSynchronizer.Errors;

  function SyncRequest(aData = {}, aCallback, form) {
    function encodeRequest(requestData) {
      return JSON.stringify(requestData);
    }

    function decodeResponse(responseData) {
      return JSON.parse(responseData);
    }

    aData._client_software = 'chrome_addon';

    const data = encodeRequest(aData);
    let url = 'https://sync-eh.everhelper.me';
    if (form && aData.action) {
      url += '/' + aData.action;
    }

    const params = {
      method: 'post',
      credentials: 'same-origin',
      headers: {
        'EverHelper-Token': fvdSynchronizer.Server.Connection.getCurrentToken(),
        'X-Client-Version': chrome.runtime.getManifest().version,
      },
    };
    if (form) {
      params.body = form;
      // params.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      // params.headers['Content-Type'] = 'multipart/form-data'; // will set automatically
    } else {
      params.headers['Content-Type'] = 'application/json';
      params.body = data;
    }

    const request = new Request(url, params);

    fetch(request)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data && data.errorCode) {
          if (
            data.errorCode == fvdSynchronizer.Errors.ERROR_AUTH_FAILED &&
            aData.action != 'user_exists' &&
            aData.action != 'user:logout'
          ) {
            fvdSynchronizer.Server.Sync.activityState(function (state) {
              if (state == 'logged') {
                fvdSynchronizer.Server.Sync.setActivityState('not_logged');
                const isNoHostPremission = fvdSynchronizer.Server.Sync.isNoHostPremission();
                if (isNoHostPremission) {
                  fvdSynchronizer.Dialogs.alertWindow(
                    _('dlg_alert_wrong_login_password_title'),
                    _('dlg_alert_wrong_login_password_text'),
                    {
                      single: true,
                    }
                  );
                } else {
                  console.warn('Check third party cookies');
                }
              }
            });
          }
        }
        aCallback(data.errorCode, data.body);
      })
      .catch(function (err) {
        console.warn(err);
        aCallback(Errors.ERROR_CONNECTION_ERROR);
      })
      .finally(() => {});
  }

  var Connection = function () {
    var currentToken = '';

    this.setCurrentToken = function (token) {
      currentToken = token;
    };

    this.getCurrentToken = function () {
      return currentToken;
    };

    this.request = function (data, callback, form) {
      new SyncRequest(data, callback, form);
    };

    this.simpleRequest = function (url, method, data, callback) {
      const params = {
        method,
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const request = new Request(url, params);
      fetch(request)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          callback(data);
        })
        .catch(function (err) {
          callback(null);
        });
    };

    this.get = function (url, callback) {
      return this.simpleRequest(url, 'GET', null, callback);
    };

    this.post = function (url, dataString, callback) {
      return this.simpleRequest(url, 'POST', dataString, callback);
    };
  };

  fvdSynchronizer.Server.Connection = new Connection();
};

export default ServerConnectionModule;
