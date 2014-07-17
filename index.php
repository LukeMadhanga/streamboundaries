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
            });
        </script>
        <style>
            #main {margin: auto;max-width:80%}
        </style>
    </head>
    <body>
        <div id='main'>
            <div id='container'>
                <div id='thumb'></div>
            </div>
        </div>
    </body>
</html>
HTML;
