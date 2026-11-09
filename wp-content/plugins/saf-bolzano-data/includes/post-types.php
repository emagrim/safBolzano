<?php
/**
 * Custom post types: staff members and club records.
 *
 * Both are edited from wp-admin and ordered with the "Order" field (menu_order).
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', 'saf_register_post_types' );

function saf_register_post_types() {
	register_post_type( 'saf_staff', array(
		'labels'       => array(
			'name'          => 'Staff',
			'singular_name' => 'Membro dello staff',
			'add_new_item'  => 'Aggiungi membro dello staff',
			'edit_item'     => 'Modifica membro dello staff',
		),
		'public'       => false,
		'show_ui'      => true,
		'menu_icon'    => 'dashicons-groups',
		'menu_position' => 25,
		'supports'     => array( 'title', 'thumbnail', 'page-attributes' ),
		'show_in_rest' => false,
	) );

	register_post_type( 'saf_record', array(
		'labels'       => array(
			'name'          => 'Record sociali',
			'singular_name' => 'Record sociale',
			'add_new_item'  => 'Aggiungi record',
			'edit_item'     => 'Modifica record',
		),
		'public'       => false,
		'show_ui'      => true,
		'menu_icon'    => 'dashicons-awards',
		'menu_position' => 26,
		'supports'     => array( 'title', 'page-attributes' ),
		'show_in_rest' => false,
	) );
}

/**
 * Meta fields shown in the edit screens. key => label
 */
function saf_meta_fields( $post_type ) {
	if ( 'saf_staff' === $post_type ) {
		return array(
			'ruolo'      => 'Ruolo',
			'specialita' => 'Specialità',
			'anno'       => 'Anno / data di nascita',
			'foto_url'   => 'URL foto (se non si usa l\'immagine in evidenza)',
		);
	}
	return array(
		'tempo'       => 'Prestazione',
		'nome'        => 'Nome',
		'cognome'     => 'Cognome',
		'data'        => 'Data',
		'old_tempo'   => 'Precedente: prestazione',
		'old_nome'    => 'Precedente: nome',
		'old_cognome' => 'Precedente: cognome',
		'old_data'    => 'Precedente: data',
	);
}

add_action( 'add_meta_boxes', function () {
	foreach ( array( 'saf_staff' => 'Dati', 'saf_record' => 'Dati del record' ) as $type => $title ) {
		add_meta_box( 'saf_meta_' . $type, $title, 'saf_render_meta_box', $type, 'normal', 'high' );
	}
} );

function saf_render_meta_box( $post ) {
	wp_nonce_field( 'saf_meta_save', 'saf_meta_nonce' );
	if ( 'saf_record' === $post->post_type ) {
		echo '<p>Il titolo è la disciplina (es. <code>100m</code>).</p>';
	} else {
		echo '<p>Il titolo è il nome completo (es. <code>MARIO ROSSI</code>).</p>';
	}
	echo '<table class="form-table">';
	if ( 'saf_record' === $post->post_type ) {
		$sesso = saf_record_sesso( $post->ID );
		echo '<tr><th><label for="saf_sesso">Categoria</label></th><td><select id="saf_sesso" name="saf_sesso">';
		foreach ( saf_record_categories() as $value => $label ) {
			printf( '<option value="%s"%s>%s</option>', esc_attr( $value ), selected( $sesso, $value, false ), esc_html( $label ) );
		}
		echo '</select></td></tr>';
	}
	foreach ( saf_meta_fields( $post->post_type ) as $key => $label ) {
		printf(
			'<tr><th><label for="saf_%1$s">%2$s</label></th><td><input type="text" class="large-text" id="saf_%1$s" name="saf_meta[%1$s]" value="%3$s"></td></tr>',
			esc_attr( $key ),
			esc_html( $label ),
			esc_attr( (string) get_post_meta( $post->ID, $key, true ) )
		);
	}
	echo '</table>';
}

add_action( 'save_post', function ( $post_id, $post ) {
	if ( ! in_array( $post->post_type, array( 'saf_staff', 'saf_record' ), true ) ) {
		return;
	}
	if ( ! isset( $_POST['saf_meta_nonce'] ) || ! wp_verify_nonce( $_POST['saf_meta_nonce'], 'saf_meta_save' ) ) {
		return;
	}
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}
	$values = isset( $_POST['saf_meta'] ) && is_array( $_POST['saf_meta'] ) ? wp_unslash( $_POST['saf_meta'] ) : array();
	foreach ( array_keys( saf_meta_fields( $post->post_type ) ) as $key ) {
		$value = isset( $values[ $key ] ) ? $values[ $key ] : '';
		if ( 'foto_url' === $key ) {
			$value = esc_url_raw( $value );
		} else {
			$value = sanitize_text_field( $value );
		}
		update_post_meta( $post_id, $key, $value );
	}
	if ( 'saf_record' === $post->post_type ) {
		$sesso = isset( $_POST['saf_sesso'] ) ? sanitize_key( wp_unslash( $_POST['saf_sesso'] ) ) : '';
		update_post_meta( $post_id, 'sesso', 'f' === $sesso ? 'F' : 'M' );
	}
}, 10, 2 );

/* ---- Records: women / men ---------------------------------------------- */

function saf_record_categories() {
	return array( 'F' => 'Donne', 'M' => 'Uomini' );
}

/** Records saved before the category existed are men's records. */
function saf_record_sesso( $post_id ) {
	return 'F' === get_post_meta( $post_id, 'sesso', true ) ? 'F' : 'M';
}

add_filter( 'manage_saf_record_posts_columns', function ( $columns ) {
	$out = array();
	foreach ( $columns as $key => $label ) {
		$out[ $key ] = $label;
		if ( 'title' === $key ) {
			$out['saf_sesso'] = 'Categoria';
		}
	}
	return $out;
} );

add_action( 'manage_saf_record_posts_custom_column', function ( $column, $post_id ) {
	if ( 'saf_sesso' === $column ) {
		$categories = saf_record_categories();
		echo esc_html( $categories[ saf_record_sesso( $post_id ) ] );
	}
}, 10, 2 );

/* ---- Data accessors used by the theme -------------------------------- */

function saf_get_staff() {
	$posts = get_posts( array(
		'post_type'      => 'saf_staff',
		'post_status'    => 'publish',
		'posts_per_page' => -1,
		'orderby'        => array( 'menu_order' => 'ASC', 'ID' => 'ASC' ),
	) );
	$out = array();
	foreach ( $posts as $p ) {
		$foto = get_the_post_thumbnail_url( $p, 'medium' );
		if ( ! $foto ) {
			$foto = get_post_meta( $p->ID, 'foto_url', true );
		}
		if ( ! $foto ) {
			$foto = 'https://atletica.me/img/noimage.jpg';
		}
		$out[] = array(
			'nome'       => $p->post_title,
			'ruolo'      => get_post_meta( $p->ID, 'ruolo', true ),
			'specialita' => get_post_meta( $p->ID, 'specialita', true ),
			'anno'       => get_post_meta( $p->ID, 'anno', true ),
			'foto'       => $foto,
		);
	}
	return $out;
}

function saf_get_records( $sesso = null ) {
	$posts = get_posts( array(
		'post_type'      => 'saf_record',
		'post_status'    => 'publish',
		'posts_per_page' => -1,
		'orderby'        => array( 'menu_order' => 'ASC', 'ID' => 'ASC' ),
	) );
	$out = array();
	foreach ( $posts as $p ) {
		$row_sesso = saf_record_sesso( $p->ID );
		if ( null !== $sesso && $sesso !== $row_sesso ) {
			continue;
		}
		$row = array( 'disciplina' => $p->post_title, 'sesso' => $row_sesso );
		foreach ( array( 'tempo', 'nome', 'cognome', 'data' ) as $k ) {
			$row[ $k ] = get_post_meta( $p->ID, $k, true );
		}
		$out[] = $row;
	}
	return $out;
}
