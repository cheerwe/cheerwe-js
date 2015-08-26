(function() {
    var LoaderUtil = {
        map: {},
        scritpMap: {
            'bootstrap': 'lib/bootstrap-2.0.0/js/bootstrap.min',
            'umeditor': 'lib/umeditor-1.2.2/umeditor.min',
            'auto-complete': 'js/auto-complete',
            'date-picker': 'lib/my97datepicker/wdatepicker,js/date-picker',
            'dialog': 'js/dialog',
            'form': 'js/form',
            'grid': 'jquery.tmpl,js/grid',
            'mask': 'js/mask',
            'message': 'js/message',
            'number-editor': 'js/number-editor',
            'pagebar': 'js/pagebar',
            'select': 'js/select',
            'tabs': 'js/tabs'
        },
        styleMap: {
            'bootstrap': 'lib/bootstrap-2.0.0/css/bootstrap.min.css'
        },
        getLoaders: function() {
            var script = document.getElementsByTagName('script');
            script = script[script.length - 1];
            var loaders = $(script).data('loader');

            return loaders;
        },
        getModules: function() {
            var loaders = LoaderUtil.getLoaders();

            var srcList;
            if (loaders) {
                srcList = srcList.concat(loaders.split(','));
            } else if {
                srcList = srcList.concat(['auto-complete', 'date-picker', 'dialog', 'form', 'grid', 'mask', 'message', 'number-editor', 'pagebar', 'select', 'tabs']);
            }
            srcList.unshift('bootstrap');

            return srcList;
        },
        create: function(sc, type) {
            var list = [];
            var fn = type == 'stype' ? $we.__createStyle : $we.__createScript;

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
            var ss = [];
            var moduleList = LoaderUtil.getModules();

            for (var i = 0, len = moduleList.length; i < len; i++) {
                var name = moduleList[i];

                var style = stypeMap[name];
                ss.concat(create(style, 'style'));

                var script = scriptMap[name];
                ss.concat(create(script, 'script'));
            }

            ss = ss.join('');
            document.write(ss);
        }
    };

    LoaderUtil.load();
})();