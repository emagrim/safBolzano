<?php
/**
 * Page slider: wrapper, images and the white wave.
 *
 * Like the original site, the outer <div class="slider"> stays open on most pages and the page content
 * is nested in it (footer.php closes it). The enrollment page closes it immediately ('close' => true).
 *
 * @var array $args { images: string[] URLs, img_class: string, close: bool }
 */
$images    = $args['images'] ?? array();
$img_class = $args['img_class'] ?? '';
$close     = ! empty( $args['close'] );
if ( ! $close ) {
	$GLOBALS['saf_slider_open'] = true;
}
?>
<div class="slider introduceSection">
	<div class="containsSlides heightSmall">
		<div class="slideOverlay heightSmall">
			<h2></h2>
			<p class="bigText"></p>
		</div>
		<?php foreach ( $images as $url ) : ?>
			<img class="slide imageSlides heightSmall <?php echo esc_attr( $img_class ); ?>" src="<?php echo esc_url( $url ); ?>" alt="">
		<?php endforeach; ?>
		<?php get_template_part( 'template-parts/wave' ); ?>
	</div>
<?php if ( $close ) : ?></div><?php endif; ?>
