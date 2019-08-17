const darkModeBtn = document.querySelector('#darkMode');
const changeFontBtn = document.querySelector('#changeFont');
const featuresPage = document.querySelector('#featuresPage');
const fontsPage = document.querySelector('#fontsPage');
const fontsContainer = document.querySelector('#fonts');
const loaderContainer = document.querySelector('#loading');
const fontSearchInput = document.querySelector('#font-search');
const navBar = document.querySelector('#nav');
const backButton = document.querySelector('#nav button');
var fontData;
var isDarkModeOn = false;

function getFonts() {
    fetch('https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyCHd3WMt4mZyxiKGoCArks_98rV67QMaGk')
        .then((response) => response.json().then((fonts) => {
            fontData = fonts.items;
            setFontItems(fontData);
        }))
        .catch((error) => console.log(error));
}

function setFontItems(fonts) {
    for (var i = 0; i < fonts.length; i++) {
        const fontItem = document.createElement('li');
        const fontItemButton = document.createElement('button');
        const fontCategory = document.createElement('div');
        const fontName = document.createElement('div');

        fontName.appendChild(document.createTextNode(fonts[i].family));
        fontCategory.appendChild(document.createTextNode('Font Category: ' + fonts[i].category));
        fontItemButton.appendChild(fontName);
        fontItemButton.appendChild(fontCategory);
        fontItem.appendChild(fontItemButton);
        fontsContainer.appendChild(fontItem);

        fontItemButton.setAttribute('data-link', fonts[i].files.regular);
        fontItemButton.setAttribute('data-name', fonts[i].family);
        fontItemButton.setAttribute('data-variants', fonts[i].variants);
        fontItemButton.setAttribute('data-subsets', fonts[i].variants);
        fontItemButton.setAttribute('data-category', fonts[i].category);

        fontItemButton.addEventListener('click', (event) => {
            changePageFont(event);
        });

        loaderContainer.classList.remove('active');
        fontsContainer.classList.add('active');
    }
}

fontSearchInput.onkeyup = function filterItems(event) {
    const query = event.target.value.toLowerCase();
    var items = fontsContainer.children;
    requestAnimationFrame(() => {
        for (var i = 0; i < items.length; i++) {
            const shouldShow = items[i].textContent.toLowerCase().indexOf(query) > -1;
            items[i].style.display = shouldShow ? 'block' : 'none';
        }
    });
};

function changePageFont(event) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.executeScript(
            tabs[0].id,
            {
                code: `
                    var apiUrl = [];
                    apiUrl.push('https://fonts.googleapis.com/css?family=');
                    apiUrl.push('${event.target.parentElement.dataset.name}'.replace(/ /g, '+'));
                    var variants = '${event.target.parentElement.dataset.variants}';
                    variants = variants.split(',');

                    // if (variants.includes('italic')) {
                    //     apiUrl.push(':');
                    //     apiUrl.push('italic');
                    // }

                    var subsets = '${event.target.parentElement.dataset.subsets}';
                    subsets = subsets.split(',');

                    if (subsets.includes('greek')) {
                        apiUrl.push('&subset=');
                        apiUrl.push('greek');
                    }
                
                    var url = apiUrl.join('');
                    url = url + '&display=swap';

                    var head = document.getElementsByTagName('head')[0];
                    var link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = url;
                    head.appendChild(link);

                    document.querySelectorAll('body, h1, h2, h3, h4, h5, h6, div, a, p, span, header, nav, footer')
                        .forEach((el) => {
                            el.style.setProperty(
                                'font-family',
                                "'${event.target.parentElement.dataset.name}', ${event.target.parentElement.dataset.category}",
                                'important'
                            );
                        });
                `
            }
        );
    });
}

function applyDarkMode() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.insertCSS(tabs[0].id, {
            code: `
                .bg-color {
                    background-color: #202124 !important;
                    color: #e8eaed !important;
                }

                .transparent-bg {
                    background: transparent !important;
                }

                .bg {
                    background-color: #202124 !important;
                }

                .color {
                    color: #e8eaed !important;
                }

                .input-color {
                    color: #202124 !important;
                }

                .input-bg {
                    background-color: #e6e6e6 !important;
                }

                .bg-color_inverted {
                    color: #202124 !important;
                    background-color: #e8eaed !important;
                }

                .1-border {
                    border: 1px solid #e8eaed !important;
                }

                .2-border {
                    border: 2px solid #e8eaed !important;
                }

                .1-border_no-color {
                    border: 1px solid !important;
                }

                .change-color {
                    color: #e8eaed !important;
                    fill: #e8eaed !important;
                }

                .inherit-color-bg {
                    background: inherit !important;
                    color: inherit !important;
                }
            `
        });

        chrome.tabs.executeScript(tabs[0].id, {
            code: `
                document.querySelectorAll('body, header, footer, a, span, \
                                            section, p, h1, h2, h3, h4, h5, h6, \
                                            svg, div, pre, code, li, ul, nav, button, \
                                            input, label, th, td, tr, table, .overlay-dialog')
                    .forEach((el) => {
                        el.classList.add('bg-color');
                    });

                document.querySelectorAll('a.button, a.btn, .goog-menu, .gb_Wa, .gb_B, .gb_Dc')
                    .forEach((el) => {
                        el.classList.add('1-border');
                    });

                document.querySelectorAll('pre, th, td, tr, table, .overlay-dialog')
                    .forEach((el) => {
                        el.classList.add('2-border');
                    });

                document.querySelectorAll('.kix-page-paginated')
                    .forEach((el) => {
                        el.classList.add('1-border_no-color');
                    });

                document.querySelectorAll('input')
                    .forEach((el) => {
                        el.classList.add('1-border', 'input-bg', 'input-color');
                    });

                document.querySelectorAll("button, input[type='submit']")
                    .forEach((el) => {
                        el.classList.add('bg-color_inverted');
                    });

                document.querySelectorAll('button svg, input svg')
                    .forEach((el) => {
                        el.classList.add('inherit-color-bg');
                    });

                document.querySelectorAll('a svg, a svg g, a svg path')
                    .forEach((el) => {
                        el.classList.add('bg', 'color');
                    });

                document.querySelectorAll('.subscribe-form__fields, span, .metabar, \
                                            h1, h2, h3, h4, h5, h6')
                    .forEach((el) => {
                        el.classList.add('transparent-bg', 'color');
                    });

                document.querySelectorAll("div[role='tooltip'], .docs-title-input, .goog-menu, \
                                            .gb_Wa, .gb_B, .gb_Dc")
                    .forEach((el) => {
                        el.classList.add('bg');
                    });
            `
        });

        isDarkModeOn = true;
        darkModeBtn.textContent = 'Deactivate dark mode';
    });
}

function removeDarkMode() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.executeScript(tabs[0].id, {
            code: `
                document.querySelectorAll('body, header, footer, a, span, \
                                            section, p, h1, h2, h3, h4, h5, h6, \
                                            svg, div, pre, code, li, ul, nav, button, \
                                            input, label, th, td, tr, table, .overlay-dialog')
                    .forEach((el) => {
                        el.classList.remove('bg-color');
                    });

                document.querySelectorAll('a.button, a.btn, .goog-menu, .gb_Wa, .gb_B, .gb_Dc')
                    .forEach((el) => {
                        el.classList.remove('1-border');
                    });

                document.querySelectorAll('pre, th, td, tr, table, .overlay-dialog')
                    .forEach((el) => {
                        el.classList.remove('2-border');
                    });

                document.querySelectorAll('.kix-page-paginated')
                    .forEach((el) => {
                        el.classList.remove('1-border_no-color');
                    });

                document.querySelectorAll('input')
                    .forEach((el) => {
                        el.classList.remove('1-border', 'input-bg', 'input-color');
                    });

                document.querySelectorAll("button, input[type='submit']")
                    .forEach((el) => {
                        el.classList.remove('bg-color_inverted');
                    });

                document.querySelectorAll('button svg, input svg')
                    .forEach((el) => {
                        el.classList.remove('inherit-color-bg');
                    });

                document.querySelectorAll('a svg, a svg g, a svg path')
                    .forEach((el) => {
                        el.classList.remove('bg', 'color');
                    });

                document.querySelectorAll('.subscribe-form__fields, span, .metabar, \
                                            h1, h2, h3, h4, h5, h6')
                    .forEach((el) => {
                        el.classList.remove('transparent-bg', 'color');
                    });

                document.querySelectorAll("div[role='tooltip'], .docs-title-input, .goog-menu, \
                                            .gb_Wa, .gb_B, .gb_Dc")
                    .forEach((el) => {
                        el.classList.remove('bg');
                    });
            `
        });

        isDarkModeOn = false;
        darkModeBtn.textContent = 'Activate dark mode';
    });
}

darkModeBtn.onclick = function (element) {
    isDarkModeOn ? removeDarkMode() : applyDarkMode();
};

changeFontBtn.onclick = function () {
    featuresPage.classList.remove('active');
    fontsPage.classList.add('active');
    getFonts();
    fontSearchInput.classList.add('active');
    navBar.style.display = 'flex';
};

backButton.onclick = function () {
    featuresPage.classList.add('active');
    fontsPage.classList.remove('active');
    getFonts();
    fontSearchInput.classList.remove('active');
    navBar.style.display = 'none';
}