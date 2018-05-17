// https://www.html5rocks.com/en/tutorials/canvas/imagefilters/
var Filters = {};
Filters.getPixels = function (ele) {
	if(ele.getContext){	//canvas
		var ctx = ele.getContext('2d');
		return ctx.getImageData(0, 0, ele.width, ele.height);
	} else {	//img
		var cvs = this.createCanvas(ele.width, ele.height);
		var ctx = cvs.getContext('2d');
		ctx.drawImage(ele,0,0);
		return ctx.getImageData(0, 0, cvs.width, cvs.height);
	}
	
}

Filters.createCanvas = function (w, h) {
	var cvs = document.createElement('canvas');
	cvs.width = w;
	cvs.height = h;
	return cvs;
}
//图片变换应用 var_args 多个参数
Filters.applyFilterImg = function (filter, img, var_args) {

	var canvas = document.createElement('canvas');
	canvas.width = img.width;
	canvas.height = img.height;
	canvas.isApply = true;
	
	var args = [canvas, this.getPixels(img)];
	for (var i = 2; i < arguments.length; i++) {
		args.push(arguments[i]);
	}
	console.log(args);
	return filter.apply(null, args);
}

//图片实时预览
Filters.filterImgPreview = function (filter, canvas, var_args) {
	console.log(this.getPixels(GLOBAL_APPLY_CANVAS))
	var args = [canvas, this.getPixels(GLOBAL_APPLY_CANVAS)];
	for (var i = 2; i < arguments.length; i++) {
		args.push(arguments[i]);
	}
	return filter.apply(null, args);
}
Filters.download = function(canvas, filename) {
	canvas.toBlob(function(data){
    var eleLink = document.createElement('a');
    eleLink.download = filename;
    eleLink.style.display = 'none';
    var blob = new Blob([data]);
    eleLink.href = URL.createObjectURL(blob);
    document.body.appendChild(eleLink);
    eleLink.click();
    document.body.removeChild(eleLink);
  })
}
//灰度滤镜 args[]
Filters.grayScale = function (canvas, pixels, level, rvalue, gvalue, bvalue) {
	console.log('灰度级别', level)
	// var options = {
	// 	r: rvalue || 0.2126 * level,
	// 	g: gvalue || 0.7152 * level,
	// 	b: bvalue || 0.0722 * level
	// }

	var options = {
		r: rvalue || 0.2126 + level,
		g: gvalue || 0.7152 + level,
		b: bvalue || 0.0722 + level
	}
	var rgb_array = pixels.data;
	for(var i=0; i<rgb_array.length; i+=4) {
		var r = rgb_array[i];
		var g = rgb_array[i+1];
		var b = rgb_array[i+2];
		var rgb = r * options.r + g * options.g + b * options.b; 
		rgb_array[i] = rgb_array[i+1] = rgb_array[i+2] = rgb;
	}
	canvas.getContext('2d').putImageData(pixels, 0, 0);
	if(canvas.isApply){
		window.downloadCanvas = canvas;
		var img = document.createElement('img');
		img.src = window.downloadCanvas.toDataURL();
		GLOBAL_IMG = img;

		var _canvas = document.createElement('canvas');
		var _ctx = _canvas.getContext('2d');
		var _pixels = Filters.getPixels(GLOBAL_CANVAS);
		_ctx.putImageData(_pixels, 0, 0);
		GLOBAL_APPLY_CANVAS = _canvas;
	}
}