<?php

require_once __DIR__.'/lib/const.php';
require_once __DIR__.'/vendor/autoload.php';
require_once __DIR__.'/lib/func.php';

$db = new \Models\DB(DB_HOST, DB_NAME, DB_USER, DB_PASSWORD);
\Models\Model::set_db($db);

// register tables
\Models\Profile::register('profile');
\Models\Link::register('links');