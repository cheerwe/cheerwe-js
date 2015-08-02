(function() {
    var script = document.getElementsByTagName('script');
    script = script[script.length - 1];

    var path = script.src.replace('we.js', '');

    var scripts = [
        '<link type="text/css" rel="stylesheet" href="', path, 'css/we.css"/>'
    ];


    var srcList = ['core', 'component', 'ajax', 'auto-complete', 'date-picker', 'dialog', 'form', 'grid', 'mask', 'message', 'number-editor', 'pagebar', 'select', 'tabs'];

    for (var i = 0, len = srcList.length; i < len; i++) {
        scripts = scripts.concat(['<script type="text/javascript" src="', path, 'js/', srcList[i], '.js"><\/', 'script>']);
    }

    scripts = scripts.join('');
    document.write(scripts);
})();
