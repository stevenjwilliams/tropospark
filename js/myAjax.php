<?php

require 'tropo.class.php';

$tropo = new Tropo();

$tropo->call("+15619011356", array('network'=>'SMS'));
$tropo->say("Tag, you're it!");

$tropo->RenderJson();
?>
