import DriverListenersModule from './listeners.js';
import DriverBookmarksdbModule from './bookmarksdb.js';
import DriverManagerModule from './manager.js';
import DriveGuidstorageModule from './guidstorage.js';
import virtualBookmarks from './virtualbookmarks.js';
const BookmarksInit = function (fvdSynchronizer) {
    virtualBookmarks.init(['unsorted']);
    fvdSynchronizer.bookmarks = {
        virtualBookmarks,
        listeners: DriverListenersModule,
        database: new DriverBookmarksdbModule(fvdSynchronizer),
        manager: new DriverManagerModule(fvdSynchronizer),
        guidsStorage: new DriveGuidstorageModule(fvdSynchronizer),
    };
};
export default BookmarksInit;
