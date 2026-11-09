<?php
/**
 * Template for the page with slug "info".
 */
get_header();
?>
    <?php saf_slider( 'info', 'lowerImgOnDisplay' ); ?>
        <div class="section" style="margin-top: 60px; margin-bottom: 0;">
            <div class="orari">
                <a href="<?php echo esc_url( saf_document_url( 'allenamenti.pdf' ) ); ?>">
                    <h1 class="bigBigTitle">ORARI E ALLENAMENTI</h1>
                    <div class="centerO">
                        <i class="fa-solid fa-clock fa-5x"></i>
                    </div>
                </a>
            </div>
            <!-- 

                 !-->

            <div class="contacts">
                <h1 class="bigBigTitle">contatti</h1>
                <div class="margin_bottom" style="margin-top: 0px">
                    <a href="#info"><i class="fa-icon fa-regular fa-envelope"></i></a>
                    <!-- <a href="#info"><i class="fa-icon fa-solid fa-phone-flip"></i></a> !-->
                    <a href="https://www.facebook.com/NuvolaRossa1953"><i class="fa-icon fa-brands fa-facebook"></i></a>
                    <a href="https://instagram.com/saf_bolzano"><i class="fa-icon fa-brands fa-instagram"></i></a>
                </div>
                <h1 class="bigBigTitle">STAFF &amp; EVENTI</h1>
                <div class="margin_bottom" style="margin-top: 0px">
                    <a href="<?php echo saf_link( '/staff/' ); ?>"><i class="fa-icon fa-solid fa-users"></i></a>
                    <a href="<?php echo saf_link( '/calendario/' ); ?>"><i class="fa-icon fa-regular fa-calendar-check"></i></a>
                </div>
            </div>
        </div>
        <div>
            <svg xmlns:xlink="http://www.w3.org/1999/xlink" id="wave" style="transform:rotate(0deg); transition: 0.3s"
                viewBox="0 0 1440 290" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="sw-gradient-0" x1="0" x2="0" y1="1" y2="0">
                        <stop stop-color="rgba(255, 255, 255, 1)" offset="0%" />
                        <stop stop-color="rgba(226.896, 226.896, 226.896, 1)" offset="100%" />
                    </linearGradient>
                </defs>
                <path style="transform:translate(0, 0px); opacity:1" fill="url(#sw-gradient-0)"
                    d="M0,87L24,82.2C48,77,96,68,144,91.8C192,116,240,174,288,174C336,174,384,116,432,91.8C480,68,528,77,576,77.3C624,77,672,68,720,82.2C768,97,816,135,864,130.5C912,126,960,77,1008,77.3C1056,77,1104,126,1152,125.7C1200,126,1248,77,1296,67.7C1344,58,1392,87,1440,106.3C1488,126,1536,135,1584,140.2C1632,145,1680,145,1728,159.5C1776,174,1824,203,1872,188.5C1920,174,1968,116,2016,91.8C2064,68,2112,77,2160,111.2C2208,145,2256,203,2304,207.8C2352,213,2400,164,2448,154.7C2496,145,2544,174,2592,154.7C2640,135,2688,68,2736,38.7C2784,10,2832,19,2880,19.3C2928,19,2976,10,3024,38.7C3072,68,3120,135,3168,154.7C3216,174,3264,145,3312,140.2C3360,135,3408,155,3432,164.3L3456,174L3456,290L3432,290C3408,290,3360,290,3312,290C3264,290,3216,290,3168,290C3120,290,3072,290,3024,290C2976,290,2928,290,2880,290C2832,290,2784,290,2736,290C2688,290,2640,290,2592,290C2544,290,2496,290,2448,290C2400,290,2352,290,2304,290C2256,290,2208,290,2160,290C2112,290,2064,290,2016,290C1968,290,1920,290,1872,290C1824,290,1776,290,1728,290C1680,290,1632,290,1584,290C1536,290,1488,290,1440,290C1392,290,1344,290,1296,290C1248,290,1200,290,1152,290C1104,290,1056,290,1008,290C960,290,912,290,864,290C816,290,768,290,720,290C672,290,624,290,576,290C528,290,480,290,432,290C384,290,336,290,288,290C240,290,192,290,144,290C96,290,48,290,24,290L0,290Z" />
                <defs>
                    <linearGradient id="sw-gradient-1" x1="0" x2="0" y1="1" y2="0">
                        <stop stop-color="rgba(255, 255, 255, 1)" offset="0%" />
                        <stop stop-color="rgba(213.235, 213.235, 213.235, 1)" offset="100%" />
                    </linearGradient>
                </defs>
                <path style="transform:translate(0, 50px); opacity:0.9" fill="url(#sw-gradient-1)"
                    d="M0,58L24,62.8C48,68,96,77,144,77.3C192,77,240,68,288,53.2C336,39,384,19,432,29C480,39,528,77,576,116C624,155,672,193,720,188.5C768,184,816,135,864,101.5C912,68,960,48,1008,67.7C1056,87,1104,145,1152,145C1200,145,1248,87,1296,82.2C1344,77,1392,126,1440,145C1488,164,1536,155,1584,159.5C1632,164,1680,184,1728,174C1776,164,1824,126,1872,120.8C1920,116,1968,145,2016,174C2064,203,2112,232,2160,227.2C2208,222,2256,184,2304,149.8C2352,116,2400,87,2448,91.8C2496,97,2544,135,2592,164.3C2640,193,2688,213,2736,227.2C2784,242,2832,251,2880,212.7C2928,174,2976,87,3024,48.3C3072,10,3120,19,3168,24.2C3216,29,3264,29,3312,38.7C3360,48,3408,68,3432,77.3L3456,87L3456,290L3432,290C3408,290,3360,290,3312,290C3264,290,3216,290,3168,290C3120,290,3072,290,3024,290C2976,290,2928,290,2880,290C2832,290,2784,290,2736,290C2688,290,2640,290,2592,290C2544,290,2496,290,2448,290C2400,290,2352,290,2304,290C2256,290,2208,290,2160,290C2112,290,2064,290,2016,290C1968,290,1920,290,1872,290C1824,290,1776,290,1728,290C1680,290,1632,290,1584,290C1536,290,1488,290,1440,290C1392,290,1344,290,1296,290C1248,290,1200,290,1152,290C1104,290,1056,290,1008,290C960,290,912,290,864,290C816,290,768,290,720,290C672,290,624,290,576,290C528,290,480,290,432,290C384,290,336,290,288,290C240,290,192,290,144,290C96,290,48,290,24,290L0,290Z" />
                <defs>
                    <linearGradient id="sw-gradient-2" x1="0" x2="0" y1="1" y2="0">
                        <stop stop-color="rgba(255, 255, 255, 1)" offset="0%" />
                        <stop stop-color="rgba(215.512, 215.512, 215.512, 1)" offset="100%" />
                    </linearGradient>
                </defs>
                <path style="transform:translate(0, 100px); opacity:0.8" fill="url(#sw-gradient-2)"
                    d="M0,174L24,159.5C48,145,96,116,144,106.3C192,97,240,106,288,130.5C336,155,384,193,432,178.8C480,164,528,97,576,87C624,77,672,126,720,154.7C768,184,816,193,864,178.8C912,164,960,126,1008,130.5C1056,135,1104,184,1152,169.2C1200,155,1248,77,1296,58C1344,39,1392,77,1440,106.3C1488,135,1536,155,1584,159.5C1632,164,1680,155,1728,164.3C1776,174,1824,203,1872,222.3C1920,242,1968,251,2016,241.7C2064,232,2112,203,2160,178.8C2208,155,2256,135,2304,120.8C2352,106,2400,97,2448,91.8C2496,87,2544,87,2592,111.2C2640,135,2688,184,2736,212.7C2784,242,2832,251,2880,212.7C2928,174,2976,87,3024,87C3072,87,3120,174,3168,193.3C3216,213,3264,164,3312,145C3360,126,3408,135,3432,140.2L3456,145L3456,290L3432,290C3408,290,3360,290,3312,290C3264,290,3216,290,3168,290C3120,290,3072,290,3024,290C2976,290,2928,290,2880,290C2832,290,2784,290,2736,290C2688,290,2640,290,2592,290C2544,290,2496,290,2448,290C2400,290,2352,290,2304,290C2256,290,2208,290,2160,290C2112,290,2064,290,2016,290C1968,290,1920,290,1872,290C1824,290,1776,290,1728,290C1680,290,1632,290,1584,290C1536,290,1488,290,1440,290C1392,290,1344,290,1296,290C1248,290,1200,290,1152,290C1104,290,1056,290,1008,290C960,290,912,290,864,290C816,290,768,290,720,290C672,290,624,290,576,290C528,290,480,290,432,290C384,290,336,290,288,290C240,290,192,290,144,290C96,290,48,290,24,290L0,290Z" />
                <defs>
                    <linearGradient id="sw-gradient-3" x1="0" x2="0" y1="1" y2="0">
                        <stop stop-color="rgba(255, 255, 255, 1)" offset="0%" />
                        <stop stop-color="rgba(255, 255, 255, 1)" offset="100%" />
                    </linearGradient>
                </defs>
                <path style="transform:translate(0, 150px); opacity:0.7" fill="url(#sw-gradient-3)"
                    d="M0,87L24,82.2C48,77,96,68,144,58C192,48,240,39,288,29C336,19,384,10,432,19.3C480,29,528,58,576,77.3C624,97,672,106,720,120.8C768,135,816,155,864,135.3C912,116,960,58,1008,62.8C1056,68,1104,135,1152,149.8C1200,164,1248,126,1296,120.8C1344,116,1392,145,1440,145C1488,145,1536,116,1584,91.8C1632,68,1680,48,1728,77.3C1776,106,1824,184,1872,188.5C1920,193,1968,126,2016,96.7C2064,68,2112,77,2160,72.5C2208,68,2256,48,2304,67.7C2352,87,2400,145,2448,164.3C2496,184,2544,164,2592,135.3C2640,106,2688,68,2736,62.8C2784,58,2832,87,2880,82.2C2928,77,2976,39,3024,38.7C3072,39,3120,77,3168,87C3216,97,3264,77,3312,62.8C3360,48,3408,39,3432,33.8L3456,29L3456,290L3432,290C3408,290,3360,290,3312,290C3264,290,3216,290,3168,290C3120,290,3072,290,3024,290C2976,290,2928,290,2880,290C2832,290,2784,290,2736,290C2688,290,2640,290,2592,290C2544,290,2496,290,2448,290C2400,290,2352,290,2304,290C2256,290,2208,290,2160,290C2112,290,2064,290,2016,290C1968,290,1920,290,1872,290C1824,290,1776,290,1728,290C1680,290,1632,290,1584,290C1536,290,1488,290,1440,290C1392,290,1344,290,1296,290C1248,290,1200,290,1152,290C1104,290,1056,290,1008,290C960,290,912,290,864,290C816,290,768,290,720,290C672,290,624,290,576,290C528,290,480,290,432,290C384,290,336,290,288,290C240,290,192,290,144,290C96,290,48,290,24,290L0,290Z" />
            </svg>
            <div class="numbers graySection">
                <?php saf_render_counts(); ?>
                <!-- wave !-->
            </div>
            <svg id="wave" style="transform:rotate(180deg); transition: 0.3s" viewBox="0 0 1440 290" version="1.1"
                xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="sw-gradient-0" x1="0" x2="0" y1="1" y2="0">
                        <stop stop-color="rgba(255, 255, 255, 1)" offset="0%"></stop>
                        <stop stop-color="rgba(226.896, 226.896, 226.896, 1)" offset="100%"></stop>
                    </linearGradient>
                </defs>
                <path style="transform:translate(0, 0px); opacity:1" fill="url(#sw-gradient-0)"
                    d="M0,87L24,82.2C48,77,96,68,144,91.8C192,116,240,174,288,174C336,174,384,116,432,91.8C480,68,528,77,576,77.3C624,77,672,68,720,82.2C768,97,816,135,864,130.5C912,126,960,77,1008,77.3C1056,77,1104,126,1152,125.7C1200,126,1248,77,1296,67.7C1344,58,1392,87,1440,106.3C1488,126,1536,135,1584,140.2C1632,145,1680,145,1728,159.5C1776,174,1824,203,1872,188.5C1920,174,1968,116,2016,91.8C2064,68,2112,77,2160,111.2C2208,145,2256,203,2304,207.8C2352,213,2400,164,2448,154.7C2496,145,2544,174,2592,154.7C2640,135,2688,68,2736,38.7C2784,10,2832,19,2880,19.3C2928,19,2976,10,3024,38.7C3072,68,3120,135,3168,154.7C3216,174,3264,145,3312,140.2C3360,135,3408,155,3432,164.3L3456,174L3456,290L3432,290C3408,290,3360,290,3312,290C3264,290,3216,290,3168,290C3120,290,3072,290,3024,290C2976,290,2928,290,2880,290C2832,290,2784,290,2736,290C2688,290,2640,290,2592,290C2544,290,2496,290,2448,290C2400,290,2352,290,2304,290C2256,290,2208,290,2160,290C2112,290,2064,290,2016,290C1968,290,1920,290,1872,290C1824,290,1776,290,1728,290C1680,290,1632,290,1584,290C1536,290,1488,290,1440,290C1392,290,1344,290,1296,290C1248,290,1200,290,1152,290C1104,290,1056,290,1008,290C960,290,912,290,864,290C816,290,768,290,720,290C672,290,624,290,576,290C528,290,480,290,432,290C384,290,336,290,288,290C240,290,192,290,144,290C96,290,48,290,24,290L0,290Z">
                </path>
                <defs>
                    <linearGradient id="sw-gradient-1" x1="0" x2="0" y1="1" y2="0">
                        <stop stop-color="rgba(255, 255, 255, 1)" offset="0%"></stop>
                        <stop stop-color="rgba(213.235, 213.235, 213.235, 1)" offset="100%"></stop>
                    </linearGradient>
                </defs>
                <path style="transform:translate(0, 50px); opacity:0.9" fill="url(#sw-gradient-1)"
                    d="M0,58L24,62.8C48,68,96,77,144,77.3C192,77,240,68,288,53.2C336,39,384,19,432,29C480,39,528,77,576,116C624,155,672,193,720,188.5C768,184,816,135,864,101.5C912,68,960,48,1008,67.7C1056,87,1104,145,1152,145C1200,145,1248,87,1296,82.2C1344,77,1392,126,1440,145C1488,164,1536,155,1584,159.5C1632,164,1680,184,1728,174C1776,164,1824,126,1872,120.8C1920,116,1968,145,2016,174C2064,203,2112,232,2160,227.2C2208,222,2256,184,2304,149.8C2352,116,2400,87,2448,91.8C2496,97,2544,135,2592,164.3C2640,193,2688,213,2736,227.2C2784,242,2832,251,2880,212.7C2928,174,2976,87,3024,48.3C3072,10,3120,19,3168,24.2C3216,29,3264,29,3312,38.7C3360,48,3408,68,3432,77.3L3456,87L3456,290L3432,290C3408,290,3360,290,3312,290C3264,290,3216,290,3168,290C3120,290,3072,290,3024,290C2976,290,2928,290,2880,290C2832,290,2784,290,2736,290C2688,290,2640,290,2592,290C2544,290,2496,290,2448,290C2400,290,2352,290,2304,290C2256,290,2208,290,2160,290C2112,290,2064,290,2016,290C1968,290,1920,290,1872,290C1824,290,1776,290,1728,290C1680,290,1632,290,1584,290C1536,290,1488,290,1440,290C1392,290,1344,290,1296,290C1248,290,1200,290,1152,290C1104,290,1056,290,1008,290C960,290,912,290,864,290C816,290,768,290,720,290C672,290,624,290,576,290C528,290,480,290,432,290C384,290,336,290,288,290C240,290,192,290,144,290C96,290,48,290,24,290L0,290Z">
                </path>
                <defs>
                    <linearGradient id="sw-gradient-2" x1="0" x2="0" y1="1" y2="0">
                        <stop stop-color="rgba(255, 255, 255, 1)" offset="0%"></stop>
                        <stop stop-color="rgba(215.512, 215.512, 215.512, 1)" offset="100%"></stop>
                    </linearGradient>
                </defs>
                <path style="transform:translate(0, 100px); opacity:0.8" fill="url(#sw-gradient-2)"
                    d="M0,174L24,159.5C48,145,96,116,144,106.3C192,97,240,106,288,130.5C336,155,384,193,432,178.8C480,164,528,97,576,87C624,77,672,126,720,154.7C768,184,816,193,864,178.8C912,164,960,126,1008,130.5C1056,135,1104,184,1152,169.2C1200,155,1248,77,1296,58C1344,39,1392,77,1440,106.3C1488,135,1536,155,1584,159.5C1632,164,1680,155,1728,164.3C1776,174,1824,203,1872,222.3C1920,242,1968,251,2016,241.7C2064,232,2112,203,2160,178.8C2208,155,2256,135,2304,120.8C2352,106,2400,97,2448,91.8C2496,87,2544,87,2592,111.2C2640,135,2688,184,2736,212.7C2784,242,2832,251,2880,212.7C2928,174,2976,87,3024,87C3072,87,3120,174,3168,193.3C3216,213,3264,164,3312,145C3360,126,3408,135,3432,140.2L3456,145L3456,290L3432,290C3408,290,3360,290,3312,290C3264,290,3216,290,3168,290C3120,290,3072,290,3024,290C2976,290,2928,290,2880,290C2832,290,2784,290,2736,290C2688,290,2640,290,2592,290C2544,290,2496,290,2448,290C2400,290,2352,290,2304,290C2256,290,2208,290,2160,290C2112,290,2064,290,2016,290C1968,290,1920,290,1872,290C1824,290,1776,290,1728,290C1680,290,1632,290,1584,290C1536,290,1488,290,1440,290C1392,290,1344,290,1296,290C1248,290,1200,290,1152,290C1104,290,1056,290,1008,290C960,290,912,290,864,290C816,290,768,290,720,290C672,290,624,290,576,290C528,290,480,290,432,290C384,290,336,290,288,290C240,290,192,290,144,290C96,290,48,290,24,290L0,290Z">
                </path>
                <defs>
                    <linearGradient id="sw-gradient-3" x1="0" x2="0" y1="1" y2="0">
                        <stop stop-color="rgba(255, 255, 255, 1)" offset="0%"></stop>
                        <stop stop-color="rgba(255, 255, 255, 1)" offset="100%"></stop>
                    </linearGradient>
                </defs>
                <path style="transform:translate(0, 150px); opacity:0.7" fill="url(#sw-gradient-3)"
                    d="M0,87L24,82.2C48,77,96,68,144,58C192,48,240,39,288,29C336,19,384,10,432,19.3C480,29,528,58,576,77.3C624,97,672,106,720,120.8C768,135,816,155,864,135.3C912,116,960,58,1008,62.8C1056,68,1104,135,1152,149.8C1200,164,1248,126,1296,120.8C1344,116,1392,145,1440,145C1488,145,1536,116,1584,91.8C1632,68,1680,48,1728,77.3C1776,106,1824,184,1872,188.5C1920,193,1968,126,2016,96.7C2064,68,2112,77,2160,72.5C2208,68,2256,48,2304,67.7C2352,87,2400,145,2448,164.3C2496,184,2544,164,2592,135.3C2640,106,2688,68,2736,62.8C2784,58,2832,87,2880,82.2C2928,77,2976,39,3024,38.7C3072,39,3120,77,3168,87C3216,97,3264,77,3312,62.8C3360,48,3408,39,3432,33.8L3456,29L3456,290L3432,290C3408,290,3360,290,3312,290C3264,290,3216,290,3168,290C3120,290,3072,290,3024,290C2976,290,2928,290,2880,290C2832,290,2784,290,2736,290C2688,290,2640,290,2592,290C2544,290,2496,290,2448,290C2400,290,2352,290,2304,290C2256,290,2208,290,2160,290C2112,290,2064,290,2016,290C1968,290,1920,290,1872,290C1824,290,1776,290,1728,290C1680,290,1632,290,1584,290C1536,290,1488,290,1440,290C1392,290,1344,290,1296,290C1248,290,1200,290,1152,290C1104,290,1056,290,1008,290C960,290,912,290,864,290C816,290,768,290,720,290C672,290,624,290,576,290C528,290,480,290,432,290C384,290,336,290,288,290C240,290,192,290,144,290C96,290,48,290,24,290L0,290Z">
                </path>
            </svg>
        </div>

        
        <div class="imageSection selectedSection two" style="height: 110%;">

            <h1 class="lateral left">MEETING CRISCUOLO</h1>


            <div class="imageSectionItem">
                <p>ogni anno ad <br /> AGOSTO</p>
                <i class="fa-solid fa-clock"></i>
            </div>

            <div class="imageSectionItem">
                <p>Premio FRANCO CRISCUOLO per la migliore prestazione sui 400m/H/M/F</p>
                <i class="fa-solid fa-medal"></i>
            </div>
        </div>
        <!--
        <div class="contacts section">
            
            <h1 class="paragraph" id="storia" style="font-size: 60px; color: #f06970;">
                PICCOLA STORIA DI UNA GRANDE SQUADRA
            </h1>
            <p class="paragraph">1953-2013. Sessant&rsquo;anni di storia sportiva della città di Bolzano passano anche
                attraverso le
                maglie
                biancorosse della Società Atletica Femminile Bolzano, indossate in questo periodo da oltre 3000 ragazze
                e da circa 1000 ragazzi (questi ultimi a partire dal 1979). Un passato ricco di successi e di ricordi,
                un presente caratterizzato dall&rsquo;entusiasmo ancora vivo di tutti i componenti della famiglia dei
                &ldquo;safini&rdquo;, in previsione di un futuro che ci auguriamo potrà essere altrettanto roseo.

                La storia, si diceva. Una storia che nasce in un&rsquo;Italia ed in una Bolzano decisamente diverse da
                quelle
                che conosciamo oggi, dove lo sport al femminile costituiva l&rsquo;eccezione più che la regola: in
                Provincia
                di Bolzano l&rsquo;unica formazione di atletica leggera femminile era quella dello Sport Club Merano,
                mentre
                in Trentino l&rsquo;ATAF Trento era nata solo l&rsquo;anno prima. La SAF BOLZANO nacque per rispondere
                alla sempre
                più crescente domanda delle ragazze bolzanine di poter praticare l&rsquo;atletica leggera. Fu allora
                che,
                grazie all&rsquo;intraprendenza di alcuni appassionati, venne fondata la Società. Il Dott. Demetrio
                Eller fu
                chiamato a presiederla e il Prof. Franco Criscuolo ne era il Direttore Tecnico, ruolo che tuttora
                ricopre. È lui, a tutti gli effetti, il principale artefice di 60 anni di ininterrotta attività
                agonistica, la vera anima di questa squadra, il collante tra tutti i protagonisti e le protagoniste
                della nostra avventura in biancorosso.</p>
            <div class="skewX">
                <button onclick="getSection(1)" class="fa-text btn-special btn-app-sect1">
                    1953
                </button>
                <button onclick="getSection(2)" class="fa-text btn-special btn-app-sect2">
                    1960
                </button>
                <button onclick="getSection(3)" class="fa-text btn-special btn-app-sect3">
                    1980
                </button>
                <button onclick="getSection(4)" class="fa-text btn-special btn-app-sect4">
                    2000
                </button>
            </div>
            <div id="section1">
                <h2 class="paragraph">1953 LA FONDAZIONE E LE ORIGINI</h2>
                <p class="paragraph">
                    La SAF BOLZANO nasce ufficialmente il 12 febbraio 1953. Per reclutare le atlete la SAF organizza, il
                    10 maggio di quell’anno, una riunione di atletica leggera al campo Druso, dove tutte le ragazze
                    bolzanine sono invitate a partecipare. Alla manifestazione, seguita da un folto pubblico di
                    appassionati, si presenta, come riportano i giornali dell’epoca, "un numeroso lotto di giovani
                    atlete". La settimana successiva, il 17 maggio, la SAF BOLZANO organizza e prende parte alla sua
                    prima manifestazione ufficiale: i Campionati regionali di Società 1953. Tra le atlete in campo vi
                    sono già i nomi di quelle che, negli anni immediatamente successivi, diventeranno le prime grandi
                    protagoniste della nostra storia: Carla Venturato e Anita Baldo, che nel 1955 sarà la prima "safina"
                    a vestire la maglia azzurra della Nazionale. I successi sono subito molti, tra cui spiccano i
                    quattro titoli regionali assoluti conquistati a Trento il 20 settembre 1953 da Anita Baldo nei 200 e
                    800 metri, Liliana Pace negli 80 metri e Carla Venturato nel salto in alto.

                    Già nel 1954 arriva il primo alloro a livello nazionale: il merito è della giovane Brigitte Pupp che
                    a Bergamo vince il titolo italiano di Seconda Serie nel lancio del giavellotto. La SAF, come del
                    resto tutto il movimento dell’atletica femminile, cresce in fretta. Ed è questa una crescita sia
                    quantitativa sia qualitativa. Le tesserate aumentano costantemente di numero, passando dalle 37 del
                    1953 alle oltre 120 del 1962.
                </p>
                <h2 class="paragraph">I SUCCESSI DEL PRIMO DECENNIO</h2>
                <p class="paragraph">
                    La seconda metà degli anni cinquanta riserva alla SAF grossissime soddisfazioni sia a livello
                    regionale sia in campo nazionale.

                    Nel 1957 Anita Baldo migliora per due volte il primato italiano dei 400 metri portandolo a 59"7,
                    prima donna italiana a scendere sotto il muro del minuto su questa distanza. La stessa Baldo,
                    insieme a Maria Gabriella Venturato e Franca De Paoli, centra anche il record italiano della
                    staffetta 3x800.

                    L’anno successivo tocca ad Edvige Boscaro realizzare il record italiano juniores sui 100 metri col
                    tempo di 12"7, prestazione che le vale anche la maglia azzurra assoluta. Il 1958 è anche l’anno
                    della consacrazione di Franca De Paoli: convocata in Nazionale, il 6 luglio a Pisa eguaglia il
                    record italiano degli 800 metri che apparteneva alla sua eterna rivale, la napoletana Gilda
                    Jannaccone, col tempo di 2’15"4. La settimana successiva, a Bolzano, frantuma con le compagne
                    Venturato e Buffa il record italiano della staffetta 3x800, stabilito dalla SAF un anno prima,
                    portandolo a 7’21"5, con un miglioramento di 7" netti. Questi risultati le valgono l’inserimento nel
                    gruppo dei Probabili Olimpici di Roma 1960; la mancata convocazione rimane forse il suo più grande
                    rammarico.

                </p>
            </div>
            <div id="section2">
                <h2 class="paragraph">1960 L'EPOCA DEI TALENTI</h2>
                <p class="paragraph">
                    L’attività della SAF non si ferma: le atlete cambiano, i risultati restano. Dopo i grandi successi
                    dei primi 10 anni, la nostra Società continua a mantenersi ad altissimi livelli nel panorama
                    nazionale. Il gruppo delle junior Campionesse d’Italia mantiene le aspettative anche nella categoria
                    assoluta. I nomi di spicco, che fanno la storia della SAF BOLZANO nella seconda metà degli anni ’60,
                    sono tanti. Nel 1966 Maria Grazia Bertoldo centra quel titolo italiano di corsa campestre che aveva
                    sfiorato nel ’64 e nel ’65. Seconda, in quella gara, Clara Pellegrinelli. Entrambe le atlete, ancora
                    juniores, conquistarono con i loro successi la maglia azzurra di categoria in due occasioni,
                    raggiungendo Marilena Paraventi, ostacolista già in Nazionale giovanile nel 1965. Maria Grazia, in
                    luglio, si laurea campionessa italiana juniores sugli 800 metri, mentre "solo" seconda è Clara sui
                    400. La Pellegrinelli corona l’inseguimento al titolo l’anno successivo, laureandosi finalmente
                    Campionessa italiana juniores sul giro di pista ad Ancona. Ancora, assieme a Luigina Tononi,
                    riconquista per la SAF il titolo italiano di Società di corsa campestre. Naturalmente, moltissimi
                    nomi nuovi. Tra il 1965 e il 1966, in mezzo ad altre 180 nuove tesserate, due atlete entrano a far
                    parte della famiglia delle "safine": Gloria Giappi e Silvana Zangirolami. In pochi mesi di attività
                    le due giovanissime raggiungono importanti traguardi: ancora una volta la SAF BOLZANO porta le sue
                    atlete in Nazionale juniores. Per la Zangirolami è l’inizio di una carriera costellata di grandi
                    successi.

                    Zangirolami, Giappi, Pellegrinelli e Bertoldo conquistano titoli, battono record, vestono la maglia
                    azzurra a più riprese.
                </p>
            </div>
            <div id="section3">
                <h2 class="paragraph">GLI ANNI 80' e 90' LA SAF AL MASCHILE</h2>
                <p class="paragraph">
                    Nel 1979, dopo oltre un quarto di secolo di vita e circa 2000 atlete tesserate, la SAF vive una
                    svolta storica, aprendo una sezione maschile. Il contesto sociale alle soglie degli anni ‘80 è ben
                    diverso rispetto a quello del 1953. Si pensi solo che all’epoca della fondazione della SAF i
                    calendari dell’atletica maschile e femminile prevedevano una rigida separazione degli appuntamenti
                    agonistici e risultava praticamente impossibile gestire comunemente atlete ed atleti.

                    La storia dell’atletica maschile targata SAF, pur non raggiungendo gli sfavillanti traguardi delle
                    colleghe atlete, può considerarsi comunque ricca di soddisfazioni, almeno a livello giovanile. Il
                    vivaio cresce di anno in anno: dai 22 tesserati del primo anno, si passa ad oltre 100 ragazzi nel
                    1984, per raggiungere l’apice nel 1989 quando gli atleti maschi tesserati sono 132. Serbatoio
                    principale di reclutamento sono le scuole medie "Ugo Foscolo", presso le quali il Direttore Tecnico
                    Franco Criscuolo è docente di educazione fisica. Silvano Librera, nel 1981, è il primo atleta
                    maschio a vincere un titolo regionale nel lancio del peso, ripetendosi nei due anni successivi
                    assieme ai compagni di squadra Vanni Casarotto nella marcia e Luca Vasarin nel salto in alto.

                    Non solo quantità, però. Nel giro di pochi anni la SAF riesce a costruire una squadra competitiva
                    che ben figura a livello giovanile, e nella seconda metà degli anni ‘80 la SAF targata uomini
                    raggiunge i più grandi successi. L’anno 1989 risulta poi straordinario. La squadra allievi, composta
                    principalmente dai ragazzi nati nel 1972, domina in campo regionale e raggiunge prestigiosi
                    traguardi anche a livello nazionale. Il bilancio parla di quattordici titoli regionali individuali,
                    la settima posizione nella finale A1 del Campionato italiano a squadre, il terzo posto ai Campionati
                    italiani di staffette della 4x400, che stabilisce anche il nuovo record regionale, il titolo
                    italiano di prove multiple individuale ed a squadre.

                    Trascinati da Paolo Valt (Campione italiano di Octathlon individuale ed a squadre, argento ai
                    Campionati italiani di lancio del giavellotto, bronzo nella 4x400), si mettono in evidenza Christian
                    Pedratscher (record regionale nei 400 metri, bronzo nella 4x400, Campione italiano di Octathlon a
                    squadre), Cristian Riccardi (componente sia della 4x400, sia della squadra di prove multiple),
                    Leonardo Colletti (asta e prove multiple), Alessio Fuganti (mezzofondista e componente della 4x400),
                    i lanciatori Peter Marinello e Mirco Flaim, Sergio Gobbo ed Alberto D’Avino nella marcia.

                    Paolo Valt, passato poi al G.S. Carabinieri Bologna sarà l’unico atleta maschio cresciuto nella SAF
                    a vestire la maglia azzurra della Nazionale ed a vincere il titolo di Campione italiano assoluto nel
                    lancio del giavellotto nel 2002.
                </p>
            </div>
            <div id="section4">
                <h2 class="paragraph">LA SAF DI OGGI E DI DOMANI</h2>
                <p class="paragraph">
                    Una nuova svolta a livello dirigenziale avviene nel 1999. Il Presidente, l’Ing. Lorenzo Püchler,
                    lascia la carica. Gli subentra Anna Lorenzini Paoli, che si insedia a capo di un Consiglio Direttivo
                    completamente rinnovato.

                    Come sempre è Franco Criscuolo a garantire la continuità nel ruolo di Direttore Tecnico. Accanto a
                    lui, quelli che erano i suoi atleti si dedicano ora alla cura delle giovani leve: Alessio Fuganti,
                    Stefano Sartori, Mirco Flaim e Luca Vasarin, assieme a Lia Püchler ritornata alla SAF dopo 10 anni,
                    coadiuvano il Prof. Criscuolo nella gestione tecnica. Con loro anche alcuni degli atleti dell’ultimo
                    decennio, Marco ed Emanuele Grimaldo, garantiscono al settore tecnico un nuovo slancio verso il
                    futuro. Segretaria rimane, come da moltissimi anni, Michela De Pillo, e collaborano attivamente
                    all’organizzazione della Società anche Alessandro Romania ed Enzo Zanotelli.

                    Il lavoro è impegnativo e non facile in un contesto in cui il movimento dell’atletica leggera
                    italiana non vive certo un periodo florido. La dirigenza decide di puntare sul settore giovanile per
                    cercare di creare un nuovo gruppo capace di cogliere quelle soddisfazioni che in passato non sono
                    mancate. I risultati, comunque, iniziano ad arrivare. Dal 2001 al 2004 la SAF BOLZANO vince, a
                    livello provinciale, il Gran Prix giovanile, manifestazione che somma i risultati stagionali di
                    tutti gli atleti ed atlete dai 9 ai 15 anni.

                    E i risultati arrivano, e sono straordinari, anche a livello nazionale: il gruppo delle atlete nate
                    negli anni 1991 e 1992 raggiunge nel 2008 il quinto posto ai Campionati Italiani di Società nella
                    categoria allieve e dopo molti anni una nostra atleta, Monica Lazzara, torna a vestire per quattro
                    volte la maglia della Nazionale giovanile, partecipando ai Campionati mondiali juniores nel 2010.

                    Anche il settore maschile è ricco di successi soprattutto grazie a Stefano Valente, capace di
                    riscrivere la storia del mezzofondo della SAF Bolzano migliorando innumerevoli volte i record
                    sociali di 800 e 1500 metri.

                    Non da ultimo, è certamente da considerare un ottimo risultato anche il continuo incremento dei
                    tesserati al settore giovanile: la strada per creare nuovamente un movimento articolato e
                    competitivo è quella giusta.

                    Dal punto di vista societario, infine, nel 2013 Anna Lorenzini Paoli lascia la carica di
                    Presidente,che viene assunta da Alessio Fuganti.
                </p>
            </div> 
        </div> !-->

        <div class="section information" id="info">
            <div>
                <h3>PARTITA IVA</h3>
                <p>80007240213</p>
            </div>
            <div>
                <h3>INDIRIZZO</h3>
                <p>Viale Giacomo Puccini 15/L/5</p>
            </div>
            <div>
                <h3>FIDAL</h3>
                <p><a
                        href="https://www.fidal.it/societa/SAF-BOLZANO-1953/BZ018">FIDAL&nbsp&nbsp&nbsp&nbsp/&nbsp&nbsp&nbsp&nbspSAF-BOLZANO-1953&nbsp&nbsp&nbsp&nbsp/&nbsp&nbsp&nbsp&nbspBZ018</a>
                </p>
            </div>
            <div class="email-box">
                <h3>E-MAIL</h3>
                <p>
                    <a href="mailto:info@safbolzano.it">info@safbolzano.it</a>
                    <span class="separator"> / </span>
                    <a href="mailto:BZ018@fidal.it">BZ018@fidal.it</a>
                </p>
            </div>
            <!--<div>
                <h3 class="rosa">DONA IL TUO 5x1000</h3>
                <p class="rosa">C.F. 80007240213</p>
            </div>!-->
        </div>
<?php get_footer(); ?>
