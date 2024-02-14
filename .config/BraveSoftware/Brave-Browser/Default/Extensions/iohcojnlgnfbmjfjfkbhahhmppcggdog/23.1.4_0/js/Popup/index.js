var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EventType } from '../types.js';
import { default as FvdSynchronizerModule } from '../index.js';
import PopupModule from './popup.js';
import ButtonControllerModule from '../ButtonController.js';
import ControlsModule from '../Controls/index.js';
class Popup {
    constructor() {
        this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const fvdSynchronizer = new FvdSynchronizerModule(this.addEventListener, {
                sync: true,
                mode: 1,
            });
            yield fvdSynchronizer.init();
            new ButtonControllerModule(fvdSynchronizer);
            new ControlsModule(fvdSynchronizer);
            new PopupModule(fvdSynchronizer);
            globalThis.fvdSynchronizer = fvdSynchronizer;
        });
    }
    addEventListener(eventType, cb) {
        if (eventType === EventType.LOAD) {
            if (document.readyState === 'complete') {
                cb();
            }
            else {
                window.addEventListener('load', (event) => {
                    cb(event);
                });
            }
        }
        else if (eventType === EventType.UNLOAD) {
            window.addEventListener('unload', (event) => {
                cb(event);
            });
        }
    }
}
new Popup();
