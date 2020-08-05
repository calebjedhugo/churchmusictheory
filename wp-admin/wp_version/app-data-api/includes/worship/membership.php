<?php
defined( 'ABSPATH' ) or die( 'No script kiddies please!');

class Membership {
    public function register(){
        add_action('wp_ajax_chuch_data', array($this, 'chuch_data'));
        add_action('wp_ajax_chuch_names', array($this, 'chuch_names'));
        add_action('wp_ajax_church_members', array($this, 'church_members'));
        add_action('wp_ajax_join_church', array($this, 'join_church'));
        add_action('wp_ajax_leave_church', array($this, 'leave_church'));
    }
    
    private function getQuery(){
        global $wpdb;
        $sql = "SELECT alias as church, role FROM wp7h_user_church
            join wp7h_alias on wp7h_user_church.church = wp7h_alias.id WHERE user_id = " . get_current_user_id();
        return $wpdb->get_results($sql);
    }
    
    public function chuch_data(){
        echo json_encode($this->getQuery()[0]);
        wp_die();
    }
    
    public function chuch_names(){
        global $wpdb;
        $search = $_GET["search"];
        $leader = $_GET["leader"];
        $sql = $wpdb->prepare("SELECT alias as church, display_name as leader, wp7h_alias.id as id FROM wp7h_alias
          join wp7h_user_church on wp7h_user_church.church = wp7h_alias.id
          join wp7h_users on wp7h_user_church.user_id = wp7h_users.ID
          WHERE alias like %s AND display_name like %s AND role = 'leader'
          LIMIT 0 , 5;", (array("%$search%", "%$leader%")));
        $result = $wpdb->get_results($sql);
        echo json_encode($result);
        wp_die();
    }
    
    public function church_members(){
        echo $this->churchMembers();
        wp_die();
    }
    
    public function churchMembers(){
        global $wpdb;
        
        //Show email and user_id if leader
        $result = $wpdb->get_results("SELECT role from wp7h_user_church where user_id = ".get_current_user_id());
        
        //Get their member's data
        if($result[0]->role === 'leader'){
            $sql = "SELECT display_name, user_id, user_email, role ";
        } else {
            $sql = "SELECT display_name, role ";
        }
        
        $sql .= "FROM wp7h_user_church
        join wp7h_users on wp7h_users.ID = wp7h_user_church.user_id
        WHERE church = (SELECT church from wp7h_user_church where user_id = ".get_current_user_id().") AND user_id != ".get_current_user_id();
        
        $result = $wpdb->get_results($sql);
        return json_encode($result);
    }
    
    public function join_church(){
        global $wpdb;
        $id = $_POST["id"];
        $wpdb->insert('wp7h_user_church', array('user_id'=>get_current_user_id(), 'church'=>$id), array('%d', '%d'));
        echo json_encode($this->getQuery());
        wp_die();
    }
    
    public function leave_church(){
        global $wpdb;
        $wpdb->query("DELETE FROM wp7h_user_church WHERE user_id = ".get_current_user_id()." AND role != 'leader'");
        echo json_encode('success');
        wp_die();
    }
}

(new Membership())->register();