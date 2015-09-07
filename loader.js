(function() {
    var LoaderUtil = {
        map: {},
        scriptMap: {
            // 'bootstrap': 'lib/bootstrap-2.0.0/js/bootstrap.min',
            'jquery-tmpl': 'lib/jquery/jquery.tmpl',
            'umeditor': 'lib/umeditor-1.2.2/umeditor.min',
            'auto-complete': 'js/auto-complete',
            'date-picker': 'js/date-picker',
            'dialog': 'js/dialog',
            'form': 'js/form',
            'grid': 'lib/jquery/jquery.tmpl,js/grid',
            'mask': 'js/mask',
            'message': 'js/message',
            'number-editor': 'js/number-editor',
            'pagebar': 'js/pagebar',
            'select': 'js/select',
            'tabs': 'js/tabs'
        },
        styleMap: {
            // 'bootstrap': 'lib/bootstrap-2.0.0/css/bootstrap.min'
        },
        getLoaders: function() {
            var script = document.getElementsByTagName('script');
            script = script[script.length - 1];
            var loaders = $(script).data('loader');

            return loaders;
        },
        getModules: function() {
            var loaders = LoaderUtil.getLoaders();

            var srcList = [];
            if (loaders) {
                srcList = srcList.concat(loaders.split(','));
            } else {
                srcList = srcList.concat(['auto-complete', 'date-picker', 'dialog', 'form', 'grid', 'mask', 'message', 'number-editor', 'pagebar', 'select', 'tabs']);
            }

            return srcList;
        },
        create: function(sc, type) {
            var list = [];
            var fn = type == 'style' ? __weCreateStyle : __weCreateScript;

            if (sc) {
                sc = sc.split(',');
                for (var i = 0, len = sc.length; i < len; i++) {
                    var path = sc[i];

                    if (!LoaderUtil.map[path]) {
                        list.push(fn(path));
                        LoaderUtil.map[path];
                    }
                }
            }
            return list;
        },
        load: function() {
            var styleList = [],
                scriptList = [];

            var moduleList = LoaderUtil.getModules();

            for (var i = 0, len = moduleList.length; i < len; i++) {
                var name = moduleList[i];

                var style = LoaderUtil.styleMap[name];
                styleList = styleList.concat(LoaderUtil.create(style, 'style'));

                var script = LoaderUtil.scriptMap[name];
                scriptList = scriptList.concat(LoaderUtil.create(script, 'script'));
            }

            document.write(styleList.join(''));
            document.write(scriptList.join(''));
        }
    };

    LoaderUtil.load();
})();