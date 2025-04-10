import { client } from './client.js';
import { nextPollTime } from './schedule.js';
import config from '../config.js';

const { normal, sleeping, burst } = config.polling;

function isSleepingHours() {
  const utcHour = new Date().getUTCHours();
  return utcHour >= 5 && utcHour < 8;
}

export function startPresenceCountdown() {
  console.log('⏱️ Starting presence countdown...');
  setInterval(() => {
    if (!nextPollTime) return;

    const diff = nextPollTime - Date.now();
    if (diff <= 0) return;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    let timeStr = '';
    if (hours > 0) timeStr += `${hours}h `;
    if (minutes > 0 || hours > 0) timeStr += `${minutes}m `;
    timeStr += `${seconds}s`;

    const statusText = isSleepingHours()
      ? `Sleeping 💤 | Next check in ${timeStr}`
      : `Next check in ${timeStr}`;

    client.user.setPresence({
      activities: [{ name: statusText.trim(), type: 4 }],
      status: isSleepingHours() ? 'idle' : 'online'
    });
  }, 5000);
}

export function updatePresenceWithNextPoll() {
  const isSleep = isSleepingHours();
  const pollInterval = isSleep ? sleeping : normal;
  const time = Math.floor((Date.now() + pollInterval) / 1000);

  client.user.setPresence({
    activities: [
      {
        name: `${isSleep ? 'Sleeping 💤' : 'Next check'} • <t:${time}:R>`,
        type: 4
      }
    ],
    status: isSleep ? 'idle' : 'online'
  });
}


export function getBurstPollingDelay() {
  return burst;
}
