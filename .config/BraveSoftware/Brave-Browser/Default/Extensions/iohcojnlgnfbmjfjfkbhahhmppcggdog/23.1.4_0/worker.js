var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import './js/bg/welcome.js';
import { EventType } from './js/types.js';
import PunycodeModule from './js/_external/punycode.js';
import { UriModule, factory as UriFactory } from './js/_external/uri.js';
import FilerModule from './js/_external/filer.js';
import { default as FvdSynchronizerModule } from './js/index.js';
import BackgroundModule from './js/Background.js';
import ButtonControllerModule from './js/ButtonController.js';
import AutoSyncModule from './js/AutoSync.js';
import ContentScriptsController from './js/content-scripts/controller.js';
class SyncWorker {
    constructor() {
        this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            PunycodeModule(this);
            UriModule(this, UriFactory);
            FilerModule(this);
            const fvdSynchronizer = new FvdSynchronizerModule(this.addEventListener, {
                sync: true,
                mode: 0,
            });
            yield fvdSynchronizer.init();
            new AutoSyncModule(fvdSynchronizer);
            new ContentScriptsController(fvdSynchronizer);
            new ButtonControllerModule(fvdSynchronizer);
            new BackgroundModule(fvdSynchronizer);
            globalThis.fvdSynchronizer = fvdSynchronizer;
        });
    }
    addEventListener(eventType, cb) {
        if (eventType === EventType.LOAD) {
            cb();
        }
        else if (eventType === EventType.UNLOAD) {
        }
    }
}
new SyncWorker();
