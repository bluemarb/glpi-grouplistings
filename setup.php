<?php

define('PLUGIN_GROUPLISTINGS_VERSION', '1.2.1');
define('PLUGIN_GROUPLISTINGS_MIN_GLPI', '11.0.0');
define('PLUGIN_GROUPLISTINGS_MAX_GLPI', '11.0.99');

function plugin_init_grouplistings(): void
{
    global $PLUGIN_HOOKS;

    $PLUGIN_HOOKS['csrf_compliant']['grouplistings'] = true;

    require_once __DIR__ . '/inc/grouplisting.class.php';

    if (PluginGrouplistingsGrouplisting::canView()) {
        $PLUGIN_HOOKS['menu_toadd']['grouplistings'] = [
            'assets' => PluginGrouplistingsGrouplisting::class,
        ];
        $PLUGIN_HOOKS['add_css']['grouplistings'] = 'grouplistings.css';
        $PLUGIN_HOOKS['add_javascript']['grouplistings'] = 'grouplistings.js';
    }
}

function plugin_version_grouplistings(): array
{
    return [
        'name'         => 'Group Listings',
        'version'      => PLUGIN_GROUPLISTINGS_VERSION,
        'author'       => 'Bluelan AB',
        'license'      => 'GPLv3+',
        'requirements' => [
            'glpi' => [
                'min' => PLUGIN_GROUPLISTINGS_MIN_GLPI,
                'max' => PLUGIN_GROUPLISTINGS_MAX_GLPI,
            ],
        ],
    ];
}

function plugin_grouplistings_check_prerequisites(): bool
{
    return version_compare(GLPI_VERSION, PLUGIN_GROUPLISTINGS_MIN_GLPI, '>=')
        && version_compare(GLPI_VERSION, PLUGIN_GROUPLISTINGS_MAX_GLPI, '<=');
}

function plugin_grouplistings_check_config(bool $verbose = false): bool
{
    return true;
}
