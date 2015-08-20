(function() {
    var script = document.getElementsByTagName('script');
    script = script[script.length - 1];

    var path = script.src.replace('we.js', '');

    var scripts = [
        '<link type="text/css" rel="stylesheet" href="', path, 'css/we.css"/>'
    ];

    var loaders = $(script).data('loader');

    var srcList = ['core', 'ajax', 'component'];

    if (loaders == 'all') {
        srcList = srcList.concat(['auto-complete', 'date-picker', 'dialog', 'form', 'grid', 'mask', 'message', 'number-editor', 'pagebar', 'select', 'tabs']);
    } else if (!loaders) {

    } else {
        srcList = srcList.concat(loaders.split(','));
    }

    var map = {};
    for (var i = 0, len = srcList.length; i < len; i++) {
        var name = srcList[i];
        if (!map[name]) {
            scripts = scripts.concat(['<script type="text/javascript" src="', path, 'js/', srcList[i], '.js"><\/', 'script>']);
            map[name] = true;
        }
    }

    scripts = scripts.join('');
    document.write(scripts);
})();