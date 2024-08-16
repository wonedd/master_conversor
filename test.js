const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

const input = path.join(__dirname, 'input.webm');
const output = path.join(__dirname, 'output.mp3');

ffmpeg(input)
  .audioCodec('libmp3lame')
  .audioBitrate(192)
  .toFormat('mp3')
  .on('end', () => {
    console.log('Conversão concluída');
  })
  .on('error', (err) => {
    console.error(`Erro na conversão: ${err.message}`);
  })
  .save(output);
