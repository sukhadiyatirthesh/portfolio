const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const dir = 'C:\\Users\\tirthesh jain\\.gemini\\antigravity-ide\\scratch\\tirthesh-portfolio';
const token = process.env.GITHUB_TOKEN;
if(!token) {
  console.error("Please provide GITHUB_TOKEN environment variable.");
  process.exit(1);
}
const username = 'sukhadiyatirthesh';
const repo = 'portfolio';

async function pushToGitHub() {
  try {
    console.log("Initializing repo...");
    await git.init({ fs, dir, defaultBranch: 'main' });

    console.log("Configuring git...");
    await git.setConfig({ fs, dir, path: 'user.name', value: 'Tirthesh Jain' });
    await git.setConfig({ fs, dir, path: 'user.email', value: 'sukhadiyatirthesh5@gmail.com' });

    console.log("Scanning files...");
    const status = await git.statusMatrix({ fs, dir });
    
    for (const row of status) {
      const filepath = row[0];
      const headStatus = row[1];
      const workdirStatus = row[2];
      
      if (filepath.startsWith('node_modules') || 
          filepath.startsWith('.git') || 
          filepath === '.env') {
        continue;
      }
      
      if (workdirStatus === 2 || workdirStatus === 3) {
        await git.add({ fs, dir, filepath });
      } else if (workdirStatus === 0) {
        await git.remove({ fs, dir, filepath });
      }
    }

    console.log("Committing...");
    try {
      const commitId = await git.commit({
        fs,
        dir,
        author: {
          name: 'Tirthesh Jain',
          email: 'sukhadiyatirthesh5@gmail.com',
        },
        message: 'Fix GA4 data collection firing (fallback with setTimeout)'
      });
      console.log("Committed:", commitId);
    } catch(e) {
      console.log("Commit skipped or error:", e.message);
    }

    console.log("Adding remote...");
    try {
      await git.addRemote({
        fs,
        dir,
        remote: 'origin',
        url: `https://github.com/${username}/${repo}.git`
      });
    } catch(e) {}

    console.log("Pushing to GitHub...");
    let pushResult = await git.push({
      fs,
      http,
      dir,
      remote: 'origin',
      ref: 'main',
      onAuth: () => ({ username: username, password: token }),
      force: true
    });
    console.log("Push complete:", pushResult);
    
  } catch(e) {
    console.error("Fatal error:", e);
  }
}

pushToGitHub();
