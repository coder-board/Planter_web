define(function (require) {
    var app = require('app');

    app.controller('uploadHomeworkCtrl', ['$scope','$http','WebApi','common', function($scope,$http,WebApi,common) {

        var studentId = $.cookie('cookieUserId');
        // var studentId = 'aa4b3bc0-e9c3-4c9d-8c5e-0c80d6ae3b41';

        $scope.init = function () {
        	// getActiveCourse();
        
        	// $("#courseList").html 
        	getCourseList();

        }

        //获取学生班级列表
        function getCourseList (){
        	var url = "/web/login/getStudentCourseInfoList";
        	WebApi.Post(url,{
                // c_id: $scope.activeCourse.c_id,
                s_id :studentId
            },function(d){
                if(d.data.length!=0){
                	$scope.courseList = d.data
                    if(!common.Session.activeCourse){
                        $scope.getActiveCourse(d.data[0],true);
                    }else{
                        $scope.getActiveCourse(common.Session.activeCourse,false);
                    }
                }else{
                    $("#homeworkList").html("当前尚未加入任何课程，请先在手机端加入课程...");
                }

            });
        }		

        //获取当前课程信息
        $scope.getActiveCourse = function(course,flag){
            if(flag){
                $("#modal-courseList").modal("show");
            }
        	$scope.activeCourse = course; 
        	common.Session.activeCourse || (common.Session.activeCourse = course)
        	var url = "/web/homework/getStudentHomeworkInfoList";
        	WebApi.Post(url,{
                c_id: course.c_id,
                s_id :studentId
            },function(d){
                if(d.data){
                	$scope.homeworkList = d.data
                	// $scope.getActiveCourse(d.data[0]);
                }else{
                    // returnMessage("当前课程暂无作业信息，请切换其他课程！")
                    $("#homeworkList").html("当前课程暂无作业信息，请切换其他课程！");
                }

            });
        }

        //学生选择的课程
        $scope.selectedCourse = function (course){
        	$scope.activeCourse = course;
        	common.Session.activeCourse = course;
            $scope.getActiveCourse(course,false);
        }

        //显示作业详情
        $scope.showHomeworkContent = function(content){
            $scope.homeworkContent = content;
            $("#modal-homeworkContent").modal("show");
        }
         

	    //用户提示弹出框
        function returnMessage(content){
            $("#modal-errorInfo").modal('show');
            $("#infoContent").html(content);
        }

        //上传文件
        $scope.fileUpload = function(task){
            $scope.activeTask = task
            fileUploadAjax(task)
        }
        function fileUploadAjax(task) {
            if ($("#" + task.homework_id).val().length > 0) {
                //progressInterval=setInterval(getProgress,500);
                $.ajaxFileUpload({
                    // url: 'http://192.168.235.50:8080/FileUpload/studentFileUpload', //用于文件上传的服务器端请求地址
                    url: 'http://118.89.48.183:8080/Planter/FileUpload/studentFileUpload', //用于文件上传的服务器端请求地址
                    type: "post",
                    secureuri: false, //一般设置为false
                    fileElementId: task.homework_id, //文件上传空间的id属性  <input type="file" id="file1" name="file" />
                    dataType: 'application/json', //返回值类型 一般设置为json
                    data: {                    
                        's_id': studentId,
                        'c_id': $scope.activeCourse.c_id,
                        'homework_id': $scope.activeTask.homework_id ,
                        'homework_student_submit_time': new Date().Format("yyyy-MM-dd hh:mm:ss")                 
                    },
                    success: function (data)  //服务器成功响应处理函数
                    {
                        returnMessage("作业上传成功！");
                        $scope.getActiveCourse(common.Session.activeCourse,false);
                        // var jsonObject = eval('(' + data + ')');
                        // $("#sp_AjaxFile").html(" Upload Success ！ filePath:" + jsonObject.filePath);
                    },
                    error: function (data /*status, e*/)//服务器响应失败处理函数
                    {
                        // console.log("0");
                        // getResourceList();
                    }
                });//end ajaxfile
            }
            else {
                alert("请选择文件!");
            }
        }

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


    }]);

});
    