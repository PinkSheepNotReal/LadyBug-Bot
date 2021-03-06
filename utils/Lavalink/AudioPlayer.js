const EventEmitter = require("events");
const AudioTrack = require("./AudioTrack.js");

class AudioPlayer extends EventEmitter {
  constructor(channel, node) {
    super();
    this.guild = channel.guild;
    this.manager = node.manager;
    this.queue = [];
    this.looping = false;
    this.playing = false;
    this.node = node;
    this.paused = false;
    this.alive = true;
    this.state = { time: 0, position: 0 };
    this.channel = channel;
    this.volume = 100;
    this.client = node.manager.client;
  }

  async play(track, { startTime, endTime } = {}) {
    if(track instanceof AudioTrack) track = track.track;
    await this.node.send({
      op: "play",
      guildId: this.guild.id,
      track: track,
      startTime,
      endTime
    });
    this.playing = true;
  }

  async destroy() {
    await this.node.send({
      op: "destroy",
      guildId: this.guild.id
    });
    this.alive = false;
    this.playing = false;
  }

  async setVolume(volume = 100) {
    await this.node.send({
      op: "volume",
      guildId: this.guild.id,
      volume
    });
    this.volume = volume;
  }

  async pause(pause = true) {
    await this.node.send({
      op: "pause",
      guildId: this.guild.id,
      pause
    });
    this.paused = pause;
  }

  resume() {
    return this.pause(false);
  }

  async stop() {
    await this.node.send({
      op: "stop",
      guildId: this.guild.id
    });
    this.playing = false;
  }

  seek(position = 0) {
    return this.node.send({
      op: "seek",
      guildId: this.guild.id,
      position
    });
  }

  clearQueue() {
    this.queue = [];
    return this;
  }

  _update(d) {
    if(!d || !d.state || !d.state.time || !d.state.position) return;
    this.state = {
      time: d.state.time,
      position: d.state.position
    };
  }
}

module.exports = AudioPlayer;
