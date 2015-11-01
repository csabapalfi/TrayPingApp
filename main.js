var app = require('app');
var Menu = require('menu');
var Tray = require('tray');
var ping = require('net-ping');
var dns = require('dns');
var timers = require('timers');
var path = require('path');

var appIcon = null;
app.on('ready', function(){
  if (app.dock) app.dock.hide();
  appIcon = new Tray(path.join(app.getAppPath(), 'Icon.png'));
  appIcon.setToolTip('ping google.com');
  var contextMenu = Menu.buildFromTemplate([
    {
      label: 'Quit',
      click: function() { app.quit(); }
    },
  ]);
  appIcon.setContextMenu(contextMenu);
  var session = ping.createSession();

  function pingHost(addresses) {
    session.pingHost(addresses, function (error, target, sent, rcvd) {
      if (error) {
        if (error instanceof ping.RequestTimedOutError) {
            appIcon.setTitle('timeout');
        } else {
          appIcon.setTitle('error');
        }
      } else {
        appIcon.setTitle(rcvd - sent + 'ms');
      }
    });
    timers.setTimeout(pingHost, 2000, addresses);
  }

  dns.lookup('www.google.com', function onLookup(err, addresses) {
    if (err) return appIcon.setTitle('error');
    pingHost(addresses);
  });
});
