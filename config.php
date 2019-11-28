<?php

define('__DEV__', getenv('ENVIRONMENT') === 'dev');
define('__TEST__', getenv('ENVIRONMENT') === 'test');

define('DB_HOST', getenv('DB_HOST'));
define('DB_NAME', getenv('DB_NAME'));
define('DB_USER', getenv('DB_USER'));
define('DB_PASSWORD', getenv('DB_PASSWORD'));
define('DB_PORT', getenv('DB_PORT'));