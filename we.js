(function() {
    var script = document.getElementsByTagName('script');
    script = script[script.length - 1];

    var path = script.src.replace('we.js', '');

    var createScript = wejs._createScript = function(name) {
        return ['<script type="text/javascript" src="', path, name, '.js"><\/', 'script>'].join('');
    };
    var createStyle = wejs._createStype = function(name) {
        return ['<link type="text/css" rel="stylesheet" href="', path, name, '.css"/>'].join('');
    };
    var scripts = [
        createStyle('css/we'),
        createScript('lib/jquery/jquery-.17.2'),
        createScript('js/core'),
        createScript('js/ajax'),
        createScript('js/component')
    ];
    scripts = scripts.join('');
    document.write(scripts);
})();