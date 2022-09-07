import LoggerInstance from './logger';

export default async () => {
  try {
    // Load FS and Other dependency
    const fs = require('fs');
    const envfile = require('envfile');
    const readline = require('readline');

    var fileModified = false;

    // Load environment files
    const envpath = `${__dirname}/../../.env`;
    const envsamplepath = `${__dirname}/../../.env.sample`;

    // First check and create .env if it doesn't exists
    if (!fs.existsSync(envpath)) {
      LoggerInstance.info('-- Checking for ENV File... Not Found');
      fs.writeFileSync(envpath, '', { flag: 'wx' });
      LoggerInstance.info('    -- ENV File Generated');
    } else {
      LoggerInstance.info('    -- Checking for ENV File... Found');
    }

    // Now Load the environment
    const envData = fs.readFileSync(envpath, 'utf8');
    const envObject = envfile.parse(envData);

    const envSampleData = fs.readFileSync(envsamplepath, 'utf8');
    const envSampleObject = envfile.parse(envSampleData);

    const readIntSampleENV = readline.createInterface({
      input: fs.createReadStream(envsamplepath),
      output: false,
    });

    let realENVContents = '';
    LoggerInstance.info('    -- Verifying and building ENV File...');

    for await (const line of readIntSampleENV) {
      let moddedLine = line;

      // Check if line is comment or environment variable
      if (moddedLine.startsWith('#') || moddedLine.startsWith('\n') || moddedLine.trim().length == 0) {
        // do nothing, just include it in the line
        // console.log("----");
      } else {
        // This is an environtment variable, first segregate the comment if any and the variable info
        const delimiter = '#';

        const index = moddedLine.indexOf('#') == -1 ? moddedLine.length : moddedLine.indexOf('#');
        const comment = index == -1 ? "" : moddedLine.slice(index + 1, moddedLine.length);

        const splits =
          index == -1
            ? [moddedLine.slice(0, index), '']
            : [moddedLine.slice(0, index), ' ' + delimiter + moddedLine.slice(index + 1)];

        const envVar = splits[0].split('=')[0]; //  Get environment variable by splitting the sample and then taking first seperation
        const envParam = splits[0].split('=')[1];

        // Check if envVar exists in real env, if not ask for val
        // console.log(envObject[`${envVar}`])
        if (!envObject[`${envVar}`] || envObject[`${envVar}`].trim() == '') {
          // env key doesn't exist, ask for input
          LoggerInstance.input(`  Enter ENV Variable Value --> ${envVar}`);

          LoggerInstance.input(`  Acceptable Values --> ${envParam} ${comment ? "// " + comment : ""}`);

          var value: any = '';

          while (value.trim().length == 0) {
            const rl = readline.createInterface({
              input: process.stdin,
              output: null,
            });
            value = await doSyncPrompt(rl, `${envSampleObject[envVar]} >`);

            if (value.trim().length == 0) {
              LoggerInstance.error("  Incorrect Entry, Field can't be empty");
            }
          }

          LoggerInstance.info(`  [Saved] ${envVar}=${value}`);
          if (comment) {
            moddedLine = `${envVar}=${value} #${comment}`;
          }
          else {
            moddedLine = `${envVar}=${value}`;
          }
          

          fileModified = true;
        } else {
          // Value exists so just replicate
          moddedLine = `${envVar}=${envObject[envVar]}${comment}`;
        }
      }

      // finally append the line
      realENVContents = `${realENVContents}\n${moddedLine}`;
    }

    if (fileModified) {
      LoggerInstance.info('    -- new ENV file generated, saving');
      fs.writeFileSync(envpath, realENVContents, { flag: 'w' });
      LoggerInstance.info('    -- ENV file saved!');
    } else {
      LoggerInstance.info('    -- ENV file verified!');
    }

    return null;
  } catch (e) {
    LoggerInstance.error('🔥  Error on env verifier loader: %o', e);
    throw e;
  }

  // Leverages Node.js' awesome async/await functionality
  async function doSyncPrompt(rl, message) {
    var promptInput = await readLineAsync(rl, message);
    rl.close();

    return promptInput;
  }

  function readLineAsync(rl, message) {
    return new Promise((resolve, reject) => {
      rl.question(message, answer => {
        resolve(answer.trim());
      });
    });
  }
};
