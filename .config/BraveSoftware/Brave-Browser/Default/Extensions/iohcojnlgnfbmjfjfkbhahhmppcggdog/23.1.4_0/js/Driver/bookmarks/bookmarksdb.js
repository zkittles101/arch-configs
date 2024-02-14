var bookmarksDatabase = function (fvdSynchronizer) {
  var systemGuids = ['menu', 'unsorted', 'toolbar'];

  var self = this;

  function generateGUID() {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz';
    var string_length = 32;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
      var rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
  }

  this.systemGuids = function () {
    return systemGuids;
  };

  this.getAllGuids = function () {
    return fvdSynchronizer.bookmarks.guidsStorage.getAllGuids();
  };

  this.getAllIds = function () {
    return fvdSynchronizer.bookmarks.guidsStorage.getAllIds();
  };

  this.getGuid = function (id) {
    return fvdSynchronizer.bookmarks.guidsStorage.getGuid(id);
  };

  this.getCountStoredGuids = function () {
    return fvdSynchronizer.bookmarks.guidsStorage.getGuidsCount();
  };

  this.getId = function (guid) {
    return fvdSynchronizer.bookmarks.guidsStorage.getId(guid);
  };

  this.setGuid = function (id, guid) {
    guid = guid || generateGUID();
    fvdSynchronizer.bookmarks.guidsStorage.setGuid(id, guid);
    return guid;
  };

  this.removeGuid = function (id) {
    fvdSynchronizer.bookmarks.guidsStorage.removeGuidById(id);
  };

  this.startMassGuidsChange = function () {
    fvdSynchronizer.bookmarks.guidsStorage.startMassGuidsChange();
  };

  this.applyMassGuidsChange = function () {
    fvdSynchronizer.bookmarks.guidsStorage.applyMassGuidsChange();
  };

  this.rollbackMassGuidChange = function () {
    fvdSynchronizer.bookmarks.guidsStorage.cancelMassGuidsChange();
  };

  this.connect = function (callback) {
    callback();
  };
};

export default bookmarksDatabase;
