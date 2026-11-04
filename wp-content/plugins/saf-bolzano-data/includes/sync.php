<?php
/**
 * Daily update of the athletes list from the club page on atletica.me.
 *
 * The page embeds the list as `glob_tutti_gli_atleti=[...];`, so a plain HTTP request is enough.
 * On any failure the current list is kept and the error is shown in SAF.
 */

defined( 'ABSPATH' ) || exit;

define( 'SAF_ATLETI_URL', 'https://atletica.me/societa/211' );
define( 'SAF_SYNC_HOOK', 'saf_sync_atleti' );

add_action( SAF_SYNC_HOOK, 'saf_sync_atleti' );

// Scheduled here rather than on activation so that sites where the plugin is already active get it too.
add_action( 'init', function () {
	if ( ! wp_next_scheduled( SAF_SYNC_HOOK ) ) {
		wp_schedule_event( time() + HOUR_IN_SECONDS, 'daily', SAF_SYNC_HOOK );
	}
} );

function saf_sync_unschedule() {
	wp_clear_scheduled_hook( SAF_SYNC_HOOK );
}

/** Downloads and stores the list. Returns the number of athletes or a WP_Error. */
function saf_sync_atleti() {
	$res = saf_fetch_atleti();
	if ( ! is_wp_error( $res ) ) {
		$res = saf_save_atleti( $res );
	}
	update_option( 'saf_atleti_sync', array(
		'time'    => time(),
		'ok'      => ! is_wp_error( $res ),
		'message' => is_wp_error( $res ) ? $res->get_error_message() : sprintf( '%d atleti', $res ),
	), false );
	return $res;
}

/** The athletes on atletica.me, in the saf_clean_atleta() input format. */
function saf_fetch_atleti() {
	$response = wp_remote_get( SAF_ATLETI_URL, array(
		'timeout'    => 30,
		'user-agent' => 'Mozilla/5.0 (compatible; SAF-Bolzano-1953-WordPress)',
	) );
	if ( is_wp_error( $response ) ) {
		return new WP_Error( 'saf_http', 'atletica.me non raggiungibile: ' . $response->get_error_message() );
	}
	$code = wp_remote_retrieve_response_code( $response );
	if ( 200 !== $code ) {
		return new WP_Error( 'saf_http', "atletica.me ha risposto con errore $code." );
	}
	if ( ! preg_match( '/glob_tutti_gli_atleti\s*=\s*(\[.*?\])\s*;/s', wp_remote_retrieve_body( $response ), $m ) ) {
		return new WP_Error( 'saf_parse', 'Lista atleti non trovata nella pagina di atletica.me (la pagina potrebbe essere cambiata).' );
	}
	$raw = json_decode( $m[1], true );
	if ( ! is_array( $raw ) ) {
		return new WP_Error( 'saf_parse', 'Lista atleti di atletica.me non leggibile.' );
	}

	$out = array();
	foreach ( $raw as $a ) {
		if ( ! is_array( $a ) ) {
			continue;
		}
		$out[] = array(
			'id'            => $a['id'] ?? '',
			'name'          => $a['nomecognome'] ?? '',
			'profile_image' => $a['profile_image'] ?? '',
			'gender'        => $a['sesso'] ?? 0,
			'category_id'   => $a['categoria_id'] ?? 0,
			'age'           => saf_age( $a['data_nascita'] ?? '', $a['anno_nascita'] ?? '' ),
			'data_nascita'  => $a['data_nascita'] ?? '',
			'generale'      => $a['generale'] ?? '',
		);
	}
	return $out;
}

/** Age today from "YYYY-MM-DD", or from the birth year alone. */
function saf_age( $date, $year ) {
	$tz = wp_timezone();
	$d  = DateTimeImmutable::createFromFormat( '!Y-m-d', (string) $date, $tz );
	if ( $d ) {
		return $d->diff( new DateTimeImmutable( 'today', $tz ) )->y;
	}
	return $year ? (int) wp_date( 'Y' ) - (int) $year : 0;
}
