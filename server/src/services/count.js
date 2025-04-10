import * as fs from 'node:fs/promises';

export async function getRealCount(req, res) {
  const data = await fs.readFile("src/count.txt", 'utf8');
  res.json({ count: data });
}

export async function addRealCount(req, res) {
  const data = await fs.readFile("src/count.txt", 'utf8');
  let num = Number(data) + 1
  await fs.writeFile('src/count.txt', `${num}`, 'utf8');
  res.json({ count: num, message: 'Total count!' });
}