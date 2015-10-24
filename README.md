# CheerweJS
=========================

CheerweJS是一款基于bootstrap2.0风格的前端组件，力求让开发者使用最少的代码，完成预定义的功能需求，让开发者快速上手

## 说明
--------------------------

**1、目录结构说明：**

* js:存放组件的JS源文件
* css:存放组件的样式源文件
* examples:组件DEMO
* docs:组件文档
* lib:存放组件依赖的第三方组件库，例如jquery,bootstrap-2.0.0,my97datepicker,umeditor-1.2.2等，后续考虑移除

**2、组件说明：**

本框架依赖一个核心的core，核心core可以单独使用，不依赖于任何其他的第三方库，核心core主题提供各类公共的帮助方法，提供所有组件的基类$we.Object


## 组件列表
--------------------------

* Core
* Ajax
* AutoComplete
* Component
* DatePicker
* Dialog
* Form
* Grid
* Mask
* Message
* NumberEditor
* Pagebar
* Select
* Tabs


## 使用方式
----------------------------

**1、第三方组件库依赖**

`````````html

<!-- 第三方依赖库 start -->
<script type="text/javascript" src="../lib/jquery/jquery-1.7.2.js"></script>
<script type="text/javascript" src="../lib/jquery/jquery.tmpl.js"></script>
<script type="text/javascript" src="../lib/bootstrap-2.0.0/js/bootstrap.min.js"></script>
<link type="text/css" rel="stylesheet" href="../lib/bootstrap-2.0.0/css/bootstrap.min.css"/>


<!-- 日期组件依赖该第三方组件 -->
<script type="text/javascript" src="../lib/my97datepicker/wdatepicker.js"></script>

<!-- 富文本编辑器组件依赖该第三方组件 -->
<script type="text/javascript" src="../lib/umeditor-1.2.2/umeditor.min.js"></script>


<!-- 第三方依赖库 end -->

`````````



**2、在需要使用本框架的页面中，添加以下引用即可**

`````````html

<script type="text/javascript" src="/we.min.js"></script>


`````````

PS：使用时，请将路径切换为您应用中的具体路径

