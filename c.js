const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const ytdl = require('@distube/ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const SoundCloud = require('scdl-core').SoundCloud;

const downloadFolder = path.join(__dirname, 'downloads');

if (!fs.existsSync(downloadFolder)) {
  fs.mkdirSync(downloadFolder);
}

const downloadYouTube = async (url) => {
  try {
    if (!ytdl.validateURL(url)) {
      throw new Error('URL inválida');
    }

    const info = await ytdl.getInfo(url);
    const tempAudioPath = path.join(downloadFolder, `${info.videoDetails.title}.tmp`);
    const finalOutput = path.join(downloadFolder, `${info.videoDetails.title}.wav`);

    const audioStream = ytdl(url, { filter: 'audioonly' });
    const tempAudioStream = fs.createWriteStream(tempAudioPath);

    audioStream.pipe(tempAudioStream);

    tempAudioStream.on('finish', () => {
      ffmpeg(tempAudioPath)
        .audioCodec('pcm_s16le') // Codec para WAV
        .toFormat('wav') // Define o formato de saída como WAV
        .on('end', () => {
          fs.unlinkSync(tempAudioPath); // Remove o arquivo temporário
          console.log(`Download e conversão concluídos: ${finalOutput}`);
        })
        .on('error', (err) => {
          console.error(`Erro ao converter o arquivo: ${err.message}`);
        })
        .save(finalOutput);
    });

    tempAudioStream.on('error', (err) => {
      console.error(`Erro ao salvar o áudio temporário: ${err.message}`);
    });

  } catch (err) {
    console.error(`Erro ao processar o vídeo: ${err.message}`);
  }
};

const downloadSoundCloud = async (url) => {
  try {
    await SoundCloud.connect(); // Conecta-se ao SoundCloud para obter o clientId
    const track = await SoundCloud.tracks.getTrack(url);
    const tempAudioPath = path.join(downloadFolder, `${track.title}.tmp`);
    const finalOutput = path.join(downloadFolder, `${track.title}.wav`);

    const audioStream = await SoundCloud.download(url);
    const tempAudioStream = fs.createWriteStream(tempAudioPath);

    audioStream.pipe(tempAudioStream);

    tempAudioStream.on('finish', () => {
      ffmpeg(tempAudioPath)
        .audioCodec('pcm_s16le') // Codec para WAV
        .toFormat('wav') // Define o formato de saída como WAV
        .on('end', () => {
          fs.unlinkSync(tempAudioPath); // Remove o arquivo temporário
          console.log(`Download e conversão concluídos: ${finalOutput}`);
        })
        .on('error', (err) => {
          console.error(`Erro ao converter o arquivo: ${err.message}`);
        })
        .save(finalOutput);
    });

    tempAudioStream.on('error', (err) => {
      console.error(`Erro ao salvar o áudio temporário: ${err.message}`);
    });

  } catch (err) {
    console.error(`Erro ao processar URL do SoundCloud: ${err.message}`);
  }
};

const processUrls = async (urls) => {
  for (const url of urls) {
    if (url.includes('youtube.com')) {
      await downloadYouTube(url);
    } else if (url.includes('spotify.com')) {
      try {
        await downloadSpotify(url);
      } catch (error) {
        console.error(`Erro ao processar URL do Spotify: ${error}`);
      }
    } else if (url.includes('soundcloud.com')) {
      await downloadSoundCloud(url);
    } else {
      console.error('URL não suportada:', url);
    }
  }
};

const urls = process.argv.slice(2);

if (urls.length > 0) {
  processUrls(urls).catch(err => console.error(`Erro ao processar URLs: ${err.message}`));
} else {
  console.error('Por favor, forneça URLs para download.');
}
