<?php

defined( 'ABSPATH' ) or die( 'No script kiddies please!');

class AddData {
    public function __construct(){
        add_action('wp_ajax_app_data', array($this, 'app_data'));
        add_action('wp_ajax_nopriv_app_data', array($this, 'app_data'));
    }
    
    public function app_data(){
        $user_id = get_current_user_id();
        if($user_id === 0){
            echo 'login required';
            wp_die();
        }
        
        global $wpdb;
        $method = $_SERVER['REQUEST_METHOD'];
        
        switch($method){
            case 'GET':
                $userdata = $wpdb->get_results('SELECT id, type, value, record from wp7h_user_knowledge where user_id = ' . $user_id);
                echo json_encode($userdata);
                break;
            case 'POST':
                $knowledge = $_POST['knowledge'];
                $patch = $_POST['patchHack'];
                $returnArray = array();
                if(!is_array($knowledge)){
                    echo 'knowledge is required';
                    wp_die();
                }
                foreach($knowledge as $item){
                    if($patch){
                        $wpdb->update('wp7h_user_knowledge', array('record'=>$item['record']), array('id'=>$item['id']));
                    } else {
                        $item[user_id] = $user_id;
                        $wpdb->insert('wp7h_user_knowledge', $item);
                        $returnArray[$item['value']] = $wpdb->insert_id;
                    }
                }
                echo json_encode($returnArray);
                break;
        }
        
        wp_die();
    }
}
new AddData();