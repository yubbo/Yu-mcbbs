<script>
// 主题语言变量
var lang_gd = "{$yulang['lang_gd']}";
var lang_kd = "{$yulang['lang_kd']}";

// 全局变量
var comiis_app_color_modes;

// ==================== 核心函数1：原样保留，一行未改 ====================
function new_showTopLink() {
    var ft = $('ft');
    if (ft) {
        var scrolltop = $('comiis_rnav');
        var scrollHeight = parseInt(document.body.getBoundingClientRect().top);

        scrolltop.style.left = 'auto';
        scrolltop.style.right = 'var(--yu-10rem)';

        if (scrollHeight < -100) {
            jq(".comiis_rtop").slideDown(250);
            scrolltop.style.right = 'var(--yu-5rem)';
        } else {
            jq(".comiis_rtop").slideUp(250);
            scrolltop.style.right = 'var(--yu-10rem)';
        }
    }
}

// ==================== 核心函数2：原样保留，一行未改！ ====================
// 【绝对不修改内部代码】只有手动点击时才会执行，自动不执行
function comiis_app_setcolor_mode() {
    if (comiis_app_color_modes == 1) {
        comiis_app_color_modes = 0;
        $('comiis_add_css').className = 'comiis_light_on';
        jQuery("#comiis_add_css .comiis_tip_text").text(lang_gd);
        extstyle('./template/dz_theme_yu/images/comiis_hei');
    
    } else {
        comiis_app_color_modes = 1;
        $('comiis_add_css').className = 'comiis_light';
        jQuery("#comiis_add_css .comiis_tip_text").text(lang_kd);
        extstyle('');
    }
    localStorage.setItem('comiis_theme', comiis_app_color_modes);
}

// DOM加载完成（仅初始化，不触发任何extstyle，无缓存报错）
document.addEventListener('DOMContentLoaded', function() {
    // 1. 返回顶部功能（正常运行）
    new_showTopLink();
    window.addEventListener('scroll', new_showTopLink);

    // 2. 读取本地主题（核心：仅赋值，不切换、不调用extstyle）
    comiis_app_color_modes = localStorage.getItem('comiis_theme') 
        ? Number(localStorage.getItem('comiis_theme')) 
        : !$('css_extstyle') ? 1 : 0;

    // 3. 【唯一操作：仅修复界面显示，绝不调用extstyle】
    // 完全不触发缓存，彻底解决登录/注册/刷新报错
    if($('comiis_add_css')){
        if (comiis_app_color_modes == 1) {
            $('comiis_add_css').className = 'comiis_light';
            jQuery("#comiis_add_css .comiis_tip_text").text(lang_kd);
        } else {
            $('comiis_add_css').className = 'comiis_light_on';
            jQuery("#comiis_add_css .comiis_tip_text").text(lang_gd);
        }
    }

    // ============== 重点：此处绝对不调用任何函数，不触发extstyle ==============
});
</script>