<?php
defined( 'ABSPATH' ) || exit;

/**
 * Club content that does not belong in git (gallery photos, PDF forms) lives in
 * wp-content/uploads/saf/{gallery,documents}.
 */
function saf_content_path( $sub = '' ) {
	$u = wp_upload_dir();
	return trailingslashit( $u['basedir'] ) . 'saf' . ( $sub ? '/' . ltrim( $sub, '/' ) : '' );
}

function saf_content_url( $sub = '' ) {
	$u = wp_upload_dir();
	return trailingslashit( $u['baseurl'] ) . 'saf' . ( $sub ? '/' . implode( '/', array_map( 'rawurlencode', explode( '/', ltrim( $sub, '/' ) ) ) ) : '' );
}

function saf_document_url( $file ) {
	return saf_content_url( 'documents/' . $file );
}

/** Version for an enqueued asset: its last change time, so browsers fetch it again after every edit. */
function saf_asset_ver( $path ) {
	$file = get_template_directory() . '/assets/' . ltrim( $path, '/' );
	return file_exists( $file ) ? (string) filemtime( $file ) : SAF_THEME_VERSION;
}

function saf_asset_url( $path ) {
	return get_template_directory_uri() . '/assets/' . ltrim( $path, '/' );
}

/** Slug of the page being shown, or '' (front page => 'home', posts page => 'news'). */
function saf_current_slug() {
	if ( is_front_page() ) {
		return 'home';
	}
	if ( is_home() || is_singular( 'post' ) || is_archive() ) {
		return 'news';
	}
	if ( is_page() ) {
		return get_post_field( 'post_name', get_queried_object_id() );
	}
	return '';
}

/** Images in a directory (recursive), as paths relative to it. */
function saf_list_images( $dir ) {
	$out = array();
	if ( ! is_dir( $dir ) ) {
		return $out;
	}
	$it = new RecursiveIteratorIterator( new RecursiveDirectoryIterator( $dir, FilesystemIterator::SKIP_DOTS ) );
	foreach ( $it as $f ) {
		if ( $f->isFile() && preg_match( '/\.(jpe?g|png|gif|webp)$/i', $f->getFilename() ) ) {
			$out[] = ltrim( str_replace( '\\', '/', substr( $f->getPathname(), strlen( $dir ) ) ), '/' );
		}
	}
	sort( $out );
	return $out;
}

/** Slider with the images in assets/images/slides/<folder>, followed by the white wave. */
function saf_slider( $folder, $img_class = '', $close = false ) {
	$dir    = get_template_directory() . "/assets/images/slides/$folder";
	$images = saf_list_images( $dir );
	if ( 'galleria' === $folder ) {
		$images = array();
		foreach ( array_slice( saf_list_images( saf_content_path( 'gallery' ) ), 0, 10 ) as $rel ) {
			$images[] = saf_content_url( 'gallery/' . $rel );
		}
	} else {
		$images = array_map( function ( $f ) use ( $folder ) {
			return saf_asset_url( 'images/slides/' . $folder . '/' . $f );
		}, $images );
	}
	get_template_part( 'template-parts/slider-open', null, array( 'images' => $images, 'img_class' => $img_class, 'close' => $close ) );
}

/** CSS custom properties for the two photo backgrounds used by .imageSection. */
function saf_background_vars() {
	$one = saf_content_url( 'gallery/2023.05.10_SPEED KING AND QUEEN BZ/speedkingbz258.jpg' );
	$two = saf_content_url( 'gallery/2023.08.23_MEETING FRANCO CRISCUOLO/meetingcriscuolo-296.jpg' );
	return sprintf( ':root{--saf-bg-one:url("%s");--saf-bg-two:url("%s");}', esc_url_raw( $one ), esc_url_raw( $two ) );
}

/** Internal link helper for the templates. */
function saf_link( $path = '/' ) {
	return esc_url( home_url( $path ) );
}
