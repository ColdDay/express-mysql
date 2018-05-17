var gifImgElement = document.getElementById('mainImg');
var speed = 5;
var color = null;
var selectInput = null;
$('.upload-file').on('change', function(e){
	if(e.target.type != 'file') return;
	var imgFiles = e.target.files || e.dataTransfer.files;
	var count = 0;
	for(var i=0; i<imgFiles.length; i++) {
		(function(img){
			var img = document.createElement('img');
		  img.onload = function () {
		  	count ++ ;
		    var _img = document.createElement('img');
		    _img.src = img.src;
		    _img.className = "drag-img";
		    _img.draggable=true;
		    var li = document.createElement('li');
		    li.appendChild(_img)
		    var span = document.createElement('span');
		    span.innerText = '编辑';
		    li.appendChild(span)
		    $('#uploadList').append(li);
		    if(count == imgFiles.length) {
		    	dragInit();
		    	showGIF();
		    }		    
		  }
		  img.src = URL.createObjectURL(imgFiles[i]);
		})(imgFiles[i])
	}
})
$('.main').on('click', '#uploadList span', function() {
	$('.pop').addClass('active');
	var colorCanvas = document.getElementById('editCanvas');
	var ctx = colorCanvas.getContext('2d');
	var img = $(this).prev()[0];
	window.currentEditImg = img; 
	var _img = document.createElement('img');
	_img.src = img.src;
	colorCanvas.width = _img.width;
	colorCanvas.height = _img.height;
	ctx.drawImage(_img, 0, 0, _img.width, _img.height, 0,0,_img.width,_img.height)
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
function DrawRect(cxt,x,y,w,h,fillcolor)
{
  cxt.fillStyle='#fff';
  cxt.rect(0, 0, w, h)
 	cxt.fill();
}
function showGIF() {
	gifImgElement.src = loadingGif;
	var imgArray = $("#uploadList img");
	$('.parms-set').show();	
	var offset = getMaxOffset();
	var arr = [];
	var count = 0;
	for(var i=0; i<imgArray.length; i++) {
		(function(index){
			var canvas = document.createElement('canvas');
			canvas.width = offset.w;
			canvas.height = offset.h;
			var ctx = canvas.getContext('2d');
			ctx.fillStyle='#fff';
		  ctx.rect(0, 0, offset.w, offset.h)
		 	ctx.fill();
			var nw = imgArray[index].naturalWidth; //6
			var nh = imgArray[index].naturalHeight;//4
			if(nw/nh > offset.w/ offset.h){
				//w>h
				ctx.drawImage(imgArray[index], 0, 0, nw,nh,0, 0, offset.w, offset.w * nw/nh)

			} else {
				ctx.drawImage(imgArray[index], 0, 0, nw,nh,0, 0, offset.h * nw/nh, offset.h )
			}
			var img = document.createElement('img');
			img.onload = function () {
				arr.push(img);
				count ++ ;
				if(count >= imgArray.length) {
					gifshot.createGIF({
				  	'images': arr,
				  	'gifWidth' : offset.w,
						'gifHeight' : offset.h,
						'frameDuration' : window.speed
					},function(obj) {
					  if(!obj.error) {
					    var image = obj.image;
					    gifImgElement.src = image;
					  }
					});
				}
			}
			img.src = canvas.toDataURL();
		})(i)
	}
}

function getMaxOffset(){
	var imgArray = $('#uploadList img');
	var w = imgArray[0].naturalWidth;
	var h = imgArray[0].naturalHeight;
	for(var i=0; i<imgArray.length;i++) {
		var item = imgArray[i];
		if(item.naturalWidth <= w) {
			w = item.naturalWidth;
		}
		if(item.naturalHeight <= h) {
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