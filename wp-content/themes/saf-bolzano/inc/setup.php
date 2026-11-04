<?php
defined( 'ABSPATH' ) || exit;

/**
 * On activation: creates the pages the templates are bound to (by slug), the main menu,
 * the static front page, the news page and /%postname%/ permalinks.
 */
add_action( 'after_switch_theme', 'saf_setup_site' );

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

	$locations = get_theme_mod( 'nav_menu_locations', array() );
	if ( empty( $locations['primary'] ) ) {
		$menu_id = wp_create_nav_menu( 'Menu principale' );
		if ( ! is_wp_error( $menu_id ) ) {
			foreach ( saf_default_menu_items() as $label => $path ) {
				$slug = trim( $path, '/' );
				if ( '' === $slug ) {
					wp_update_nav_menu_item( $menu_id, 0, array(
						'menu-item-title'  => $label,
						'menu-item-object' => 'page',
						'menu-item-object-id' => $ids['home'],
						'menu-item-type'   => 'post_type',
						'menu-item-status' => 'publish',
					) );
				} else {
					wp_update_nav_menu_item( $menu_id, 0, array(
						'menu-item-title'     => $label,
						'menu-item-object'    => 'page',
						'menu-item-object-id' => $ids[ $slug ],
						'menu-item-type'      => 'post_type',
						'menu-item-status'    => 'publish',
					) );
				}
			}
			$locations['primary'] = $menu_id;
			$locations['footer']  = $menu_id;
			set_theme_mod( 'nav_menu_locations', $locations );
		}
	}

	flush_rewrite_rules();
}
