const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const headingSong = $(".dashboard header h1");
const cdThumb = $(".cd-thumb");
const cd = $(".cd");
const audio = $("#audio");
const repeatBtn = $(".btn-repeat");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const togglePlayBtn = $(".btn-toggle-play");
const control = $(".control");
const progress = $("#progress");
const playList = $(".playlist");
const numberSong = $(".number-song");
const PLAYER_SETTING = "1999Music";
const realTimeSong = $(".real-time");
const APIMUSIC = "https://612f3ec55fc50700175f1514.mockapi.io/songs";
// eslint-disable-next-line no-unused-vars
let songsElement = null;

const app = {
  // list songs
  currentIndex: 0,
  isPlaying: false,
  isRepeat: false,
  isRandom: false,
  idsPlayed: [],
  config: JSON.parse(localStorage.getItem(PLAYER_SETTING)) || {},

  // setting config
  setConfig(key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_SETTING, JSON.stringify(this.config));
  },
  songs: [],
  getSongs(callback) {
    fetch(APIMUSIC)
      .then((response) => response.json())
      .then(callback)
      .catch(() => {
        document.body.innerHTML = `<h1 style="text-align: center; margin-top: 100px;">Fail connect to API</h1>`;
      });
  },

  handleGetSongs(data) {
    try {
      this.songs = data;
      this.defineProperties();
      this.renderSongs();
      this.loadConfig();
      this.renderCurrentSong();
      this.handleActionAfterLoadConfig();
      this.handleEvents();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
     

    
  },

  updateNumberSong() {
    numberSong.innerHTML = `${this.songs.length} <i class="fa fa-music" aria-hidden="true"></i>`;
  },

  // Render List Song
  renderSongs() {
    // updata number song
    this.updateNumberSong();

    // render pohan dashboard
    // render list
    const htmls = this.songs.map(
      (song) => `
      <div class="song" data-id="${song.id}">
        <div
          class="thumb"
          style="background-image: url('${song.url}')"
        ></div>
        <div class="body">
          <h3 class="title">${song.name}</h3>
          <p class="author">${song.singer}</p>
        </div>
        <div class="option">
          <i class="fas fa-ellipsis-h"></i>
        </div>
      </div>
    `,
    );
    $(".playlist").innerHTML = htmls.join("");
    songsElement = $$(".song");
    this.idsPlayed.push(this.currentIndex);
  },

  // no se kieu nhu nay get currentSong (){ //define function}
  // define property cuurentSong (no se get ra cuurent Song)

  defineProperties() {
    Object.defineProperty(this, "currentSong", {
      get() {
        return this.songs[this.currentIndex];
      },
    });
  },

  loadConfig() {
    this.currentIndex = this.config.currentIndex || 0;
    this.isRandom = this.config.isRandom || false;
    this.isRepeat = this.config.isRepeat || false;
  },
  handleActionAfterLoadConfig() {
    // setting loop song
    audio.loop = this.isRepeat;
    // settig toggle button play
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);

    // playing , current time reload app (F5)
    audio.currentTime = this.config.currentTime || 0;
    // audio.volume = 100;
  },

  renderTimeSong() {
    const minuRun = this.formatTime(Math.floor((audio.currentTime || 0) / 60));
    const minu = this.formatTime(Math.floor(audio.duration / 60));
    const secRun = this.formatTime(Math.floor((audio.currentTime || 0) % 60));
    const sec = this.formatTime(Math.floor(audio.duration % 60));

    realTimeSong.innerHTML = `${minuRun}:${secRun}/${minu}:${sec}`;
  },
  // Render Current Song
  formatTime(number) {
    if (number >= 0 && number <= 9) return `0${number}`;
    return number;
  },
  renderCurrentSong() {
    headingSong.innerText = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.url}')`;
    audio.src = this.currentSong.path;

    // add  class active for current in player list
    songsElement.forEach((song) => {
      if (Number(song.dataset.id) === this.currentIndex + 1) {
        song.classList.add("active");
      } else song.classList.remove("active");
    });
    this.scrollToActiveSong();
  },
  // scroll to address song choice
  scrollToActiveSong() {
    // if (this.currentIndex <= (this.songs * 1) / 5) {
    $(".song.active").scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  },
  // next and prev song
  nextSong() {
    if (this.currentIndex === this.songs.length - 1) {
      this.currentIndex = 0;
    } else this.currentIndex += 1;
    this.renderCurrentSong();
  },

  prevSong() {
    if (this.currentIndex === 0) {
      this.currentIndex = this.songs.length - 1;
    } else this.currentIndex -= 1;
    this.renderCurrentSong();
  },

  randomSong() {
    const isTrue = true;
    if (this.idsPlayed.length === this.songs.length) this.idsPlayed = [];
    while (isTrue) {
      const indexSong = Math.floor(Math.random() * this.songs.length);
      if (indexSong !== this.currentIndex && this.idsPlayed.indexOf(indexSong) === -1) {
        this.currentIndex = indexSong;
        this.idsPlayed.push(indexSong);
        break;
      }
    }
    this.renderCurrentSong();
  },
  // Handel All Event
  handleEvents() {
    const cdWidth = cd.offsetWidth;
    progress.step = 0.0000001;
    // eslint-disable-next-line no-underscore-dangle

    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000,
      iterations: Infinity,
    });
    cdThumbAnimate.pause();

    // zoomin and zoomout CD Thumb scroll
    document.onscroll = () => {
      const posScrollY = window.scrollY || document.documentElement.scrollTop;
      let cdNewWidth = cdWidth - posScrollY;

      cdNewWidth = cdNewWidth <= 0 ? 0 : cdNewWidth;

      Object.assign(cd.style, {
        width: `${cdNewWidth}px`,
        height: `${cdNewWidth}px`,
        opacity: cdNewWidth / cdWidth,
      });
    };

    // toggle play and pause
    togglePlayBtn.onclick = () => {
      if (!this.isPlaying) audio.play();
      else audio.pause();
    };

    // event play
    audio.onplay = () => {
      this.isPlaying = true;
      cdThumbAnimate.play();
      control.classList.add("played");
    };

    // event pause
    audio.onpause = () => {
      this.isPlaying = false;
      cdThumbAnimate.pause();
      control.classList.remove("played");
    };

    // event song playing return current time
    audio.ontimeupdate = () => {
      if (audio.duration) {
        const percentTime = (audio.currentTime / audio.duration) * 100;
        progress.value = percentTime;
        this.setConfig("currentTime", audio.currentTime);
        this.renderTimeSong();
      }
    };

    // event changeed seektime of the song
    progress.oninput = () => {
      const seekTime = (progress.value / 100) * audio.duration;
      audio.currentTime = seekTime;
    };

    // event of button next
    nextBtn.onclick = () => {
      if (this.isRandom) this.randomSong();
      else this.nextSong();
      audio.play();
      // set local
      this.setConfig("currentIndex", this.currentIndex);
      this.setConfig("currentTime", (audio.currentTime = 0));
    };

    // event of button prev
    prevBtn.onclick = () => {
      if (this.isRandom) this.randomSong();
      else this.prevSong();
      audio.play();
      this.setConfig("currentIndex", this.currentIndex);
      this.setConfig("currentTime", (audio.currentTime = 0));
    };

    // event of button repeat
    repeatBtn.onclick = () => {
      this.isRepeat = !this.isRepeat;
      repeatBtn.classList.toggle("active", this.isRepeat);
      audio.loop = this.isRepeat;
      this.setConfig("isRepeat", this.isRepeat);
    };

    // event of the button random
    randomBtn.onclick = () => {
      this.isRandom = !this.isRandom;
      randomBtn.classList.toggle("active", this.isRandom);
      this.setConfig("isRandom", this.isRandom);
    };

    // auto next song

    audio.onended = () => {
      setTimeout(() => {
        if (!this.isRepeat) nextBtn.onclick();
      }, 1000);
    };

    // lis
    playList.onclick = (e) => {
      // eslint-disable-next-line no-console
      if (e.target.closest(".option")) console.log(e.target.closest(".option"));
      else if (e.target.closest(".song:not(.active)")) {
        const indexSongChoice = e.target.closest(".song:not(.active)").dataset.id - 1;
        this.currentIndex = indexSongChoice;
        this.renderCurrentSong();
        audio.play();
        this.setConfig("currentIndex", this.currentIndex);
      }
    };
  },

  // Run App
  run() {
    this.getSongs(this.handleGetSongs.bind(this));
  },
};

app.run();
