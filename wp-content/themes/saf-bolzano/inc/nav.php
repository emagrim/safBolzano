<?php
defined( 'ABSPATH' ) || exit;

/**
 * Renders menu items as the theme's flat <a class="navItem"><p class="navText"> links.
 */
class SAF_Nav_Walker extends Walker_Nav_Menu {
	private $css;
	private $footer;

	public function __construct( $footer = false ) {
		$this->footer = $footer;
	}

	public function start_lvl( &$output, $depth = 0, $args = null ) {}
	public function end_lvl( &$output, $depth = 0, $args = null ) {}
	public function end_el( &$output, $item, $depth = 0, $args = null ) {}

	public function start_el( &$output, $item, $depth = 0, $args = null, $id = 0 ) {
		$link  = $this->footer ? 'footItem' : 'navItem';
		$text  = $this->footer ? 'footText' : 'navText';
		$attrs = ! empty( $item->target ) ? ' target="' . esc_attr( $item->target ) . '"' : '';
		$output .= sprintf(
			'<a href="%s" class="%s"%s><p class="%s">%s</p></a>',
			esc_url( $item->url ),
			$link,
			$attrs,
			$text,
			esc_html( $item->title )
		);
	}
}

function saf_primary_menu( $footer = false ) {
	wp_nav_menu( array(
		'theme_location' => $footer ? 'footer' : 'primary',
		'container'      => false,
		'items_wrap'     => '%3$s',
		'walker'         => new SAF_Nav_Walker( $footer ),
		'fallback_cb'    => 'saf_menu_fallback',
	) );
}

function saf_menu_fallback() {
	foreach ( saf_default_menu_items() as $label => $path ) {
		printf( '<a href="%s" class="navItem"><p class="navText">%s</p></a>', saf_link( $path ), esc_html( $label ) );
	}
}

function saf_default_menu_items() {
	return array(
		'HOME'       => '/',
		'ISCRIZIONI' => '/iscrizioni/',
		'ATLETI'     => '/atleti/',
		'STAFF'      => '/staff/',
		'RISULTATI'  => '/risultati/',
		'GALLERIA'   => '/galleria/',
		'CALENDARIO' => '/calendario/',
		'INFO'       => '/info/',
	);
}

/** A slice of the footer menu, as the two link columns of the footer. */
function saf_footer_menu( $offset, $length ) {
	$items = array();
	$locations = get_nav_menu_locations();
	if ( ! empty( $locations['footer'] ) ) {
		foreach ( (array) wp_get_nav_menu_items( $locations['footer'] ) as $it ) {
			$items[ $it->title ] = $it->url;
		}
	} else {
		foreach ( saf_default_menu_items() as $label => $path ) {
			$items[ $label ] = home_url( $path );
		}
	}
	foreach ( array_slice( $items, $offset, $length, true ) as $label => $url ) {
		printf( '<a href="%s" class="footItem"><p class="footText">%s</p></a>', esc_url( $url ), esc_html( $label ) );
	}
}
