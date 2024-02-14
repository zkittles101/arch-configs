/**
 * Load Open Sans using JS for Chrome/Firefox compatibility
 */
loadCustomFonts();


/**
 * When the popup is opened
 **/
$(document).ready(async () => {
    let domain;
    try {
        domain = await getDomainForSite();
    } catch {
        domain = null;
    }
    initComponentsState(domain);
    addEventListenersToComponents();
    if (domain === null) {
        showCantRunHere();
    }
})


function showCantRunHere() {
    $(".selectextRunOnWrapper").remove();

    let selectextNotAvailable = (
        $("<h3></h3>")
            .addClass("selectextSubHeader")
            .addClass("selectextIsNotAvailable")
            .text("Selectext is not available on this page")
    );

    $(selectextNotAvailable).insertAfter(".selectextSiteNameHeaderWrapper");
}


function getUserInfo() {
    const url = `${API_URL}/get-user-info`;
    return fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    })
}


const generateResetsInText = (resetsInSeconds, isCancelled, isPaid, nextPlanInfo) => {
    var d = Math.floor(resetsInSeconds / (3600 * 24));
    var h = Math.floor(resetsInSeconds % (3600 * 24) / 3600);
    let firstWord = "Resets ";
    if (isCancelled) {
        firstWord = "Cancels "
    } else if (isPaid) {
        firstWord = "Renews "
    }

    if (nextPlanInfo !== undefined) {
        firstWord = `Dowgrades to '${nextPlanInfo.name}' plan`
    }
    return `${firstWord} in ${d} day${d !== 1 ? "s" : ""}, ${h} hour${h !== 1 ? "s" : ""}`
}

/**
 * Set the state of UI components based on browser storage values
 */
function initComponentsState(domain) {
    $(".siteNameHeader").text(domain);

    let key;
    if (PAUSED_BY_DEFAULT_SITE_LIST.includes(domain)) {
        key = `resume_${domain}`;
    } else {
        key = `pause_${domain}`;
    }
    browser.storage.sync.get({ 'activeColour': "rgb(0, 185, 251)", 'panelId': "colour2", [key]: false, "copyMode": "multiline" }).then(function (result) {
        let activeColour = result.activeColour;
        let panelId = result.panelId;

        // Set the active colour CSS variable
        setColour(activeColour)

        // Make the active colour panel glow
        $(`#${panelId}`).addClass("activeColour");

        if ((result[key] === true && !PAUSED_BY_DEFAULT_SITE_LIST.includes(domain)) || (result[key] === false && PAUSED_BY_DEFAULT_SITE_LIST.includes(domain))) {
            showResumeButton(key, domain);
        } else {
            checkContentScriptPaused(key).catch((e) => {})
        }

        $('#' + result.copyMode).prop('checked', true);
    })



    getUserInfo().then(
        (response) => {
            if (response.status === 401) {
                $('.selectextPopupWrapper > :not(.selectextHeaderWrapper)').remove();
                $(".selectextPopupWrapper").append("<p class='notSignedInText'>It looks like you haven't signed in yet</p>");
                const tutorialButton = $("<button class='selectextButton tutorialButton'>Follow the tutorial to get started</button>")
                tutorialButton.click((e) => {
                    browser.tabs.create({ url: `${WEBSITE_URL}/tutorial` });
                })
                $(".selectextPopupWrapper").append(tutorialButton);
                $(".selectextPopupWrapper").append("<p class='notSignedInText' style='margin-bottom: 0px'>Or pause any video and click the toggle in the top left</p>");
            } else {
                response.json().then(
                    (json) => {
                        const picture = json.picture;
                        if (picture) {
                            $(".userIcon").attr("src", picture);
                            $(".userIcon").css("border-radius", "50%");
                        }

                        const usage = json.usage;
                        if (usage) {
                            $(".dailyLimitText").text(usage.limit);
                            $(".ocrCountText").text(usage.count);
                            if (usage.limit === usage.count) {
                                $('.usageText').css("color", "red")
                            }
                        }

                        const plan = json.plan;
                        if (plan) {
                            if (plan.priceId === undefined) {
                                $(".upgradeButton").text("Upgrade to get more credits");
                                $(".upgradeButton").click(
                                    () => browser.tabs.create({ url: `${WEBSITE_URL}/portal/plans` })
                                )
                            } else {
                                $(".upgradeButton").text("Manage Subscription");
                                $(".upgradeButton").click(
                                    () => browser.tabs.create({ url: `${WEBSITE_URL}/portal/account` })
                                )
                            }

                            const resetsInSeconds = json.plan.resetsInSeconds;
                            const isCancelled = json.plan.isCancelled;
                            const isPaid = json.plan.priceId !== undefined;
                            const nextPlanInfo = json.plan.nextPlanInfo;
                            $(".resetsInText").text(generateResetsInText(resetsInSeconds, isCancelled, isPaid, nextPlanInfo));
                        }
                    }
                )
            }
        }
    )
}


async function checkContentScriptPaused(pause_key) {
    let tabs = await browser.tabs.query({ currentWindow: true, active: true })
    let activeTab = tabs[0];
    let response = await browser.tabs.sendMessage(activeTab.id, { "isSelectextPaused": true })
    if (response.isPaused !== undefined && response.isPaused === true) {
        showResumeButton(pause_key);
    }
}


async function getDomainForSite() {
    let tabs = await browser.tabs.query({ currentWindow: true, active: true })
    let activeTab = tabs[0];
    let domain = getSiteNameFromURL(activeTab.url);
    return domain;
}

function showResumeButton(pause_key, domain) {
    $(".pauseOnceButton").remove();
    $(".pauseAlwaysButton").remove();
    $(".pauseOnSiteText").text("Resume on this site")

    $("<button></button>").addClass("selectextButton").text("Resume").appendTo(".toggleTableWrapper").click(() => onResumeClick(pause_key, domain).catch(e => {}))
}

async function onResumeClick(pause_key, domain) {
    if (PAUSED_BY_DEFAULT_SITE_LIST.includes(domain)) {
        await browser.storage.sync.set({[pause_key]: true})
    } else {
        await browser.storage.sync.remove([pause_key]);
    }

    let tabs = await browser.tabs.query({ currentWindow: true, active: true })
    let activeTab = tabs[0];
    browser.tabs.sendMessage(activeTab.id, { "resume": true });
    window.close();
}


/**
 * Add click event listeners to UI components
 * {Element} youtubeToggle the HTML element representing the toggle for Youtube
 * {Element} uoaToggle the HTML element representing the toggle for uoa
 */
function addEventListenersToComponents() {
    const colourPanels = document.getElementsByClassName("colourPanel");
    for (let i = 0; i < colourPanels.length; i++) {
        colourPanels[i].addEventListener("click", () => clickColour(colourPanels[i], colourPanels))
    }

    $(".userIcon").click(
        () => browser.tabs.create({ url: `${WEBSITE_URL}/portal/account` })
    )
    $(".pauseOnceButton").click(onPauseOnce)
    $(".pauseAlwaysButton").click(onPauseAlways)
    $("#multiline").click(setMultiLineMode);
    $("#singleline").click(setSingleLineMode);
    $("#indentation").click(setIndetationMode);
}


async function setAndSendToContentScript(data) {
    try {
        await browser.storage.sync.set(data);
        let tabs = await browser.tabs.query({ currentWindow: true, active: true })
        let activeTab = tabs[0];
        await browser.tabs.sendMessage(activeTab.id, data);
    } catch(e) {}
}

function setMultiLineMode() {
    setAndSendToContentScript({ "copyMode": "multiline" });
}

function setSingleLineMode() {
    setAndSendToContentScript({ "copyMode": "singleline" });
}

function setIndetationMode() {
    setAndSendToContentScript({ "copyMode": "indentation" });
}


async function onPauseOnce() {
    try {
        let tabs = await browser.tabs.query({ currentWindow: true, active: true })
        let activeTab = tabs[0];
        await browser.tabs.sendMessage(activeTab.id, { "pause": true });
        window.close();
    } catch(e) {}
}    


async function onPauseAlways() {
    let domain = $(".siteNameHeader").text();

    if (PAUSED_BY_DEFAULT_SITE_LIST.includes(domain)) {
        const key = `resume_${domain}`;
        await browser.storage.sync.remove([key]);
    } else {
        const key = `pause_${domain}`;
        await browser.storage.sync.set({ [key]: true });
    }

    await onPauseOnce()
}


/**
 * When a colour square is clicked on
 * @param {Element} panel the HTML colour panel that was clicked on
 * @param {array<Element>} colourPanels an array of all of the HTML colour panels
 */
function clickColour(panel, colourPanels) {
    // Get the colour of this panel
    const backgroundColour = panel.style.backgroundColor;

    // Update the active colour CSS variable
    setColour(backgroundColour)

    // Set the active colour in browser storage
    browser.storage.sync.set({ 'activeColour': backgroundColour, 'panelId': panel.id })

    // Deselect other panels and select this panel
    for (let i = 0; i < colourPanels.length; i++) {
        colourPanels[i].classList.remove("activeColour");
    }
    panel.classList.add("activeColour");

    // Tell the content script we have just changed colour for live update
    browser.tabs.query({ currentWindow: true, active: true }).then(function (tabs) {
        let activeTab = tabs[0];
        browser.tabs.sendMessage(activeTab.id, { "activeColour": backgroundColour }).catch((e) => {});
    });
}


/**
 * Set the active colour css variable.
 * @param colour the CSS colour to set to.
 */
function setColour(colour) {
    const root = document.querySelector(":root");
    if (root !== undefined) {
        root.style.setProperty("--activeColour", colour);
    }
}