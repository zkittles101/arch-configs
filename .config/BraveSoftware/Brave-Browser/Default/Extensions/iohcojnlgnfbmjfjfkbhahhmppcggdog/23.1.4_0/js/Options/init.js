import { EventType } from '../types.js';

let tab_account = null;
let tab_speeddial = null;
let tab_bookmarks = null;
let tab_backups = null;
let tab_backups_server = null;
let tab_backups_local = null;
let tab_customs = null;

var backupsPrevOpened = 'backups_server';

// get sections
var login_section = null;
var manual_speed = null;
var manual_bookmarks = null;
var restore_section = null;
var backup_frame_src = null;

//account open
function account_open(sub, fvdSynchronizer) {
  tab_account.className += ' tab_pressed';
  login_section.className = 'section_open';

  tab_speeddial.className = 'tab tab_blue tab_speeddial';
  tab_bookmarks.className = 'tab tab_green tab_bookmarks';
  tab_backups.className = 'tab tab_yellow tab_backups';

  manual_speed.className = '';
  manual_bookmarks.className = '';
  restore_section.className = '';

  fvdSynchronizer.Options.loadAccountFrame();
}

//speed dial open
function speeddial_open(sub, fvdSynchronizer) {
  tab_speeddial.className += ' tab_pressed';
  manual_speed.className = 'section_open';

  tab_account.className = 'tab tab_violet tab_account';
  tab_bookmarks.className = 'tab tab_green tab_bookmarks';
  tab_backups.className = 'tab tab_yellow tab_backups';

  login_section.className = '';
  manual_bookmarks.className = '';
  restore_section.className = '';
}

//bookmarks open
function bookmarks_open(sub, fvdSynchronizer) {
  tab_bookmarks.className += ' tab_pressed';
  manual_bookmarks.className = 'section_open';

  tab_account.className = 'tab tab_violet tab_account';
  tab_speeddial.className = 'tab tab_blue tab_speeddial';
  tab_backups.className = 'tab tab_yellow tab_backups';

  login_section.className = '';
  manual_speed.className = '';
  restore_section.className = '';
}

//backups open
function backups_open(sub, fvdSynchronizer) {
  if (sub == 'backups_prev') {
    sub = backupsPrevOpened;
  }

  tab_backups.className += ' tab_pressed';
  restore_section.className = 'section_open';

  tab_account.className = 'tab tab_violet tab_account';
  tab_speeddial.className = 'tab tab_blue tab_speeddial';
  tab_bookmarks.className = 'tab tab_green tab_bookmarks';
  login_section.className = '';
  manual_speed.className = '';
  manual_bookmarks.className = '';

  var restoreSection = document.getElementById('restore_section');

  var subsectionServer = document.getElementById('subsectionBackupsServer');
  var subsectionLocal = document.getElementById('subsectionBackupsLocal');
  var subsectionCustoms = document.getElementById('subsectionBackupsCustoms');

  var customsLink = document.getElementById('customsLink');
  var localBackupsLink = document.getElementById('localBackupsLink');
  var serverBackupsLink = document.getElementById('serverBackupsLink');

  restoreSection.setAttribute('sub', sub);

  subsectionServer.setAttribute('hidden', 1);
  subsectionLocal.setAttribute('hidden', 1);
  subsectionCustoms.setAttribute('hidden', 1);
  customsLink.removeAttribute('active');
  serverBackupsLink.removeAttribute('active');
  localBackupsLink.removeAttribute('active');

  if (sub == 'backups_customs') {
    subsectionCustoms.removeAttribute('hidden');
    customsLink.setAttribute('active', 1);
    fvdSynchronizer.Customs.ui.getGlobalState();
  } else if (sub == 'backups_local') {
    subsectionLocal.removeAttribute('hidden');
    localBackupsLink.setAttribute('active', 1);
    backupsPrevOpened = sub;
  } else {
    subsectionServer.removeAttribute('hidden');
    serverBackupsLink.setAttribute('active', 1);
    backupsPrevOpened = sub;
    setBackupFrameSrc();
  }
}

function setBackupFrameSrc() {
  var srcAuth = 'https://everhelper.me/client/stats?addon=chrome_sync';
  var srcBackups =
    'https://everhelper.me/client/settings_inc?tab=backups&no_close=true&no_tab_navigation=true&no_pro_button=true&no_dialog=true';

  var iframe = document.getElementById('backupFrame');
  fvdSynchronizer.Server.Sync.getAuthState(function (error, authorized) {
    var src = authorized ? srcBackups : srcAuth;

    if (src != backup_frame_src) {
      iframe.setAttribute('src', src);
      backup_frame_src = src;
    }
  });
}

export const switchTabs = {
  account: account_open,
  speeddial: speeddial_open,
  bookmarks: bookmarks_open,
  backups: backups_open,
};

const OptionsInit = function (fvdSynchronizer) {
  fvdSynchronizer.addEventListener(
    EventType.LOAD,
    function () {
      // get tabs buttons
      tab_account = document.getElementById('tabHeadAccount');
      tab_speeddial = document.getElementById('tabHeadSync');
      tab_bookmarks = document.getElementById('tabHeadSyncBookmarks');
      tab_backups = document.getElementById('tabHeadBackupHistory');

      tab_backups_server = document.getElementById('serverBackupsLink');
      tab_backups_local = document.getElementById('localBackupsLink');
      tab_customs = document.getElementById('customsLink');

      tab_account.addEventListener(
        'click',
        function () {
          fvdSynchronizer.Options.setTab('account');
        },
        false
      );
      tab_speeddial.addEventListener(
        'click',
        function () {
          fvdSynchronizer.Options.setTab('speeddial');
        },
        false
      );
      tab_bookmarks.addEventListener(
        'click',
        function () {
          fvdSynchronizer.Options.setTab('bookmarks');
        },
        false
      );
      tab_backups.addEventListener(
        'click',
        function () {
          fvdSynchronizer.Options.setTab('backups');
        },
        false
      );
      tab_backups_server.addEventListener(
        'click',
        function () {
          fvdSynchronizer.Options.setTab('backups_server');
        },
        false
      );
      tab_backups_local.addEventListener(
        'click',
        function () {
          fvdSynchronizer.Options.setTab('backups_local');
        },
        false
      );
      if (tab_customs)
        tab_customs.addEventListener(
          'click',
          function () {
            fvdSynchronizer.Options.setTab('backups_customs');
          },
          false
        );

      login_section = document.getElementById('login_section');
      manual_speed = document.getElementById('manual_speed');
      manual_bookmarks = document.getElementById('manual_bookmarks');
      restore_section = document.getElementById('restore_section');

      var howToUseBtn = document.querySelector('#topButtons .how-to-use-button');
      howToUseBtn.addEventListener(
        'click',
        function () {
          var url = 'https://nimbusweb.me/s/share/3610278/z38gs6ke4x29wfbv9iw7';
          if (
            fvdSynchronizer.Utils.browserLocaleIs('ru') ||
            fvdSynchronizer.Utils.browserLocaleIs('uk') ||
            fvdSynchronizer.Utils.browserLocaleIs('ua') ||
            fvdSynchronizer.Utils.browserLocaleIs('kz') ||
            fvdSynchronizer.Utils.browserLocaleIs('uz') ||
            fvdSynchronizer.Utils.browserLocaleIs('by')
          ) {
            url = 'https://nimbusweb.me/s/share/3624488/22fcw5loqfl7yl3v1vm2';
          }
          window.open(url);
        },
        false
      );
    },
    false
  );
};

export default OptionsInit;
