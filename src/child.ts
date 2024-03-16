import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs';

import ffmpeg from 'fluent-ffmpeg';

const resolutions = [
  '320x240',
  // '640x360',
  // '640x480',
  // '1280x720',
  // '1920x1080'
];

let c = 0;

let handler = ffmpeg({
  source: process.stdin,
  timeout: 1000 * 60 * 7
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
  fs.mkdirSync(path.resolve(__dirname, '..', 'uploads', `sliced-videos`, fileUUID));

  handler = handler
    .output(path.resolve(__dirname, '..', 'uploads', `sliced-videos`, fileUUID, `${resolution}.m3u8`))
    .addOptions([
      '-profile:v baseline',
      '-level 3.0',
      '-start_number 0',
      '-hls_time 10',
      '-hls_list_size 0',
      '-f hls'
    ])
    .videoCodec('libx264')
    .size(resolution)
});

handler.run();

process.on('exit', () => console.log('Processo finalizado!'));
