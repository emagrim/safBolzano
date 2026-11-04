<?php
defined( 'ABSPATH' ) || exit;

/**
 * On activation: creates the pages the templates are bound to (by slug), the main menu,
 * the static front page, the news page and /%postname%/ permalinks.
 */
// After core (priority 10), which maps the previous theme's menus onto ours.
add_action( 'after_switch_theme', 'saf_setup_site', 20 );

function saf_setup_site() {
	$pages = array(
		'home'       => 'Home',
		'iscrizioni' => 'Iscrizioni',
		'atleti'     => 'Atleti',
		'staff'      => 'Staff',
		'risultati'  => 'Risultati',
		'galleria'   => 'Galleria',
		'calendario' => 'Calendario',
		'info'       => 'Info',
		'news'       => 'News',
	);
	$ids = array();
	foreach ( $pages as $slug => $title ) {
		$existing = get_page_by_path( $slug );
		if ( $existing ) {
			$ids[ $slug ] = $existing->ID;
			continue;
		}
		$ids[ $slug ] = wp_insert_post( array(
			'post_type'   => 'page',
			'post_status' => 'publish',
			'post_title'  => $title,
			'post_name'   => $slug,
		) );
	}

	update_option( 'show_on_front', 'page' );
	update_option( 'page_on_front', $ids['home'] );
	update_option( 'page_for_posts', $ids['news'] );

	if ( ! get_option( 'permalink_structure' ) ) {
		update_option( 'permalink_structure', '/%postname%/' );
	}

	saf_setup_menu( $ids );

	flush_rewrite_rules();
}

/**
 * Assigns the theme's own "Menu principale" to both locations, creating it (or filling it, when empty)
 * from saf_default_menu_items(). A menu WordPress carried over from the previous theme is replaced;
 * an existing "Menu principale" with items is kept as the editors left it.
 */
function saf_setup_menu( $ids ) {
	$menu    = wp_get_nav_menu_object( 'Menu principale' );
	$menu_id = $menu ? (int) $menu->term_id : wp_create_nav_menu( 'Menu principale' );
	if ( is_wp_error( $menu_id ) ) {
		return;
	}

	if ( ! wp_get_nav_menu_items( $menu_id ) ) {
		foreach ( saf_default_menu_items() as $label => $path ) {
			$slug = trim( $path, '/' );
			$page = '' === $slug ? $ids['home'] : $ids[ $slug ];
			wp_update_nav_menu_item( $menu_id, 0, array(
				'menu-item-title'     => $label,
				'menu-item-object'    => 'page',
				'menu-item-object-id' => $page,
				'menu-item-type'      => 'post_type',
				'menu-item-status'    => 'publish',
			) );
		}
	}

	$locations            = get_theme_mod( 'nav_menu_locations', array() );
	$locations['primary'] = $menu_id;
	$locations['footer']  = $menu_id;
	set_theme_mod( 'nav_menu_locations', $locations );
}
