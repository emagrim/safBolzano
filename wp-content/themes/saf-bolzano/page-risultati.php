<?php
/**
 * Template for the page with slug "risultati".
 */
get_header();
?>
    <?php saf_slider( 'risultati' ); ?>
        <h1 class="bigBigTitle recordMove"><p style="font-size: 0.655em; text-align: center; margin: 0; line-height: 70%; transform: translateX(-0.7em)">I NOSTRI</p>RECORD</h1>
        <div class="section flexVertical tableScroll" style="margin: 130px auto">

            <?php saf_render_records(); ?>
        </div>
<?php get_footer(); ?>
