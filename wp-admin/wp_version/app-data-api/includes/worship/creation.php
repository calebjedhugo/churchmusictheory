<?php

defined( 'ABSPATH' ) or die( 'No script kiddies please!');

class Creation {
    public function register(){
        add_action('wp_ajax_start_church', array($this, 'start_church'));
        add_action('wp_ajax_delete_church', array($this, 'delete_church'));
    }
    
    public function start_church(){
        global $wpdb;
        $church = $_POST['church'];
        $result = $wpdb->insert('wp7h_alias', array('alias'=>$church, 'type'=>'church'), array('%s','%s'));
        $result = $wpdb->insert('wp7h_user_church', array('user_id'=>get_current_user_id(), 'church'=>$wpdb->insert_id, 'role'=>'leader'), array('%d','%d','%s'));
        echo json_encode(Array(church=>$church, role=>'leader'));
        wp_die();
    }
    
    public function delete_church(){
        global $wpdb;
        $churchIdSubSelect = "(SELECT church from wp7h_user_church WHERE user_id = ".get_current_user_id().")";
        $sql = "SELECT count(user_id) as count FROM wp7h_user_church WHERE church = $churchIdSubSelect";
        $result = $wpdb->get_results($sql)[0]->count;
        if($result === '1'){
            $result = $wpdb->query("DELETE FROM wp7h_alias WHERE id = $churchIdSubSelect");
            $result = $wpdb->query("DELETE FROM wp7h_user_church WHERE user_id = ".get_current_user_id()." AND role = 'leader'");
            $res = 'success';
        } else {
            http_response_code(400);
            $res = "Other users were found in your church. Deletion failed.";
        }
        echo $res;
        wp_die();
    }
}
(new Creation())->register();