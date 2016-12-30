const timers = require('timers');
const path = require('path');
const dns = require('dns');
const Ping = require('ping-lite');
const { forever, timeout, parallel, waterfall } = require('async');
const { app, dialog, BrowserWindow, Tray, Menu } = require('electron');

const dnsLatency = (host, callback) => {
  const dnsStartMs = +(new Date);
  dns.resolve(host, err => {
    if (err) return callback(err);
    callback(null, +(new Date) - dnsStartMs);
  });
}

const pingLatency = (ip, callback) => {
  const ping = new Ping(ip);
  ping.send((err, latencyMs) => {
    if (err) return callback(err);
    callback(null, Math.round(latencyMs));
  });
}

let mainWindow;
app.on('ready', () => {
  mainWindow = new BrowserWindow({show: false});
  if (app.dock) app.dock.hide();

  const tray = new Tray(path.join(app.getAppPath(), 'icon.png'));

  tray.setContextMenu(Menu.buildFromTemplate([{
    label: 'Quit',
    click: () => app.quit(),
  }]));

  tray.on('click', tray.popUpContextMenu);
  tray.on('right-click', tray.popUpContextMenu);

  let title = `.../...ms`;
  tray.setTitle(title);

  const refreshLatency = (check, arg, timeoutMs, titleRegex) =>
    () => setInterval(() => {
      timeout(check, timeoutMs)(arg, (err, latency) => {
        title = title.replace(titleRegex, latency || '...');
        tray.setTitle(title);
      })
    }, timeoutMs + 100);

  parallel([
    refreshLatency(dnsLatency, 'google.com', 2000, /[\d\.]+(?=\/)/),
    refreshLatency(pingLatency, '8.8.8.8', 2000, /[\d\.]+(?=ms)/),
  ]);

});
