import path from 'node:path';
import crypto from 'node:crypto';

import ffmpeg from 'fluent-ffmpeg';

const resolutions = [
  '320x240',
  '640x360',
  '640x480',
  '1280x720',
  '1920x1080'
]

let c = 0;

let handler = ffmpeg({
  source: process.stdin
})
.on('error', console.error)
.on('end', () => {
  if (++c == resolutions.length) {
    handler.kill('SIGTERM');
    process.exit(0);
  }
});

const fileUUID = crypto.randomUUID();

resolutions.forEach((resolution, index) => {
  handler = handler
    .output(path.resolve(__dirname, '..', 'uploads', `${fileUUID}@${resolution}.mp4`))
    .videoCodec('libx264')
    .size(resolution)
});

handler.run();

process.on('exit', () => console.log('Processo finalizado!'));
