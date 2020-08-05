<?
$request = $_SERVER['REQUEST_URI'];

switch ($request) {
    case '/' :
        require './publichtml/index.html';
        break;
}
?>
