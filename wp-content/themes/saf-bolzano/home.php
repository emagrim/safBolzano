<?php
/**
 * News: the posts page (set as "Pagina degli articoli" on activation).
 */
get_header();
saf_slider( 'news' );
?>
	<div class="section" style="margin-left: auto; margin-right: auto;">
		<h1 class="bigBigTitle">ULTIME NOTIZIE</h1>
		<div class="ig-section ig-grid-news">
			<?php while ( have_posts() ) : the_post(); ?>
				<div class="ig-post newsBack" id="post-<?php the_ID(); ?>">
					<?php if ( has_post_thumbnail() ) : ?>
						<a href="<?php the_permalink(); ?>"><?php the_post_thumbnail( 'large' ); ?></a>
					<?php else : ?>
						<a href="<?php the_permalink(); ?>" class="newsNoImg"><img src="<?php echo esc_url( saf_asset_url( 'images/official/logo_saf.png' ) ); ?>" alt=""></a>
					<?php endif; ?>
					<div class="description">
						<h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
						<p class="paragraph"><?php echo esc_html( saf_post_date_it() ); ?> &middot; <?php echo esc_html( wp_trim_words( get_the_excerpt(), 40 ) ); ?></p>
						<a href="<?php the_permalink(); ?>" class="newsLink"><i class="fa-solid fa-chevron-down"></i></a>
					</div>
				</div>
			<?php endwhile; ?>
		</div>
		<?php the_posts_pagination( array( 'mid_size' => 1, 'prev_text' => '&larr;', 'next_text' => '&rarr;' ) ); ?>
	</div>
<?php get_footer(); ?>
