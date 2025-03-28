"use client"
import React, { useEffect, useRef, useCallback } from 'react';

interface YouTubeVideoProps {
    videoUrl: string;
    play?: boolean;
    mute?: boolean;
    volume?: number; // 0 a 100
    onEnd: () => void;
}

interface CustomWindow extends Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
}

declare let window: CustomWindow;

const YouTubeVideo: React.FC<YouTubeVideoProps> = ({ videoUrl, play, mute, volume = 100, onEnd }) => {
    const playerRef = useRef<YT.Player | null>(null);

    // Función para obtener el ID del video de YouTube
    const getYouTubeVideoId = useCallback((url: string): string | null => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\\w\/|embed\/|watch\\?v=|\\&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
    }, []);

    // Función que se ejecuta cuando el reproductor está listo
    const onPlayerReady = useCallback(() => {
        if (play) {
            playerRef.current?.playVideo();
        }
        if (mute) {
            playerRef.current?.mute();
        } else {
            playerRef.current?.unMute();
        }
        playerRef.current?.setVolume(volume);
    }, [play, mute, volume]);

    // Función para manejar el cambio de estado del reproductor
    const onPlayerStateChange = useCallback(
        (event: YT.OnStateChangeEvent) => {
            if (event.data === YT.PlayerState.ENDED) {
                onEnd();
                if (playerRef.current) {
                    playerRef.current.seekTo(0, false);
                    playerRef.current.pauseVideo();
                }
            }
        },
        [onEnd]
    );

    // Función para inicializar el reproductor
    const createPlayer = useCallback(() => {
        if (playerRef.current) {
            playerRef.current.destroy();
        }

        const videoId = getYouTubeVideoId(videoUrl);
        if (!videoId) return;

        playerRef.current = new YT.Player('youtube-player', {
            videoId,
            events: {
                onStateChange: onPlayerStateChange,
                onReady: onPlayerReady,
            },
        });
    }, [getYouTubeVideoId, videoUrl, onPlayerReady, onPlayerStateChange]);

    // Cargar el script de YouTube solo una vez
    useEffect(() => {
        if (window.YT) return;

        window.onYouTubeIframeAPIReady = createPlayer;

        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag.parentNode) {
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
    }, [createPlayer]);

    // Crear el reproductor cuando cambia el videoUrl
    useEffect(() => {
        if (window.YT && window.YT.Player) {
            createPlayer();
        }
    }, [createPlayer]);

    return <div id="youtube-player" style={{ height: '100%', width: '100%' }}></div>;
};

export default YouTubeVideo;
