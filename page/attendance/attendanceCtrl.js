define(function (require) {
    var app = require('app');

    app.controller('attendanceCtrl', ['$scope','$http','WebApi','common', function($scope,$http,WebApi,common) {

    	var teacherId = $.cookie('cookieUserId');
    	var attendanceList = [];
        $scope.init = function () {
            $scope.activeCourse = common.Session.activeCourse;
        	$scope.activeCourseTime = common.Session.activeCourseTime;
            $scope.isStart = common.Session.isStart;
            $scope.isSend = false;
            $scope.isReceived = false;
            // $scope.isStart = false;
            // $scope.attendanceList = [];

            // getLocation();
            getStudentList();
            if(common.Session.attendanceCode){
                $scope.attendanceCode = common.Session.attendanceCode;
            }
        }

        //开课
        $scope.startClass = function(){
            var url = "/web/course/classBegin";
            WebApi.Post(url, {
                class_begin_time: new Date().Format("yyyy-MM-dd hh:mm:ss"),
                c_id: $scope.activeCourse.c_id,
                t_id :teacherId
            }, function (d) {
                /*class_begin_status
                public static final int CLASS_STATUS_OPEN = 1; // 表示已开课
                public static final int CLASS_STATUS_CLOSE = 0; // 表示已结课
                */
                if(d.data.class_begin_status == 1){
                    returnMessage("开课成功！");
                    $scope.isStart = true;
                    common.Session.isStart = $scope.isStart;
                    if(common.Session.openClassId){
                        return true;
                    }else{
                        common.Session.openClassId = d.data.open_class_id; 
                    }
                    getCode();
                }else{
                    returnMessage("开课失败，请重新开课！");
                }
            });
        }

        //获取学生列表
        function getStudentList() {
            var url = "/web/randomAsk/enterAskModule";
            WebApi.Post(url, {
                c_id: $scope.activeCourse.c_id,
                t_id :teacherId
            }, function (d) {
                $scope.studentList = d.data;
            });
        }

        //收集总结反馈
        $scope.summary = function(){
            var url = "/web/summary/summarySend";
            WebApi.Post(url, {
                summary_request_time: new Date().Format("yyyy-MM-dd hh:mm:ss"),
                open_class_id: common.Session.openClassId,
                t_id :teacherId
            }, function (d) {
                if(d.data.summary_status == 1){
                    returnMessage("收集反馈已开启，请您稍后去【往期考勤与反馈】查看！");
                }else{
                    returnMessage("收集反馈失败，请重新收集！");
                }
            });
        }

        //结课，显示已发送界面
        $scope.endClass = function (flag1,flag2) {
            var url = "/web/course/classEnd";
            WebApi.Post(url, {
                class_begin_time: new Date().Format("yyyy-MM-dd hh:mm:ss"),
                c_id: $scope.activeCourse.c_id,
                t_id :teacherId,
                open_class_id : common.Session.openClassId
            }, function (d) {
                /*class_begin_status
                public static final int CLASS_STATUS_OPEN = 1; // 表示已开课
                public static final int CLASS_STATUS_CLOSE = 0; // 表示已结课
                */
                if(d.data.class_begin_status == 0){
                    returnMessage("结课成功！");
                    $scope.isSend = flag1;
                    $scope.isReceived = flag2;
                    $scope.isStart = false;
                    common.Session.isStart = $scope.isStart;
                }else{
                    returnMessage("结课失败，请重新结课！");
                }
            });
        }

        //获取签到码
        //{"error_code":200,"reason":"desc","data":{"attendance_code":"644577"}}
        function getCode (){
        	var url = "/web/attendance/getAttendanceCode";
        	WebApi.Post(url, {
                class_open_time: new Date().Format("yyyy-MM-dd hh:mm:ss"),
                c_id: $scope.activeCourse.c_id,
                t_id :teacherId,
                open_class_id : common.Session.openClassId
            }, function (d) {
                if(d.error_code == 200){
                    $scope.attendanceCode = d.data.attendance_code;
                    common.Session.attendanceCode = $scope.attendanceCode;
                }
            });
        }

         //添加公告
        $scope.showNotice = function (){
        	$("#modal-addNotice").modal("show");
        }

        //添加课程
        $scope.showAdd = function () {
            $("#modal-addCourse").modal("show");
        }

        //发送考勤通知，显示考勤列表
        //{"error_code":200,"reason":"desc","data":{"attendance_code_send_status":1}}
        $scope.sendNotice = function(){
        	if(!$scope.isStart){
        		returnMessage("请先开课，再使用此功能！");
        		return;
        	}
        	$scope.isSend = true;
        	$scope.isReceived = false;
        	var url = "/web/attendance/check";
        	WebApi.Post(url, {
                attendance_code: $scope.attendanceCode,
                c_id: $scope.activeCourse.c_id,
                t_id :teacherId,
                open_class_id : common.Session.openClassId
            }, function (d) {
                if(d.data.attendance_code_send_status == 1){
                    returnMessage("考勤码发送成功，请您耐心等待考勤结果！");
                }else{
                    returnMessage("考勤码发送失败，请重新发送！");
                }
            });
        }

        //返回考勤界面
        $scope.backAttendance = function(flag1,flag2){
        	$scope.isSend = flag1;
        	$scope.isReceived = flag2;
        	if(flag2){
        		getFeedbackList();
        	}
        }

        //获取往期反馈列表
        function getFeedbackList(){
        	var url = "/web/summary/getSummaryAndAttendanceHistory";
        	WebApi.Post(url, {
                // attendance_code: $scope.attendanceCode,
                c_id: $scope.activeCourse.c_id,
                t_id :teacherId,
                open_class_id : common.Session.openClassId
            }, function (d) {
                $scope.feedbackList = d.data;
                creatTableList();
            });
        } 

        //显示反馈详情
        $scope.showDetail = function(student){
        	$("#modal-showDetail").modal("show");
        	var url = "/web/summary/getStudentSummaryList";
        	WebApi.Post(url, {
                // attendance_code: $scope.attendanceCode,
                c_id: $scope.activeCourse.c_id,
                // s_id: student.s_id,
                t_id: teacherId,
                class_open_time :student.class_open_time,
                open_class_id : common.Session.openClassId
            }, function (d) {
                $scope.feedbackDetail = d.data;
                creatTableDetail();
            });

        }

        //创建反馈详情表格
        function creatTableDetail() {
             $('#tableDetail').bootstrapTable({
                cache: false,
                height: 320,  
                striped: true,
                pagination: false,
                pageNumber: 1,
                pageSize: 10,
                pageList: [10, 25, 50],
                search: false, //不显示 搜索框  
                showColumns: false, //不显示下拉框（选择显示的列）  
                sidePagination: "client", //客户端请求  
                minimumCountColumns: 2,
                clickToSelect: true,
                columns: [{
                    field: 'student_name',
                    align: 'center',
                    title: '姓名'
                }, {
                    field: 'summary_content',
                    align: 'center',
                    title: '总结反馈',
                    cellStyle: formatTableUnit
                }, {
                    field: 'summary_result',
                    align: 'center',
                    title: '受理',
                    events: operateEvents,
                    formatter: summaryFormatter
                }],
                data:$scope.feedbackDetail
            });
        }
        function formatTableUnit(value, row, index) {
            var width = '70%';
            var bg_color = 'white';
            return {
                css: {
                    "width":width,
                }
            }
        }

        // 教师回复反馈的结果
        // public static final int SUMMARY_REASONABLE = 1;
        // public static final int SUMMARY_THANKS = -1;
        // public static final int SUMMARY_DEFAULT = 0; // 默认状态下不评价
        function summaryFormatter(value, row, index) {
            if(row.summary_result == 0){
               return [
                    '<a class="RoleOfYes pointer" style="margin-right:10px;">合理' + ' ' + 
                    '<a class="RoleOfNo pointer">谢谢'
                ].join(''); 
            }else if(row.summary_result == 1){
                return [
                    '合理'
                ].join(''); 
            }else{
                return [
                    '谢谢'
                ].join(''); 
            }
            
        }

        //评价学生反馈
        function handleSummary(student,handel){
            var url = "/web/summary/handleSummary";
            WebApi.Post(url, {
                // attendance_code: $scope.attendanceCode,
                c_id: $scope.activeCourse.c_id,
                s_id: student.s_id,
                t_id: teacherId,
                class_open_time :student.class_open_time,
                summary_result: handel
            }, function (d) {
                // $scope.feedbackDetail = d.data;
                // creatTableDetail();
                $scope.showDetail(student);
            });
        }


        //用户提示弹出框
        function returnMessage(content){
            $("#modal-errorInfo").modal('show');
            $("#infoContent").html(content);
        }

        //创建反馈列表表格
        function creatTableList(){
        	$('#tableList').bootstrapTable({
                cache: false,
                height: 270,  
                striped: true,
                pagination: false,
                pageNumber: 1,
                pageSize: 10,
                pageList: [10, 25, 50],
                search: false, //不显示 搜索框  
                showColumns: false, //不显示下拉框（选择显示的列）  
                sidePagination: "client", //客户端请求  
                minimumCountColumns: 2,
                queryParams: function (params) {
                    // return {
                    //     BeginTime: $scope.BeginTime,
                    //     EndTime: $scope.EndTime,
                    //     LotteryId: $scope.lotteryId,
                    //     SchemeId: $scope.schemeId
                    // };
                },
                clickToSelect: true,
                columns: [{
                    field: 'class_open_time',
                    align: 'center',
                    title: '开课时间'
                }, {
                    field: 'attendance_count',
                    align: 'center',
                    title: '出勤人数'
                },  {
                    field: 'absence_count',
                    align: 'center',
                    title: '缺勤人数'
                },{
                    field: 'detial',
                    align: 'center',
                    title: '课堂反馈',
                    events: operateEvents,
                    formatter: operateFormatter
                }],
                data:$scope.feedbackList
            });

        }

        // 网页端 显示教师处理的三种情况
        // public static final int SUMMARY_NO_SUMMARY = 1; // 暂无反馈
        // public static final int SUMMARY_ALL_DONE = 2; // 所有反馈均处理
        // public static final int SUMMARY_NOT_FINISHED = 3; // 有反馈未处理
        function operateFormatter(value, row, index) {
            if(row.summary_handle_status == 3){
               return [
                    '<a class="RoleOfA pointer" style="margin-right:15px;">查看(新增'+ 
                    '<strong id="notFinished">' + row.summary_new_files + '</strong>份)</button>'
                ].join(''); 
            }else if(row.summary_handle_status == 2){
                return [
                    '<a class="RoleOfA pointer" style="margin-right:15px;">查看</button>'
                ].join(''); 
            }else{
                return [
                    '<a class="RoleOfA" style="margin-right:15px;">暂无</button>'
                ].join(''); 
            }
            
        }

        window.operateEvents = {
            'click .RoleOfA': function (e, value, row, index) {
                // console.log(row);
                if(row.summary_handle_status != 1)
                // $("#modal-showDetail").modal('show');
                $scope.showDetail(row);
            },
            'click .RoleOfYes': function (e, value, row, index) {
                // console.log(row);
                handleSummary(row,1);
                // $scope.showDetail(row);
            },
            'click .RoleOfNo': function (e, value, row, index) {
                console.log(row);
                // if(row.summary_handle_status != 1)
                // $("#modal-showDetail").modal('show');
                handleSummary(row,-1);
            },

        };

        //信息推送
        var goEasy = new GoEasy({
	        appkey: "BC-be5f25350dac454d943677328902cccc"
		});
        
	    goEasy.subscribe({
	        channel: 'Planter',
	        onMessage: function(message){
	        	var data = JSON.parse(message.content);
                var moduleId = data.module_id;
                switch(moduleId)
                {
                case 1:
                  
                    break;
                case 2:
                  
                    break;
                case 3: //考勤类推送（学生实时考勤列表）
                    if(data.t_id == teacherId && data.c_id == $scope.activeCourse.c_id
                        && data.attendance_check_end == false){
                        var len = document.getElementById('attendanceList').innerHTML+=
                    "<li style='padding: 10px 15px;'>" + data.student_name + "考勤成功，获得相应考勤奖励！</li>";

                    }else if(data.attendance_check_end == true){
                    // var len = document.getElementById('attendanceList').innerHTML+=
                    // "<li style='padding: 10px 15px;'>" + data.student_name + "考勤成功，目前" + 
                    // data.attendance_count + "次出勤！</li>";

                    var end = document.getElementById('endAttendance').innerHTML = "考勤结束，此次考勤共" +
                     data.attendance_total_count + "人出席！";
                    }    
                    break;
                case 4: //专注推送类（专注列表）
                    // 学生专注状态
                    // public static final int ATTENTION_STATUS_SUCCESS = 1;
                    // public static final int ATTENTION_STATUS_DEFAULT = 0; // 默认状态不专注
                    // public static final int ATTENTION_STATUS_FAIL = -3;
                    // public static final int ATTENTION_STATUS_ATTENTIONING = 2; // 正在专注
                    // public static final int ATTENTION_STATUS_NOT_PAY_ATTENTION = -1; // 未参与本次专注
                    // public static final int ATTENTION_STATUS_NOT_IN_TIME = -2; // 不在专注时间
                    if(data.attention_type == 1){
                        if(data.attention_status == -3){
                            var len = document.getElementById('focusList').innerHTML+=
                        "<li style='padding: 10px 15px;'>" + data.student_name + "专注失败，"
                         + data.attention_insist_time + "后开小差啦！</li>";

                        }else if(data.attention_status == 1){
                            var len = document.getElementById('focusList').innerHTML+=
                            "<li style='padding: 10px 15px;'>" + data.student_name + "专注成功，"+
                            "该同学有在认真呦！</li>";
                        }
                    }else if(data.attention_type == 2){
                         if(data.attention_status == -3){
                            var len = document.getElementById('focusList').innerHTML+=
                        "<li style='padding: 10px 15px;'>" + data.student_name + "专注失败，"
                         + data.attention_insist_time + "后开小差啦！</li>";

                        }else if(data.attention_status == 1){
                            var len = document.getElementById('focusList').innerHTML+=
                            "<li style='padding: 10px 15px;'>" + data.student_name + "打了"+
                            data.attention_score + "分，该同学有在认真呦！</li>";
                        }
                    }
                    
                    break;
                case 5: //反馈类推送（学生新增反馈数）

                    break;
                }
	        	
	        }

	    });




        // 对Date的扩展，将 Date 转化为指定格式的String
		// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
		// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
		// 例子： 
		// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
		// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
		Date.prototype.Format = function(fmt)   
		{ //author: meizz   
		  var o = {   
		    "M+" : this.getMonth()+1,                 //月份   
		    "d+" : this.getDate(),                    //日   
		    "h+" : this.getHours(),                   //小时   
		    "m+" : this.getMinutes(),                 //分   
		    "s+" : this.getSeconds(),                 //秒   
		    "q+" : Math.floor((this.getMonth()+3)/3), //季度   
		    "S"  : this.getMilliseconds()             //毫秒   
		  };   
		  if(/(y+)/.test(fmt))   
		    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
		  for(var k in o)   
		    if(new RegExp("("+ k +")").test(fmt))   
		  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
		  return fmt;   
		}  

        var x=document.getElementById("demo");
	    $scope.location = function () {
	    	getLocation();
	    }
	    function getLocation (){
	        if (navigator.geolocation){
	            navigator.geolocation.getCurrentPosition(showPosition,showError);
	        }else{
	            alert("浏览器不支持地理定位。"); 
	        }
	    }


		//获取用户地理位置失败时的一些错误代码处理方式
		function showError(error){ 
		  switch(error.code) { 
		    case error.PERMISSION_DENIED: 
		      alert("定位失败,用户拒绝请求地理定位"); 
		      break; 
		    case error.POSITION_UNAVAILABLE: 
		      alert("定位失败,位置信息是不可用"); 
		      break; 
		    case error.TIMEOUT: 
		      alert("定位失败,请求获取用户位置超时"); 
		      break; 
		    case error.UNKNOWN_ERROR: 
		      alert("定位失败,定位系统失效"); 
		      break; 
		  } 
		} 

		// 调用coords的latitude和longitude即可获取到用户的纬度和经度
		function showPosition(position){ 
		  var lat = position.coords.latitude; //纬度 
		  var lag = position.coords.longitude; //经度 
		  alert('纬度:'+lat+',经度:'+lag); 
		} 


        //导出Excel文件
        $scope.toExcel = function(inTblId, inWindow) {
		    if (navigator.userAgent.toLowerCase().indexOf("msie")>0 || !!window.ActiveXObject || "ActiveXObject" in window) { //如果是IE浏览器 
		        try {
		            var allStr = "";
		            var curStr = "";
		            if (inTblId != null && inTblId != "" && inTblId != "null") {
		                curStr = getTblData(inTblId, inWindow);
		            }
		            if (curStr != null) {
		                allStr += curStr;
		            } else {
		                alert("你要导出的表不存在！");
		                return;
		            }
		            var fileName = getExcelFileName();
		            doFileExport(fileName, allStr);
		        } catch(e) {
		            alert("导出发生异常:" + e.name + "->" + e.description + "!");
		        }
		    } else {
		        // window.open('data:application/vnd.ms-excel,' + encodeURIComponent($('div[id$=divGvData]').html()));
		        // e.preventDefault();
		        $('#'+ inTblId).tableExport({type: 'excel', escape: 'false',fileName: '学生考勤列表'});
		    }
		}
		function getTblData(inTbl, inWindow) {
		    var rows = 0;
		    var tblDocument = document;
		    if ( !! inWindow && inWindow != "") {
		        if (!document.all(inWindow)) {
		            return null;
		        } else {
		            tblDocument = eval(inWindow).document;
		        }
		    }
		    var curTbl = tblDocument.getElementById(inTbl);
		    if (curTbl.rows.length > 65000) {
		        alert('源行数不能大于65000行');
		        return false;
		    }
		    if (curTbl.rows.length <= 1) {
		        alert('数据源没有数据');
		        return false;
		    }
		    var outStr = "";
		    if (curTbl != null) {
		        for (var j = 0; j < curTbl.rows.length; j++) {
		            for (var i = 0; i < curTbl.rows[j].cells.length; i++) {
		                if (i == 0 && rows > 0) {
		                    outStr += " \t";
		                    rows -= 1;
		                }
		                var tc = curTbl.rows[j].cells[i];
		                if (j > 0 && tc.hasChildNodes() && tc.firstChild.nodeName.toLowerCase() == "input") {
		                    if (tc.firstChild.type.toLowerCase() == "checkbox") {
		                        if (tc.firstChild.checked == true) {
		                            outStr += "是" + "\t";
		                        } else {
		                            outStr += "否" + "\t";
		                        }
		                    }
		                } else {

		                    outStr += " " + curTbl.rows[j].cells[i].innerText + "\t";
		                }
		                if (curTbl.rows[j].cells[i].colSpan > 1) {
		                    for (var k = 0; k < curTbl.rows[j].cells[i].colSpan - 1; k++) {
		                        outStr += " \t";
		                    }
		                }
		                if (i == 0) {
		                    if (rows == 0 && curTbl.rows[j].cells[i].rowSpan > 1) {
		                        rows = curTbl.rows[j].cells[i].rowSpan - 1;
		                    }
		                }
		            }
		            outStr += "\r\n";
		        }
		    } else {
		        outStr = null;
		        alert(inTbl + "不存在!");
		    }
		    return outStr;
		}
		function getExcelFileName() {
		    var d = new Date();
		    var curYear = d.getYear();
		    var curMonth = "" + (d.getMonth() + 1);
		    var curDate = "" + d.getDate();
		    var curHour = "" + d.getHours();
		    var curMinute = "" + d.getMinutes();
		    var curSecond = "" + d.getSeconds();
		    if (curMonth.length == 1) {
		        curMonth = "0" + curMonth;
		    }
		    if (curDate.length == 1) {
		        curDate = "0" + curDate;
		    }
		    if (curHour.length == 1) {
		        curHour = "0" + curHour;
		    }
		    if (curMinute.length == 1) {
		        curMinute = "0" + curMinute;
		    }
		    if (curSecond.length == 1) {
		        curSecond = "0" + curSecond;
		    }
		    var fileName = "设备状态" + curYear + curMonth + curDate + curHour + curMinute + curSecond + ".xls";
		    return fileName;
		}
		function doFileExport(inName, inStr) {
		    var xlsWin = null;
		    if ( !! document.all("glbHideFrm")) {
		        xlsWin = glbHideFrm;
		    } else {
		        var width = 1;
		        var height = 1;
		        var openPara = "left=" + (window.screen.width / 2 + width / 2) + ",top=" + (window.screen.height + height / 2) + ",scrollbars=no,width=" + width + ",height=" + height;
		        xlsWin = window.open("", "_blank", openPara);
		    }
		    xlsWin.document.write(inStr);
		    xlsWin.document.close();
		    xlsWin.document.execCommand('Saveas', true, inName);
		    xlsWin.close();
		}

    }])
	
	.filter("transComment",function(){
        return function(v){
            return v==1?"合理":v==1?"谢谢":"未处理";
        }
    })

});
    
