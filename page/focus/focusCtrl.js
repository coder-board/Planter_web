define(function (require) {
    var app = require('app');

    app.controller('focusCtrl', ['$scope','$http','WebApi','common', function($scope,$http,WebApi,common) {

        var teacherId = $.cookie('cookieUserId');
        //添加公告
        $scope.showNotice = function (){
            $("#modal-addNotice").modal("show");
        }
        
        $scope.init = function () {
            $scope.activeCourse = common.Session.activeCourse;
            $scope.activeCourseTime = common.Session.activeCourseTime;
            $scope.isStart = common.Session.isStart;
            $scope.isChosen = true;
            $scope.stop = true;
            getStudentList();
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
                }else{
                    returnMessage("开课失败，请重新开课！");
                }
            });
        }

        //结课
        $scope.endClass = function () {
            var url = "/web/course/classEnd";
            WebApi.Post(url, {
                class_end_time: new Date().Format("yyyy-MM-dd hh:mm:ss"),
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
                    $scope.isStart = false;
                    common.Session.isStart = $scope.isStart;
                }else{
                    returnMessage("结课失败，请重新结课！");
                }
            });
        }

        //开启普通专注
        // 专注类型
        // public static final int ATTENTION_TYPE_NORMAL = 1; 普通专注
        // public static final int ATTENTION_TYPE_GROUP = 2; 小组专注
        $scope.startFocus = function (type) {
            // $scope.activeType = type;
        	$scope.isStartFocus = true;
            $scope.isGroup = false;
            $scope.isCommon = false;
            $scope.isChosen = false;
            $scope.startTime = new Date().Format("yyyy-MM-dd hh:mm:ss");
            var url = "/web/attention/normalAttentionBegin";
            WebApi.Post(url, {
                attention_duration: type == 'isGroup'?$scope.groupDuration:$scope.commonDuration,
                attention_type: type == 'isGroup'?2:1,
                t_id :teacherId,
                c_id :$scope.activeCourse.c_id,
                attention_time:$scope.startTime,
                open_class_id : common.Session.openClassId
            }, function (d) {
                if(d.data.attention_begin == 1){
                    $scope.duration = $scope.commonDuration; 
                    returnMessage("专注开启成功，请您耐心等待专注结果！");
                }else{
                    returnMessage("专注开启失败，请重新开启！");
                }
            });
        }

        //开启小组专注
        $scope.startGroupFocus = function(){
            $scope.isStartFocus = true;
            $scope.isGroup = false;
            $scope.isChosen = false;
            var checkedGroup = "";
            $scope.startTimeG = new Date().Format("yyyy-MM-dd hh:mm:ss");
            $scope.groupList.forEach(function(item){
                if(item.isChecked && item.isChecked == "yes"){
                    checkedGroup += item.group_name + ','
                }
            })
            var url = "/web/attention/groupAttentionBegin";
            WebApi.Post(url, {
                group_name: checkedGroup,
                attention_duration: $scope.groupDuration,
                attention_type: 2,
                t_id :teacherId,
                c_id :$scope.activeCourse.c_id,
                attention_time:$scope.startTimeG,
                attention_student_need_score: $scope.studentNeed,
                open_class_id : common.Session.openClassId
            }, function (d) {
                if(d.data.attention_begin == 1){
                    $scope.duration = $scope.groupDuration;
                    returnMessage("专注开启成功，请您耐心等待专注结果！");
                }else{
                    returnMessage("专注开启失败，请重新开启！");
                }
            });

        }

        //保存选中小组
        $scope.checkedGroup = function(group){
            group.isChecked || (group.isChecked = "no")
            if(group.isChecked == "no"){
                group.isChecked = "yes";
            }else{
                group.isChecked = "no";
            }
        }

        //获取小组列表
        function getGroupList(){
            var url = "/web/attention/prepareGroupAttention";
            WebApi.Post(url, {
                t_id :teacherId,
                c_id :$scope.activeCourse.c_id,
            }, function (d) {
                $scope.groupList = d.data
            });
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

        //选择专注类型
        $scope.chooseType = function(type){
            if(!$scope.isStart){
                returnMessage("请先开课，再使用此功能！");
                return;
            }
            $scope.isChosen = false;
            if(type == 'isCommon'){
                $scope.isCommon = true;
                $scope.isGroup = false;
            }else{
                $scope.isCommon = false;
                $scope.isGroup = true;
                getGroupList();
            }
        }

        //返回选择类型界面
        $scope.backType = function(type){
            $scope.isChosen = true;
            if(type == 'isCommon'){
                $scope.isCommon = false;
            }else{
                $scope.isGroup = false;
            }
        }

        //重新开启一轮
        //{"error_code":200,"reason":"no reason","data":{"attention_begin":0}}
        $scope.reset = function(flag){
            var url = "/web/attention/normalAttentionEnd"; 
            if(!flag){
                $scope.stop = false;
            }else{
                $scope.isStartFocus = false;
                $scope.isChosen = true;
                $scope.stop = true;
            }
            WebApi.Post(url, {
                t_id :teacherId,
                c_id :$scope.activeCourse.c_id,
                attention_end_time :new Date().Format("yyyy-MM-dd hh:mm:ss"),
                open_class_id : common.Session.openClassId
            }, function (d) {
                // if(d.data.attention_begin == 1){
                //     returnMessage("专注开启成功，请您耐心等待专注结果！");
                // }else{
                //     returnMessage("专注开启失败，请重新开启！");
                // }
            });
        }

        //用户提示弹出框
        function returnMessage(content){
            $("#modal-errorInfo").modal('show');
            $("#infoContent").html(content);
        }



    }]);

});
    