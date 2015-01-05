<?php

echo <<<HTML
<html>
    <head>
        <script type='text/javascript' src='//code.jquery.com/jquery-latest.min.js'></script>
        <script type='text/javascript' src='streamboundaries.js'></script>
        <script type='text/javascript'>
            $(function () {
                $('#container').streamBoundaries({
                    width: 200,
                    height: 200,
                    thumbWidth: 20,
                    thumbHeight: 20,
                    orientation: '2d',
                    resizable: !0
                });
                $('#test2').streamBoundaries({
                    width: 200,
                    height: 200,
                    thumbWidth: 640,
                    thumbHeight: 640,
                    orientation: '2d',
                    crosshair: !1,
                    isViewport: !0
                });
            });
        </script>
        <style>
            #main {margin: auto;max-width:80%}
            #main > div {margin: 30px;}
        </style>
    </head>
    <body>
        <div id='main'>
            <div id='container'>
                <div id='thumb'></div>
            </div>

            <div id='test2'>
                <div><img src='http://photos-f.ak.instagram.com/hphotos-ak-xpa1/10413020_555851384535597_345028240_n.jpg'/></div>
            </div>
        </div>
    </body>
</html>
HTML;
