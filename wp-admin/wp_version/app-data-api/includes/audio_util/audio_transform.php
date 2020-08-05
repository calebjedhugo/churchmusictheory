<?php
class AudioTransform {
    public function register(){
        add_action('wp_ajax_make_mp3', array($this, 'make_mp3'));
    }
    
    public function make_mp3(){
        global $wpdb;
        $recordingId = $_POST['recordingId'];
        
        //Save pcm data to disk
        $sql = $wpdb->prepare("SELECT recording from wp7h_recordings WHERE id = %d", array($recordingId));
        $pcmData = $wpdb->get_results($sql)[0]->recording;
        $pcmPath = AD_ABSPATH . "workspace/mp3_build/$recordingId.pcm";
        file_put_contents($pcmPath, $pcmData);
        
        //convert to .mp3
        $mp3Path = AD_ABSPATH . "workspace/mp3_build/$recordingId.mp3";
        shell_exec("ffmpeg -y -f f32le -ar 44100 -ac 1 -i $pcmPath -ar 44100 -ac 1 $mp3Path");
        
        //save to database
        $mp3handle = fopen($mp3Path, 'r');
        $mp3Data = fread($mp3handle, filesize($mp3Path));
        $wpdb->update('wp7h_recordings', array('mp3'=>$mp3Data), array('id'=>$recordingId));
        
        //cleanup
        fclose($mp3handle);
        unlink($mp3Path);
        unlink($pcmPath);
        
        echo json_encode("success");
        wp_die();
    }

    public function mixdown($id, $masterRef){
        global $wpdb;
        $sql = $wpdb->prepare("SELECT recording, latency, id from wp7h_recordings WHERE id = %d OR
            (master_ref = $masterRef AND mixed = 1) OR id = $masterRef", array($id));
        $recordings = $wpdb->get_results($sql);
        
        $mixdownCommand = "ffmpeg -y ";
        foreach($recordings as $recording){
            $pcmData = $recording->recording;
            $recordingId = $recording->id;
            $latency = $recording->latency / 1000;
            $pcmPath = AD_ABSPATH . "workspace/mixdown/$recordingId.pcm";
            file_put_contents($pcmPath, $pcmData);
            
            //convert to .wav while trimming for latency.
            $wavPath = AD_ABSPATH . "workspace/mixdown/$recordingId.wav";
            shell_exec("ffmpeg -y -f f32le -ar 44100 -ac 1 -ss $latency -i $pcmPath -ar 44100 -ac 1 $wavPath");
            $mixdownCommand .= "-i $wavPath ";
        }
        $c = count($recordings);
        $masterPath = AD_ABSPATH . "workspace/mixdown/master$masterRef.mp3";
        $mixdownCommand .= "-filter_complex amix=inputs=$c:duration=longest $masterPath";
        shell_exec($mixdownCommand);
        
        //save to database
        $mp3handle = fopen($masterPath, 'r');
        $mp3Data = fread($mp3handle, filesize($masterPath));
        $wpdb->update('wp7h_recordings', array('mp3'=>$mp3Data), array('id'=>$masterRef));
        
        //cleanup
        fclose($mp3handle);
        unlink($masterPath);
        foreach($recordings as $recording){
            $recordingId = $recording->id;
            $pcmPath = AD_ABSPATH . "workspace/mixdown/$recordingId.pcm";
            unlink($pcmPath);
            $wavPath = AD_ABSPATH . "workspace/mixdown/$recordingId.wav";
            unlink($wavPath);
        }
        
        $wpdb->update('wp7h_recordings', array('mixed'=>1), array('id'=>$id), array('%d'), array('%d'));
        return "mixed successfully";
    }
}
(new AudioTransform())->register();