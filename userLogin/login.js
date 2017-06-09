    jQuery.support.cors = true;
 var host = "http://118.89.48.183:8080/Planter/login";
 // var host = "http://192.168.235.50:8080/login";
 // var host = "http://10.173.8.165:8080/login";
        var code=null;
        //var admin="";
        function login(user){
            // if(checkUserName(user)&& checkUserPwd(user)){
            if(true){
                var data = { 
                    userName: $('#'+ user + 'UserName').val().toString(), 
                    userPassword: $('#'+ user + 'Password').val(),
                    Rank: user=='tea'? 0 : 1
                };
                console.log(data);
                $.ajax({ 
                    type: 'POST',
                    url: host,
                    data: JSON.stringify(data),
                    cache: false,
                    contentType: "application/json;charset=utf-8",   
                    async:false, 
                    dataType:"json",
                    statusCode:{
                        403:function(data){
                            alert("请求不允许~");
                        },
                        404:function(data){
                            alert("输入有误~");
                        }
                    },
                    success: function(d){
                        console.log(d);
                        if(d.error_code == 200){
                            var rank = d.data.Rank;
                            var userId = '';
                            if(rank == 0){
                                userId = d.data.t_id;
                            }else{
                                userId = d.data.s_id;
                            }
                            var userName = $('#'+ user + 'UserName').val();
                            $.cookie('cookieRank', null);  
                            $.cookie("cookieRank", rank, {expires: 30, path: '/'});
                            $.cookie('cookieUserId', null);  
                            $.cookie("cookieUserId", userId, {expires: 30, path: '/'});
                            $.cookie('cookieUserName', null);  
                            $.cookie("cookieUserName", userName, {expires: 30, path: '/'});
                            window.location.href = '../';
                            return;
                        }else{
                            alert(d.reason);
                        }
                                         
                    },
                    error:function(data){               
                        console.log(data);
                    }                 
                });  
            }else{ 
                checkUserName(); 
                checkUserPwd(); 
                checkCheckCode(); 
            }
        }   

        $("#b").click(function(){
            login();
        })
        function getCode(){
            code= new Date().valueOf();
            $("#code").attr('src',host+"/api/User/GetFile?icode="+(code));
        }
        //check the userName 
        function checkUserName(user){ 
            if($('#'+ user + 'UserName').val().length == 0){ 
                $('#'+ user + 'UserName').parent("span").parent("label").next("span").css("color","red").text("*用户名不能为空"); 
                return false; 
            }else if($('#'+ user + 'UserName').val().length< 3||$('#'+ user + 'UserName').val().length >30){ 
                $('#'+ user + 'UserName').parent("span").parent("label").next("span").css("color","red").text("*用户名应为3-30位"); 
                return false; 
            }else{
                $('#'+ user + 'UserName').parent("span").parent("label").next("span").css("color","red").text(""); 
                return true; 
            }
        } 
        //check the pwd 
        function checkUserPwd(user){ 
            if($('#'+ user + 'Password').val().length == 0) 
            { 
                $('#'+ user + 'Password').parent("span").parent("label").next("span").css("color","red").text("*密码不能为空"); 
                return false; 
            } 
            else 
            { 
                $('#'+ user + 'Password').parent("span").parent("label").next("span").css("color","red").text(""); 
                return true; 
            } 
        } 
        // check the check code 
        function checkCheckCode(){ 
            if($('#c').val().length == 0) 
            { 
                $('#c').parent("span").parent("label").next("span").css("color","red").text("*验证码不能为空"); 
                return false; 
            } 
            else 
            { 
                $('#c').parent("span").parent("label").next("span").css("color","red").text(""); 
                return true; 
            } 
        } 

        //用户注册
        function register(){
            var url = "http://192.168.235.55:8080/web/signup";
            if(($('#Password').val())!=($('#conformPassword').val())){
                alert("两次输入密码不一致，请重新输入！");
                return false;
            }
            // var userType=$('input:radio[name="userType"]:checked').val();
            if(checkUserPwd('conform')&&checkUserPwd()){
                var data = { 
                    userName: $('#UserName').val(), 
                    userPassword: $('#Password').val()
                    // Rank: parseInt(userType)
                };
                console.log(data);
                $.ajax({ 
                    type: 'POST',
                    url: url,
                    data: JSON.stringify(data),
                    cache: false,
                    contentType: "application/json;charset=utf-8",    
                    async:false, 
                    dataType:"json",
                    statusCode:{
                        403:function(data){
                            alert("请求不允许~");
                        },
                        404:function(data){
                            alert("输入有误~");
                        }
                    },
                    success: function(d){
                        console.log(d);
                        if(d.error_code == 200){
                            var rank = parseInt(userType);
                            var userId = '';
                            if(rank == 0){
                                userId = d.data.t_id;
                            }else{
                                userId = d.data.s_id;
                            }
                            var userName = $('#UserName').val();
                            $.cookie('cookieRank', null);  
                            $.cookie("cookieRank", rank, {expires: 30, path: '/'});
                            $.cookie('cookieUserId', null);  
                            $.cookie("cookieUserId", userId, {expires: 30, path: '/'});
                            $.cookie('cookieUserName', null);  
                            $.cookie("cookieUserName", userName, {expires: 30, path: '/'});
                            window.location.href = '../';
                            return;
                        }else{
                            alert(d.reason);
                        }
                                         
                    },
                    error:function(data){               
                        console.log(data);
                    }                 
                });  
            }else{ 
                // checkUserName(); 
                checkUserPwd(); 
                checkUserPwd('conform');
                // checkCheckCode(); 
            } 
        }