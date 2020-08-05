<?php

include_once('admin-ajax.php');

class AudioTransform{
  public function createMp3($id){

  }

  public function mixdown($id){
    global $conn;
    $sql = "UPDATE wp7h_recordings SET mixed = 1 where id = $id AND submitted = 1";
    $conn->query($sql);
    if($conn->error){
      http_response_code(500);
      echo $conn->error;
    }
    return "mixed successfully";
  }
}
?>
