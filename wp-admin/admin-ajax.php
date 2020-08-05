<?php

// header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Credentials: true");

// Create connection
include_once('config.php');
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

include_once('audioTransform.php');

$getQuery = "SELECT alias as church, role FROM wp7h_user_church
  join wp7h_alias on wp7h_user_church.church = wp7h_alias.id WHERE user_id = " . get_current_user_id();

switch(isset($_POST["action"]) ? $_POST["action"] : $_GET["action"]){
  case "chuch_data":
    $sql = $getQuery;
    $result = $conn->query($sql)->fetch_assoc();
    echo json_encode($result);
    break;
  case "chuch_names":
    $search = $_GET["search"];
    $leader = $_GET["leader"];
    $sql = "SELECT alias as church, display_name as leader, wp7h_alias.id as id FROM wp7h_alias
      join wp7h_user_church on wp7h_user_church.church = wp7h_alias.id
      join wp7h_users on wp7h_user_church.user_id = wp7h_users.ID
      WHERE alias like '%$search%' AND display_name like '%$leader%' AND role = 'leader'
      LIMIT 0 , 2;";
    $result = $conn->query($sql);
    if($conn->error){
      $res = $conn->error;
    } else {
      $res = $result->fetch_all(MYSQLI_ASSOC);
    }
    echo json_encode($res);
    break;
  case "join_church":
    $userId = get_current_user_id();
    $id = $_POST["id"];
    $sql = "INSERT INTO wp7h_user_church (user_id, church)
      VALUES ($userId, $id)";
    $result = $conn->query($sql);
    if($conn->error){
      http_response_code(500);
      $res = $conn->error;
    } else {
      $sql = $getQuery;
      $result = $conn->query($sql);
      if($conn->error){
        $res = $conn->error;
      } else {
        $res = $result->fetch_assoc();
      }
    }
    echo json_encode($res);
    break;
  case "leave_church":
    $userId = get_current_user_id();
    $sql = "DELETE FROM wp7h_user_church WHERE user_id = $userId AND role != 'leader';";
    $sql .= "DELETE FROM wp7h_recording WHERE user_id = $userId;";
    $result = $conn->multi_query($sql);
    if($conn->error){
      http_response_code(500);
      $res = $conn->error;
    } else {
      $res = 'success';
    }
    echo json_encode($res);
    break;
  case "church_members":
    echo churchMembers();
    break;
  case "transfer_leadership":
    $userId = get_current_user_id();
    leaderOnly();

    $transferToId = $_POST['id'];
    $sql = "UPDATE wp7h_user_church SET role = 'musician' where user_id = $userId;
      UPDATE wp7h_user_church SET role = 'leader' where user_id = $transferToId;";
    $result = $conn->multi_query($sql);
    if($conn->error){
      http_response_code(500);
      $res = $conn->error;
    } else {
      $res = Array(role=>'musician');
    }
    echo json_encode($res);
    break;
  case "start_church":
    $userId = get_current_user_id();
    $church = $_POST['church'];
    $sql = "INSERT INTO wp7h_alias (alias, type) VALUES ('$church', 'church')";
    $result = $conn->query($sql);
    $churchId = $conn->insert_id;
    $sql = "INSERT INTO wp7h_user_church (user_id, church, role) VALUES ($userId, $churchId, 'leader')";
    $result = $conn->query($sql);
    if($conn->error){
      http_response_code(500);
      $res = $conn->error;
    } else {
      $res = Array(church=>$church, role=>'leader');
    }
    echo json_encode($res);
    break;
  case "delete_church":
    $userId = get_current_user_id();
    $churchIdSubSelect = "(SELECT church from wp7h_user_church WHERE user_id = $userId)";
    $sql = "SELECT count(user_id) as count FROM wp7h_user_church
      WHERE church = $churchIdSubSelect";
    $result = $conn->query($sql)->fetch_all(MYSQLI_ASSOC)[0]['count'];
    if($result === '1'){
      $sql = "DELETE FROM wp7h_alias WHERE id = $churchIdSubSelect;
        DELETE FROM wp7h_user_church WHERE user_id = $userId AND role = 'leader'";
      $result = $conn->multi_query($sql);
      if($conn->error){
        http_response_code(500);
        $res = $conn->error;
      } else {
        $res = 'success';
      }
    } else {
      http_response_code(400);
      $res = "Other users were found in your church. Deletion failed.";
    }
    echo json_encode($res);
    break;
  case "publish_song":
    $userId = get_current_user_id();
    $sql = "SELECT role from wp7h_user_church where user_id = $userId";
    $result = $conn->query($sql)->fetch_all(MYSQLI_ASSOC);
    if($result[0]['role'] !== 'leader'){
      http_response_code(403);
      "You are not authorized to add a new song.";
      break;
    }

    $recordingId = $_POST['recordingId'];
    $masterRef = $_POST['masterRef'];
    $lyrics = $_POST['lyrics'];
    $songTitle = $_POST['songTitle'];

    //update master entry with correct take.
    $sql = "UPDATE wp7h_recordings
      SET user_id = 0,
      master_ref = 0,
      lyrics = '$lyrics',
      song_title = '$songTitle'
      WHERE id = $recordingId";

    $conn->query($sql);
    if($conn->error){
      http_response_code(500);
      echo $conn->error;
      break;
    }

    //delete all other takes.
    $sql = "DELETE FROM wp7h_recordings WHERE master_ref = $masterRef";

    $conn->query($sql);
    if($conn->error){
      http_response_code(500);
      echo $conn->error;
      break;
    }

    echo $res;
    break;
  case "append_recording":
    $recording = $_POST['recording'];
    $recordingId = $_POST['recordingId'];
    foreach($recording as $record){
      $recordingConcatString .= ", FROM_BASE64('$record')";
    }
    $sql = "UPDATE wp7h_recordings SET recording = CONCAT(recording $recordingConcatString) where id = $recordingId";

    $conn->query($sql);
    if($conn->error){
      http_response_code(500);
      echo $conn->error;
      break;
    } else {
      $res = 'success';
    }
    echo json_encode($res);
    break;
  case "create_recording_entry":
    echo createRecordingEntry();
    break;
  case "songs":
    $userId = get_current_user_id();
    $churchId = "(SELECT church from wp7h_user_church WHERE user_id = $userId)";
    $sql = "SELECT id, song_title, lyrics from wp7h_recordings WHERE user_id = 0 and church = $churchId";
    $result = $conn->query($sql);
    if($conn->error){
      http_response_code(500);
      $res = $conn->error;
    } else {
      $res = $result->fetch_all(MYSQLI_ASSOC);
    }
    echo json_encode($res);
    break;
  case "song_record": //Have you contributed already?
    $userId = get_current_user_id();
    $recordingId = $_GET['recordingId'];
    $sql = "SELECT count(id) as count FROM wp7h_recordings
      where user_id = $userId AND master_ref = $recordingId AND submitted = 1";
    $result = $conn->query($sql);
    if($conn->error){
      http_response_code(500);
      $res = $conn->error;
    } else {
      $res = $result->fetch_all(MYSQLI_ASSOC)[0]['count'];
    }
    echo json_encode($res);
    break;
  case "get_recording":
    $id = $_GET['id'];
    $sql = "SELECT TO_BASE64(mp3) as recording from wp7h_recordings WHERE id = $id";
    $result = $conn->query($sql);
    if($conn->error){
      http_response_code(500);
      $res = $conn->error;
    } else {
      $res = $result->fetch_all(MYSQLI_ASSOC)[0]['recording'];
    }
    echo json_encode($res);
    break;
  case "get_takes":
    echo getTakes();
    break;
  case "get_drafts":
    $userId = get_current_user_id();
    $churchId = "(SELECT church from wp7h_user_church WHERE user_id = $userId)";
    $sql = "SELECT lyrics, song_title, master_ref from wp7h_recordings
      WHERE user_id = $userId AND church = $churchId AND master_ref = id";
    $result = $conn->query($sql);
    if($conn->error){
      http_response_code(500);
      $res = $conn->error;
    } else {
      $res = $result->fetch_all(MYSQLI_ASSOC);
    }
    echo json_encode($res);
    break;
  case "save_draft":
    leaderOnly();
    $userId = get_current_user_id();
    $churchId = "(SELECT church from wp7h_user_church WHERE user_id = $userId)";
    $masterRef = isset($_POST['masterRef']) ? $_POST['masterRef'] : 0;
    $songTitle = $_POST['songTitle'];
    $lyrics = $_POST['lyrics'];

    //No recording shouldn't stop anything.
    if($masterRef === 0 || $masterRef === '0'){
      $masterRef = createRecordingEntry();
    }
    $sql = "UPDATE wp7h_recordings SET lyrics = '$lyrics', song_title = '$songTitle' where id = $masterRef";
    $result = $conn->query($sql);
    if($conn->error){
      http_response_code(500);
      $res = $conn->error;
    } else {
      $res = $masterRef;
    }
    echo json_encode($res);
    break;
  case "delete_song":
    $userId = get_current_user_id();
    $sql = "SELECT role from wp7h_user_church where user_id = $userId";
    $result = $conn->query($sql)->fetch_all(MYSQLI_ASSOC);
    if($result[0]['role'] !== 'leader'){
      http_response_code(403);
      "You are not authorized to delete a new song.";
      break;
    }

    $recordingId = $_POST['recordingId'];

    $sql = "DELETE FROM wp7h_recordings where id = $recordingId OR master_ref = $recordingId";
    $result = $conn->query($sql);
    if($conn->error){
      http_response_code(500);
      echo $conn->error;
      break;
    }

    echo json_encode('success');
    break;
  case "delete_take":
    $userId = get_current_user_id();
    $id = $_POST['recordingId'];

    $sql = "SELECT master_ref from wp7h_recordings where id = $id";
    $masterRef = $conn->query($sql)->fetch_all(MYSQLI_ASSOC)[0]['master_ref'];
    if($conn->error){
      http_response_code(500);
      echo $conn->error;
      break;
    }

    $sql = "DELETE FROM wp7h_recordings where user_id = $userId AND id = $id AND submitted = 0";

    $conn->query($sql);
    if($conn->error){
      http_response_code(500);
      echo $conn->error;
      break;
    }

    echo getTakes($masterRef);
    break;
  case "submit_take":
    $id = $_POST['recordingId'];
    $userId = get_current_user_id();
    $sql = "SELECT master_ref from wp7h_recordings WHERE id = $id";
    $masterRef = $conn->query($sql)->fetch_all(MYSQLI_ASSOC)[0]['master_ref'];

    $sql = "UPDATE wp7h_recordings SET submitted = 1 where id = $id";
    $conn->query($sql);
    if($conn->error){
      http_response_code(500);
      echo $conn->error;
      break;
    }

    $sql = "DELETE FROM wp7h_recordings WHERE id != $id AND master_ref = $masterRef AND user_id = $userId";
    $conn->query($sql);
    if($conn->error){
      http_response_code(500);
      echo $conn->error;
      break;
    }

    $sql = "SELECT role FROM wp7h_user_church WHERE user_id = $userId";
    $role = $conn->query($sql)->fetch_all(MYSQLI_ASSOC)[0]['role'];
    if($role === 'leader' || $role === 'musician' || $role === 'singer'){
      echo json_encode((new AudioTransform())->mixdown($id));
    } else {
      echo json_encode("success");
    }
    break;
  case "change_role":
    leaderOnly();
    $userId = get_current_user_id();
    $role = $_POST['role'];
    $idToChange = $_POST['id'];

    if($userId === $idToChange){
      http_response_code(400);
      echo "You cannot change your own role";
      exit();
    }

    if($role === 'leader'){
      http_response_code(400);
      echo "To select a new leader, the leader much user the 'relinquish leadership' button.";
      exit();
    }

    $sql = "UPDATE wp7h_user_church SET role = '$role' WHERE user_id = $idToChange";
    $conn->query($sql);
    if($conn->error){
      http_response_code(500);
      echo $conn->error;
      exit();
    }
    echo churchMembers();
    break;
  case "pending_submissions":
    leaderOnly();
    $userId = get_current_user_id();
    $churchId = "(SELECT church from wp7h_user_church WHERE user_id = $userId)";
    $sql = "SELECT
      wp7h_recordings.id as recording_id,
      wp7h_users.ID as user_id,
      wp7h_users.display_name as display_name,
      wp7h_user_church.role as role
      FROM wp7h_recordings
        join wp7h_user_church on wp7h_recordings.user_id = wp7h_user_church.user_id
        join wp7h_users on wp7h_recordings.user_id = wp7h_users.ID
      where submitted = 1 AND mixed = 0 AND wp7h_recordings.church = $churchId";

    $result = $conn->query($sql);
    if($conn->error){
      http_response_code(500);
      echo $conn->error;
      exit();
    } else {
      $res = $result->fetch_all(MYSQLI_ASSOC);
    }
    echo json_encode($res);
    break;
  case "approve_recording":
    leaderOnly();
    echo json_encode((new AudioTransform())->mixdown($_POST['id']));
    break;
  case "latency":
    $latency = $_POST['latency'];
    $id = $_POST['id'];
    $sql = "UPDATE wp7h_recordings SET latency = $latency WHERE id = $id";
    $result = $conn->query($sql);
    if($conn->error){
      http_response_code(500);
      echo $conn->error;
      exit();
    } else {
      echo json_encode('success');
    }
    break;
  case "make_mp3":
    echo json_encode('OK');
}

function get_current_user_id(){
  return 1;
}

function createRecordingEntry(){
  global $conn;
  $userId = get_current_user_id();
  $churchId = "(SELECT church from wp7h_user_church WHERE user_id = $userId)";
  $masterRef = isset($_POST['masterRef']) ? $_POST['masterRef'] : 0;
  $sql = "INSERT INTO wp7h_recordings (church, user_id, master_ref) VALUES ($churchId, $userId, $masterRef)";
  $conn->query($sql);

  if($conn->error){
    http_response_code(500);
    $res = $conn->error;
  } else {
    $res = $conn->insert_id;
  }

  if($masterRef === 0 || $masterRef === '0'){
    $masterRef = $conn->insert_id;
    $sql = "UPDATE wp7h_recordings SET master_ref = $masterRef where id = $masterRef";
    $conn->query($sql);
  }
  return $res;
}

function getTakes($masterRef = null){
  global $conn;
  $userId = get_current_user_id();
  $churchId = "(SELECT church from wp7h_user_church WHERE user_id = $userId)";
  $masterRef = isset($_GET['masterRef']) ? $_GET['masterRef'] : $masterRef;
  $sql = "SELECT id, IF(recording = '', FALSE, TRUE) as recording, latency FROM wp7h_recordings
    WHERE master_ref = $masterRef AND user_id = $userId AND church = $churchId
    ORDER BY id ASC";
  $result = $conn->query($sql);
  if($conn->error){
    http_response_code(500);
    $res = $conn->error;
  } else {
    $res = $result->fetch_all(MYSQLI_ASSOC);
  }
  return json_encode($res);
}

function leaderOnly(){
  global $conn;
  $userId = get_current_user_id();
  $sql = "SELECT role from wp7h_user_church where user_id = $userId";
  $result = $conn->query($sql)->fetch_all(MYSQLI_ASSOC)[0]['role'];
  //Get their member's data
  if($result !== 'leader'){
    http_response_code(403);
    $action = isset($_POST["action"]) ? $_POST["action"] : $_GET["action"] ;
    echo json_encode("Only leaders are allowed to $action.");
    exit();
  }
}

function churchMembers(){
  global $conn;
  $userId = get_current_user_id();
  //Verify role
  $sql = "SELECT role from wp7h_user_church where user_id = $userId";
  $result = $conn->query($sql)->fetch_all(MYSQLI_ASSOC);
  //Get their member's data
  if($result[0]['role'] === 'leader'){
    $sql = "SELECT display_name, user_id, user_email, role ";
  } else {
    $sql = "SELECT display_name, role ";
  }

  $sql .= "FROM wp7h_user_church
  join wp7h_users on wp7h_users.ID = wp7h_user_church.user_id
  WHERE church = (SELECT church from wp7h_user_church where user_id = $userId) AND user_id != $userId";

  $result = $conn->query($sql);
  if($conn->error){
    http_response_code(500);
    $res = $conn->error;
  } else {
    $res = $result->fetch_all(MYSQLI_ASSOC);
  }
  echo json_encode($res);
}
?>
