<?php

define('ROOT_PATH', __DIR__);
define('PUBLIC_PATH', __DIR__.'/public');

require_once ROOT_PATH.'/vendor/autoload.php';

define('DS', DIRECTORY_SEPARATOR);
define('EOL', PHP_EOL);

// load configuration from .env
$dotenv = Dotenv\Dotenv::create(ROOT_PATH, '.env');
$dotenv->load();

if (!isset($argv)) {
	$argv = [isset($_SERVER['SCRIPT_FILENAME']) ? $_SERVER['SCRIPT_FILENAME'] : __FILE__];
	$args_list = isset($_GET['argv']) && is_array($_GET['argv']) ? $_GET['argv'] : $_GET;

	foreach ($args_list as $key => $value) {
		if ($value) $argv[] = $value;
	}
}

if (php_sapi_name() == 'cli' || !isset($_SERVER["REQUEST_METHOD"])) {
	$document_root = realpath(getenv('CLI_DOCUMENT_ROOT') ?: PUBLIC_PATH);
	$server_name = gethostname();
	$request_uri = str_replace(DS, '/', substr($_SERVER['PHP_SELF'], strlen($document_root)));
	$request_method = 'CLI';
} else {
	$document_root = realpath($_SERVER['DOCUMENT_ROOT']);
	$server_name = $_SERVER['SERVER_NAME'];
	$request_uri = $_SERVER['REQUEST_URI'];
	$request_method = $_SERVER['REQUEST_METHOD'];
}

$document_url = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on' ? 'https' : 'http').'://'.$server_name;

$app_path = $document_root;
$app_url = $document_url;

if (strpos(PUBLIC_PATH, $document_root) === 0) {
	$app_uri = substr(PUBLIC_PATH, strlen($document_root));
	$app_path .= $app_uri;
	$app_url .= str_replace(DS, '/', $app_uri);
}

// create root directories
$dirs = ['tmp', 'cache', 'logs', 'archive'];
foreach ($dirs as $dir) {
	$path = ROOT_PATH.'/'.$dir;
	if (!file_exists($path)) {
	    mkdir($path, 0777, true);
	}
}

define('DOCUMENT_ROOT', $document_root);
define('SERVER_NAME', $server_name);
define('SERVER_URL', $document_url);
define('SERVER_REQUEST', $document_url.$request_uri);

define('REQUEST_URI', $request_uri);
define('REQUEST_METHOD', $request_method);

define('APP_PATH', $app_path);
define('APP_URL', $app_url);

define('APP_LOGS_PATH', ROOT_PATH.'/logs');
define('APP_ARCHIVE_PATH', ROOT_PATH.'/archive');
define('APP_CACHE_PATH', ROOT_PATH.'/cache');
define('APP_TMP_PATH', ROOT_PATH.'/tmp');

define('ASSETS_URL', APP_URL.'/assets');
define('ASSETS_PATH', APP_PATH.'/assets');

// global functions
// global functions
require_once ROOT_PATH.'/config.php';
require_once ROOT_PATH.'/lib/func.php';

// Moment
\Moment\Moment::setDefaultTimezone(date_default_timezone_get());

// configure parent model
\Models\Model::connect(DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, DB_PORT);
\Models\Model::$db->on_error(function($msg) {
	plog($msg);
});

// configure models
\Models\Profile::register('profile');
\Models\Link::register('links');