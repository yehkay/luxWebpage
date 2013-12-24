var screenH; //screen height
        var screenW; //screen width
        var current_timestamp = Math.round((new Date().getTime())/1000); //current unix timestamp
        var hash = window.location.hash;


        var addTeamInfo = $(".rows.fifth").detach(); //detach the participant block html

        //function to re-run the dimension specs on a window resize
        function resize(){
            screenH = $(window).height();
            screenW = $(window).width();
            $('.screen-wrap').each(function(){
                $(this).css({ minHeight: screenH
                    //width: screenW
                });
            });
        }

        function snapto(elem){
            var offsetTop = ($(elem).offset()).top;
            $('body,html').animate({ scrollTop: offsetTop }, 1000);
        }

        function toggleMenu(){
            $('.mobile-menu-btn').click();
        }

        $(function(){
            resize();
        });

        function change_header(){
            if($(this).scrollTop() > screen_offset ){
                $('.menubar').addClass('changed');
            }
            if($(this).scrollTop() < screen_offset ) {
                $('.menubar').removeClass('changed');
            }
        }


        function check_hash(){
            switch (hash){
                // case '#loginerr':
                //     snapto('.screen-wrap.signin');
                //     $('#signin-msg.msg-holder').addClass('error');
                //     $('#signin-msg.msg-holder').text('Invalid username/password');
                //     $('#signin-msg.msg-holder').fadeIn().delay(3000).fadeOut();
                // break;

                case '#rules':
                    snapto('.screen-wrap.rules');
                break;

                case '#task':
                    snapto('.screen-wrap.task');
                break;

                case '#prize':
                    snapto('.screen-wrap.prize');
                break;

                case '#judges':
                    snapto('.screen-wrap.judges');
                break;

                // case '#signin':
                //     snapto('.screen-wrap.signin');
                // break;

                // case '#register':
                //     snapto('.screen-wrap.register');
                //     break;

                // case '#myaccount':
                //     snapto('.screen-wrap.myaccount');
                // break;

            }
        }

        function check_height(){
            if(screenH <= 650 ){
                $('.column').css('padding-top', '8%');
            }else{
                $('.column').css('padding-top', '12%');
            }
        }

        function goto(hash){
            //window.location = "/"+hash;
            window.location.reload('/'+hash);
        }

        $(document).ready(function(){
            $(window).change(function(){
               resize();
               check_height();
            });
            check_height();
            //check_hash();

            //change menubar on reaching second screen AND ROD-title motion and fade
            var title_offset = parseInt($('#ROD-title').offset().top);
            var screen_offset = parseInt($('.screen-wrap1.task').offset().top) - parseInt($('.menubar').height());
            var title_margin = parseInt($('#ROD-title .title-wrap').css('margin-top'));


            if($(this).scrollTop() > screen_offset ){
                $('.menubar').addClass('changed');
            }



            $(window).scroll(function(){
                if($(this).scrollTop() > screen_offset ){
                    $('.menubar').addClass('changed');
                }
                if($(this).scrollTop() < screen_offset ) {
                    $('.menubar').removeClass('changed');
                }
            });

            //mobile-menu-btn
            $('.mobile-menu-btn').click(function(){
                $(this).toggleClass('active');
                $('nav').slideToggle(1000);
            });
            if($('.mobile-menu-btn').css('display') == 'block'){
                $('nav li a').click(function(){
                   toggleMenu();
                });
            }


            //show hide register form single participant/ team participant
            $('#format').change(function(){
                if($(this).val() == "team"){
                    $('.rows.fourth').after(addTeamInfo);
                    $('.rows.fifth').fadeIn();
                }else{
                    $('.rows.fifth').fadeOut();
                    $(".rows.fifth").detach();
                }
            });

            
        });