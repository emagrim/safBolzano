<?php
/**
 * Athletes list and athlete counts.
 *
 * The athletes come from atletica.me, which can only be read with a headless browser. That
 * part lives outside WordPress (tools/scrape-atleti.js) and produces a JSON file that is
 * uploaded from SAF > Atleti (or `wp saf import-atleti <file>`). The list is stored as an option.
 */

defined( 'ABSPATH' ) || exit;

function saf_categorie() {
	return array(
		70 => 'Esordienti maschi', 71 => 'Esordienti femmine', 72 => 'Ragazzi U14', 73 => 'Ragazze U14',
		74 => 'Cadetti U16', 75 => 'Cadette U16', 76 => 'Alievi U18', 77 => 'Alieve U18',
		78 => 'Juniores uomini U20', 79 => 'Juniores donne U20', 80 => 'Promesse uomini U23', 81 => 'Promesse donne U23',
		82 => 'Senior uomini', 83 => 'Senior donne',
		84 => 'Master uomini O35', 85 => 'Master donne O35', 86 => 'Master uomini O40', 87 => 'Master donne O40',
		88 => 'Master uomini O45', 89 => 'Master donne O45', 90 => 'Master uomini O50', 91 => 'Master donne O50',
		92 => 'Master uomini O55', 93 => 'Master donne O55', 94 => 'Master uomini O60', 95 => 'Master donne O60',
		96 => 'Master uomini O65', 97 => 'Master donne O65', 98 => 'Master uomini O70', 99 => 'Master donne O70',
	);
}

/** Athletes grouped by category name, sorted by category id then name. */
function saf_get_atleti_grouped() {
	$athletes = get_option( 'saf_atleti', array() );
	if ( ! is_array( $athletes ) ) {
		return array();
	}
	usort( $athletes, function ( $a, $b ) {
		if ( (int) $a['category_id'] !== (int) $b['category_id'] ) {
			return (int) $a['category_id'] - (int) $b['category_id'];
		}
		return strcasecmp( $a['name'], $b['name'] );
	} );
	$cat    = saf_categorie();
	$groups = array();
	foreach ( $athletes as $a ) {
		$name              = isset( $cat[ (int) $a['category_id'] ] ) ? $cat[ (int) $a['category_id'] ] : 'other';
		$groups[ $name ][] = $a;
	}
	return $groups;
}

/** Counts shown on the info/iscrizioni pages. */
function saf_get_counts() {
	$c = get_option( 'saf_counts', array( 'maschi' => 0, 'femmine' => 0 ) );
	$m = (int) ( $c['maschi'] ?? 0 );
	$f = (int) ( $c['femmine'] ?? 0 );
	return array( 'maschi' => $m, 'femmine' => $f, 'atleti' => $m + $f );
}

/** Normalises one entry of the scraper output, dropping anything unexpected. */
function saf_clean_atleta( $a ) {
	if ( ! is_array( $a ) || empty( $a['name'] ) ) {
		return null;
	}
	$img = ! empty( $a['profile_image'] ) && 'null' !== $a['profile_image'] ? esc_url_raw( $a['profile_image'] ) : 'https://atletica.me/img/noimage.jpg';
	return array(
		'id'            => sanitize_text_field( (string) ( $a['id'] ?? '' ) ),
		'name'          => sanitize_text_field( $a['name'] ),
		'profile_image' => $img,
		'gender'        => (int) ( $a['gender'] ?? 0 ),
		'category_id'   => (int) ( $a['category_id'] ?? 0 ),
		'age'           => (int) ( $a['age'] ?? 0 ),
		'data_nascita'  => sanitize_text_field( (string) ( $a['data_nascita'] ?? '' ) ),
		'generale'      => sanitize_text_field( ! empty( $a['generale'] ) && 'null' !== $a['generale'] ? $a['generale'] : 'Polivalente' ),
	);
}

function saf_import_atleti_json( $json ) {
	$data = json_decode( $json, true );
	if ( ! is_array( $data ) ) {
		return new WP_Error( 'saf_json', 'File JSON non valido.' );
	}
	$clean = array_values( array_filter( array_map( 'saf_clean_atleta', $data ) ) );
	update_option( 'saf_atleti', $clean, false );

	// The counts follow the list when it is imported.
	$m = $f = 0;
	foreach ( $clean as $a ) {
		if ( 2 === $a['gender'] ) {
			$m++;
		} elseif ( 3 === $a['gender'] ) {
			$f++;
		}
	}
	update_option( 'saf_counts', array( 'maschi' => $m, 'femmine' => $f ) );
	return count( $clean );
}

/* ---- Admin page -------------------------------------------------------- */

add_action( 'admin_menu', function () {
	add_menu_page( 'SAF Bolzano', 'SAF', 'manage_options', 'saf-atleti', 'saf_render_admin_page', 'dashicons-universal-access', 27 );
} );

function saf_render_admin_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$notice = '';
	if ( isset( $_POST['saf_admin_nonce'] ) && wp_verify_nonce( $_POST['saf_admin_nonce'], 'saf_admin' ) ) {
		if ( isset( $_POST['saf_save_counts'] ) ) {
			update_option( 'saf_counts', array(
				'maschi'  => absint( $_POST['maschi'] ?? 0 ),
				'femmine' => absint( $_POST['femmine'] ?? 0 ),
			) );
			update_option( 'saf_mail_admin', sanitize_email( wp_unslash( $_POST['mail_admin'] ?? '' ) ) );
			$notice = 'Impostazioni salvate.';
		} elseif ( isset( $_POST['saf_import'] ) && ! empty( $_FILES['atleti_json']['tmp_name'] ) ) {
			$res    = saf_import_atleti_json( file_get_contents( $_FILES['atleti_json']['tmp_name'] ) );
			$notice = is_wp_error( $res ) ? $res->get_error_message() : sprintf( 'Importati %d atleti.', $res );
		}
	}
	$counts = saf_get_counts();
	$list   = get_option( 'saf_atleti', array() );
	?>
	<div class="wrap">
		<h1>SAF Bolzano</h1>
		<?php if ( $notice ) : ?>
			<div class="notice notice-success"><p><?php echo esc_html( $notice ); ?></p></div>
		<?php endif; ?>

		<h2>Numero di atleti e iscrizioni</h2>
		<form method="post">
			<?php wp_nonce_field( 'saf_admin', 'saf_admin_nonce' ); ?>
			<table class="form-table">
				<tr><th><label for="maschi">Maschi</label></th><td><input type="number" min="0" id="maschi" name="maschi" value="<?php echo esc_attr( $counts['maschi'] ); ?>"></td></tr>
				<tr><th><label for="femmine">Femmine</label></th><td><input type="number" min="0" id="femmine" name="femmine" value="<?php echo esc_attr( $counts['femmine'] ); ?>"></td></tr>
				<tr><th><label for="mail_admin">Email che riceve una copia delle iscrizioni</label></th><td><input type="email" class="regular-text" id="mail_admin" name="mail_admin" value="<?php echo esc_attr( get_option( 'saf_mail_admin', get_option( 'admin_email' ) ) ); ?>"></td></tr>
			</table>
			<p class="description">Importando la lista atleti i numeri vengono ricalcolati; qui si possono correggere a mano.</p>
			<?php submit_button( 'Salva', 'primary', 'saf_save_counts' ); ?>
		</form>

		<h2>Lista atleti (<?php echo (int) count( $list ); ?>)</h2>
		<p>Carica il file JSON prodotto da <code>tools/scrape-atleti.js</code>. Sostituisce la lista attuale.</p>
		<form method="post" enctype="multipart/form-data">
			<?php wp_nonce_field( 'saf_admin', 'saf_admin_nonce' ); ?>
			<input type="file" name="atleti_json" accept=".json,application/json" required>
			<?php submit_button( 'Importa', 'secondary', 'saf_import', false ); ?>
		</form>
	</div>
	<?php
}

if ( defined( 'WP_CLI' ) && WP_CLI ) {
	WP_CLI::add_command( 'saf import-atleti', function ( $args ) {
		$res = saf_import_atleti_json( file_get_contents( $args[0] ) );
		if ( is_wp_error( $res ) ) {
			WP_CLI::error( $res->get_error_message() );
		}
		WP_CLI::success( "Importati $res atleti." );
	} );
}
