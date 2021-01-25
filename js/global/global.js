// baseURL = "http://bearxx.cn/qixing/"
baseURL = "http://localhost:9091/"

var freeUrls = ["/","index.html","login.html","resetpassword.html"];
var enableLogin = true;

// 后台响应的数据结构
Response = {}


/******************************************************* 以上是全局配置 **************************************/

getToken = function(){
  return localStorage.getItem("token")
}
// 设置公共头部token， 移动到 vue-resource.min.js中去了
// Vue.http.headers.common['token'] = getToken();

// 判断当前页面是否存在token
function isNoneToken(){
  var token = getToken();
  return token == undefined || token == null || token.trim().length < 16;
}

// 前端的权限控制
function controllHtmlJumping(){
  if (!enableLogin){
    return;
  }
  // 跳转到登录页
  function jumpToLogin(){
    window.location.href = "./login.html";
  }
  // 判断当前请求的URL是否是免登录的
  function isCurrentUrlFree(){
    var url = window.location.href;
    for(var i = 0; i<freeUrls.length; i++){
      if (url.endsWith(freeUrls[i])){
        return true;
      }
    }
    return false;
  }
  if (isNoneToken()){
    if (!isCurrentUrlFree()){
      jumpToLogin();
    }
  }
}
controllHtmlJumping();

Response.isOk = function(httpResponse){
  var resp = httpResponse.data;
  return resp.code == 200;
}

Response.getMsg = function(httpResponse){
  var resp = httpResponse.data;
  return resp.message;
}

Response.getData = function(httpResponse){
  var resp = httpResponse.data;
  return resp.data;
}

Response.hasData = function(httpResponse){
  return httpResponse.data != undefined;
}

Response.httpRespHandle = function(httpResponse,bizOkCallback,bizFailedCallback,netErrorCallback){
  if (httpResponse.status == 200){
    if (Response.isOk(httpResponse)){
      if (Response.hasData(httpResponse)){
        bizOkCallback(Response.getData(httpResponse));
      }
    } else {
      bizFailedCallback(Response.getMsg(httpResponse));
    }    
  } else {
    netErrorCallback(arguments[0]);
  }
}