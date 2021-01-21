/************************************************ 以下是具体对象定义 *********************************/
Pop = {}  // 弹窗对象
DomUtil = {}  // Dom操作工具
Valid = {}  // 校验工具
DateUtil = {} // 日期工具
Redirector = {} // 页面跳转工具
Page = {} // 分页工具

/************************************************ 以下是具体函数实现 *********************************/
//提示
Pop.tip = function(msg){
  layer.open({
    content: msg
    ,skin: 'msg'
    ,time: 2 //2秒后自动关闭
  });
}

// 文本切换
DomUtil.toggleText = function(obj,defaultTxt,txt){
    $(obj).text($(obj).text() == defaultTxt ? txt : defaultTxt)
}

DomUtil.isBottom = function(){
  console.log(document.body.scrollTop+" + "+window.innerHeight+" = "+document.documentElement.clientHeight) 
  return document.body.scrollTop+window.innerHeight == document.documentElement.clientHeight;
  // window.onscroll = function(e){
  //   console.log(document.body.scrollTop+" + "+window.innerHeight+" = "+document.documentElement.clientHeight) 
  // }
  
}

// 判断是否是手机号
Valid.isPhone = function(phone){
  var myreg=/^[1][3,4,5,6,7,8,9][0-9]{9}$/;
  return myreg.test(phone);
}
Valid.isEmpty = function (obj){
  return obj == undefined || obj == null || obj.toString().trim() == "";
}
Valid.isNotEmpty = (obj)=>!Valid.isEmpty(obj);


DateUtil.fmt = function (date, fmt) {
  if (date === undefined || date === null){
    return "";
  }
  date = new Date(date)
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      let str = o[k] + ''
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? str : DateUtil.padLeftZero(str))
    }
  }
  return fmt
}

DateUtil.yyyyMMdd = function(date){
  return DateUtil.fmt(date,"yyyy-MM-dd")
}

DateUtil.padLeftZero = function (str) {
  return ('00' + str).substr(str.length)
}

Redirector.jump = function (url,paramJson){  
  var paramStr = "";
  for (const key in paramJson) {
    
    if (paramJson.hasOwnProperty(key)) {
      const element = paramJson[key];
      paramStr += (key+"="+element+"&");
      localStorage.setItem(key,JSON.stringify(element));
    }
  }
  if (paramStr.endsWith("&")){    
    paramStr = paramStr.substr(0,paramStr.length-1);
  }
  if (paramStr != ""){
    paramStr = "?"+paramStr;
  }
  window.location.href = url+paramStr;
}

Redirector.getSrcParams = function(key){
  var params =  localStorage.getItem(key);
  localStorage.removeItem(key);
  return JSON.parse(params);
}

Page.of = function(){
  return {
    'current':0,
    'size':10,
    "pages": 1,
    "total": 0,
  }
}
Page.hasMorePage = function(page){                             
  return page.current < page.pages;
}
Page.resumePage = function(page,size){
  page.current = 0
  page.size = size === undefined ? 10 : size;
  page.pages = 1
  page.total = 0
}
Page.wrapPage = function(page,returnPage){
  page.current = returnPage.current;
  page.size = returnPage.size;
  page.pages = returnPage.pages;
  page.total = returnPage.total;
}
Page.moveToNextPage = function(page){
  page.current++;
}
/** 
 * 获取下一页数据
 * 该方法依赖 Vue的网络模块,且写死的GET请求 
 * url: 请求地址
 * targetArr: 分页数据records 将赋值到该数组
 * cleanTargetArrBeforeSetNewVals: 是否每次都清空目标数组
 * noMoreCallback: 没有更多数据后的回调
 */
Page.next = function(page,url,targetArr,cleanTargetArrBeforeSetNewVals,noMoreCallback){
  console.log("===",page);
  if (Page.hasMorePage(page)){
    Page.moveToNextPage(page);
    Vue.http.get(url,{params:page})
    .then(function (data) {
        Response.httpRespHandle(data,(bizData)=>{ 
            if (cleanTargetArrBeforeSetNewVals == true){
              targetArr.length = 0
            }
            for (var i = 0; i< bizData.records.length; i++){
              targetArr.push(bizData.records[i]);
            }
            Page.wrapPage(page,bizData);
        },(errMsg)=>{Pop.tip(errMsg)},(errMsg)=>{Pop.tip(errMsg)});
    })
  } else {
    if (noMoreCallback != undefined){
      noMoreCallback();
    }
  }
}

/** 
 * 获取上一页数据
 * 该方法依赖 Vue的网络模块,且写死的GET请求 
 * url: 请求地址
 * targetArr: 分页数据records 将赋值到该数组
 * cleanTargetArrBeforeSetNewVals: 是否每次都清空目标数组
 * noMoreCallback: 没有更多数据后的回调
 */
Page.prev = function(page,url,targetArr,cleanTargetArrBeforeSetNewVals,noMoreCallback){
  if (!Page.isBeforeFirstPage(page)){
    Page.moveToPrevPage(page);
    Vue.http.get(url,{params:page})
    .then(function (data) {
        Response.httpRespHandle(data,(bizData)=>{ 
            if (cleanTargetArrBeforeSetNewVals == true){
              targetArr.length = 0
            }
            for (var i = 0; i< bizData.records.length; i++){
              targetArr.push(bizData.records[i]);
            }
            Page.wrapPage(page,bizData);
        },(errMsg)=>{Pop.tip(errMsg)},(errMsg)=>{Pop.tip(errMsg)});
    })
  } else {
    console.log(123);
    if (noMoreCallback != undefined){      
      noMoreCallback();
    }
  }
}
Page.isBeforeFirstPage = function(page){
  return page.current <= 1;
}
Page.moveToPrevPage = function(page){
  page.current--;
}