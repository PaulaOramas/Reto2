document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video-player');
    const playPauseButton = document.getElementById('play-pause');
    const muteUnmuteButton = document.getElementById('mute-unmute');
    const progressBar = document.getElementById('progress-bar');
    const volumeBar = document.getElementById('volume-bar');
    const currentTimeDisplay = document.getElementById('current-time');
    const durationDisplay = document.getElementById('duration');
    const fullscreenButton = document.getElementById('fullscreen');

    // Función para dar formato al tiempo en mm:ss
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    // Actualizar el tiempo total del video cuando se carga
    video.addEventListener('loadedmetadata', () => {
        progressBar.max = video.duration;
        durationDisplay.textContent = formatTime(video.duration);
    });

    // Play/Pause del video
    playPauseButton.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            playPauseButton.textContent = '⏸️'; // Cambia el ícono a pausa
        } else {
            video.pause();
            playPauseButton.textContent = '▶️'; // Cambia el ícono a play
        }
    });

    // Actualizar la barra de progreso y el tiempo actual
    video.addEventListener('timeupdate', () => {
        progressBar.value = video.currentTime;
        currentTimeDisplay.textContent = formatTime(video.currentTime);
    });

    // Cambiar el tiempo del video desde la barra de progreso
    progressBar.addEventListener('input', () => {
        video.currentTime = progressBar.value;
    });

    // Mute/Unmute del video
    muteUnmuteButton.addEventListener('click', () => {
        video.muted = !video.muted;
        muteUnmuteButton.textContent = video.muted ? '🔇' : '🔊'; // Cambia el ícono
    });

    // Cambiar el volumen desde la barra de volumen
    volumeBar.addEventListener('input', () => {
        video.volume = volumeBar.value;
        video.muted = video.volume === 0; // Mute automático si el volumen es 0
        muteUnmuteButton.textContent = video.muted ? '🔇' : '🔊';
    });

    // Pantalla completa
    fullscreenButton.addEventListener('click', () => {
        if (video.requestFullscreen) {
            video.requestFullscreen();
        } else if (video.webkitRequestFullscreen) {
            video.webkitRequestFullscreen(); // Safari
        } else if (video.msRequestFullscreen) {
            video.msRequestFullscreen(); // IE/Edge
        }
    });
});
