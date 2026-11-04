<?php
/**
 * Plugin Name: Dev mail (Mailpit)
 * Description: Solo sviluppo locale: manda tutte le email di WordPress a Mailpit (http://localhost:8025).
 */
add_action( 'phpmailer_init', function ( $phpmailer ) {
	$phpmailer->isSMTP();
	$phpmailer->Host     = 'mailpit';
	$phpmailer->Port     = 1025;
	$phpmailer->SMTPAuth = false;
} );

// "wordpress@localhost" non e' un indirizzo valido per PHPMailer.
add_filter( 'wp_mail_from', function () {
	return 'noreply@safbolzano.test';
} );
