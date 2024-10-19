"use strict"

const video = document.getElementById('video'),
    playPauseBtn = document.getElementById('playPauseBtn'),
    posterPlayPauseBtn = document.getElementById('posterPlayPauseBtn'),
    currentTimeDisplay = document.getElementById('currentTime'),
    languageIcon = document.getElementById('languageIcon'),
    audioDropdown = document.getElementById('audioDropdown'),
    captionIcon = document.getElementById('captionIcon'),
    captionDropdown = document.getElementById('captionDropdown'),
    resIcon = document.getElementById('resIcon'),
    resDropdown = document.getElementById('resDropdown'),
    speedIcon = document.getElementById('speedIcon'),
    speedDropdown = document.getElementById('speedDropdown'),
    volumeIcon = document.getElementById('volumeIcon'),
    volumeSlider = document.getElementById('volumeSlider'),
    fullscreenIcon = document.getElementById('fullscreenIcon'),
    controlsContainer = document.getElementById('controlsContainer'),
    hls = Hls.isSupported() ? new Hls() : null;

let controlTimeout; // Timeout for hiding controls
const preloader = document.getElementById('preloader');
let isBuffering = false; // Buffering state track করার জন্য
let full = document.getElementById('full');


// Update progress bar as video loads
video.addEventListener('progress', () => {
    const duration = video.duration; 
    if (duration > 0) {
        for (let i = 0; i < video.buffered.length; i++) {
            if (video.buffered.start(video.buffered.length - 1 - i) < video.currentTime) {
                
                const bufferedPercentage = (video.buffered.end(video.buffered.length - 1 - i) / duration) * 100;
                
                progressBar.style.width = bufferedPercentage + '%';
                break;
            }
        }
    }
});



volumeSlider.oninput = (e) => {
    video.volume = e.target.value;

    if (video.volume == 0) {
        
        volumeIcon.classList.remove('fa-volume-up', 'fa-volume-down');
        volumeIcon.classList.add('fa-volume-mute');
    } else if (video.volume > 0 && video.volume <= 0.5) {
        
        volumeIcon.classList.remove('fa-volume-up', 'fa-volume-mute');
        volumeIcon.classList.add('fa-volume-down');
    } else {
        
        volumeIcon.classList.remove('fa-volume-mute', 'fa-volume-down');
        volumeIcon.classList.add('fa-volume-up');
    }
};





// Fullscreen icon click event
full.onclick = () => {
    if (!document.fullscreenElement) {
        controlsContainer.requestFullscreen().then(() => {
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('landscape').catch(err => {
                    console.error(`Orientation lock failed: ${err.message}`);
                });
            }
        }).catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message}`);
        });
    } else {
        document.exitFullscreen().then(() => {
            if (screen.orientation && screen.orientation.unlock) {
                screen.orientation.unlock();
            }
        });
    }
};

document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
        }
    }
});

video.onwaiting = () => {
    isBuffering = true;
    preloader.style.display = 'flex';
};

video.onplaying = () => {
    preloader.style.display = 'none';
    if (isBuffering) {
        video.play();
        isBuffering = false;
    }
};

video.onpause = () => {
    if (!isBuffering) {
        posterPlayPauseBtn.style.display = 'block';
        showControls();
    }
};

if (hls) {
    hls.loadSource('https://raw.githubusercontent.com/KMABIDHASAN63/project/refs/heads/main/discovery.m3u8');
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.pause();
    });

    hls.on(Hls.Events.BUFFER_APPENDING, () => {
        preloader.style.display = 'none';
        if (isBuffering) {
            video.play();
            isBuffering = false;
        }
    });

    hls.on(Hls.Events.ERROR, function (event, data) {
        if (data.fatal) {
            switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                    console.error("Network error encountered, trying to recover...");
                    hls.startLoad();
                    break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                    console.error("Media error encountered, trying to recover...");
                    hls.recoverMediaError();
                    break;
                default:
                    console.error("Unrecoverable error, destroying HLS...");
                    hls.destroy();
                    break;
            }
        }
    });
} else {
    video.src = 'https://raw.githubusercontent.com/KMABIDHASAN63/project/refs/heads/main/discovery.m3u8';
    video.onloadedmetadata = () => video.play();
}

video.onloadedmetadata = () => {
    posterPlayPauseBtn.style.display = 'block';
    video.pause();
    showControls();
};

playPauseBtn.onclick = () => {
    if (video.paused) {
        video.play();
        playPauseBtn.classList.replace('fa-play', 'fa-pause');
        posterPlayPauseBtn.style.display = 'none';
        hideControlsWithDelay();
    } else {
        video.pause();
        playPauseBtn.classList.replace('fa-pause', 'fa-play');
        posterPlayPauseBtn.style.display = 'block';
        showControls();
    }
};

video.onclick = () => {
    if (video.paused) {
        video.play();
        playPauseBtn.classList.replace('fa-play', 'fa-pause');
        posterPlayPauseBtn.style.display = 'none';
        hideControlsWithDelay();
    } else {
        video.pause();
        playPauseBtn.classList.replace('fa-pause', 'fa-play');
        posterPlayPauseBtn.style.display = 'block';
        showControls();
    }
};

video.onpause = () => {
    posterPlayPauseBtn.style.display = 'block';
    showControls();
};

video.onplay = () => {
    posterPlayPauseBtn.style.display = 'none';
    hideControlsWithDelay();
};

video.ontimeupdate = () => {
    const minutes = Math.floor(video.currentTime / 60);
    const seconds = Math.floor(video.currentTime % 60).toString().padStart(2, '0');
    currentTimeDisplay.textContent = `${minutes}:${seconds}`;
};

controlsContainer.onmouseenter = () => {
    showControls();
    clearTimeout(controlTimeout);
};

controlsContainer.onmouseleave = () => {
    if (!video.paused) {
        hideControlsWithDelay();
    }
};

document.addEventListener('mousemove', () => {
    if (document.fullscreenElement) {
        showControls();
        hideControlsWithDelay();
    }
});

function showControls() {
    controlsContainer.querySelector('.custom-controls').style.opacity = '1';
    controlsContainer.querySelector('.custom-controls').style.visibility = 'visible';
}

function hideControlsWithDelay() {
    clearTimeout(controlTimeout);
    controlTimeout = setTimeout(() => {
        controlsContainer.querySelector('.custom-controls').style.opacity = '0';
        controlsContainer.querySelector('.custom-controls').style.visibility = 'hidden';
    }, 3000);
}

// Language track selection
languageIcon.onclick = () => {
    if (audioDropdown.style.display === 'block') {
        audioDropdown.style.display = 'none';
    } else {
        audioDropdown.style.display = 'block';

        // Load and display audio tracks
        if (hls) {
            const audioTracks = hls.audioTracks;

            // Clear the existing options before adding new ones
            audioDropdown.innerHTML = '';

            // Add audio tracks to dropdown
            audioTracks.forEach((track, index) => {
                const trackOption = document.createElement('div');
                trackOption.classList.add('option');
                trackOption.setAttribute('data-track', index);
                trackOption.textContent = track.name || `Track ${index + 1}`; // Display track name or index
                audioDropdown.appendChild(trackOption);
            });
        }
    }
};

audioDropdown.onclick = (e) => {
    const trackIndex = e.target.getAttribute('data-track');
    if (trackIndex !== null) {
        hls.audioTrack = parseInt(trackIndex);
        audioDropdown.style.display = 'none';
    }
};

captionIcon.onclick = () => {
    captionDropdown.style.display = captionDropdown.style.display === 'block' ? 'none' : 'block';
};

captionDropdown.onclick = (e) => {
    const captionIndex = e.target.getAttribute('data-caption');
    if (captionIndex !== null) {
        hls.subtitleTrack = captionIndex;
        captionDropdown.style.display = 'none';
    }
};

// Resolution dropdown logic
resIcon.onclick = () => {
    if (resDropdown.style.display === 'block') {
        resDropdown.style.display = 'none';
    } else {
        resDropdown.style.display = 'block';

        // Load and display resolution levels
        if (hls) {
            const levels = hls.levels;

            // Clear the existing options before adding new ones
            resDropdown.innerHTML = '';

            // Filter out duplicate resolutions
            const uniqueResolutions = [];
            levels.forEach((level, index) => {
                if (!uniqueResolutions.includes(level.height)) {
                    uniqueResolutions.push(level.height);

                    const resOption = document.createElement('div');
                    resOption.classList.add('option');
                    resOption.setAttribute('data-res', index);
                    resOption.textContent = `${level.height}p`; // Display resolution height
                    resDropdown.appendChild(resOption);
                }
            });
        }
    }
};

resDropdown.onclick = (e) => {
    const resIndex = e.target.getAttribute('data-res');
    if (resIndex !== null) {
        hls.currentLevel = resIndex;
        resDropdown.style.display = 'none';
    }
};

speedIcon.onclick = () => {
    speedDropdown.style.display = speedDropdown.style.display === 'block' ? 'none' : 'block';
};

speedDropdown.onclick = (e) => {
    const speed = e.target.getAttribute('data-speed');
    if (speed !== null) {
        video.playbackRate = speed;
        speedDropdown.style.display = 'none';
    }
};

volumeIcon.onclick = () => {
    volumeSlider.style.display = volumeSlider.style.display === 'block' ? 'none' : 'block';
};




window.onclick = (e) => {
    if (!languageIcon.contains(e.target) && !audioDropdown.contains(e.target)) {
        audioDropdown.style.display = 'none';
    }
    if (!captionIcon.contains(e.target) && !captionDropdown.contains(e.target)) {
        captionDropdown.style.display = 'none';
    }
    if (!resIcon.contains(e.target) && !resDropdown.contains(e.target)) {
        resDropdown.style.display = 'none';
    }
    if (!speedIcon.contains(e.target) && !speedDropdown.contains(e.target)) {
        speedDropdown.style.display = 'none';
    }
    if (!volumeIcon.contains(e.target) && !volumeSlider.contains(e.target)) {
        volumeSlider.style.display = 'none';
    }
};