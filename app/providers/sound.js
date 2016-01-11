var client_1 = require('./client');
var audio = new Audio();
var playOgg = !!(audio.canPlayType && audio.canPlayType("audio/ogg; codecs='vorbis'").replace(/no/, ""));
var playMp3 = !!(audio.canPlayType && audio.canPlayType("audio/mpeg").replace(/no/, ""));
var client;
//Play
exports.play = function (sound) {
    var client = client_1.Client.getInstance();
    if (!client.session.settings.sound) {
        return;
    }
    if (playMp3) {
        audio.src = sound + ".mp3";
        audio.load();
        audio.play();
        return true;
    }
    else if (playOgg) {
        audio.src = sound + ".ogg";
        ;
        audio.load();
        audio.play();
        return true;
    }
    else {
        return false;
    }
};
