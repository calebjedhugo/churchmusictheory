<?php
defined( 'ABSPATH' ) or die( 'No script kiddies please!');
class Leadership{
    
    public function register(){
        add_action('wp_ajax_transfer_leadership', array($this, 'transfer_leadership'));
        add_action('wp_ajax_change_role', array($this, 'change_role'));
        add_action('wp_ajax_pending_submissions', array($this, 'pending_submissions'));
        add_action('wp_ajax_approve_recording', array($this, 'approve_recording'));
    }
    
    public function transfer_leadership(){
        global $wpdb;
        $this->leaderOnly();
        $transferToId = $_POST['id'];
        $wpdb->update('wp7h_user_church', array('role'=>'musician'), array('user_id'=>get_current_user_id()), array('%s'), array('%d'));
        $wpdb->update('wp7h_user_church', array('role'=>'leader'), array('user_id'=>$transferToId), array('%s'), array('%d'));
        echo json_encode(array(role=>'musician'));
        wp_die();
    }
    
    public function change_role(){
        global $wpdb;
        $this->leaderOnly();
        $role = $_POST['role'];
        $idToChange = $_POST['id'];
    
        if(get_current_user_id() === $idToChange){
          http_response_code(400);
          echo "You cannot change your own role";
          wp_die();
        }
    
        if($role === 'leader'){
          http_response_code(400);
          echo "To select a new leader, the leader much user the 'relinquish leadership' button.";
          wp_die();
        };
        
        $wpdb->update('wp7h_user_church', array('role'=>$role), array('user_id'=>$idToChange), array('%s'), array('%d'));
        include_once AD_ABSPATH . 'includes/worship/membership.php';
        echo (new Membership())->churchMembers();
        wp_die();
    }

    public function pending_submissions(){
        global $wpdb;
        $this->leaderOnly();
        $churchId = "(SELECT church from wp7h_user_church WHERE user_id = ".get_current_user_id().")";
        $sql = "SELECT
            wp7h_recordings.id as recording_id,
            wp7h_users.ID as user_id,
            wp7h_users.display_name as display_name,
            wp7h_user_church.role as role
            FROM wp7h_recordings
                join wp7h_user_church on wp7h_recordings.user_id = wp7h_user_church.user_id
                join wp7h_users on wp7h_recordings.user_id = wp7h_users.ID
            where submitted = 1 AND mixed = 0 AND wp7h_recordings.church = $churchId";
    
        $result = $wpdb->get_results($sql);
        echo json_encode($result);
        wp_die();
    }
  
    public function approve_recording(){
        global $wpdb;
        $this->leaderOnly();
        $id = $_POST['id'];
        $sql = $wpdb->prepare("SELECT master_ref from wp7h_recordings WHERE id = %d", array($id));
        $masterRef = $wpdb->get_results($sql)[0]->master_ref;
        
        include_once AD_ABSPATH . 'includes/audio_util/audio_transform.php';
        echo json_encode((new AudioTransform())->mixdown($id, $masterRef));
        wp_die();
    }
  
    public function leaderOnly(){
        global $wpdb;
        $sql = "SELECT role from wp7h_user_church where user_id = ".get_current_user_id();
        $result = $wpdb->get_results($sql)[0]->role;
        
        if($result !== 'leader'){
            http_response_code(403);
            $action = isset($_POST["action"]) ? $_POST["action"] : $_GET["action"] ;
            echo json_encode("Only leaders are allowed to $action.");
            wp_die();
        }
    }
}

(new Leadership())->register();