<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<Navbar class="navbar">
	<div class="navContainer gridRight">
		<div class="backOfLogo slideIn1">
			<a href="<?php echo saf_link( '/' ); ?>"><img src="<?php echo esc_url( saf_asset_url( 'images/official/logo_saf.png' ) ); ?>" class="logo slideIn2" alt="SAF Bolzano 1953" /></a>
		</div>
	</div>
	<div class="navContainer gridCenter">
		<div class="gridInnerTop slideIn2">
			<a href="<?php echo saf_link( '/info/' ); ?>" class="upperNavItem navItem"><p>Contattaci ora!</p></a>
			<a href="https://www.instagram.com/saf_bolzano_1953" target="_blank" rel="noopener" class="upperNavItem navItem" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
			<a href="https://www.facebook.com/NuvolaRossa1953" target="_blank" rel="noopener" class="upperNavItem navItem" aria-label="Facebook"><i class="fa-brands fa-facebook"></i></a>
			<a href="<?php echo saf_link( '/iscrizioni/#modulo' ); ?>"><button class="upperNavItem">ISCRIVITI</button></a>
		</div>
		<div class="gridInnerCenter slideIn1">
			<?php saf_primary_menu(); ?>
			<div class="navItem excluded navText" onclick="onClickToggleNav()">
				<div class="bars-icon icon">
					<div class="moving-bar up"></div>
					<div class="icon-part-away"></div>
					<div class="moving-bar down"></div>
				</div>
			</div>
		</div>
		<div class="">
			<div class="navigationMobile"></div>
		</div>
	</div>
	<div class="navContainer gridLeft"></div>
</Navbar>
