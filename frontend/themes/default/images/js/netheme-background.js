/**
 * Netheme X5 全屏背景轮播。
 *
 * 优化说明：
 * 1. 只使用主题本地图片，不依赖外部图片接口。
 * 2. 下一张图片加载并解码完成后才切换，避免闪白或显示半张图。
 * 3. 两个固定图层交叉淡入，不修改 body 行内样式，也不影响 Discuz 弹窗。
 * 4. 页面切到后台时暂停计时，返回页面后重新计时，减少无意义的资源消耗。
 * 5. 铺满屏幕由 CSS background-size: cover 完成，窗口缩放和浏览器缩放都会自动适配。
 */
(function () {
    'use strict';

    var script = document.currentScript;
    var root = document.querySelector('.netheme-page-background');
    if (!script || !root) {
        return;
    }

    var layers = root.querySelectorAll('.netheme-page-background__layer');
    if (layers.length !== 2) {
        return;
    }

    // 根据当前脚本地址计算图片目录，使主题更换域名或安装目录后仍可正常工作。
    var scriptUrl = script.src.split('?')[0];
    var imageBase = scriptUrl.substring(0, scriptUrl.lastIndexOf('/js/')) + '/lgbg/';
    // 白天模式使用明亮图片池；黑夜模式固定使用深色森林图，避免切换后仍出现刺眼背景。
    var lightImageNames = [
        '01.jpg', '02.jpg', '03.jpg', '04.jpg',
        '05.jpg', '07.jpg', '08.jpg'
    ];
    var darkImageName = '00.jpg';

    // HTML 可通过 data 属性调整间隔；小于 10 秒时回退为默认的一分钟。
    var interval = parseInt(script.getAttribute('data-netheme-background-interval'), 10);
    interval = isNaN(interval) || interval < 10000 ? 60000 : interval;

    var activeLayer = 0;
    var currentIndex = 0;
    var timer = null;

    function isDarkMode() {
        return document.documentElement.getAttribute('data-netheme-theme') === 'dark';
    }

    function currentImageNames() {
        return isDarkMode() ? [darkImageName] : lightImageNames;
    }

    // 随机结果不能与当前图片相同，避免用户感觉这一轮没有切换。
    function getNextIndex() {
        var imageNames = currentImageNames();
        if (imageNames.length < 2) {
            return 0;
        }
        var next = currentIndex;
        while (next === currentIndex) {
            next = Math.floor(Math.random() * imageNames.length);
        }
        return next;
    }

    // 预加载和解码均完成后再通知切换；旧浏览器不支持 decode() 时仍使用 onload。
    function preload(url, done) {
        var image = new Image();
        image.onload = function () {
            if (typeof image.decode === 'function') {
                image.decode().catch(function () {}).then(function () {
                    done(url);
                });
            } else {
                done(url);
            }
        };
        image.onerror = schedule;
        image.src = url;
    }

    function show(index) {
        var imageNames = currentImageNames();
        var nextLayer = activeLayer === 0 ? 1 : 0;
        var url = imageBase + imageNames[index];

        preload(url, function (loadedUrl) {
            layers[nextLayer].style.backgroundImage = 'url("' + loadedUrl + '")';
            layers[nextLayer].classList.add('is-visible');
            layers[activeLayer].classList.remove('is-visible');
            activeLayer = nextLayer;
            currentIndex = index;
            schedule();
        });
    }

    function schedule() {
        window.clearTimeout(timer);
        if (!document.hidden && !isDarkMode()) {
            timer = window.setTimeout(function () {
                show(getNextIndex());
            }, interval);
        }
    }

    function applyThemeBackground() {
        currentIndex = 0;
        show(0);
    }

    // 首屏按当前主题选图；监听 html 属性变化，切换主题时立即更换背景。
    layers[activeLayer].style.backgroundImage = 'url("' + imageBase + currentImageNames()[0] + '")';
    if (window.MutationObserver) {
        new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
                if (mutations[i].attributeName === 'data-netheme-theme') {
                    applyThemeBackground();
                    break;
                }
            }
        }).observe(document.documentElement, { attributes: true });
    }
    document.addEventListener('visibilitychange', schedule, false);
    schedule();
}());
