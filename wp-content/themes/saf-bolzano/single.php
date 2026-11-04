<?php
/**
 * A single news article.
 */
get_header();
saf_slider( 'news' );
while ( have_posts() ) :
	the_post();
	?>
	<div class="section" style="margin-left: auto; margin-right: auto;">
		<article class="ig-post articleBack">
			<?php if ( has_post_thumbnail() ) : ?>
				<?php the_post_thumbnail( 'large' ); ?>
			<?php endif; ?>
			<div class="description">
				<h3><?php the_title(); ?></h3>
				<p class="paragraph"><?php echo esc_html( get_the_date() ); ?></p>
				<div class="paragraph"><?php the_content(); ?></div>
				<a class="articleLink" href="<?php echo saf_link( '/news/' ); ?>">Tutte le notizie</a>
			</div>
		</article>
	</div>
	<?php
endwhile;
get_footer();
