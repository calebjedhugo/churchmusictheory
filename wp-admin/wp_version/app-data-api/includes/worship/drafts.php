<?php
defined( 'ABSPATH' ) or die( 'No script kiddies please!');

class Drafts {
    public function register(){
        add_action('wp_ajax_get_drafts', array($this, 'get_drafts'));
        add_action('wp_ajax_save_draft', array($this, 'save_draft'));
    }
    
    public function get_drafts(){
        global $wpdb;
        $churchId = "(SELECT church from wp7h_user_church WHERE user_id = ".get_current_user_id().")";
        $sql = "SELECT lyrics, song_title, master_ref from wp7h_recordings
            WHERE user_id = ".get_current_user_id()." AND church = $churchId AND master_ref = id";
        $result = $wpdb->get_results($sql);
        echo json_encode($result);
        wp_die();
    }
    
    public function save_draft(){
        global $wpdb;
        include_once AD_ABSPATH . 'includes/worship/leadership.php';
        (new LeaderShip())->leaderOnly();
        $churchId = "(SELECT church from wp7h_user_church WHERE user_id = ".get_current_user_id().")";
        $masterRef = isset($_POST['masterRef']) ? $_POST['masterRef'] : 0;
        $songTitle = $_POST['songTitle'];
        $lyrics = $_POST['lyrics'];
    
        //No recording shouldn't stop anything.
        if($masterRef === 0 || $masterRef === '0'){
            include_once AD_ABSPATH . 'includes/worship/recordings.php';
            $masterRef = (new Recordings)->createRecordingEntry();
        }
        $wpdb->update('wp7h_recordings', array('lyrics'=>$lyrics,'song_title'=>$songTitle), array('id'=>$masterRef), array('%s', '%s'), array('%d'));
        echo json_encode($masterRef);
        wp_die();
    }
}
(new Drafts())->register();