<?php
/**
 * One-time import of the data that used to live in the Node app's SQLite database
 * (exported to seed.json). Runs on activation and only fills empty collections.
 */

defined( 'ABSPATH' ) || exit;

function saf_seed_from_file() {
	$file = SAF_DATA_DIR . 'seed.json';
	if ( ! file_exists( $file ) ) {
		return;
	}
	$seed = json_decode( file_get_contents( $file ), true );
	if ( ! is_array( $seed ) ) {
		return;
	}

	if ( ! saf_count_posts( 'saf_staff' ) && ! empty( $seed['staff'] ) ) {
		foreach ( $seed['staff'] as $i => $row ) {
			$id = wp_insert_post( array(
				'post_type'   => 'saf_staff',
				'post_status' => 'publish',
				'post_title'  => trim( $row['nome'] . ' ' . $row['cognome'] ),
				'menu_order'  => $i,
			) );
			if ( $id && ! is_wp_error( $id ) ) {
				update_post_meta( $id, 'ruolo', (string) $row['ruolo'] );
				update_post_meta( $id, 'specialita', (string) $row['specialita'] );
				update_post_meta( $id, 'anno', (string) $row['anno'] );
				$foto = (string) $row['foto'];
				if ( 'https://atletica.me/img/noimage.jpg' !== $foto && 'https://' !== $foto ) {
					update_post_meta( $id, 'foto_url', esc_url_raw( $foto ) );
				}
			}
		}
	}

	if ( ! saf_count_posts( 'saf_record' ) && ! empty( $seed['records'] ) ) {
		foreach ( $seed['records'] as $i => $row ) {
			$id = wp_insert_post( array(
				'post_type'   => 'saf_record',
				'post_status' => 'publish',
				'post_title'  => (string) $row['disciplina'],
				'menu_order'  => $i,
			) );
			if ( $id && ! is_wp_error( $id ) ) {
				foreach ( array( 'tempo', 'nome', 'cognome', 'data', 'old_tempo', 'old_nome', 'old_cognome', 'old_data' ) as $k ) {
					update_post_meta( $id, $k, isset( $row[ $k ] ) ? (string) $row[ $k ] : '' );
				}
			}
		}
	}

	if ( false === get_option( 'saf_counts', false ) && ! empty( $seed['counts'] ) ) {
		update_option( 'saf_counts', array(
			'maschi'   => (int) $seed['counts']['maschi'],
			'femmine'  => (int) $seed['counts']['femmine'],
		) );
	}
}

function saf_count_posts( $type ) {
	$counts = wp_count_posts( $type );
	$n      = 0;
	foreach ( (array) $counts as $status => $c ) {
		if ( 'trash' !== $status && 'auto-draft' !== $status ) {
			$n += (int) $c;
		}
	}
	return $n;
}
