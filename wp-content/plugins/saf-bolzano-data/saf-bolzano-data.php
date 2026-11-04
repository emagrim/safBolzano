<?php
/**
 * Plugin Name: SAF Bolzano Data
 * Description: Staff, club records, athletes list, athlete counts and the enrollment form for the SAF Bolzano 1953 site. Keeps the data independent from the theme.
 * Version:     1.0.0
 * Author:      SAF Bolzano 1953
 * Text Domain: saf-bolzano-data
 */

defined( 'ABSPATH' ) || exit;

define( 'SAF_DATA_VERSION', '1.0.0' );
define( 'SAF_DATA_DIR', plugin_dir_path( __FILE__ ) );

require_once SAF_DATA_DIR . 'includes/post-types.php';
require_once SAF_DATA_DIR . 'includes/athletes.php';
require_once SAF_DATA_DIR . 'includes/sync.php';
require_once SAF_DATA_DIR . 'includes/enrollment.php';
require_once SAF_DATA_DIR . 'includes/seed.php';

register_activation_hook( __FILE__, 'saf_data_activate' );
register_deactivation_hook( __FILE__, 'saf_sync_unschedule' );

function saf_data_activate() {
	saf_register_post_types();
	saf_seed_from_file();
	flush_rewrite_rules();
}
