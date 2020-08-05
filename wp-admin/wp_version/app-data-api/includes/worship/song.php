<?php
defined( 'ABSPATH' ) or die( 'No script kiddies please!');
class Song {
    public function register(){
        add_action('wp_ajax_publish_song', array($this, 'publish_song'));
        add_action('wp_ajax_songs', array($this, 'songs'));
        add_action('wp_ajax_song_record', array($this, 'song_record'));
        add_action('wp_ajax_delete_song', array($this, 'delete_song'));
    }
    
    public function publish_song(){
        global $wpdb;
        include_once AD_ABSPATH . 'includes/worship/leadership.php';
        (new Leadership)->leaderOnly();
    
        $recordingId = $_POST['recordingId'];
        $masterRef = $_POST['masterRef'];
        $lyrics = $_POST['lyrics'];
        $songTitle = $_POST['songTitle'];
    
        //update master entry with correct take.
        $wpdb->update(
            'wp7h_recordings',
            array('user_id'=>0, 'master_ref'=>0, 'lyrics'=>$lyrics, 'song_title'=>$songTitle),
            array('id'=>$recordingId),
            array('%d', '%d', '%s', '%s'),
            array('%d')
        );
    
        //delete all other takes.
        $wpdb->delete('wp7h_recordings', array('master_ref'=>$masterRef), array('%d'));
    
        echo json_encode('success');
        wp_die();
    }
    
    public function songs(){
        global $wpdb;
        $churchId = "(SELECT church from wp7h_user_church WHERE user_id = ".get_current_user_id().")";
        $sql = "SELECT id, song_title, lyrics from wp7h_recordings WHERE user_id = 0 and church = $churchId";
        $result = $wpdb->get_results($sql);
        echo json_encode($result);
        wp_die();
    }
    
    public function song_record(){ //Have you contributed already?
        global $wpdb;
        $recordingId = $_GET['recordingId'];
        $sql = $wpdb->prepare("SELECT count(id) as count FROM wp7h_recordings
            where user_id = ".get_current_user_id()." AND master_ref = %d AND submitted = 1", array($recordingId));
        $result = $wpdb->get_results($sql)[0]->count;
        echo json_encode($result);
        wp_die();
    }
    
    public function delete_song(){
        global $wpdb;
        include_once AD_ABSPATH . 'includes/worship/leadership.php';
        (new Leadership())->leaderOnly();
    
        $recordingId = $_POST['recordingId'];
    
        $sql = $wpdb->prepare("DELETE FROM wp7h_recordings where id = %d OR master_ref = %d", array($recordingId, $recordingId));
        $wpdb->query($sql);
    
        echo json_encode('success');
        wp_die();
    }
}
(new Song())->register();