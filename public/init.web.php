<?php

require_once 'init.php';
require_once ROOT_PATH.'/debug.php';

// configure Bootstrap
\Bootstrap\Component::register('table', 'Bootstrap\Components\Table');
\Bootstrap\Component::register('button', 'Bootstrap\Components\Button');
\Bootstrap\Component::register('nav', 'Bootstrap\Components\Nav');
\Bootstrap\Component::register('pagination', 'Bootstrap\Components\Pagination');

// global variables
$app->init_web_session();
$_user = $app->get_authenticated_user();
$_ui = new \Bootstrap\Component;

$_products = \App\App::get_products();

// navigation config
$_nav = null;

if ($_user) {
    $_nav = [
        'dashboard' => [
            'title' => 'Dashboard',
            'url' => APP_URL.'/dashboard',
            'icon' => 'ion ion-md-home'
        ],
        'client-review' => [
            'title' => 'Client review',
            'icon' => 'ion ion-ios-search',
            'submenu' => []
        ],
        'orders' => [
            'title' => $_user->admin ? 'Orders' : 'My orders',
            'url' => APP_URL.'/orders',
            'icon' => 'ion ion-md-list'
        ],
        '_new-orders' => [
            'title' => 'CREATE ORDER',
            'divider' => true
        ],
        'new' => [
            'title' => 'Single Locate',
            'url' => APP_URL.'/orders/new',
            'icon' => 'ion ion-md-document'
        ],
        'new-batch' => [
            'title' => 'Batch Locate',
            'url' => APP_URL.'/orders/batches/new',
            'icon' => 'ion ion-ios-apps'
        ]
    ];

    $status_filters = \App\Content::get_status_filters();
    foreach ($status_filters as $filter => $title) {
        $_nav['client-review']['submenu'][$filter] = [
            'title' => $title,
            'url' => APP_URL.'/review/'.$filter
        ];
    }

	if ($_user->has_role(\Models\Role::STAFF)) {
		$_nav[] = [
			'title' => 'STAFF',
			'divider' => true
		];

		$_nav['staff-review'] = [
			'title' => 'Staff review',
			'url' => APP_URL.'/staff/review',
			'icon' => 'ion ion-md-search'
		];
	}

	if ($_user->admin) {
        $_nav[] = [
            'title' => 'ADMINISTRATION',
            'divider' => true
        ];

		$_nav['admin-clients'] = [
			'title' => 'Manage clients',
			'icon' => 'ion ion-md-people',
            'url' => APP_URL.'/admin/clients'
		];
	}
}