<?php
/*
Plugin Name: App Data API
Description: Manages ChurchMusicTheory.com app data
Author: Caleb Hugo
*/

defined( 'ABSPATH' ) or die( 'No script kiddies please!');

if (!class_exists("AppData")) {
    class AppData {
        public function __construct() {
        	$this->define_constants();
        	$this->includes();
        }
        
        private function define_constants() {
			$this->define( 'AD_DS', DIRECTORY_SEPARATOR );
			$this->define( 'AD_PLUGIN_FILE', __FILE__ );
			$this->define( 'AD_ABSPATH', dirname( __FILE__ ) . AD_DS );
		}
		
		private function define( $name, $value ) {
			if ( ! defined( $name ) ) {
				define( $name, $value );
			}
		}
		
		private function includes() {
			include_once AD_ABSPATH . 'includes/theory/knowledge.php';
			include_once AD_ABSPATH . 'includes/worship/creation.php';
			include_once AD_ABSPATH . 'includes/worship/drafts.php';
			include_once AD_ABSPATH . 'includes/worship/leadership.php';
			include_once AD_ABSPATH . 'includes/worship/membership.php';
			include_once AD_ABSPATH . 'includes/worship/recordings.php';
			include_once AD_ABSPATH . 'includes/worship/song.php';
			include_once AD_ABSPATH . 'includes/worship/takes.php';
			include_once AD_ABSPATH . 'includes/audio_util/audio_transform.php';
		}
    }
}

if (class_exists("AppData")) {
  $appData = new AppData();
}

//Do not show admin bar on homepage (the app itself)
if($_SERVER['REQUEST_URI'] === "/"){
    add_filter('show_admin_bar', '__return_false');
}
?>