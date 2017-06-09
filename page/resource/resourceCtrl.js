define(function (require) {
    var app = require('app');

    app.controller('resourceCtrl', ['$scope','$http','WebApi','common','$fileUploader', function($scope,$http,WebApi,common,$fileUploader) {

        var teacherId = $.cookie('cookieUserId');
    	//添加公告
        $scope.showNotice = function (){
        	$("#modal-addNotice").modal("show");
        }

        $scope.init = function () {
            $scope.activeCourse = common.Session.activeCourse;
            $scope.activeCourseTime = common.Session.activeCourseTime;
            getResourceList();
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

        //获取资源列表
        function getResourceList() {
        	var url = "/web/resource/getResourceList";
        	WebApi.Post(url,{
                c_id: $scope.activeCourse.c_id,
                t_id :teacherId
            },function(d){
                if(d.data){
                    $scope.resourceList = d.data;
                }else{
                    $("#resourceList").html("暂无资源，请先点击上传资源按钮进行资源上传...");
                }
            });
        }

        //删除资源
        $scope.deleteResource = function(resource){
            var url = "/web/resource/delete";
            WebApi.Post(url,{
                resource_id: $scope.activeResource.resource_id,
                c_id: $scope.activeCourse.c_id,
                t_id :teacherId
            },function(d){
                if(d.data.resource_file_delete_status == 1){
                    returnMessage("资源删除成功！");
                     getResourceList();
                }else{
                    returnMessage("资源删除失败，请重新删除！");
                }
            });
        }

        //删除确认弹出框
        $scope.deleteConform = function(resource){
            $("#modal-deleteConform").modal("show");
            $scope.activeResource = resource;
        }

        //更新资源
        $scope.updateResource = function(){
            setTimeout(function(){
                // clearInterval(timer);
                // $("#randomStudent").html(d.data.student_name);
                getResourceList();
            },100);
        }

        //用户提示弹出框
        function returnMessage(content){
            $("#modal-errorInfo").modal('show');
            $("#infoContent").html(content);
        }

        //上传文件
        $scope.fileUpload = function(){
            fileUploadAjax()
        }
        function fileUploadAjax() {
            if ($("#file_AjaxFile").val().length > 0) {
                //progressInterval=setInterval(getProgress,500);
                $.ajaxFileUpload({
                    // url: 'http://192.168.235.50:8080/FileUpload/fileUpload_ajax', //用于文件上传的服务器端请求地址
                    url: 'http://118.89.48.183:8080/Planter/FileUpload/fileUpload_ajax', //用于文件上传的服务器端请求地址
                    type: "post",
                    secureuri: false, //一般设置为false
                    fileElementId: 'file_AjaxFile', //文件上传空间的id属性  <input type="file" id="file1" name="file" />
                    dataType: 'application/json', //返回值类型 一般设置为json
                    data: {                    
                        't_id': teacherId,
                        'c_id': $scope.activeCourse.c_id                    },
                    success: function (data)  //服务器成功响应处理函数
                    {
                        console.log("1");
                        returnMessage("资源上传成功！");
                        getResourceList();
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
        //    var progressInterval = null;
        //    var i=0;
        //    var getProgress=function (){
        //        $.get("/FileUpload/fileUploadprogress",
        //            {},
        //            function (data) {
        //                $("#sp_fileUploadProgress").html(i+++data);
        //                if(data==100||i==100)
        //                    clearInterval(progressInterval);
        //            }
        //        );
        //    }

        //上传资源
        //插件ajaxfileupload.js
        $('#uploadResource').diyUpload({
	        url:'http://118.89.48.183:8080/FileUpload/fileUpload_ajax',
	        success:function( data ) {
	            console.info( data );
	            //完成上传后再次获取资源列表
	            //getResourceList();
	        },
	        error:function( err ) {
	            console.info( err );    
	        },
	        buttonText : "上传资源 <i class='glyphicon glyphicon-open icon-color'><i/>",
	        chunked:true,
	        // 分片大小
	        chunkSize:512 * 1024,
	        //最大上传的文件数量, 总文件大小,单个文件大小(单位字节);
	        fileNumLimit:50,
	        fileSizeLimit:500000 * 1024,
	        fileSingleSizeLimit:50000 * 1024,
	        accept: {}
	    });

        //文件上传插件
        var vm = $scope.vm = {};
            vm.uploader = $fileUploader.create({
            scope: $scope,
            url: 'http://192.168.235.50:8080/FileUpload/fileUpload_ajax',
            // headers: {'Content-Type':'multipart/form-data; boundary=----WebKitFormBoundaryC7O5QpW9CRGSJ9V8'},
            autoUpload: true,   // 自动开始上传
            formData: [          // 和文件内容同时上传的form参数
              { id: 'file_AjaxFile' }
            ],
            filters: [           // 过滤器，可以对每个文件进行处理
              function (item) {
                console.info('filter1', item);
                $scope.vm.uploader.uploadAll();
                $scope.fileName && ($scope.fileName += ' ' + item.name)
                $scope.fileName || ($scope.fileName = item.name)
                // $scope.fileUpload.PathName = nameSplit[0].substring(0,nameSplit[0].length-4);
                // $scope.addFunctionUrl();
                // $scope.getAllMenuList();
                // getAllAccessByMenu();
                return true;
              }
            ]
        });

    }]);

});
    