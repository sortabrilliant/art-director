<?php
/**
 * Plugin Name: Art Director
 * Plugin URI: https://sortabrilliant.com/artdirector/
 * Description: Add page specific CSS to turn your content from blah into ahhh.
 * Author: sorta brilliant
 * Author URI: https://sortabrilliant.com
 * Version: 1.0.0
 * License: GPL2+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 *
 * @package SB
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Block Initializer.
 */
require_once plugin_dir_path( __FILE__ ) . 'src/init.php';

/**
 * GitHub Plugin Updater.
 */
function sbb_artdirector_github_plugin_updater_test_init() {
	include_once 'updater.php';

	if ( is_admin() ) {
		$config = array(
			'slug'               => plugin_basename( __FILE__ ),
			'proper_folder_name' => 'sbb-art-director',
			'api_url'            => 'https://api.github.com/repos/sortabrilliant/art-director',
			'raw_url'            => 'https://raw.github.com/sortabrilliant/art-director/master',
			'github_url'         => 'https://github.com/sortabrilliant/art-director',
			'zip_url'            => 'https://github.com/sortabrilliant/art-director/archive/master.zip',
			'requires'           => '4.9.8',
			'tested'             => '4.9.8',
			'readme'             => 'README.md',
		);

		new WP_GitHub_Updater( $config );
	}
}
add_action( 'init', 'sbb_artdirector_github_plugin_updater_test_init' );
