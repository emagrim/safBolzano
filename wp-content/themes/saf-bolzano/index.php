<?php
/**
 * Fallback template (pages without their own template, search, 404).
 */
get_header();
saf_slider( 'news' );
?>
	<div class="section" style="margin-left: auto; margin-right: auto;">
		<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
			<h1 class="bigBigTitle"><?php the_title(); ?></h1>
			<div class="paragraph"><?php the_content(); ?></div>
		<?php endwhile; else : ?>
			<h1 class="bigBigTitle">PAGINA NON TROVATA</h1>
			<p class="paragraph"><a href="<?php echo saf_link( '/' ); ?>">Torna alla home</a></p>
		<?php endif; ?>
	</div>
<?php get_footer(); ?>
