'use strict';

chrome.runtime.onInstalled.addListener(function () {
    console.log(chrome);
    chrome.storage.sync.set({ color: '#3aa757' }, function () {
        console.log("The color is green.");
    });

    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { schemes: ['https', 'http'] },
                })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});