
/**
 @ Name：layui.horizontalClassify 水平分类
 @ Author：gmx@yiynx.cn
 @ License：MIT 
 */
 
layui.define(['layer', 'form'], function(exports){ //假如该组件依赖 layui.form
  var $ = layui.$
  ,layer = layui.layer
  ,form = layui.form
  
  //字符常量
  ,MOD_NAME = 'horizontalClassify', ELEM = '.layui-horizontal-classify'
  
  //外部接口
  ,horizontalClassify = {
    index: layui.horizontalClassify ? (layui.horizontalClassify.index + 10000) : 0
    
    //设置全局项
    ,set: function(options){
      var that = this;
      that.config = $.extend({}, that.config, options);
      return that;
    }
    
    //事件监听
    ,on: function(events, callback){
      return layui.onevent.call(this, MOD_NAME, events, callback);
    }
  }
  
  //操作当前实例
  ,thisIns = function(){
    var that = this
    ,options = that.config
    ,id = options.id || options.index;
    
    return {
      reload: function(options){
        that.reload.call(that, options);
      }
      ,config: options
    }
  }
  
  //构造器
  ,Class = function(options){
    var that = this;
    that.index = ++horizontalClassify.index;
    that.config = $.extend({}, that.config, horizontalClassify.config, options);
    that.render();
  };
  
  //默认配置
  Class.prototype.config = {
	title : ['一级分类', '二级分类', '三级分类'] //联动层级
    ,showSearch : false // 是否显示搜索
  };
  
  //渲染视图
  Class.prototype.render = function(){
    var that = this
    ,options = that.config;

    options.elem = $(options.elem);
    
    // 初始化水平分类
    options.elem.html("").addClass("layui-horizontal-classify")
	for (var i = 0; i < options.title.length; i++) {
    	var htm =  "<div class=\"layui-horizontal-classify-box\">";
    	htm += "<div class=\"layui-horizontal-classify-header\">"+options.title[i]+"<button type=\"button\" class=\"layui-btn layui-btn-xs hc-add\"><i class=\"layui-icon layui-icon-add-1\"></i></button></div>";
    	if (options.showSearch) {
    		htm+="<div class=\"layui-horizontal-classify-search\"><i class=\"layui-icon layui-icon-search\"></i><input type=\"input\" class=\"layui-input\" placeholder=\"关键词搜索\"></div>";
    	}
    	htm += "<ul class=\"layui-horizontal-classify-data\">";
    	htm += "</ul>";
    	htm += "</div>";
    	options.elem.append(htm);
    }
    // 加载一级分类
    $.getJSON(options.url, function(result){
    	var htm = "";
    	for (var i = 0; i < result.data.length; i++) {
    		var obj = result.data[i];
    		htm += "<li data-id=\""+obj.id+"\" data-parent-id=\""+obj.parentId+"\">" +
    				"<span class=\"layui-horizontal-classify-data-item\" title=\""+obj.name+"\">"+obj.name+"</span>" +
    				"<button type=\"button\" class=\"layui-btn layui-btn-xs layui-btn-danger hc-delete\"><i class=\"layui-icon layui-icon-delete\"></i></button>" +
    				"<button type=\"button\" class=\"layui-btn layui-btn-xs layui-btn-normal hc-edit\"><i class=\"layui-icon layui-icon-edit\"></i></button>" +
    				"</li>";
    	}
    	options.elem.find(".layui-horizontal-classify-data:first").append(htm);
    });
    // 搜索
    if (options.showSearch) {
    	$(ELEM).on("change", ".layui-horizontal-classify-search input", function() {
    		var currentIndex = $(this).parent().parent().index();
    		$(".layui-horizontal-classify-box:eq("+currentIndex+") .layui-horizontal-classify-data li").hide();
    		$(".layui-horizontal-classify-box:eq("+currentIndex+") .layui-horizontal-classify-data li .layui-horizontal-classify-data-item:contains("+$(this).val()+")").parent().show();
    	});
    }
    // 添加
    $(ELEM).on("click", ".hc-add", function(){
    	var $this = $(this);
    	var currentIndex = $this.parent().parent().index();
    	var parentId = currentIndex == 0 ? null : $(".layui-horizontal-classify .layui-horizontal-classify-box:eq("+(currentIndex-1)+")").find(".hcdi-active").data("id");
    	if (typeof(parentId) == 'undefined') {
    		layer.msg("请选择上级分类！");
    		return;
    	}
    	layer.open({"title":"添加", content:"" +
    			"<form id=\"hcAddForm\" class=\"layui-form\">" +
    			"<div class=\"layui-form-item\">" + 
    			"<label class=\"layui-form-label\">名称</label>" +
    			"<div class=\"layui-input-block\">" + 
    			"<input type=\"text\" id=\"hcName\" name=\"name\" required=\"\" lay-verify=\"required\" placeholder=\"请输入\" autocomplete=\"off\" class=\"layui-input\">" + 
    			"</div>" + 
    			"</div>" + 
    			"</form>" +
    			""
	    	,btn:['确定', '取消']
	    	,yes:function(index){
	    		$.post(options.addUrl, {name:$("#hcName").val(), parentId:parentId}, function(result){
	    			layer.close(index);
	    			var obj = result.data;
	    			var htm = "<li data-id=\""+obj.id+"\" data-parent-id=\""+obj.parentId+"\">" +
	    					"<span class=\"layui-horizontal-classify-data-item\" title=\""+obj.name+"\">"+obj.name+"</span>" +
	    					"<button type=\"button\" class=\"layui-btn layui-btn-xs layui-btn-danger hc-delete\"><i class=\"layui-icon layui-icon-delete\"></i></button>" +
	    					"<button type=\"button\" class=\"layui-btn layui-btn-xs layui-btn-normal hc-edit\"><i class=\"layui-icon layui-icon-edit\"></i></button>" +
	    					"</li>";
	    			$this.parent().parent().find(".layui-horizontal-classify-data").append(htm);
	    		});
	    	}}
    	);
    });
    // 编辑
    $(ELEM).on("click", ".hc-edit", function(){
    	var $this = $(this);
    	var hcName = $this.parent().find(".layui-horizontal-classify-data-item").text();
    	layer.open({"title":"编辑", content:"" +
			"<form id=\"hcEditForm\" class=\"layui-form\">" +
			"<div class=\"layui-form-item\">" + 
			"<label class=\"layui-form-label\">名称</label>" +
			"<div class=\"layui-input-block\">" + 
			"<input type=\"text\" id=\"hcName\" name=\"name\" required=\"\" lay-verify=\"required\" value=\""+hcName+"\" placeholder=\"请输入\" autocomplete=\"off\" class=\"layui-input\">" + 
			"</div>" + 
			"</div>" + 
			"</form>" +
			""
    	,btn:['确定', '取消']
    	,yes:function(index){
    		$.post(options.editUrl, {name:$("#hcName").val(), id:$this.parent().data("id")}, function(result){
    			layer.close(index);
    			$this.parent().find(".layui-horizontal-classify-data-item").text($("#hcName").val()).attr("title", $("#hcName").val());
    		});
    	}}
	  );
    });
    // 分类点击-加载下级分类
    $(ELEM).on("click", ".layui-horizontal-classify-data-item", function(){
    	$(this).parent().addClass("hcdi-active").siblings().removeClass("hcdi-active"); // 选中
    	var currentIndex = $(this).parent().parent().parent().index();
    	$(".layui-horizontal-classify .layui-horizontal-classify-box:gt("+currentIndex+")").find(".layui-horizontal-classify-data").html(""); // 清空下级数据
    	var $next = $(this).parent().parent().parent().next();
    	$.getJSON(options.url, {parentId:$(this).parent().data("id")}, function(result){
    		var htm = "";
        	for (var i = 0; i < result.data.length; i++) {
        		var obj = result.data[i];
        		htm += "<li data-id=\""+obj.id+"\" data-parent-id=\""+obj.parentId+"\">" +
        				"<span class=\"layui-horizontal-classify-data-item\" title=\""+obj.name+"\">"+obj.name+"</span>" +
        				"<button type=\"button\" class=\"layui-btn layui-btn-xs layui-btn-danger hc-delete\"><i class=\"layui-icon layui-icon-delete\"></i></button>" +
        				"<button type=\"button\" class=\"layui-btn layui-btn-xs layui-btn-normal hc-edit\"><i class=\"layui-icon layui-icon-edit\"></i></button>" +
        				"</li>";
        	}
        	$next.find(".layui-horizontal-classify-data:first").html(htm);
    	});
    });
    // 删除
    $(ELEM).on("click", ".hc-delete", function(){
    	var $item = $(this).parent();
    	var currentIndex = $(this).parent().parent().parent().index();
    	layer.confirm("确认删除么？", function(index){
        	$.getJSON(options.delUrl, {id:$item.data("id")}, function(result){
        		$item.remove();
        		if ($item.children(".layui-horizontal-classify-data-item").hasClass("hcdi-active")) {
        			$(".layui-horizontal-classify .layui-horizontal-classify-box:gt("+currentIndex+")").find(".layui-horizontal-classify-data").html(""); // 清空下级数据
            	}
        	});
        	layer.close(index);
    	});
    });
  }
  
  //核心入口
  horizontalClassify.render = function(options){
    var ins = new Class(options);
    return thisIns.call(ins);
  };
  
  //加载组件所需样式
  layui.link(layui.cache.base + 'horizontalClassify.css?v=1', function(){
    //样式加载完毕的回调
  }, 'horizontalClassify'); //此处的“horizontalClassify”要对应 horizontalClassify.css 中的样式： html #layuicss-horizontalClassify{}
  
  exports('horizontalClassify', horizontalClassify);
});
