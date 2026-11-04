<?php
/**
 * Enrollment form: POST /wp-json/saf/v1/iscrizione
 *
 * Sends the athlete a confirmation of the data they entered and a copy to the club.
 * Mail transport is whatever WordPress is configured with (use an SMTP plugin in production).
 */

defined( 'ABSPATH' ) || exit;

add_action( 'rest_api_init', function () {
	register_rest_route( 'saf/v1', '/iscrizione', array(
		'methods'             => 'POST',
		'callback'            => 'saf_handle_enrollment',
		'permission_callback' => '__return_true',
	) );
} );

function saf_handle_enrollment( WP_REST_Request $req ) {
	// Honeypot: real users never fill this in.
	if ( '' !== (string) $req->get_param( 'sito_web' ) ) {
		return new WP_REST_Response( array( 'ok' => true ), 200 );
	}

	// At most 5 submissions per IP per hour.
	$key   = 'saf_enr_' . md5( $_SERVER['REMOTE_ADDR'] ?? '' );
	$tries = (int) get_transient( $key );
	if ( $tries >= 5 ) {
		return new WP_Error( 'saf_rate', 'Troppi invii, riprova più tardi.', array( 'status' => 429 ) );
	}
	set_transient( $key, $tries + 1, HOUR_IN_SECONDS );

	$text = function ( $name ) use ( $req ) {
		return sanitize_text_field( (string) $req->get_param( $name ) );
	};
	$nome      = $text( 'nome' );
	$cognome   = $text( 'cognome' );
	$email     = sanitize_email( (string) ( $req->get_param( 'e_mail' ) ?: $req->get_param( 'email' ) ) );
	$cf        = $text( 'codice_fiscale' );
	$nascita   = $text( 'data_nascita' );
	$luogo     = $text( 'luogo_nascita' );

	if ( '' === $nome || '' === $cognome || ! is_email( $email ) ) {
		return new WP_Error( 'saf_invalid', 'Nome, cognome ed email valida sono obbligatori.', array( 'status' => 400 ) );
	}

	$e = 'esc_html';
	$body = '<p>Ciao, ' . $e( "$nome $cognome" ) . ',</p>'
		. '<p>Nome: ' . $e( $nome ) . '</p>'
		. '<p>Cognome: ' . $e( $cognome ) . '</p>'
		. '<p>Codice Fiscale: ' . $e( $cf ) . '</p>'
		. '<p>Data di nascita: ' . $e( $nascita ) . '</p>'
		. '<p>Luogo di nascita: ' . $e( $luogo ) . '</p>'
		. '<p>Controlla i dati per fare richiesta di iscrizione alla nostra società "SAF BOLZANO 1953".</p>'
		. '<p>In caso di dati errati o mancanti, rispondere a questa mail o ricompilare il modulo sul sito ufficiale safbolzano.it.</p>'
		. '<p>Se tutto è andato bene, ci vediamo prossimamente al campo!</p>'
		. '<p>Saluti,<br/>Lo staff di Saf Bolzano.</p>';

	$subject = "SAF BZ 1953 - Conferma dati iscrizione atleta $nome $cognome";
	$headers = array( 'Content-Type: text/html; charset=UTF-8' );
	$admin   = sanitize_email( (string) get_option( 'saf_mail_admin', get_option( 'admin_email' ) ) );
	if ( is_email( $admin ) ) {
		$headers[] = 'Bcc: ' . $admin;
		$headers[] = 'Reply-To: ' . $admin;
	}

	if ( ! wp_mail( $email, $subject, $body, $headers ) ) {
		return new WP_Error( 'saf_mail', 'Invio email non riuscito.', array( 'status' => 500 ) );
	}
	return new WP_REST_Response( array( 'ok' => true ), 200 );
}
