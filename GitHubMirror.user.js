// ==UserScript==
// @name               GitHub镜像
// @name:en            GitHub Mirror
// @description        GitHub镜像，加速访问GitHub，支持Clone、Release、Raw、Zip加速。
// @description:en     GitHub mirror. Accelerate access to GitHub. Support Clone, Release, RAW and ZIP acceleration.
// @namespace          https://github.com/HaleShaw
// @version            1.2.0
// @author             HaleShaw
// @copyright          2021+, HaleShaw (https://github.com/HaleShaw)
// @license            AGPL-3.0-or-later
// @homepage           https://github.com/HaleShaw/TM-GitHubMirror
// @supportURL         https://github.com/HaleShaw/TM-GitHubMirror/issues
// @downloadURL        https://raw.githubusercontent.com/HaleShaw/TM-GitHubMirror/master/GitHubMirror.user.js
// @updateURL          https://raw.githubusercontent.com/HaleShaw/TM-GitHubMirror/master/GitHubMirror.user.js
// @contributionURL    https://www.jianwudao.com/
// @icon               https://github.githubassets.com/favicon.ico
// @require            https://cdn.jsdelivr.net/npm/jquery/dist/jquery.min.js
// @include            *://github.com/*
// @include            *://github*
// @compatible	       Chrome
// @run-at             document-end
// @grant              GM_addStyle
// @grant              GM_getValue
// @grant              GM_setValue
// ==/UserScript==

// ==OpenUserJS==
// @author             HaleShaw
// @collaborator       HaleShaw
// ==/OpenUserJS==

(function () {
    ('use strict');

    const style = `
        /* The menu container */
        .menuContainer {
            width: 600px;
        }

        .menuBlock {
            padding: 4px 0;
            color: #990000;
        }

        .menuLeftIcon{
            margin-right:5px;
        }

        .menuButtonLabel{
            margin-right: 2rem;
        }

        .menuButtonCheck{
            vertical-align: text-bottom;
            margin: 0 3px;
        }

        .clone {
            padding-left: 0 !important;
            width: calc(100% - 21px) !important;
        }
    `;

    const mirrors = [
        {
            id: 0,
            name: 'CnpmJS',
            url: 'https://github.com.cnpmjs.org',
            description: 'cnpmjs.org'
        },
        {
            id: 1,
            name: 'FastGit',
            url: 'https://hub.fastgit.org',
            description: 'KevinZonda'
        },
        {
            id: 2,
            name: 'FastGit',
            url: 'https://download.fastgit.org',
            description: 'KevinZonda'
        },
        {
            id: 3,
            name: 'wuyanzheshui',
            url: 'https://github.wuyanzheshui.workers.dev',
            description: 'wuyanzheshui，每日10万次调用上限'
        },
        {
            id: 4,
            name: 'RC1844',
            url: 'https://github.rc1844.workers.dev',
            description: 'RC1844，每日10万次调用上限'
        },
        {
            id: 5,
            name: 'jsDelivr',
            url: 'https://cdn.jsdelivr.net/gh',
            description: '项目当前分支总文件大小不可超过50MB'
        },
        {
            id: 6,
            name: 'IAPK',
            url: 'https://github.iapk.cc',
            description: 'IAPK工具箱，Github下载器'
        },
        {
            id: 7,
            name: 'Ecalose',
            url: 'https://gh.haval.gq',
            description: 'Ecalose，每日10万次调用上限'
        },
        {
            id: 8,
            name: 'IAPK',
            url: 'https://iapk.cc/github?url=https://github.com',
            description: 'IAPK工具箱，Github下载器'
        }
    ];

    //添加对应索引即可使用
    const cloneSet = [0, 1, 3];
    const browseSet = [0, 1, 3, 4, 6, 7];
    const downloadSet = [2, 3, 4, 7, 8];
    const rawSet = [3, 4, 7, 8];

    const messages = {
        en: {
            menuButton: {
                name: 'CloneMirror',
                title: 'Open List',
                header: 'Quickly clone and Mirror sites',
                block:
                    'Please do not login in the mirror site. I will not be responsible for any loss caused by this.'
            }
        },
        zh: {
            menuButton: {
                name: '克隆与镜像',
                title: '打开列表',
                header: '快速克隆与镜像站点',
                block: '请不要在镜像网站登录账号，若因此造成任何损失本人概不负责'
            }
        }
    };

    const icons = {
        closeIcon: `
            <svg aria-label="Close menu" class="octicon octicon-x" width="16" height="16" role="img">
                <path fill-rule="evenodd" d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"></path>
            </svg>`,
        copyIcon: `
            <svg class="octicon octicon-clippy" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true">
                <path fill-rule="evenodd" d="M5.75 1a.75.75 0 00-.75.75v3c0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75v-3a.75.75 0 00-.75-.75h-4.5zm.75 3V2.5h3V4h-3zm-2.874-.467a.75.75 0 00-.752-1.298A1.75 1.75 0 002 3.75v9.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0014 13.25v-9.5a1.75 1.75 0 00-.874-1.515.75.75 0 10-.752 1.298.25.25 0 01.126.217v9.5a.25.25 0 01-.25.25h-8.5a.25.25 0 01-.25-.25v-9.5a.25.25 0 01.126-.217z"></path>
            </svg>`,
        commandIcon: `
            <svg class="octicon octicon-terminal menuLeftIcon" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true">
                <path fill-rule="evenodd" d="M0 2.75C0 1.784.784 1 1.75 1h12.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0114.25 15H1.75A1.75 1.75 0 010 13.25V2.75zm1.75-.25a.25.25 0 00-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 00.25-.25V2.75a.25.25 0 00-.25-.25H1.75zM7.25 8a.75.75 0 01-.22.53l-2.25 2.25a.75.75 0 11-1.06-1.06L5.44 8 3.72 6.28a.75.75 0 111.06-1.06l2.25 2.25c.141.14.22.331.22.53zm1.5 1.5a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z"></path>
            </svg>`,
        linkIcon: `
            <svg class="octicon octicon-link color-text-secondary menuLeftIcon" alt="custom" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true">
                <path fill-rule="evenodd" d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"></path>
            </svg>`
    };

    const clonePrefix = 'git clone ';
    const depthPrefix = '--depth=1 ';
    let message;
    let settingHtml;

    main();
    $(document).on('pjax:success', function () {
        $('#mirror-menu').remove();
        main();
    });

    function main() {
        GM_addStyle(style);
        logInfo(GM_info.script.name, GM_info.script.version);
        initSetting();
        message = getMessage(true, true);
        settingHtml = getSettingHtml();
        let menuButtonHtml =
            getMenuButtonPrefix() + getCloneList() + getBrowseList() + getMenuButtonSuffix();
        $('h1.flex-wrap.break-word.text-normal').append(menuButtonHtml);
        if (location.pathname.split('/')[3] == 'releases') {
            addReleasesList();
        }
        if (isPC) {
            addDownloadZip();
        }
    }

    /**
     * Initialize setting.
     */
    function initSetting() {
        let lang = GM_getValue('lang');
        let clone = GM_getValue('clone');
        let depth = GM_getValue('depth');
        if (lang == undefined) {
            GM_setValue('lang', 'zh');
        }
        if (clone == undefined) {
            GM_setValue('clone', true);
        }
        if (depth == undefined) {
            GM_setValue('depth', true);
        }
    }

    function getMenuButtonPrefix() {
        return `
        <details class="details-reset details-overlay mr-0 mb-0" id="mirror-menu">
            <summary class="btn ml-2 btn-primary" id="menuButtonTitle" data-hotkey="m" title="${message.menuButton.title}" aria-haspopup="menu" role="button">
                <span class="css-truncate-target" id="menuButtonName" data-menu-button="">${message.menuButton.name}</span>
                <span class="dropdown-caret"></span>
            </summary>

            <details-menu class="SelectMenu SelectMenu--hasFilter" role="menu">
                <div class="SelectMenu-modal menuContainer">
                    <header class="SelectMenu-header">
                        <span class="SelectMenu-title" id="menuButtonHeader">${message.menuButton.header}</span>
                        ${settingHtml}
                        <button class="SelectMenu-closeButton" type="button" data-toggle-for="mirror-menu">
                        ${icons.closeIcon}
                        </button>
                    </header>
                    <tab-container class="d-flex flex-column js-branches-tags-tabs" style="min-height: 0;">
                        <div role="tabpanel" class="d-flex flex-column flex-auto" tabindex="0">
                            <div class="SelectMenu-list" data-filter-list="">
                                <div class="btn-block flash-error menuBlock" id="menuButtonBlock" role="alert">
                                    ${message.menuButton.block}
                                </div>`;
    }

    function getSettingHtml() {
        const clone = GM_getValue('clone');
        const depth = GM_getValue('depth');
        const lang = GM_getValue('lang');
        const cloneStatus = clone ? ' checked' : '';
        const depthStatus = depth ? ' checked' : '';
        const langStatus = lang == 'en' ? ' checked' : '';
        return `
                <label class="menuButtonLabel"><input id="menuButtonClone" class="menuButtonCheck" type="checkbox"${cloneStatus}>Clone</input></label>
                <label class="menuButtonLabel"><input id="menuButtonDepth" class="menuButtonCheck" type="checkbox"${depthStatus}>Depth</input></label>
                <label class="menuButtonLabel"><input id="menuButtonLang" class="menuButtonCheck" type="checkbox"${langStatus}>English</input></label>
            `;
    }

    /**
     * Clone Checkbox event.
     */
    $('#menuButtonClone').change(function () {
        const status = $('#menuButtonClone').is(':checked');
        GM_setValue('clone', status);
        const inputs = $('.clone');
        for (let i = 0; i < inputs.length; i++) {
            let value = inputs[i].value;
            if (status) {
                value = clonePrefix + value;
            } else {
                value = value.replace(clonePrefix, '');
            }
            inputs[i].value = value;
            $(inputs[i]).next().children().attr('value', value);
        }
    });

    /**
     * Depth Checkbox event.
     */
    $('#menuButtonDepth').change(function () {
        const status = $('#menuButtonDepth').is(':checked');
        GM_setValue('depth', status);
        const inputs = $('.form-control.input-monospace.input-sm.clone');
        const index = clonePrefix.length;
        for (let i = 0; i < inputs.length; i++) {
            let value = inputs[i].value;
            if (status) {
                const length = value.length;
                if (value.startsWith(clonePrefix)) {
                    value = value.slice(0, index) + depthPrefix + value.slice(index, length);
                } else {
                    value = depthPrefix + value;
                }
            } else {
                value = value.replace(depthPrefix, '');
            }
            inputs[i].value = value;
            $(inputs[i]).next().children().attr('value', value);
        }
    });

    /**
     * Language Checkbox event.
     */
    $('#menuButtonLang').change(function () {
        const status = $('#menuButtonLang').is(':checked');
        const value = status ? 'en' : 'zh';
        GM_setValue('lang', value);
        message = getMessage();
        updateMessage();
    });

    /**
     * Update message by target language.
     */
    function updateMessage() {
        $('#menuButtonTitle').attr('title', message.menuButton.title);
        $('#menuButtonName').html(message.menuButton.name);
        $('#menuButtonHeader').html(message.menuButton.header);
        $('#menuButtonBlock').html(message.menuButton.block);
    }

    /**
     * Get the clone list.
     */
    function getCloneList() {
        const href = window.location.href.split('/');
        const git = href[3] + '/' + href[4] + '.git';
        let menuButtonHtml = '';
        const prefix = getClonePrefix();
        cloneSet.forEach(id => {
            menuButtonHtml += getCloneHtml(
                prefix + mirrors[id]['url'] + '/' + git,
                mirrors[id]['name']
            );
        });
        return menuButtonHtml;
    }

    function getMenuButtonSuffix() {
        return `</div></div></tab-container></div></details-menu></details>`;
    }

    /**
     * Get the clone command prefix.
     */
    function getClonePrefix() {
        let prefix = '';
        let clone = GM_getValue('clone');
        let depth = GM_getValue('depth');
        if (clone) {
            prefix += 'git clone ';
        }
        if (depth) {
            prefix += '--depth=1 ';
        }
        return prefix;
    }

    /**
     * Get the clone button html string.
     * @param {String} url url.
     * @param {tip} tip tip.
     */
    function getCloneHtml(url, tip) {
        return `
            <div class="input-group" style="padding: 0 16px;" title="${tip}">
                ${icons.commandIcon}
                <input type="text" class="form-control input-monospace input-sm clone" value="${url}" readonly=""
                    data-autoselect="">
                <div class="input-group-button">
                    <clipboard-copy value="${url}" class="btn btn-sm">
                        ${icons.copyIcon}
                    </clipboard-copy>
                </div>
            </div>`;
    }

    /**
     * Get the browse list.
     */
    function getBrowseList() {
        let menuButtonHtml = ``;
        const href = window.location.href.split('/');
        const path = window.location.pathname;
        browseSet.forEach(id => {
            menuButtonHtml += getBrowseHtml(
                mirrors[id]['url'] + path,
                mirrors[id]['name'],
                mirrors[id]['description']
            );
        });
        if (href.length == 5 || path.includes('/tree/') || path.includes('/blob/')) {
            var html = mirrors[5]['url'] + path.replace('/tree/', '@').replace('/blob/', '@');
            if (!path.includes('/blob/')) {
                html += '/';
            }
            menuButtonHtml += getBrowseHtml(html, mirrors[5]['name'], mirrors[5]['description']);
        }
        if (location.hostname != 'github.com') {
            menuButtonHtml += getBrowseHtml(`https://github.com${path}`, '返回GitHub');
        }
        return menuButtonHtml;
    }

    /**
     * Get browse html string.
     * @param {String} url url.
     * @param {String} name name.
     * @param {String} tip tip.
     * @returns
     */
    function getBrowseHtml(url, name, tip = '') {
        return `
        <a class="SelectMenu-item" href="${url}" target="_blank" title="${tip}" role="menuitemradio" aria-checked="false" rel="nofollow">
            ${icons.linkIcon}
            <span class="css-truncate css-truncate-overflow" style="width: 520px; overflow: hidden; word-break:keep-all; white-space:nowrap; text-overflow:ellipsis;">${url}</span>
            <span class="css-truncate css-truncate-overflow" style="width: 80px; text-align: right;">${name}</span>
        </a>`;
    }

    /**
     * Add Release list.
     */
    function addReleasesList() {
        $('.Box--condensed')
            .find('[href]')
            .each(function () {
                const href = $(this).attr('href');
                $(this)
                    .parent()
                    .after(`<div class="Box-body" >` + getReleaseDownloadHtml(href) + `</div>`);
                $(this).parent().removeClass('Box-body');
            });
    }

    /**
     * Get Release download button html string.
     * @param {String} href href.
     * @returns html.
     */
    function getReleaseDownloadHtml(href) {
        let html = '';
        downloadSet.forEach(id => {
            html += `<a class="flex-1 btn btn-outline get-repo-btn" rel="nofollow" href="${
                mirrors[id]['url'] + href
            }" title="${mirrors[id]['description']}">${mirrors[id]['name']}</a>`;
        });
        return html;
    }

    /**
     * Add download zip button.
     */
    function addDownloadZip() {
        $("a[data-open-app='link']").each(function () {
            var li = $(`<li class="Box-row p-0"></li>`);
            const downloadHref = $(this).attr('href');
            var aElement = $(this)
                .clone()
                .removeAttr('data-hydro-click data-hydro-click-hmac data-ga-click');
            aElement.addClass('Box-row Box-row--hover-gray');
            downloadSet.forEach(id => {
                let tempA = aElement.clone();
                tempA.attr({
                    href: mirrors[id]['url'] + downloadHref,
                    title: mirrors[id]['description']
                });
                tempA.html(
                    tempA.html().replace('Download ZIP', `Download ZIP(${mirrors[id]['name']})`)
                );
                li = li.clone().append(tempA);
            });
            $(this).parent().after(li);
        });
    }

    /**
     * Get message by setting.
     */
    function getMessage() {
        return 'zh' == GM_getValue('lang') ? messages.zh : messages.en;
    }

    /**
     * Log the title and version at the front of the console.
     * @param {String} title title.
     * @param {String} version script version.
     */
    function logInfo(title, version) {
        const titleStyle = 'color:white;background-color:#606060';
        const versionStyle = 'color:white;background-color:#1475b2';
        const logTitle = ' ' + title + ' ';
        const logVersion = ' ' + version + ' ';
        console.log('%c' + logTitle + '%c' + logVersion, titleStyle, versionStyle);
    }
})();
