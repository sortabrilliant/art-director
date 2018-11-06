<?php

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Enqueue Gutenberg block assets for backend editor.
 *
 * @since 1.0.0
 */
function sbb_artdirector_editor_assets() {
	wp_enqueue_script(
		'sbb_artdirector-block-js',
		plugins_url( '/dist/blocks.build.js', dirname( __FILE__ ) ),
		array( 'wp-i18n', 'wp-element', 'wp-editor', 'wp-edit-post' ),
		filemtime( plugin_dir_path( __DIR__ ) . 'dist/blocks.build.js' ),
		true // load in the footer
	);

	wp_enqueue_style(
		'sbb_artdirector-block-editor-css',
		plugins_url( 'dist/blocks.editor.build.css', dirname( __FILE__ ) ),
		array( 'wp-edit-blocks' ),
		filemtime( plugin_dir_path( __DIR__ ) . 'dist/blocks.editor.build.css' )
	);
}
add_action( 'enqueue_block_editor_assets', 'sbb_artdirector_editor_assets' );

/**
 * Register CodePad Meta Field with the REST API.
 */
function sbb_artdirector_register_meta() {
	register_meta(
		'post',
		'_sbb_artdirector_css_field',
		[
			'type'         => 'string',
			'single'       => true,
			'show_in_rest' => true,
		]
	);
}
add_action( 'init', 'sbb_artdirector_register_meta' );

/**
 * Register CodePad Metabox to REST API.
 */
function sbb_artdirector_api_posts_meta_field() {
	register_rest_route(
		'sortabrilliant/v1',
		'/update-meta/(?P<id>\d+)',
		[
			'methods'  => 'POST',
			'callback' => 'sbb_artdirector_update_callback',
			'args'     => [
				'id' => [ 'sanitize_callback' => 'absint' ],
			],
		]
	);
}
add_action( 'rest_api_init', 'sbb_artdirector_api_posts_meta_field' );

/**
 * CodePad REST API Callback.
 */
function sbb_artdirector_update_callback( $data ) {
	return update_post_meta( $data['id'], $data['key'], $data['value'] );
}

function sbb_artdirector_output_code() {
	if ( ! is_singular() ) {
		return;
	}

	$css = get_post_meta( get_queried_object_id(), '_sbb_artdirector_css_field', true );

	if ( empty( $css ) ) {
		return;
	}

	echo '<style type="text/css">/* HERE */' . $css . '</style>'; // phpcs:ignore
}
add_action( 'wp_footer', 'sbb_artdirector_output_code' );
