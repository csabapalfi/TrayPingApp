const path = require('path');
const networkStatus = require('./network-status');
const { app, BrowserWindow, Tray, Menu } = require('electron');
const timeoutMs = 2000;

app.on('ready', () => {
  new BrowserWindow({show: false});
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

  networkStatus({
    timeoutMs: 2000,
    intervalMs: 2000,
    hostname: 'google.com',
    address: '8.8.8.8'
  }).on('latencies', ({dns, ping}) =>
    tray.setTitle(`${dns || '...'}/${ping || '...'}ms`)
  );
});
