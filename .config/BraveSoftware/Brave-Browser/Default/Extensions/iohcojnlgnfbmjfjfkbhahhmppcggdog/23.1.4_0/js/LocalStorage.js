var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class LocalStorage {
    constructor() {
        this.exclude = ['backup'];
        this.listener();
    }
    listener() {
        const that = this;
        chrome.storage.local.onChanged.addListener((changes) => {
            Object.keys(changes).forEach((key) => {
                if (!that.exclude.includes(key)) {
                    if (changes[key].hasOwnProperty('newValue')) {
                        that._setStorageItem(key, changes[key].newValue);
                    }
                    else {
                        that._removeStorageItem(key);
                    }
                }
            });
        });
    }
    _setStorageItem(key, val) {
        this.storage[key] = val;
    }
    _removeStorageItem(key) {
        if (this.storage.hasOwnProperty(key)) {
            delete this.storage[key];
        }
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const that = this;
            return new Promise((resolve) => {
                chrome.storage.local.get((result) => {
                    that.storage = Object.keys(result).reduce((storage, key) => {
                        if (!that.exclude.includes(key)) {
                            storage[key] = result[key];
                        }
                        return storage;
                    }, {});
                    resolve(that.storage);
                });
            });
        });
    }
    getAllItems() {
        return this.storage;
    }
    getItemAsync(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield chrome.storage.local.get(key);
        });
    }
    getItem(key) {
        return this.storage.hasOwnProperty(key) ? this.storage[key] : undefined;
    }
    hasItem(key) {
        return this.storage.hasOwnProperty(key);
    }
    setItem(key, val) {
        this._setStorageItem(key, val);
        chrome.storage.local.set({ [key]: val });
    }
    removeItem(key) {
        this._removeStorageItem(key);
        chrome.storage.local.remove([key]);
    }
}
export default LocalStorage;
