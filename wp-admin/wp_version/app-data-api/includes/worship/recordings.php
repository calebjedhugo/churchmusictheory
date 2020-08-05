<?php
defined( 'ABSPATH' ) or die( 'No script kiddies please!');

class Recordings {
    public function register(){
        add_action('wp_ajax_append_recording', array($this, 'append_recording'));
        add_action('wp_ajax_create_recording_entry', array($this, 'create_recording_entry'));
        add_action('wp_ajax_get_recording', array($this, 'get_recording'));
        add_action('wp_ajax_latency', array($this, 'latency'));
        
        // Create connection
        include_once AD_ABSPATH . 'recording_config.php';
        $this->recording_conn = new mysqli($servername, $username, $password, $dbname);
        // Check connection
        if ($this->recording_conn->connect_error) {
            die("Connection failed: " . $this->recording_conn->connect_error);
        }
    }
    
    public function append_recording(){
        global $wpdb;
        $recording = $_POST['recording'];
        $recordingId = $_POST['recordingId'];
        foreach($recording as $record){
          $recordingConcatString .= $wpdb->prepare(", FROM_BASE64(%s)", array($record));
        }
        $sql = "UPDATE wp7h_recordings SET recording = CONCAT(recording $recordingConcatString) " . $wpdb->prepare("where id = %d", array($recordingId));
        
        //wpdb doesn't work for this query, so we do it ourselves.
        $this->recording_conn->query($sql);
        echo json_encode('success');
        wp_die();
    }
    
    public function create_recording_entry(){
        echo $this->createRecordingEntry();
        wp_die();
    }
    
    public function get_recording(){
        global $wpdb;
        $id = $_GET['id'];
        $sql = $wpdb->prepare("SELECT TO_BASE64(mp3) as recording from wp7h_recordings WHERE id = %d", array($id));
        $result = $wpdb->get_results($sql)[0]->recording;
        echo json_encode($result);
        wp_die();
    }
    
    public function latency(){
        global $wpdb;
        $latency = $_POST['latency'];
        $id = $_POST['id'];
        $wpdb->update('wp7h_recordings', array('latency'=>$latency), array('id'=>$id), array('%d'), array('%d'));
        echo json_encode('success');
        wp_die();
    }
    
    public function createRecordingEntry(){
        global $wpdb;
        $churchId = "(SELECT church from wp7h_user_church WHERE user_id = ".get_current_user_id().")";
        $masterRef = isset($_POST['masterRef']) ? $_POST['masterRef'] : 0;
        $sql = $wpdb->prepare("INSERT INTO wp7h_recordings (church, user_id, master_ref) VALUES ($churchId, ".get_current_user_id().", %d)", array($masterRef));
        $wpdb->query($sql);
        $res = $wpdb->insert_id;
    
        if($masterRef === 0 || $masterRef === '0'){
            $masterRef = $res;
            $wpdb->update('wp7h_recordings', array('master_ref'=>$res), array('id'=>$res), array('%d'), array('%d'));
        }
        return $res;
    }
}
    
(new Recordings())->register();