function Ajax(type, url, data, success, failed){
  var xhr = null;
  if(window.XMLHttpRequest){
      xhr = new XMLHttpRequest();
  } else {
      xhr = new ActiveXObject('Microsoft.XMLHTTP')
  }

  var type = type.toUpperCase();
  var random = Math.random();
  if(typeof data == 'object'){
      var str = '';
      for(var key in data){
          str += key+'='+data[key]+'&';
      }
      data = str.replace(/&$/, '');
  }

  if(type == 'GET'){
      if(data){
          xhr.open('GET', url + '?' + data, true);
      } else {
          xhr.open('GET', url + '?t=' + random, true);
      }
      xhr.send();

  } else if(type == 'POST'){
      xhr.open('POST', url, true);
      xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xhr.send(data);
  }
  xhr.onreadystatechange = function(){
      if(xhr.readyState == 4){
          if(xhr.status == 200){
              var res = JSON.parse(xhr.responseText)
            if (res.code == -2) {
              window.location.href = 'login.html'
            }
            success(res);
          } else {
              if(failed){
                  failed(xhr.status);
              }
          }
      }
  }
}
function getQueryString(name) { 
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
    var r = window.location.search.substr(1).match(reg); 
    if (r != null) return unescape(r[2]); return null; 
} 
