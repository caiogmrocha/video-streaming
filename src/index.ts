import fs from 'node:fs';
import path from 'node:path';
import stream from 'node:stream';
import child from 'node:child_process';

import express from 'express';
import busboy from 'busboy';
import HlsServer from 'hls-server';

const app = express();

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));
app.use(express.json());

app.get('/videos/stream', (req, res) => {
  return res.status(200).sendFile(path.join(__dirname, 'public/index.html'));
});

app.post('/videos/upload', (req, res) => {
  const bb = busboy({ headers: req.headers });

  const processor = child.fork('./src/child.ts', {
    stdio: ['pipe', 1, 2, 'ipc']
  });

  bb
  .on('file', (name, file, info) => file.pipe(<stream.Writable>processor.stdin))
  .on('error', res.send)

  req.pipe(bb);

  processor.on('close', () => res.send('end'));
});

const httpServer = app.listen(3333, () => {
  console.log('Server is running on http://localhost:3333');
});

httpServer.setTimeout(1000 * 60);

new HlsServer(httpServer, {

  provider: {
    exists: (req: any, cb: any) =>{
      const ext = path.extname(req.url);

      if (ext !== 'm3u8' && ext !== 'ts') {
        return cb(null, true);
      }

      fs.access(path.resolve(__dirname, req.url), fs.constants.F_OK, err => {
        if (err) {
          console.warn('File not exists');
          return cb(null, false);
        }
        cb(null, true);
      });
    },
    getManifestStream: (req: any, cb: any) => {
      cb(null, fs.createReadStream(path.join(__dirname, '..', req.url)).on('error', () => console.log('error')));
    },
    getSegmentStream: (req: any, cb: any) => {
      cb(null, fs.createReadStream(path.join(__dirname, '..', req.url)).on('error', () => console.log('error')));
    },
  }
});
