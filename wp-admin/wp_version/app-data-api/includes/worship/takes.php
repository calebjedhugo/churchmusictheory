<?php
defined( 'ABSPATH' ) or die( 'No script kiddies please!');
class Takes {
    public function register(){
        add_action('wp_ajax_get_takes', array($this, 'get_takes'));
        add_action('wp_ajax_delete_take', array($this, 'delete_take'));
        add_action('wp_ajax_submit_take', array($this, 'submit_take'));
    }
    
    public function get_takes(){
        echo $this->getTakes();
        wp_die();
    }

    private function getTakes($masterRef = null){
        global $wpdb;
        $churchId = "(SELECT church from wp7h_user_church WHERE user_id = ".get_current_user_id().")";
        $masterRef = isset($_GET['masterRef']) ? $_GET['masterRef'] : $masterRef;
        $sql = $wpdb->prepare("SELECT id, IF(recording = '', FALSE, TRUE) as recording, latency FROM wp7h_recordings
            WHERE master_ref = %d AND user_id = ".get_current_user_id()." AND church = $churchId
            ORDER BY id ASC", array($masterRef));
        $result = $wpdb->get_results($sql);
        return json_encode($result);
    }

    public function delete_take(){
        global $wpdb;
        $id = $_POST['recordingId'];
    
        $sql = $wpdb->prepare("SELECT master_ref from wp7h_recordings where id = %d", array($id));
        $masterRef = $wpdb->get_results($sql)[0]->master_ref;
        
        $wpdb->delete('wp7h_recordings', array('user_id'=>get_current_user_id(), 'id'=>$id, 'submitted'=>0), array('%d','%d','%d'));
    
        echo $this->getTakes($masterRef);
        wp_die();
    }
    
    public function submit_take(){
        global $wpdb;
        $id = $_POST['recordingId'];
        $sql = $wpdb->prepare("SELECT master_ref from wp7h_recordings WHERE id = %d", array($id));
        $masterRef = $wpdb->get_results($sql)[0]->master_ref;
    
        $wpdb->update('wp7h_recordings', array('submitted'=>1), array('id'=>$id), array('%d'), array('%d'));
        
        $sql = $wpdb->prepare("DELETE FROM wp7h_recordings WHERE id != %d AND master_ref = %d AND user_id = ".get_current_user_id(), array($id, $masterRef));
        $wpdb->query($sql);
    
        $sql = "SELECT role FROM wp7h_user_church WHERE user_id = ".get_current_user_id();
        $role = $wpdb->get_results($sql)[0]->role;
        if($role === 'leader' || $role === 'musician' || $role === 'singer'){
            include_once AD_ABSPATH . 'includes/audio_util/audio_transform.php';
            return json_encode((new AudioTransform())->mixdown($id, $masterRef));
        } else {
            echo json_encode("success");
        }
        wp_die();
    }
}
(new Takes())->register();