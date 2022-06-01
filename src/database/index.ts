import chalk from 'chalk';
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_URL!)
  .then(() => console.log(`${chalk.green("[INFO]")} Connected to MongoDB Database\n`))
  .catch((err) => console.log(chalk.red(`[ERROR] An error occurred while connecting to MongoDB Database:\n`) + err + "\n"));