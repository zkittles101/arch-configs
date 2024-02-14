export function _(msg) {
    return chrome.i18n.getMessage(msg);
}
const LocalizerModule = function (fvdSynchronizer) {
    const Localizer = function () { };
    Localizer.prototype = {
        localizeCurrentPage: function () {
            const elements = document.querySelectorAll('*[msg]');
            for (let i = 0, len = elements.length; i != len; i++) {
                const element = elements[i];
                if (element.hasAttribute('msg_target')) {
                    element.setAttribute(element.getAttribute('msg_target') || '', _(element.getAttribute('msg')));
                }
                else {
                    element.innerHTML = _(element.getAttribute('msg'));
                }
                element.removeAttribute('msg');
            }
            const body = document.getElementsByTagName('body');
            if (body && body.length) {
                body[0].setAttribute('localized', '1');
            }
        },
    };
    fvdSynchronizer.Localizer = new Localizer();
};
export default LocalizerModule;
