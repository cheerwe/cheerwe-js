(function() {
    var script = document.getElementsByTagName('script');
    script = script[script.length - 1];

    var path = script.src.replace('we.js', '');

    var createScript = __weCreateScript = function(name) {
        return ['<script type="text/javascript" src="', path, name, '.js"><\/', 'script>'].join('');
    };
    var createStyle = __weCreateStyle = function(name) {
        return ['<link type="text/css" rel="stylesheet" href="', path, name, '.css"/>'].join('');
    };
    var scripts = [
        createStyle('css/we'),
        createScript('lib/jquery/jquery-1.7.2'),
        createScript('js/core'),
        createScript('js/ajax'),
        createScript('js/component')
    ];
    scripts = scripts.join('');
    document.write(scripts);
})();