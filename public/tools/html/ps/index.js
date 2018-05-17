// 全局变量
var CaW = 600;
var CaH = 600;

//图片缩放比例
var GLOBAL_SCALE = 1;	

//图片全局应用对象，操作应用后的图片，放大镜用到，也可以用户恢复上一个版本
var GLOBAL_IMG = null;	

//全局应用canvas，原始图片大小，渲染应用后的版本，可以用户恢复上一个版本
var GLOBAL_ORIGIN_APPLY_CANVAS = null;	

//操作区域canvas ,经过缩放后的
var GLOBAL_CANVAS = document.getElementById('currentCanvas');	

/** 
	当前画布的原版canvas ,经过缩放后的，滤镜预览基于此canvas
	参数切换实时预览不在原图上进行计算，而是在小图上
**/
var GLOBAL_APPLY_CANVAS = null;

function Cut( options) {
	var that = this;
	var file = null;
	var canvas = window.restoreCanvas;
	var zoomCanvas = null;

	var ops = {
		zoomW:options.zoomW || 100,
		zoomH:options.zoomH || 100,
		zoomScale: options.zoomScale || 2
	}
	var clip = {
		width: 0,
		height: 0,
		left: 0,
		top: 0
	}

	this.init = function () {
		zoomCanvas = document.createElement('canvas');
		zoomCanvas.className = 'zoom-canvas';
		$('body').append(zoomCanvas);
		interact('.clip').unset();
		_drawGrids(document.getElementById('dragClip'));
	}
	

  //绘制裁剪网格
  function _drawGrids (dragEle) {
  	clip.top = GLOBAL_CANVAS.height / 4;
  	clip.left = GLOBAL_CANVAS.width / 4;
  	clip.width = GLOBAL_CANVAS.width / 2;
  	clip.height = GLOBAL_CANVAS.height / 2;
  	//初始化裁剪数据框的长宽
  	var xInput = document.getElementById('clip-W');
  	var yInput = document.getElementById('clip-H'); 
  	xInput.value = Math.round(clip.width * GLOBAL_SCALE);
  	yInput.value = Math.round(clip.height * GLOBAL_SCALE);

  	$('#dragClip').show().css(clip);
  	_dragInit(dragEle);
  }
  //初始化拖拽控件
	function dragMoveListener (event) {
	  var target = event.target,
	      x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
	      y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

	  target.style.webkitTransform =
	  target.style.transform =
	    'translate(' + x + 'px, ' + y + 'px)';

	  target.setAttribute('data-x', x);
	  target.setAttribute('data-y', y);
	}

  function _dragInit (dragEle) {
  	interact('.clip')
		  .draggable({
		    onmove: dragMoveListener,
		    //限制在父元素中拖动，elementRect控制边界点
		    restrict: {
		      restriction: "parent",
		      elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
		    }
		  })
		  .resizable({
		    edges: { left: true, right: true, bottom: true, top: true },
		    restrict: {
		      restriction: "parent"
		    }
		  })
		  .on('resizemove', function (event) {
		    var target = event.target,
		        x = (parseFloat(target.getAttribute('data-x')) || 0),
		        y = (parseFloat(target.getAttribute('data-y')) || 0);

		    target.style.width  = event.rect.width + 'px';
		    target.style.height = event.rect.height + 'px';

		    x += event.deltaRect.left;
		    y += event.deltaRect.top;

		    target.style.webkitTransform = target.style.transform =
		        'translate(' + x + 'px,' + y + 'px)';

		    target.setAttribute('data-x', x);
		    target.setAttribute('data-y', y);
		    //fixd interact模糊拖拽距离导致的焦点不准问题
		  	if (event.edges.right) {
		  		var x = event.rect.right;
		  		_showZoom(x , event.clientY);
		  	} else if (event.edges.left) {
		  		var x = event.rect.left;
		  		_showZoom(x, event.clientY);
		  	} else if (event.edges.top) {
		  		var y = event.rect.top;
		  		_showZoom(event.clientX, y);
		  	} else {
		  		var y = event.rect.bottom;
		  		_showZoom(event.clientX, y);
		  	}
		  	var xInput = document.getElementById('clip-W');
		  	var yInput = document.getElementById('clip-H'); 
		  	xInput.value = Math.round(event.rect.width * GLOBAL_SCALE);
		  	yInput.value = Math.round(event.rect.height * GLOBAL_SCALE);
		  })
		  .on('resizeend',function () {
		  	zoomCanvas.style.display = 'none';
		  }); 	
  }


  function _getElementLeft(element){
　　　　var actualLeft = element.offsetLeft;
　　　　var current = element.offsetParent;
　　　　while (current !== null){
　　　　　　actualLeft += current.offsetLeft;
　　　　　　current = current.offsetParent;
　　　　}
　　　　return actualLeft;
　}
	function _getElementTop(element){
　　　　var actualTop = element.offsetTop;
　　　　var current = element.offsetParent;
　　　　while (current !== null){
　　　　　　actualTop += current.offsetTop;
　　　　　　current = current.offsetParent;
　　　　}
　　　　return actualTop;
　　}

  function _showZoom (x, y) {
  	//设置放大镜的大小和位置

  	zoomCanvas.style.display = 'block';
  	zoomCanvas.width = 100 * ops.zoomScale;
  	zoomCanvas.height = 100 * ops.zoomScale;
  	
  	zoomCanvas.style.left = x + 20 + 'px';
  	zoomCanvas.style.top = y + 20 + 'px';

  	var _ctx = zoomCanvas.getContext('2d');
  	_ctx.clearRect(0,0,100,100);

  	var sx = (x - _getElementLeft(GLOBAL_CANVAS)) * GLOBAL_SCALE - ops.zoomW / 2;
  	var sy = (y - _getElementTop(GLOBAL_CANVAS)) * GLOBAL_SCALE - ops.zoomH / 2;
  	var sw = ops.zoomW;
  	var sh = ops.zoomH;
  	_ctx.drawImage(GLOBAL_IMG, sx, sy, ops.zoomW, ops.zoomH, 0, 0, ops.zoomW * ops.zoomScale, ops.zoomH * ops.zoomScale);
  	
  	_ctx.beginPath();
		_ctx.moveTo(0, zoomCanvas.height / 2);
		_ctx.lineTo(zoomCanvas.width, zoomCanvas.height / 2);
		_ctx.stroke();

		_ctx.beginPath();
		_ctx.moveTo(zoomCanvas.width / 2,0);
		_ctx.lineTo(zoomCanvas.width / 2, zoomCanvas.height);
		_ctx.stroke();
  }
}

eventInit();
$('body').on('click','.fun',function(){
	initFun($(this).data('temp'));
})

function eventInit() {
	$('.upload-file').on('change', function(e){
		console.log(e);
		if(e.target.type != 'file') return;
		window.currentFile = e.target.files[0] || e.dataTransfer.files[0];
		window.currentFileName = currentFile.name;
		fileToImg();
	})
}
//文件转Img
function fileToImg () {
	var img = document.createElement('img');
		img.id = 'temp'
  img.onload = function () {
  	GLOBAL_IMG = $(img).clone()[0];	//引用问题，防止事件注册到全局img中
    drawImage(img);
  }
  img.src = URL.createObjectURL(window.currentFile);
}

//绘制图片到canvas
function drawImage (img) {
	var canvas = GLOBAL_CANVAS;
	var container = document.getElementById('canvasContainer');
	ctx = canvas.getContext('2d');
	container.appendChild(canvas);

	var ctx = canvas.getContext('2d');
	GLOBAL_SCALE = getScale(img);
	var swidth = img.width / GLOBAL_SCALE;
	var sheight = img.height / GLOBAL_SCALE;
	canvas.width = swidth;
	canvas.height = sheight;
	ctx.clearRect(0,0,1000,1000);
  ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, swidth, sheight);
  setGlobalCanvas(canvas);
}

//设置全局画布
function setGlobalCanvas (canvas) {
	//缩放后的经过滤镜裁剪处理canvas，用于滤镜预览
	var _canvas = document.createElement('canvas');
	var _ctx = _canvas.getContext('2d');
	_canvas.width = canvas.width;
	_canvas.height = canvas.height;
	var pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
	_ctx.putImageData(pixels, 0, 0);
	GLOBAL_APPLY_CANVAS = _canvas;
	
	//原始大小处理后的餐canvas用于下载
	var _canvasDownload = document.createElement('canvas');
	var _ctxD = _canvasDownload.getContext('2d');
	_canvasDownload.width = GLOBAL_IMG.width;
	_canvasDownload.height = GLOBAL_IMG.height;
	_ctxD.drawImage(GLOBAL_IMG, 0, 0, GLOBAL_IMG.width, GLOBAL_IMG.height, 0, 0, GLOBAL_IMG.width, GLOBAL_IMG.height);
	window.downloadCanvas = _canvasDownload;
}

function getClipCanvas() {
	var clipEle = document.getElementById('dragClip');
	var sx = clipEle.offsetLeft + clipEle.getAttribute('data-x') * 1;
	var sy = clipEle.offsetTop + clipEle.getAttribute('data-y') * 1;
	var sw = clipEle.offsetWidth;
	var sh = clipEle.offsetHeight;

	var x = sx * GLOBAL_SCALE;
	var y = sy * GLOBAL_SCALE;
	var w = sw * GLOBAL_SCALE;
	var h = sh * GLOBAL_SCALE;
	var _canvas = document.createElement('canvas');
		_canvas.width = w;
		_canvas.height = h;
	var _ctx = _canvas.getContext('2d');
	_ctx.drawImage(GLOBAL_IMG, x, y, w, h, 0, 0, w, h);
	return _canvas;
}
function getScale (img) {
	var s = 1;
	var w = img.width;
	var h = img.height;
	if (w > h) {
		s = w / CaW;
	} else {
		s = h / CaH;
	}
	return s;
}

function initFun(type) {
	if(!window.currentFile){
		alert('请先选择图片');
		return;
	} 
	var $fun = $('#fun-' + type);
	if($fun.hasClass('active')) {
		return
	} else {
		$('.fun').removeClass('active');
		$fun.addClass('active');
		$('.operate-area').empty().append($('#temp-' + type).html())
	}
	if(type == 'clip') {
		$('#dragClip').show();
		var cutman = new Cut({});
		cutman.init();
	} else {
		$('#dragClip').hide();
	}
}

// 裁剪功能区
function clipImg () {
	var _canvas = getClipCanvas();
	window.downloadCanvas = _canvas;
	Filters.download(_canvas, currentFileName);
	var img = document.createElement('img');
	img.onload = function () {
  	GLOBAL_IMG = $(img).clone()[0];
		drawImage(GLOBAL_IMG);
		var cutman = new Cut({});
		cutman.init();
  }
	img.src =  _canvas.toDataURL();
}

//灰度操作区
function applyGrayChange() {
	if(!GLOBAL_IMG) return;
	Filters.applyFilterImg (Filters.grayScale, GLOBAL_IMG, window.grayFilterLevel)
}

function downloadGrayImg (e) {
	applyGrayChange();	//下载前先应用当前操作
	Filters.download(window.downloadCanvas, currentFileName);
}

function grayChange(e){
	$(e).closest('.range-group').find('.range-value').text(e.value);
	if(!GLOBAL_IMG) return;
	window.grayFilterLevel = e.value/100;
	Filters.filterImgPreview (Filters.grayScale, GLOBAL_CANVAS, window.grayFilterLevel)
}

function lightChange(e) {
	$(e).closest('.range-group').find('.range-value').text(e.value);
	if(!GLOBAL_IMG) return;
	Filters.filterImgPreview (Filters.grayScale, GLOBAL_CANVAS, e.value)
}

