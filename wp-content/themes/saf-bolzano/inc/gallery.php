<?php
defined( 'ABSPATH' ) || exit;

/**
 * /galleria/<album>/ shows the photos of one folder of wp-content/uploads/saf/gallery.
 * Folders are named "YYYY.MM.DD_Event name".
 */
add_action( 'init', function () {
	add_rewrite_rule( '^galleria/([^/]+)/?$', 'index.php?pagename=galleria&saf_album=$matches[1]', 'top' );
} );

add_filter( 'query_vars', function ( $vars ) {
	$vars[] = 'saf_album';
	return $vars;
} );

/** Albums (newest first) with date label, name and cover image. */
function saf_get_albums() {
	$base   = saf_content_path( 'gallery' );
	$albums = array();
	if ( ! is_dir( $base ) ) {
		return $albums;
	}
	foreach ( scandir( $base ) as $dir ) {
		if ( '.' === $dir[0] || ! is_dir( "$base/$dir" ) ) {
			continue;
		}
		$imgs     = saf_list_images( "$base/$dir" );
		$albums[] = array(
			'folder' => $dir,
			'date'   => implode( '/', array_reverse( explode( '.', substr( $dir, 0, 10 ) ) ) ),
			'name'   => substr( $dir, 11 ),
			'cover'  => $imgs ? saf_content_url( "gallery/$dir/" . $imgs[0] ) : '',
		);
	}
	return array_reverse( $albums );
}

/** The album folder requested by the URL, or '' when absent/invalid (also blocks path traversal). */
function saf_current_album() {
	$album = get_query_var( 'saf_album' );
	if ( ! $album ) {
		return '';
	}
	$album = rawurldecode( $album );
	if ( false !== strpos( $album, '/' ) || false !== strpos( $album, '..' ) || ! is_dir( saf_content_path( "gallery/$album" ) ) ) {
		return '';
	}
	return $album;
}
