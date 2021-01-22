---
title: "Unity 2020 In SwiftUI App"
date: 2021-01-22
slug: "unity-swiftui-integration"
description: "How to integrate Unity 2020 into a SwiftUI iOS application"
keywords: [ "unity", "graphics", "ios", "swiftui", "swift" ]
tags: [ "graphics", "ios" ]
images: [ "/images/posts/raymarching-2.jpg" ]
draft: false
math: false
---

This blog post will be less graphics-oriented than the usual ones. At the time
of writing, there is however no good solution available that demonstrates how
to integrate Unity as library into a SwiftUI iOS application.

This blog post shares my solution to the problem hoping it can help others.

<!--more-->

## Goals

When I first tried to integrate Unity into an iOS native app, I had a few goals in mind that needed a little more than what I could at the time on StackOverflow and public repositories.

This article will describe how to:

* Integrate Unity with the new SwiftUI framework
* Add native UI view overlaying Unity's rendering
* Communicate _efficiently_ data from Unity to the native side
* Communicate _efficiently_ data from the native side to Unity

The last point is a bit more work than using something like [sendMessageToGOWithName()](hhttps://docs.unity3d.com/Manual/UnityasaLibrary-iOS.html), but comes with
greater powers!

## Build

### iOS Example App

The iOS app will be your SwiftUI app in which your Unity game is integrated. We
are going to create a new one right one, but you can obviously re-use one you
already have.

TODO: insert image

### Unity Project Generation

We need to generate a XCode project from Unity. This project will generate the `UnityFramework` framework described in the [doc](https://docs.unity3d.com/Manual/UnityasaLibrary-iOS.html).

TODO: insert image

### Workspace

In order to easily share code between those two projects, we are going to
create an XCode workspace.

Simply create a workspace and reference your Unity project as well as your example
app.

## Start Unity

Now that our projects are linked together, we would like to start Unity from
the native application. The process is highly detailed in the
[Unity as a library integration repository](https://github.com/Unity-Technologies/uaal-example/blob/master/NativeiOSApp/NativeiOSApp/MainViewController.mm).

{{< hint warning >}}

Note that only one instance can live in your entire process. If you completely
kill this instance, there will be no way to start it again.

{{< /hint >}}

Let's start first by writing a singleton that will manage the Unity instance:

```swift
import Foundation
import UnityFramework

class UnityBridge: UIResponder, UIApplicationDelegate, UnityFrameworkListener {

    private static var instance : UnityBridge?

    private let ufw: UnityFramework

    public static func getInstance() -> UnityBridge {
        if UnityBridge.instance == nil {
            UnityBridge.instance = UnityBridge()
        }
        return UnityBridge.instance!
    }

    private static func loadUnityFramework() -> UnityFramework? {
        let bundlePath: String = Bundle.main.bundlePath + "/Frameworks/UnityFramework.framework"
        let bundle = Bundle(path: bundlePath)
        if bundle?.isLoaded == false {
            bundle?.load()
        }
        let ufw = bundle?.principalClass?.getInstance()
        if ufw?.appController() == nil {
            let machineHeader = UnsafeMutablePointer<MachHeader>
              .allocate(capacity: 1)
            machineHeader.pointee = _mh_execute_header
            ufw!.setExecuteHeader(machineHeader)
        }
        return ufw
    }

    internal override init() {
        self.ufw = UnityBridge.loadUnityFramework()!
        self.ufw.setDataBundleId("com.unity3d.framework")
        self.api = API()

        super.init()

        self.api.bridge = self
        self.ufw.register(self)
        ufw.runEmbedded(withArgc: CommandLine.argc, argv: CommandLine.unsafeArgv, appLaunchOpts: nil)
    }

    public func show(controller: UIViewController) {
        self.ufw.showUnityWindow()
        if let view = self.ufw.appController()?.rootView {
            controller.view?.addSubview(view)
        }
    }

    public func unload() {
        self.ufw.unloadApplication()
    }

    internal func unityDidUnload(_ notification: Notification!) {
        ufw.unregisterFrameworkListener(self)
        UnityBridge.instance = nil
    }

}
```
