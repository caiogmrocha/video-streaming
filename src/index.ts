import fs from 'node:fs';
import path from 'node:path';
import stream from 'node:stream';
import child from 'node:child_process';


import express from 'express';
import busboy from 'busboy';

const app = express();

app.use(express.json());

app.post('/videos/upload', (req, res) => {
  const bb = busboy({ headers: req.headers });

  const processor = child.fork('./src/child.ts', {
    stdio: ['pipe', 1, 2, 'ipc']
  });

  bb
  .on('file', (name, file, info) => {
    file.pipe(<stream.Writable>processor.stdin);
  })
  .on('error', res.send)

  req.pipe(bb);

  processor.on('close', () => {
    res.send('end')
  });
});

app.listen(3333, () => {
  console.log('Server is running on port 3333');
});
