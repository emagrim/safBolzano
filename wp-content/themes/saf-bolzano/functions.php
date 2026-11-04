<?php
/**
 * SAF Bolzano 1953 theme.
 */

defined( 'ABSPATH' ) || exit;

define( 'SAF_THEME_VERSION', '1.0.0' );

require_once get_template_directory() . '/inc/helpers.php';
require_once get_template_directory() . '/inc/nav.php';
require_once get_template_directory() . '/inc/gallery.php';
require_once get_template_directory() . '/inc/render.php';
require_once get_template_directory() . '/inc/setup.php';

add_action( 'after_setup_theme', function () {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script' ) );
	register_nav_menus( array( 'primary' => 'Menu principale', 'footer' => 'Menu footer' ) );
} );

add_action( 'wp_enqueue_scripts', function () {
	$uri = get_template_directory_uri();
	$ver = SAF_THEME_VERSION;

	wp_enqueue_style( 'saf-fonts', 'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap', array(), null );
	wp_enqueue_style( 'saf-globals', $uri . '/assets/css/globals.css', array( 'saf-fonts' ), $ver );
	wp_add_inline_style( 'saf-globals', saf_background_vars() );

	// Page specific styles (assets/css/page-<slug>.css).
	$slug = saf_current_slug();
	if ( $slug && file_exists( get_template_directory() . "/assets/css/page-$slug.css" ) ) {
		wp_enqueue_style( 'saf-page', "$uri/assets/css/page-$slug.css", array( 'saf-globals' ), $ver );
	}

	wp_enqueue_script( 'saf-fontawesome', 'https://kit.fontawesome.com/fb4513912a.js', array(), null, false );
	wp_script_add_data( 'saf-fontawesome', 'crossorigin', 'anonymous' );
	wp_enqueue_script( 'saf-std', "$uri/assets/js/std.js", array(), $ver, true );
	wp_enqueue_script( 'saf-introducer', "$uri/assets/js/introducer.js", array(), $ver, true );
	wp_enqueue_script( 'saf-functions', "$uri/assets/js/functions.js", array(), $ver, true );

	if ( 'iscrizioni' === $slug ) {
		wp_enqueue_script( 'saf-iscrizioni', "$uri/assets/js/iscrizioni.js", array(), $ver, true );
		wp_localize_script( 'saf-iscrizioni', 'safIscrizione', array( 'endpoint' => esc_url_raw( rest_url( 'saf/v1/iscrizione' ) ) ) );
	}
	if ( 'atleti' === $slug ) {
		wp_add_inline_script( 'saf-std', 'function openLink(url){window.open(url,"_blank");}' );
	}
} );

// Font Awesome kit needs the crossorigin attribute.
add_filter( 'script_loader_tag', function ( $tag, $handle ) {
	if ( 'saf-fontawesome' === $handle ) {
		$tag = str_replace( ' src=', ' crossorigin="anonymous" src=', $tag );
	}
	return $tag;
}, 10, 2 );

// Remove the block library styles the theme does not use.
add_action( 'wp_enqueue_scripts', function () {
	wp_dequeue_style( 'wp-block-library' );
	wp_dequeue_style( 'global-styles' );
}, 100 );
