var timers = require('timers');
var path = require('path');
var dns = require('dns');

var app = require('app');
var Menu = require('menu');
var Tray = require('tray');
var dialog = require('dialog');

var ping = require('net-ping');

app.on('ready', function(){
  if (app.dock) app.dock.hide();

  var trayIcon = new Tray(path.join(app.getAppPath(), 'icon.png'));

  trayIcon.setContextMenu(Menu.buildFromTemplate([{
    label: 'Quit',
    click: function() { app.quit(); }
  }]));

  var session = ping.createSession();

  var timeout = timers.setTimeout(dnsError, 2000);
  dns.lookup('google.com', function onLookup(err, address) {
    timers.clearTimeout(timeout);
    if (err) return dnsError();
    pingHost(address);
  });

  function pingHost(address) {
    session.pingHost(address, function (error, target, sent, rcvd) {
      if (error) {
        if(isTimeout(error)) return setTitle('timeout');
        return setTitle('error');
      }
      setTitle(rcvd - sent + 'ms');

    });
    timers.setTimeout(pingHost, 2000, address);
  }

  function dnsError() {
    dialog.showErrorBox(
      'DNS lookup error',
      'Failed to resolve google.com'
    );
    app.quit();
  }

  function isTimeout(error) {
    return error instanceof ping.RequestTimedOutError;
  }

  function setTitle(title) {
    trayIcon.setTitle(title);
  }

});
