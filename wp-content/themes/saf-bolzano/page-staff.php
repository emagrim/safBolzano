<?php
/**
 * Template for the page with slug "staff".
 */
get_header();
?>
    <?php saf_slider( 'staff' ); ?>  
        <div class="marginTop"><h1 class="bigBigTitle"><p style="font-size: 0.655em; text-align: center; margin: 0; line-height: 70%; transform: translateX(-1.8em)">IL NOSTRO</p>PERSONALE</h1></div>
        <?php saf_render_staff(); ?>
<?php get_footer(); ?>
