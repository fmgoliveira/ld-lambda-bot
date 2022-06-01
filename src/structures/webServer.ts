import chalk from 'chalk';
import express from 'express';

export const webServerInit = (port: number | undefined) => {
  const app = express();
  
  app.get('/', (req, res) => {
    res.sendStatus(200);
  });

  app.listen(port || 3000, () => console.log(`${chalk.green('[INFO]')} Web server listening on port ${port || 3000}`));
};