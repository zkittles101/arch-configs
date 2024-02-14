var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import '../../js/_external/jquery-3.6.1.min.js';
import { _ } from '../Localizer.js';
import { _b } from '../Utils.js';
import { Dialog } from '../Controls/simple-dialog.js';
function browserName() {
    return 'Chrome';
}
class CustomsUIModule {
    constructor(fvdSynchronizer) {
        this.DEV = true;
        this.ONCE = [];
        this.UI = {};
        this.state = {};
        this.pending = [];
        this.locale = {
            restore: _('customs_list_restore'),
            remove: _('customs_list_remove'),
            edit: _('customs_list_edit'),
            will_message: _('customs_will_backup_message'),
            will_list: _('customs_will_backup_list'),
        };
        let ts = this;
        this.fvdSynchronizer = fvdSynchronizer;
        this.actions = fvdSynchronizer.Customs.actions;
        $(() => {
            ts.state.DOMLoaded = true;
            ts.init();
        });
    }
    init() {
        let ts = this;
        ts.once('init');
    }
    once(action, callback) {
        let ts = this;
        if (ts.ONCE.indexOf(action) != -1)
            return;
        else
            ts.ONCE.push(action);
        switch (action) {
            case 'init':
                ts.state.initiated = true;
                ts.getUI();
                ts.listeners();
                ts.getGlobalState();
                break;
            default:
                if (callback)
                    callback();
        }
    }
    getUI() {
        let ts = this;
        let $WRAP = $('#customs-block');
        ts.UI = {
            $wrap: $WRAP,
            tabs: {
                $backup_main: $('#tabHeadBackupHistory'),
                $customs: $('#customsLink'),
                $backup: $('#prevBackupsLink'),
            },
            btns: {
                $create: $WRAP.find('#customs-create-btn'),
                $restore: $WRAP.find('#customs-restore-btn'),
                $login: $WRAP.find('#customs-login-btn'),
                $premium: $WRAP.find('#customs-premium-btn'),
            },
            progress: {
                $wrap: $WRAP.find('#customs-informer'),
                $info: $WRAP.find('#customs-informer .customs-informer-progress'),
                $reload: $WRAP.find('#customs-informer #customs-reload-btn'),
                $seconds: $WRAP.find('#customs-informer #customs-reload-btn t'),
            },
            $list: $WRAP.find('#customs-list'),
        };
    }
    listeners() {
        let ts = this;
        ts.UI.btns.$create.unbind('click').on('click', (e) => {
            ts.createConfirmation();
        });
        ts.UI.btns.$restore.unbind('click').on('click', (e) => {
        });
        ts.UI.$list.on('click', '.customs-list-icons i', (event) => {
            ts.actionsButton($(event.currentTarget));
        });
        ts.UI.$list.on('click', '.customs-list-button .button', (event) => {
            ts.actionsButton($(event.currentTarget));
        });
        ts.UI.progress.$reload.unbind('click').on('click', (e) => {
            ts.UI.progress.$reload.attr('disabled', 'disabled');
            ts.actions.reloadAllPages();
        });
        ts.UI.btns.$login.unbind('click').on('click', (e) => {
            $('#tabHeadAccount').trigger('click');
        });
        ts.UI.btns.$premium.unbind('click').on('click', (e) => {
            chrome.tabs.create({ url: 'https://everhelper.me/everhelperplansru.php' });
        });
    }
    tabsPrm() {
        let prm = true;
        if (this.fvdSynchronizer.Prefs.get('last_settings_tab_index') != 'backups_customs') {
            prm = false;
        }
        return prm;
    }
    getGlobalState() {
        let ts = this;
        if (!ts.state.DOMLoaded) {
            return;
        }
        if (!ts.tabsPrm()) {
            return;
        }
        let prevAuth = ts.state.auth;
        this.fvdSynchronizer.Utils.Async.chain([
            function (chainCallback) {
                ts.fvdSynchronizer.Driver.Speeddial.isAllowed(function (allowed) {
                    if (!allowed) {
                        ts.state.enabled = false;
                        $('#serverBackupsLink').trigger('click');
                    }
                    else {
                        ts.state.enabled = true;
                    }
                    chainCallback();
                });
            },
            function (chainCallback) {
                if (!ts.state.enabled)
                    chainCallback();
                else {
                    ts.fvdSynchronizer.Server.Sync.activityState(function (aState) {
                        if (aState !== 'logged') {
                            ts.state.auth = false;
                        }
                        else {
                            ts.state.auth = true;
                        }
                        chainCallback();
                    });
                }
            },
            function (chainCallback) {
                if (!ts.state.enabled || !ts.state.auth)
                    chainCallback();
                else {
                    ts.fvdSynchronizer.Server.Sync.userInfo(function (err, info) {
                        if (!err && info.premium.active) {
                            ts.state.pro = true;
                        }
                        else {
                            ts.state.pro = false;
                        }
                        chainCallback();
                    });
                }
            },
            function () {
                ts.draw(['enabled', 'auth']);
                if (true || prevAuth != ts.state.auth) {
                    ts.draw(['customs-list']);
                }
                else {
                    ts.draw('loading');
                }
            },
        ]);
    }
    draw(actions, mode) {
        return __awaiter(this, void 0, void 0, function* () {
            let ts = this;
            if (typeof actions != 'object') {
                actions = [actions || false];
            }
            if (typeof mode != 'object') {
                mode = { mode: mode || false };
            }
            for (let action of actions) {
                switch (action) {
                    case 'customs-list':
                        const list = [];
                        if (ts.state.auth) {
                            ts.draw('loading', true);
                            yield ts.actions.getList();
                            for (let item of ts.actions.list.items) {
                                let values = JSON.parse(item.value);
                                let $li = $('<li>')
                                    .addClass('customs-list-item')
                                    .attr('uuidHead', item.uuid)
                                    .attr('uuidData', values.uuidData)
                                    .attr('date', values.date)
                                    .css('order', -1 * parseInt(String(values.date).substr(2, 8)) || 0);
                                let $name = $('<span>').addClass('customs-list-name').text(values.name);
                                let $icons = $('<span>')
                                    .addClass('customs-list-icons')
                                    .append($('<i>')
                                    .attr('action', 'edit')
                                    .addClass('cicon cicon-edit')
                                    .attr('title', ts.locale.edit))
                                    .append($('<i>')
                                    .attr('action', 'remove')
                                    .addClass('cicon cicon-remove')
                                    .attr('title', ts.locale.remove));
                                let $button = $('<span>')
                                    .addClass('customs-list-button')
                                    .append($('<span>')
                                    .attr('action', 'restore')
                                    .addClass('button btn-mini btn-success')
                                    .append($('<span>').text(ts.locale.restore)));
                                $li.append($icons);
                                $li.append($name);
                                $li.append($button);
                                list.push($li);
                            }
                        }
                        ts.UI.$list.html('').append(list);
                        ts.draw(['empty', 'loading'], false);
                        break;
                    case 'highlight':
                        let max = 0;
                        ts.UI.$list.find('li').each((N, el) => {
                            const $el = $(el);
                            const date = parseInt(($el && $el.attr('date')) || '0');
                            max = Math.max(date, max);
                        });
                        let $last = ts.UI.$list.find(`li[date=${max}]`);
                        setTimeout(() => {
                            $last.addClass('transition').addClass('highlight');
                        }, 10);
                        setTimeout(() => {
                            $last.removeClass('highlight');
                            setTimeout(() => {
                                $last.removeClass('transition');
                            }, 1e3);
                        }, 15e2);
                        break;
                    case 'empty':
                        if (!ts.UI.$list.find('li').length) {
                            ts.UI.$list.append($('<li>').addClass('customs-list-empty').text(_('customs_empty_message')));
                        }
                        break;
                    case 'loading':
                        if (mode.mode) {
                            ts.UI.$wrap.addClass('loading');
                            if (mode.pending)
                                ts.pending = mode.pending;
                        }
                        else {
                            ts.UI.$wrap.removeClass('loading');
                            if (ts.pending) {
                                ts.draw(ts.pending);
                                ts.pending = [];
                            }
                        }
                        break;
                    case 'progress':
                        ts.UI.progress.$wrap.removeClass('hide');
                        ts.UI.progress.$info.text(Math.min(100, Math.ceil((100 * parseInt(mode.info.ready)) / parseInt(mode.info.need))) +
                            '%');
                        if (mode.countdown !== false) {
                            ts.UI.progress.$reload.removeClass('hide');
                            ts.UI.progress.$seconds.text(mode.countdown);
                        }
                        break;
                    case 'auth':
                        ts.UI.$wrap.attr('mode', 'auth');
                        break;
                    case 'enabled':
                        ts.UI.tabs.$customs.attr('disabled', ts.state.enabled ? false : 'disabled');
                        if (ts.UI.tabs.$customs.attr('active') == '1' &&
                            String(this.fvdSynchronizer.Prefs.get('last_settings_tab_index')).indexOf('backups') ===
                                0) {
                            ts.UI.tabs.$backup.trigger('click');
                        }
                        break;
                    case 'error':
                        console.warn(mode.error || 'Error');
                        ts.draw('loading');
                        break;
                    case 'tips':
                        if (!_b(this.fvdSynchronizer.Prefs.get('prefs.backup.tips_dials_shown'))) {
                            this.fvdSynchronizer.Dialogs.alert(_('customs_tips_backup_title'), _('customs_tips_backup_dials_message'));
                            this.fvdSynchronizer.Prefs.set('prefs.backup.tips_dials_shown', true);
                        }
                        break;
                }
            }
        });
    }
    actionsButton($action) {
        let ts = this;
        if (!ts.premission()) {
            return;
        }
        let action = $action.attr('action');
        let $item = $action.parents('.customs-list-item');
        let uuidHead = $item.attr('uuidHead');
        let uuidData = $item.attr('uuidData');
        let $name = $item.find('.customs-list-name');
        let name = $name.text();
        if (!action || !uuidHead || !uuidData)
            return;
        if (action == 'edit') {
            ts.dialogName(name, _('customs_settings_rename_title'), _('customs_settings_rename'), function (value) {
                if (value) {
                    $name.text(value);
                    ts.actions.rename(uuidHead, value);
                }
            });
        }
        else if (action == 'remove') {
            this.fvdSynchronizer.Dialogs.confirm(_('customs_remove_title'), $('<span>').addClass('dialog-message-center-big').text(name)[0].outerHTML, function (r) {
                if (r) {
                    $item.remove();
                    ts.draw('empty');
                    ts.actions.remove(uuidHead);
                }
            });
        }
        else if (action == 'restore') {
            this.fvdSynchronizer.Dialogs.confirm(_('customs_restore_title'), $('<span>').addClass('dialog-message-center-big').text(name)[0].outerHTML, function (r) {
                if (r) {
                    ts.draw('loading', true);
                    ts.actions.restore(uuidHead);
                }
            });
        }
    }
    createConfirmation() {
        let ts = this;
        if (!ts.premission())
            return;
        let name = ts.nameGenerator();
        ts.dialogName(name, _('customs_settings_create_title'), _('customs_settings_create'), function (value) {
            ts.draw('loading', { mode: true, pending: ['tips'] });
            ts.actions.create(value);
        });
    }
    premission() {
        let ts = this;
        let prm = true;
        if (!ts.state.auth || !ts.state.pro) {
            prm = false;
            let btns = [];
            btns[_('dlg_confirm_cancel')] = function () {
                dlg.close();
            };
            btns[_('customs_pro_popup_button')] = function () {
                dlg.close();
                chrome.tabs.create({ url: 'https://everhelper.me/everhelperplansru.php' });
            };
            let dlg = new Dialog({
                width: 400,
                title: _('customs_pro_popup_title'),
                content: _('customs_pro_popup_message'),
                buttons: btns,
            });
        }
        return prm;
    }
    dialogName(value, title, button, cb) {
        let ts = this;
        var $input = $('<input>')
            .attr('id', 'customizationName')
            .addClass('input-modal')
            .attr('placeholder', _('customs_settings_create_placeholder'))
            .attr('maxlength', 100);
        var $html = $('<div>')
            .append($('<div>').addClass('common-modal-body-inputs').append($input))
            .append($('<div>')
            .addClass('common-modal-body-list')
            .append($('<p>')
            .append($('<h5>').text(ts.locale.will_message))
            .append($('<span>').text(ts.locale.will_list))));
        this.fvdSynchronizer.Dialogs.confirm(title, $html[0].outerHTML, function (r) {
            if (r) {
                ts.dialogNameConfirm(cb);
            }
        });
        $('#customizationName').val(value);
    }
    dialogNameConfirm(cb) {
        let $text = $('#customizationName');
        if (cb)
            cb($text.val());
    }
    nameGenerator() {
        let name = 'Backup ';
        name += String(browserName());
        name += ', ' + new Date().toLocaleString();
        return name;
    }
}
export default CustomsUIModule;
