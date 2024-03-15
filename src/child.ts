import path from 'node:path';

import ffmpeg from 'fluent-ffmpeg';

const resolutions = [
  '1280x720',
  '1920x1080'
]

let handler = ffmpeg({
  source: process.stdin
});

resolutions.forEach((resolution, index) => {
  handler = handler
    .output(path.resolve(__dirname, '..', 'uploads', `video@${resolution}.mp4`))
    .videoCodec('libx264')
    .size(resolution)
});

let c = 0;

handler
  .on('error', console.error)
  .on('end', () => {
    c++;

    if (c == resolutions.length) {
      process.exit(0);
    }
  })
  .run();


process.on('exit', () => console.log('Processo finalizado!'));
