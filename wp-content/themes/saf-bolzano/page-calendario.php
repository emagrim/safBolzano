<?php
/**
 * Template for the page with slug "calendario".
 */
get_header();
?>
    <?php saf_slider( 'calendario' ); ?>
        <h1 class="bigBigTitle recordMove"><p style="font-size: 0.655em; text-align: center; margin: 0; line-height: 70%; transform: translateX(-0.7em)"></p>CALENDARIO</h1>
        <div class="section flexVertical" style="margin: 130px auto; width: 100%;">
            <iframe 
                src="<?php echo esc_url( saf_document_url( 'calendario.pdf' ) ); ?>" 
                width="100%" 
                height="900px" 
                style="border: none;">
            </iframe>
        </div>
<?php get_footer(); ?>
