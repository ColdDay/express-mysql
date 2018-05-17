var gifImgElement = document.getElementById('mainImg');
var speed = 5;
var color = null;
var selectInput = null;
var playVideo = document.getElementById('play');
var GLOBAL_W = 200;
var GLOBAL_SCALE = 1;
function getLoopImg() {
	var canvas = document.createElement("canvas");
	GLOBAL_SCALE = playVideo.offsetWidth / playVideo.offsetHeight;
	canvas.width = GLOBAL_W;
	canvas.height = GLOBAL_W / GLOBAL_SCALE;
  canvas.getContext('2d')
        .drawImage(playVideo, 0, 0, playVideo.offsetWidth,  playVideo.offsetHeight,0,0,canvas.width, canvas.height);

    var img = document.createElement("img");
    img.src = canvas.toDataURL();
    img.className = "drag-img";
    img.draggable=true;
    var li = document.createElement('li');
    li.appendChild(img)
    var span = document.createElement('span');
    span.innerText = '编辑';
    li.appendChild(span)
    $('#uploadList').append(li);
    if(playVideo.ended) {
    	showGIF();
    	dragInit();
    }else{
    	setTimeout(function() {
    		getLoopImg();
    	},500)
    	
    }
}
$('.upload-file').on('change', function(e){
	if(e.target.type != 'file') return;
	gifImgElement.src = loadingGif;
	var video = e.target.files[0] || e.dataTransfer.files[0];
	var playVideo = document.getElementById('play');
	playVideo.src = URL.createObjectURL(video);
	playVideo.playbackRate = 2
	playVideo.play();
	setTimeout(function() {
		getLoopImg();
	},300)
})
$('.main').on('click', '#uploadList span', function() {
	$('.pop').addClass('active');
	var img = $(this).prev()[0];
	var colorCanvas = document.getElementById('editCanvas');
	var ctx = colorCanvas.getContext('2d');
	colorCanvas.width = img.naturalWidth;
	colorCanvas.height = img.naturalHeight;
	window.currentEditImg = img; 
	ctx.drawImage(img, 0, 0, colorCanvas.width, colorCanvas.height, 0,0,colorCanvas.width,colorCanvas.height)
	if(color) return;
	color = ColorPicker(
	  document.getElementById('slide'),
	  document.getElementById('picker'),
	  function(hex, hsv, rgb) {
	    selectInput ? selectInput.style.color = hex : '';
  });
})
$('.canvas-container').on('focus','input', function() {
	window.selectInput = $(this)[0];
})

$('#editCanvas').click(function(e) {
	var container = $(this).parent();
	var x = e.offsetX;
	var y = e.offsetY;
	var input = document.createElement('input');
	input.draggable=true;
	input.style.top = y + 'px';
	input.style.left = x + 'px';
	input.style.fontSize = selectInput ? selectInput.style.fontSize : '14px';
	input.style.color = selectInput ? selectInput.style.color : 'blue';
	input.style.fontFamily = selectInput ? selectInput.style.fontFamily : 'SimSun';
	container.append(input);
	input.focus();
	input.onselectstart = function() {
     return false;
  };
  input.ondragstart = function(ev) {
      /*拖拽开始*/
      //拖拽效果
      ev.dataTransfer.effectAllowed = "move";
      ev.dataTransfer.setDragImage(ev.target, 0, 0);
      return true;
  };
	input.ondragend = function(ev) {
        /*拖拽结束*/
        console.log(ev);
        ev.target.style.left = ev.target.offsetLeft + ev.offsetX + 'px'; 
        ev.target.style.top = ev.target.offsetTop - ev.target.offsetHeight + ev.offsetY + 'px';

        return false;
    };
})

function showGIF() {
	gifImgElement.src = loadingGif;
	var imgArray = $("#uploadList img");
	$('.parms-set').show();	
	var offset = getMaxOffset();
	console.log(offset);
	var arr = [];
	for(var i=0; i<imgArray.length; i++) {
		arr.push(imgArray[i])
	}
	gifshot.createGIF({
  	'images': arr,
  	'gifWidth' : GLOBAL_W,
		'gifHeight' : GLOBAL_W / GLOBAL_SCALE,
		'frameDuration' : window.speed
	},function(obj) {
	  if(!obj.error) {
	    var image = obj.image;
	    gifImgElement.src = image;
	  }
	});
}

function getMaxOffset(){
	var imgArray = $('#uploadList img');
	var h = 0;
	var w = 0;
	for(var i=0; i<imgArray.length;i++) {
		var item = imgArray[i];
		if(item.naturalWidth > w) {
			w = item.naturalWidth;
		}
		if(item.naturalHeight > h) {
			h = item.naturalHeight;
		}
	}
	return {
		w: w,
		h: h
	}
}
function createCanvasByImg(img) {
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
	return canvas;
}

function speedChange(e){
	window.speed = Math.abs(e.value);
	showGIF();
}

function dragInit() {
	var  dragImgs = $("#uploadList img");
	var  eleDrag = null;
	for (var i=0; i < dragImgs.length; i+=1) {
    dragImgs[i].onselectstart = function() {
       return false;
    };
    dragImgs[i].ondragstart = function(ev) {
        /*拖拽开始*/
        //拖拽效果
        ev.dataTransfer.effectAllowed = "move";
        ev.dataTransfer.setDragImage(ev.target, 0, 0);
        eleDrag = ev.target;
        return true;
    };
    dragImgs[i].ondragleave = function(ev) {
        /*拖拽结束*/
        ev.target.className = '';
        return true
    };
          
    dragImgs[i].ondragend = function(ev) {
        /*拖拽结束*/
        dragImgs.removeClass('active');
        eleDrag = null;
        return false
    };
    dragImgs[i].ondragover = function(ev) {
    	
    	if(ev.target != eleDrag) {
    		ev.target.className = 'active';
    	}
	    /*拖拽元素在目标元素头上移动的时候*/
	    ev.preventDefault();
	    return true;
		};
		dragImgs[i].ondragenter = function(ev) {
	    /*拖拽元素进入目标元素头上的时候*/
	    return true;
		};
		dragImgs[i].ondrop = function(ev) {
	    /*拖拽元素进入目标元素头上，同时鼠标松开的时候*/
	    if (eleDrag) {
	    	if($(ev.target).prev()[0] == eleDrag) {
	    		$(ev.target.parentNode).after(eleDrag.parentNode);
	    	}else {
	    		$(ev.target.parentNode).before(eleDrag.parentNode);
	    	}
	    	showGIF();
	    	dragImgs.removeClass('active');
	    }
	    return false;
		};

		var trash = document.getElementById('J_delete');
		trash.ondragover = function(ev) {
			/*拖拽元素在目标元素头上移动的时候*/
	    ev.preventDefault();
	    return true;
		};
		trash.ondragenter = function(ev) {
	    /*拖拽元素进入目标元素头上的时候*/
	    ev.target.className = 'active';
	    return true;
		};
		trash.ondragleave = function(ev) {
        /*拖拽结束*/
        ev.target.className = '';
        return true
    };
		trash.ondrop = function(ev) {
	    /*拖拽元素进入目标元素头上，同时鼠标松开的时候*/
	    if (eleDrag) {
				ev.target.className = '';
	    	$(eleDrag.parentNode).remove();
	    	showGIF();
	    }
	    return false;
		};
	}
}

function saveText() {

	var canvas = document.getElementById('editCanvas');
	var ctx = canvas.getContext('2d');
	var inputs = $('.canvas-container').find('input');
	inputs.each(function() {
		var val = this.value;
		if(val.toString().length == 0) return;
		var x = this.offsetLeft;
		var y = this.offsetTop;
		ctx.font = this.style.fontSize + this.style.fontFamily;
		ctx.fillStyle = selectInput.style.color;
		ctx.fillText(val, x, y);
	})
	canvas.toBlob(function(data) {
		var blob = URL.createObjectURL(data);
		currentEditImg.src = blob;
		currentEditImg.onload = function() {
			showGIF();
		}
		$('.pop').click();
	})
}
function changeFontSize(ele) {
	selectInput.style.fontSize = ele.value;
}
function changeFontFamily(ele) {
	selectInput.style.fontFamily = ele.value;
}