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
class CustomsActionsModule {
    constructor(fvdSynchronizer) {
        this.DEV = true;
        this.ONCE = [];
        this.API = {
            auth: 'https://everhelper.me/auth/process.php?',
            server: 'https://sync-eh.everhelper.me',
        };
        this.tables = {
            fvdSynchronizer: { source: 'fvdSynchronizer', allow_empty: true },
            fvdSpeedDial: { source: 'fvdSpeedDial', allow_empty: true },
            misc: { source: 'misc', allow_empty: true, keys: ['sd.background'] },
            deny: { source: 'deny', allow_empty: true },
        };
        this.state = {
            listKeyHead: 'custom_sd_head',
            listKeyData: 'custom_sd_data',
        };
        this.list = {};
        let ts = this;
        this.fvdSynchronizer = fvdSynchronizer;
        ts.once('init');
    }
    once(action, callback = undefined) {
        let ts = this;
        if (ts.ONCE.indexOf(action) != -1)
            return;
        else
            ts.ONCE.push(action);
        switch (action) {
            case 'init':
                break;
            default:
                if (callback != null) {
                    callback();
                }
        }
    }
    getList() {
        return __awaiter(this, void 0, void 0, function* () {
            let ts = this;
            ts.list = yield ts
                .server({
                send: {
                    action: 'lists:get',
                    body: { key: ts.state.listKeyHead },
                },
            })
                .catch((ex) => {
                console.warn(ex);
                ts.drawUI('error', { error: "Can't load list" });
            });
            return ts.list;
        });
    }
    restore(uuidHead) {
        return __awaiter(this, void 0, void 0, function* () {
            let ts = this;
            let item = ts.getItem(uuidHead);
            let data = false;
            const dataList = yield ts
                .server({
                send: {
                    action: 'lists:get',
                    body: {
                        key: ts.state.listKeyData,
                        uuid: item.uuidData,
                    },
                },
            })
                .catch((ex) => {
                ts.drawUI('error', { error: "Can't load backup" });
            });
            let fileURL = false;
            for (let i in dataList.items) {
                if (dataList.items[i].uuid == item.uuidData) {
                    try {
                        data = JSON.parse(dataList.items[i].value);
                    }
                    catch (ex) {
                        console.warn(ex);
                    }
                    if (dataList.items[i].fileURL)
                        fileURL = dataList.items[i].fileURL;
                    break;
                }
            }
            ts.restoreData(data, fileURL);
        });
    }
    restoreData(Back, fileURL) {
        let ts = this;
        if (!Back) {
            ts.drawUI('error', { error: 'Backup is damaged' });
            return;
        }
        for (var key in ts.tables) {
            if (Back[key]) {
                switch (ts.tables[key].source) {
                    case 'fvdSynchronizer':
                        ts.restorePrefsSync(key, Back[key]);
                        break;
                    case 'fvdSpeedDial':
                        ts.restorePrefsSD(key, Back[key]);
                        break;
                    case 'misc':
                        ts.restoreMiscSD(key, Back[key], fileURL);
                        break;
                    case 'deny':
                        ts.restoreDenySD(key, Back[key]);
                        break;
                }
            }
        }
        ts.progress();
    }
    restoreDenySD(Name, Data) {
        let ts = this;
        ts.tables[Name].need = Data.length;
        ts.tables[Name].redy = 0;
        ts.fvdSynchronizer.Driver.Speeddial.gMessageToSD({ action: 'Deny.set', data: Data });
        ts.tables[Name].redy = ts.tables[Name].need;
    }
    restoreMiscSD(Name, Data, fileURL) {
        let ts = this;
        ts.tables[Name].need = ts.tables[Name].length;
        ts.tables[Name].redy = 0;
        for (var key in ts.tables[Name].keys) {
            let dataSet = Data[key] || '';
            if (String(dataSet.val).indexOf('file:') === 0) {
                dataSet.val = fileURL;
            }
            ts.fvdSynchronizer.Driver.Speeddial.gMessageToSD({
                action: 'miscItemSet',
                data: {
                    key: dataSet.key,
                    val: dataSet.val,
                },
            });
            ts.tables[Name].redy++;
        }
    }
    restorePrefsSD(Name, Data) {
        let ts = this;
        ts.tables[Name].need = Data.length;
        ts.tables[Name].redy = 0;
        let updated = [];
        for (var key in Data) {
            ts.tables[Name].redy++;
            this.fvdSynchronizer.Driver.Speeddial.gMessageToSD({
                action: 'Prefs.set',
                data: { key: Data[key].key, val: Data[key].val },
            });
            updated.push(Data[key].key);
        }
    }
    restorePrefsSync(Name, Data) {
        let ts = this;
        ts.tables[Name].need = Data.length;
        ts.tables[Name].redy = 0;
        const updated = [];
        const safeKeys = [
            'autobackup.enabled',
            'dont_display_ds_chromesync_message',
            'dont_display_sync_access_warning',
        ];
        for (var key in Data) {
            ts.tables[Name].redy++;
            if (safeKeys.indexOf(Data[key].key) === -1) {
                continue;
            }
            this.fvdSynchronizer.Prefs.set(Data[key].key, Data[key].val);
            updated.push(Data[key].key);
        }
    }
    progress() {
        let ts = this;
        let DonePrm = true;
        let info = { ready: 0, need: 0 };
        for (var key in ts.tables) {
            info.ready += ts.tables[key].redy || 0;
            info.need += ts.tables[key].need || 0;
            if (ts.tables[key].need > ts.tables[key].redy) {
                DonePrm = false;
            }
        }
        ts.drawUI('progress', { info: info, countdown: false });
        if (DonePrm) {
            var delay = 10;
            ts.reloadAllPages(delay * 1000);
            this.fvdSynchronizer.Driver.Speeddial.gMessageToSD({ action: 'setMisc' });
            let interval = setInterval(function () {
                delay--;
                ts.drawUI('progress', { info: info, countdown: Math.max(0, delay) });
                if (delay < 0)
                    clearInterval(interval);
            }, 1000);
        }
    }
    remove(uuidHead) {
        return __awaiter(this, void 0, void 0, function* () {
            let ts = this;
            let item = ts.getItem(uuidHead);
            let sendServerDelHead = {
                action: 'lists:delete',
                body: {
                    key: ts.state.listKeyHead,
                    uuid: [uuidHead],
                },
            };
            let sendServerDelData = {
                action: 'lists:delete',
                body: {
                    key: ts.state.listKeyData,
                    uuid: [item.uuidData],
                },
            };
            yield ts.server({ send: sendServerDelHead });
            ts.server({ send: sendServerDelData });
            return;
        });
    }
    rename(uuidHead, name) {
        return __awaiter(this, void 0, void 0, function* () {
            let ts = this;
            let item = ts.getItem(uuidHead);
            item.name = name;
            let sendServerAddHead = {
                action: 'lists:set',
                body: {
                    key: ts.state.listKeyHead,
                    item: [
                        {
                            uuid: uuidHead,
                            value: JSON.stringify(item),
                        },
                    ],
                },
            };
            let resultHead = yield ts.server({ send: sendServerAddHead });
        });
    }
    getItem(uuidHead) {
        let ts = this;
        let item = false;
        for (let i in ts.list.items) {
            if (ts.list.items[i].uuid == uuidHead) {
                item = JSON.parse(ts.list.items[i].value);
                break;
            }
        }
        return item;
    }
    create(name) {
        let ts = this;
        for (var key in ts.tables) {
            if (ts.tables[key].source == 'fvdSynchronizer') {
                ts.readPrefsSync(key);
            }
            else if (ts.tables[key].source == 'fvdSpeedDial') {
                ts.readPrefsSD(key);
            }
            else if (ts.tables[key].source == 'misc') {
                ts.readMiscSD(key);
            }
            else if (ts.tables[key].source == 'deny') {
                ts.readDenySD(key);
            }
        }
        var WaitInterval = setInterval(function () {
            let done = true;
            for (var key in ts.tables)
                if (ts.tables[key].wait)
                    done = false;
            if (done) {
                clearInterval(WaitInterval);
                ts.writeCustoms(name);
            }
        }, 750);
    }
    writeCustoms(name) {
        return __awaiter(this, void 0, void 0, function* () {
            let ts = this;
            let now = Date.now();
            let uuidHead = ts.createUUID(now);
            let uuidData = ts.createUUID(now + 1);
            let tempfilename = null;
            let customsData = {};
            for (let k in ts.tables) {
                customsData[k] = ts.tables[k].data;
                if (ts.tables[k].file)
                    tempfilename = ts.tables[k].file;
            }
            let sendServerAddHead = {
                action: 'lists:set',
                body: {
                    key: ts.state.listKeyHead,
                    item: [
                        {
                            uuid: uuidHead,
                            value: JSON.stringify({ name: name, date: now, uuidData: uuidData }),
                        },
                    ],
                },
            };
            let sendServerAddData = {
                action: 'lists:set',
                body: {
                    key: ts.state.listKeyData,
                    item: [
                        {
                            uuid: uuidData,
                            value: JSON.stringify(customsData),
                            tempfilename: tempfilename,
                        },
                    ],
                },
            };
            let resultHead = yield ts.server({ send: sendServerAddHead });
            let resultData = yield ts.server({ send: sendServerAddData });
            yield ts.removeTail();
            ts.drawUI(['customs-list', 'highlight']);
        });
    }
    removeTail() {
        return __awaiter(this, void 0, void 0, function* () {
            let ts = this;
            let tail = 10;
            let minDate = 0;
            let uuidHeadRemove = '';
            if (ts.list.items.length >= tail) {
                for (let i in ts.list.items) {
                    let item = JSON.parse(ts.list.items[i].value);
                    let curDate = parseInt(item.date) || 0;
                    minDate = minDate ? Math.min(minDate, curDate) : curDate;
                    if (curDate == minDate) {
                        uuidHeadRemove = ts.list.items[i].uuid;
                    }
                }
                if (uuidHeadRemove) {
                    yield ts.remove(uuidHeadRemove);
                }
            }
            return;
        });
    }
    drawUI(action, mode) {
        if (typeof action !== 'object')
            action = [action || 'customs-list'];
        if (typeof this.fvdSynchronizer.Customs.ui == 'object') {
            this.fvdSynchronizer.Customs.ui.draw(action, mode);
        }
    }
    readDenySD(Name) {
        let ts = this;
        ts.tables[Name].data = [];
        ts.tables[Name].wait = true;
        this.fvdSynchronizer.Driver.Speeddial.gMessageToSD({ action: 'Deny.dump' }, (response) => {
            const dump = response.result;
            for (let key in dump) {
                ts.tables[Name].data.push(dump[key]);
            }
            ts.tables[Name].success = true;
            ts.tables[Name].wait = false;
        });
    }
    readMiscSD(Name) {
        let ts = this;
        ts.tables[Name].data = [];
        ts.tables[Name].file = false;
        ts.tables[Name].wait = true;
        this.fvdSynchronizer.Utils.Async.arrayProcess(ts.tables[Name].keys, function (key, next) {
            ts.fvdSynchronizer.Driver.Speeddial.gMessageToSD({ action: 'miscItemGet', data: { key: key } }, (response) => {
                response.result = String(response.result);
                if (response.result.indexOf('data:') === 0 || response.result.indexOf('blob:') === 0) {
                    ts.getBlob(response.result, (blob) => {
                        let fname = key + Date.now();
                        ts.uploadTempFile(fname, blob, (upResult) => {
                            let tempfile = false;
                            if (typeof upResult == 'object' &&
                                typeof upResult.files == 'object' &&
                                upResult.files.file) {
                                ts.tables[Name].file = upResult.files.file;
                                tempfile = upResult.files.file;
                            }
                            ts.tables[Name].data.push({
                                key: key,
                                val: tempfile ? 'file:' + tempfile : false,
                            });
                            next();
                        });
                    });
                }
                else {
                    ts.tables[Name].data.push({ key: key, val: response.result });
                    next();
                }
            });
        }, () => {
            ts.tables[Name].success = true;
            ts.tables[Name].wait = false;
        });
    }
    uploadTempFile(filename, blob, callback) {
        this.fvdSynchronizer.Server.Sync.preUploadFile({
            blob: blob,
            name: filename,
        }, function (error, data) {
            if (error) {
                return callback(error);
            }
            if (!data || !data.files) {
                return callback(this.fvdSynchronizer.Errors.ERROR_STORAGE_ENGINE_RETURNS_ERROR);
            }
            var filesMap = data.files;
            if (!filesMap.file) {
                return callback(this.fvdSynchronizer.Errors.ERROR_STORAGE_ENGINE_RETURNS_ERROR);
            }
            callback(data);
        });
    }
    getBlob(url, cb) {
        if (url.indexOf('data:') === 0) {
            var blob = this.fvdSynchronizer.Utils.dataURItoBlob(url);
            cb(blob);
        }
        else {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'blob';
            xhr.onload = function (e) {
                if (this.status == 200) {
                    var myBlob = this.response;
                    cb(myBlob);
                }
            };
            xhr.send();
        }
    }
    readPrefsSD(Name) {
        let ts = this;
        ts.tables[Name].data = [];
        ts.tables[Name].wait = true;
        this.fvdSynchronizer.Driver.Speeddial.gMessageToSD({ action: 'Prefs.dump' }, (response) => {
            const dump = response.result;
            for (let key in dump) {
                ts.tables[Name].data.push({ key: key, val: dump[key] });
            }
            ts.tables[Name].success = true;
            ts.tables[Name].wait = false;
        });
    }
    readPrefsSync(Name) {
        let ts = this;
        ts.tables[Name].data = [];
        ts.tables[Name].wait = true;
        this.fvdSynchronizer.Prefs.dump((dump) => {
            for (let key in dump) {
                ts.tables[Name].data.push({ key: key, val: dump[key] });
            }
            ts.tables[Name].success = true;
            ts.tables[Name].wait = false;
        });
    }
    server(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let ts = this;
            return new Promise(function (resolve, reject) {
                let xhr = ts.post(ts.API.server, JSON.stringify(data.send), function (result) {
                    if (result.errorCode == 0 ||
                        (data.options &&
                            data.options.errors &&
                            (data.options.errors === true || data.options.errors.indexOf(result.errorCode) > -1))) {
                        resolve(result.body);
                    }
                    else {
                        console.warn(ts.API.server, data.send, result);
                        reject(result.errorCode);
                    }
                    xhr = null;
                }, function (error) {
                    console.warn(error);
                    reject(error);
                });
            });
        });
    }
    post(url, data, successFunction, errorFunction) {
        $.post(url, data, successFunction).fail(function (e) {
            if (errorFunction)
                errorFunction(e);
        });
    }
    createUUID(id) {
        const ts = this;
        const uuid = [];
        uuid.push(ts.crc32(String(id)).toString('16'));
        const date = new Date(parseInt(id) || id);
        uuid.push(date.getFullYear());
        uuid.push(String('0' + String(date.getMonth() + 1)).slice(-2) +
            String('0' + String(date.getDate())).slice(-2));
        uuid.push(String('0' + String(date.getHours())).slice(-2) +
            String('0' + String(date.getMinutes())).slice(-2));
        uuid.push(String(String(id).substr(1)));
        return String(uuid.join('-'));
    }
    reloadAllPages(timeout) {
        this.fvdSynchronizer.Driver.Speeddial.gMessageToSD({
            action: 'reloadAllPages',
            timeout: timeout || 0,
        });
        setTimeout(function () {
            document.location.reload();
        }, timeout || 150);
    }
    makeCRCTable() {
        var c;
        this.crcTable = [];
        for (var n = 0; n < 256; n++) {
            c = n;
            for (var k = 0; k < 8; k++) {
                c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
            }
            this.crcTable[n] = c;
        }
        return this.crcTable;
    }
    crc32(str) {
        let ts = this;
        if (!this.crcTable) {
            this.crcTable = ts.makeCRCTable();
        }
        var crc = 0 ^ -1;
        for (var i = 0; i < str.length; i++) {
            crc = (crc >>> 8) ^ this.crcTable[(crc ^ str.charCodeAt(i)) & 0xff];
        }
        return (crc ^ -1) >>> 0;
    }
}
export default CustomsActionsModule;
