<?php
/**
 * Markup for the data-driven sections. The data comes from the saf-bolzano-data plugin; without it
 * the sections are simply empty.
 */
defined( 'ABSPATH' ) || exit;

function saf_render_atleti() {
	if ( ! function_exists( 'saf_get_atleti_grouped' ) ) {
		return;
	}
	?>
	<div class="athletesList">
		<h1 class="bigBigTitle"><p style="font-size: 0.655em; text-align: center; margin: 0; line-height: 70%; transform: translateX(0.1em)">I NOSTRI</p>ATLETI</h1>
		<?php foreach ( saf_get_atleti_grouped() as $category => $athletes ) : ?>
			<div class="categoryDiv" id="<?php echo esc_attr( preg_replace( '/\s+/', '', $category ) ); ?>">
				<h2><?php echo esc_html( $category ); ?></h2>
				<div class="athletesContainer">
					<?php foreach ( $athletes as $a ) :
						$gender = 2 === (int) $a['gender'] ? 'maschio' : ( 3 === (int) $a['gender'] ? 'femmina' : 'other' );
						?>
						<div class="athlete <?php echo esc_attr( $gender ); ?>" onclick="openLink('<?php echo esc_url( 'https://atletica.me/atleta/' . rawurlencode( $a['id'] ) ); ?>');">
							<div class="part1">
								<img src="<?php echo esc_url( $a['profile_image'] ); ?>" width="50" height="50" class="athleteField profileImg" alt="">
							</div>
							<div class="part2">
								<div><h3 class="athleteField"><?php echo esc_html( $a['name'] ); ?></h3></div>
								<div>
									<div class="athleteField"><?php echo (int) $a['age']; ?> Anni</div>
									<div class="athleteField"><?php echo esc_html( $a['generale'] ); ?></div>
									<div class="athleteField"><?php echo esc_html( saf_format_birth( $a['data_nascita'] ) ); ?></div>
								</div>
							</div>
						</div>
					<?php endforeach; ?>
				</div>
			</div>
		<?php endforeach; ?>
	</div>
	<?php
}

/** "1999-05-03" => "03 maggio 1999"; a bare year stays as is. */
function saf_format_birth( $value ) {
	if ( preg_match( '/^\d{4}$/', $value ) ) {
		return $value;
	}
	$ts = strtotime( $value );
	if ( ! $ts ) {
		return substr( (string) $value, 0, 4 );
	}
	return wp_date( 'd F Y', $ts );
}

function saf_render_staff() {
	if ( ! function_exists( 'saf_get_staff' ) ) {
		return;
	}
	?>
	<div class="athletesList"><div class="categoryDiv"><div class="athletesContainer">
		<?php foreach ( saf_get_staff() as $p ) : ?>
			<div class="staffSlot fakeGlassGreenBack">
				<div class="part1">
					<img src="<?php echo esc_url( $p['foto'] ); ?>" width="100%" height="100%" class="athleteField staffImg" alt="">
				</div>
				<div class="part2">
					<div><h3 class="athleteField"><?php echo esc_html( $p['nome'] ); ?></h3></div>
					<div>
						<div class="athleteField"><?php echo esc_html( $p['ruolo'] ); ?></div>
						<div class="athleteField"><?php echo esc_html( $p['specialita'] ); ?></div>
						<div class="athleteField"><?php echo esc_html( $p['anno'] ); ?></div>
					</div>
				</div>
			</div>
		<?php endforeach; ?>
	</div></div></div>
	<?php
}

/**
 * One records table: 'F' = Donne, 'M' = Uomini. Prints nothing if the category is empty.
 */
function saf_render_records( $sesso ) {
	if ( ! function_exists( 'saf_get_records' ) ) {
		return;
	}
	$rows = saf_get_records( $sesso );
	if ( ! $rows ) {
		return;
	}
	?>
	<h2 class="recordsTitle"><?php echo 'F' === $sesso ? 'Donne' : 'Uomini'; ?></h2>
	<table class="table_btm">
		<tr><th>disciplina</th><th>prestazione</th><th>nome</th><th>cognome</th><th>data</th></tr>
		<?php foreach ( $rows as $r ) : ?>
			<tr>
				<td><?php echo esc_html( $r['disciplina'] ); ?></td>
				<td><?php echo esc_html( $r['tempo'] ); ?></td>
				<td><?php echo esc_html( $r['nome'] ); ?></td>
				<td><?php echo esc_html( $r['cognome'] ); ?></td>
				<td><?php echo esc_html( $r['data'] ); ?></td>
			</tr>
		<?php endforeach; ?>
	</table>
	<?php
}

function saf_render_counts() {
	if ( ! function_exists( 'saf_get_counts' ) ) {
		return;
	}
	$c = saf_get_counts();
	?>
	<div>
		<div class="n-container beat shadowBack"><h3>MASCHI</h3><p><?php echo (int) $c['maschi']; ?></p></div>
		<div class="n-container beat shadowBack"><h3>FEMMINE</h3><p><?php echo (int) $c['femmine']; ?></p></div>
		<div class="n-container beat shadowBack"><h3>ATLETI</h3><p><?php echo (int) $c['atleti']; ?></p></div>
	</div>
	<?php
}
