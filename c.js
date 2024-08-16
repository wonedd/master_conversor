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

const sanitizeUrl = (url) => {
  const urlObj = new URL(url);
  urlObj.search = ''; // Remove todos os parâmetros de query
  return urlObj.toString();
};

const downloadYouTube = async (url) => {
  try {
    if (!ytdl.validateURL(url)) {
      throw new Error('URL inválida');
    }

    const info = await ytdl.getInfo(url);
    const finalOutput = path.join(downloadFolder, `${info.videoDetails.title}.mp3`);

    const audioStream = ytdl(url, {
      filter: 'audioonly'
    });

    audioStream.on('error', (err) => {
      console.error(`Erro ao obter o stream de áudio do YouTube: ${err.message}`);
    });

    ffmpeg()
      .input(audioStream)
      .audioCodec('libmp3lame')
      .audioBitrate(320)
      .toFormat('mp3')
      .on('end', () => {
        console.log(`Download e conversão concluídos: ${finalOutput}`);
      })
      .on('error', (err) => {
        console.error(`Erro ao converter o arquivo: ${err.message}`);
      })
      .pipe(fs.createWriteStream(finalOutput), { end: true });

  } catch (err) {
    console.error(`Erro ao processar o vídeo: ${err.message}`);
  }
};

const downloadSpotify = (url) => {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(downloadFolder);
    exec(`spotdl --output "${outputPath}" "${url}"`, (error, stdout, stderr) => {
      if (error) {
        reject(`Erro ao baixar a música do Spotify: ${error.message}`);
        return;
      }
      if (stderr) {
        reject(`Erro: ${stderr}`);
        return;
      }
      console.log(`Download concluído: ${stdout}`);
      resolve();
    });
  });
};

const downloadSoundCloud = async (url) => {
  try {
    await SoundCloud.connect(); // Conecta-se ao SoundCloud para obter o clientId
    const track = await SoundCloud.tracks.getTrack(url);
    const finalOutput = path.join(downloadFolder, `${track.title}.mp3`);

    const audioStream = await SoundCloud.download(url);

    ffmpeg()
      .input(audioStream)
      .audioCodec('libmp3lame')
      .audioBitrate(320)
      .toFormat('mp3')
      .on('end', () => {
        console.log(`Download e conversão concluídos: ${finalOutput}`);
      })
      .on('error', (err) => {
        console.error(`Erro ao converter o arquivo: ${err.message}`);
      })
      .pipe(fs.createWriteStream(finalOutput), { end: true });

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
