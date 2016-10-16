//
//  AppDelegate.swift
//  TrayPing
//
//  Created by Csaba Palfi on 15/10/2016.
//  Copyright © 2016 Palfi Ltd. All rights reserved.
//

import Cocoa
import PlainPing

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate {

    @IBOutlet weak var statusMenu: NSMenu!
    
    let statusItem = NSStatusBar.system().statusItem(withLength:NSVariableStatusItemLength)
    @IBAction func quitClicked(_ sender: NSMenuItem) {
        NSApplication.shared().terminate(self)
    }
    
    func ping() {
        PlainPing.ping("www.google.com", withTimeout: 1.0, completionBlock: { (timeElapsed:Double?, error:Error?) in
            if let latency = timeElapsed {
                self.statusItem.title = "\(String(format: "%.0f", latency))ms"
            }
            
            if let error = error {
                print(error)
                self.statusItem.title = "error"
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + .seconds(2), execute: {
                self.ping();
            })
        })
    }

    func applicationDidFinishLaunching(_ aNotification: Notification) {
        let icon = NSImage(named: "statusIcon")
        icon?.isTemplate = true // best for dark mode
        statusItem.image = icon
        statusItem.menu = statusMenu
        self.ping();
    }

    func applicationWillTerminate(_ aNotification: Notification) {
        // Insert code here to tear down your application
    }


}

