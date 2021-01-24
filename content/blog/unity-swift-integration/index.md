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

At the time of writing this, there is no available sample that demonstrates how
to integrate Unity as library into a SwiftUI iOS application. This blog post
shares my solution to the problem hoping it can help others.

<!--more-->

<video autoplay loop muted playsinline src="result.mp4" style="max-height: 800px; display: block; margin: auto"></video>

## Introduction

This blog post will be less graphics-oriented than the usual ones. However, it's
still related to rendering and I believe it could help the community, so why
shouldn't I write it :)

When I first tried to integrate Unity into an iOS native app, I had a few goals in mind that needed a little more than what I could at the time on StackOverflow and public samples.

This article will describe how to:

* Integrate Unity with the new SwiftUI framework
* Add native UI views overlaying Unity's rendering
* Communicate _efficiently_ data from Unity to the native side
* Communicate _efficiently_ data from the native side to Unity

Spoiler alert: the last bullet point doesn't use [sendMessageToGOWithName()](hhttps://docs.unity3d.com/Manual/UnityasaLibrary-iOS.html)!

The entire code reference in this blog post is avaiable in
[this repository](https://github.com/DavidPeicho/unity-swiftui-example).

## Build

### iOS Example App

The iOS app will be your SwiftUI app in which your Unity game is integrated. We
are going to create a new one right one, but you can obviously re-use one you
already have.

TODO: insert image

### Unity Project Generation

We need to generate a XCode project from Unity. This project will generate the `UnityFramework` framework described in the [doc](https://docs.unity3d.com/Manual/UnityasaLibrary-iOS.html).

In my [available sample](https://github.com/DavidPeicho/unity-swiftui-example),
I exported the project at `unityapp/Build/iOS`.

### Workspace

In order to easily share code between those two projects, we are going to
create an XCode workspace.

Simply create a workspace and reference your Unity project as well as your example
app.

## Integrate Unity

Now that our projects are linked together, we would like to start Unity from
the native application. The process is highly detailed in the
[Unity as a library integration repository](https://github.com/Unity-Technologies/uaal-example/blob/master/NativeiOSApp/NativeiOSApp/MainViewController.mm).

{{< hint warning >}}

Note that only one instance can live in your entire process. If you completely
kill this instance, there will be no way to start it again.

{{< /hint >}}

Let's start first by writing a singleton that will manage the Unity instance:

_UnityBridge.swift_

```swift
class UnityBridge: UIResponder, UIApplicationDelegate, UnityFrameworkListener {
    private static var instance: UnityBridge?

    /// UnityFramework instance
    private let ufw: UnityFramework

    /// UnityFramework root view
    public var view: UIView? { ufw.appController()?.rootView }

    public static func getInstance() -> UnityBridge {
        if UnityBridge.instance == nil {
            UnityBridge.instance = UnityBridge()
        }
        return UnityBridge.instance!
    }

    /// Loads the UnityFramework  from the bundle path
    ///
    /// - Returns: The UnityFramework instance
    private static func loadUnityFramework() -> UnityFramework? {
        let bundlePath: String = Bundle.main.bundlePath + "/Frameworks/UnityFramework.framework"
        let bundle = Bundle(path: bundlePath)
        if bundle?.isLoaded == false {
            bundle?.load()
        }

        let ufw = bundle?.principalClass?.getInstance()
        if ufw?.appController() == nil {
            let machineHeader = UnsafeMutablePointer<MachHeader>.allocate(capacity: 1)
            machineHeader.pointee = _mh_execute_header
            ufw!.setExecuteHeader(machineHeader)
        }
        return ufw
    }

    override internal init() {
        ufw = UnityBridge.loadUnityFramework()!
        ufw.setDataBundleId("com.unity3d.framework")
        api = API()
        super.init()

        ufw.register(self)
        FrameworkLibAPI.registerAPIforNativeCalls(api)

        ufw.runEmbedded(withArgc: CommandLine.argc, argv: CommandLine.unsafeArgv, appLaunchOpts: nil)
    }

    /// Notifies the UnityFramework to show the window, and append the Unity view
    /// to the given controller
    ///
    /// - Parameter controller: Controller that will host the Unity view
    public func show(controller: UIViewController) {
        ufw.showUnityWindow()
        if let view = self.view {
            controller.view?.addSubview(view)
        }
    }

    /// Unloads the Unity framework
    ///
    /// ## Notes
    ///
    /// * Unloading doesn't seem to free memory, or it's not picked up by the XCode dev tools.
    /// * Unloading isn't synchronous, and this object will be notified in the `unityDidUnload` method
    public func unload() {
        ufw.unloadApplication()
    }

    /// Triggered by Unity via `UnityFrameworkListener` when the framework unloaded
    internal func unityDidUnload(_: Notification!) {
        ufw.unregisterFrameworkListener(self)
        UnityBridge.instance = nil
    }
}
```

The `UnityBridge` class is used to:

* Load the UnityFramework at runtime, i.e., open the `UnityFramework.framework` file,
and get the exported instance
* Run the Unity instance
* Show the Unity instance on the phone

Just keep in mind that the `unityDidUnload()` is triggered by Unity when the
framework is unloaded. This is possible because we first register our `UnityBridge`
object as a delegate with the call:

```swift
ufw.register(self)
```

Let's try our wrapper to ensure it's properly working and that we can display
the Unity view. We are going to display our game in the background, and overlay
some text made with the SwiftUI framework.

Let's first modify the default `ContentView.swift` file:

_ContentView.swift_

```swift
import SwiftUI

struct MyViewController: UIViewControllerRepresentable {
    func makeUIViewController(context _: Context) -> UIViewController {
        let vc = UIViewController()
        let unity = UnityBridge.getInstance()
        unity.show(controller: vc)
        return vc
    }

    func updateUIViewController(_: UIViewController, context _: Context) {
      // Empty.
    }
}

struct ContentView: View {
    var body: some View {
        ZStack {
            MyViewController()
            Text("This text overlays Unity!")
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
```

Let's run the native app and appreciate the result:

@todo: insert image

As you can see, Unity doesn't display **anything**. However, looking at the
console we can see it running.

It looks like Unity needs some delay before we can show it. I haven't figure
out why yet. Maybe they re-create a view asynchroneously, but I can't tell for
now. I will definitely update this blog post whenever I find the answer.

In the meantime, you can fix this issue by adding a small delay on the main thread:

_ContentView.swift_

```swift
struct MyViewController: UIViewControllerRepresentable {
    func makeUIViewController(context _: Context) -> UIViewController {
        let vc = UIViewController()
        let unity = UnityBridge.getInstance()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            unity.show(controller: vc)
        }
        return vc
    }
    ...
}

...
```

{{< image src="unity-with-overlay.jpg" >}}

Okay, you may think that this is **gross** and you are right. A hack like this
doesn't seem right, and I feel you: I don't want anything like that in production.

For my use case, this isn't too much of an issue. Basically, I need to expose
an API from Unity that would allow the native iOS app to query vertices, to
update some meshes, etc... Obviously, such an API shouldn't be available before
the appropriate GameObjects are instanciated and ready to be queried / modified.

This is where my simple solution to this problem comes from. Instead of using
a made up delay like that, I am going to only assumes Unity is ready when my
scene and all the gameobjects are ready. When they are, the code on th
Unity side will notify the native app that it can start showing and that the API
is available.

Before looking at my solution, let's look at how we can communicate data from
Unity scripts to native code.

## Communication: Unity to Native

Calling some native code from Unity can be done using
[Foreign Function Interface (FFI)](https://en.wikipedia.org/wiki/Foreign_function_interface).

All we have to do is to expose a function. Fortunately for us, the Unity code
and the native code runs in the same process in the end. In order to be sure
our function don't get mangled, we will simply need to annotate those function
as `extern C`.

Let's create two new files in the Unity app, in the folder `Assets/Plugins/iOS/`.
After updating this file, you will need to re-build the Unity app. However, you can directly modify the XCode generated project if you want to iterate faster.

_NativeCallProxy.h_

```objectivec
@protocol NativeCallsProtocol
@required
- (void) onUnityStateChange:(const NSString*) state;
// other methods
@end

__attribute__ ((visibility("default")))
@interface FrameworkLibAPI : NSObject
+(void) registerAPIforNativeCalls:(id<NativeCallsProtocol>) aApi;

@end
```

_NativeCallProxy.mm_

```objectivec
#import <Foundation/Foundation.h>
#import "NativeCallProxy.h"

@implementation FrameworkLibAPI

id<NativeCallsProtocol> api = NULL;
+(void) registerAPIforNativeCalls:(id<NativeCallsProtocol>) aApi
{
    api = aApi;
}

@end

extern "C" {

  // Functions listed here are available to Unity. When called,
  // they forward the call to the `api` delegate.
  //
  // You should also perform data transformation here, from
  // C data struct to Objective-C **if needed**.

  void
  sendUnityStateUpdate(const char* state)
  {
      const NSString* str = @(state);
      [api onUnityStateChange: str];
  }

}
```

The function `registerAPIforNativeCalls()` saves the reference of an object
implementing the `NativeCallProtocol`. It means that we have a reference to
an object that has the method `onUnityStateChange()`.

The `sendUnityStateUpdate()` function is in charge of forwarding
the call to the object containing the `onUnityStateChange()` method.

On the Unity side, our code will thus call `sendUnityStateUpdate()`, that will
forward the call to `onUnityStateChange()` on a target.

Let's create a new C# script that will demonstrate how to call this function:

_API.cs_

```csharp
using System;
using System.Collections;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using UnityEngine.UI;
using UnityEngine;
using AOT;

/// <summary>
/// C-API exposed by the Host, i.e., Unity -> Host API.
/// </summary>
public class HostNativeAPI {
    [DllImport("__Internal")]
    public static extern void sendUnityStateUpdate(string state);
}

public class API : MonoBehaviour
{
    void Start()
    {
        #if UNITY_IOS
        if (Application.platform == RuntimePlatform.IPhonePlayer) {
            HostNativeAPI.sendUnityStateUpdate("ready");
        }
        #endif
    }
}
```

{{< hint info >}}

Don't forget to add this script component to an empty gameobject. This gameobject
will be in charge of registering your global API.

{{< /hint >}}

The line:

```csharp
public static extern void sendUnityStateUpdate(string state);
```

Let the compiler knows that this function will be created somewhere, after
linking occurs.

For now, this script calls the `sendUnityStateUpdate()` functions that will
then forward that to a listener.

Congratulations, you just made your first native call from a Unity script!

{{< hint info >}}

Alternatively, you could also just export functions that will be
available to the Unity side, without going through all the `FrameworkLibAPI` code.

However, I like this implementation so I can add glue code between the
C data and the Objective-C one.

{{< /hint >}}

## Communication: Native to Unity

It often happens that the native side needs to control or get data from Unity.
However, the only API exposed by the `UnityFramework` instance is the
[sendMessageToGOWithName()](https://docs.unity3d.com/Manual/UnityasaLibrary-iOS.html) function.

This is **not** good. The only parameter data you can forward is a string.

That's nice, but what happens if I need to send a vertex buffer? Something heavy?

For my use case, I have a lot of heavy data and assets I want Unity to access
without copy. I decided to re-use what we did in the
[Unity to native section](communication-unity-to-native) to achieve that.

The idea is simple. We call a function from the native app, and we give it as
an argument a function pointer on the Unity side. The native app can save this
function pointer and call freely whenever it want.

Obviously, both need to communicate using pointers, C `struct` and primitive
types. But those are all you need to achieve a good communication system.

Let's modify the Objective-C to expose such a function:

_NativeCallProxy.h_

```objectivec
typedef void (*TestDelegate)(const char* name);

@protocol NativeCallsProtocol
@required
...
- (void) onSetTestDelegate:(TestDelegate) delegate;
@end

...
```

_NativeCallProxy.mm_

```objectivec
extern "C" {

  ...

  void
  setTestDelegate(TestDelegate delegate)
  {
      [api onSetTestDelegate: delegate];
  }

}
```

Same as before! Except here, we forward a function pointer to the native side.
The function pointer points to a function declared in your Unity script. Isn't
that amazing!

Our Unity script should also be modified consequently:

```csharp
public class HostNativeAPI {

    ...

    public delegate void TestDelegate(string name);

    [DllImport("__Internal")]
    public static extern void setTestDelegate(TestDelegate cb);

}

/// <summary>
/// C-API exposed by Unity, i.e., Host -> Unity API.
/// </summary>
public class UnityNativeAPI {

    [MonoPInvokeCallback(typeof(HostNativeAPI.TestDelegate))]
    public static void test(string name) {
        Debug.Log("This static function has been called from iOS!");
        Debug.Log(name);
    }

}


public class API : MonoBehaviour
{
    void Start()
    {
        #if UNITY_IOS
        if (Application.platform == RuntimePlatform.IPhonePlayer) {
            HostNativeAPI.setTestDelegate(UnityNativeAPI.test);
            HostNativeAPI.sendUnityStateUpdate("ready");
        }
        #endif
    }
}
```

Finally, we can modify our `API` class to first save this function pointer,
and expose it nicely to our developers:

```UnityBridge.swift
class API: NativeCallsProtocol {

    ...

    /// Function pointer pointing to a static function in Unity
    private var testCallback: TestDelegate!

    /// API simply calling the function declared in the Unity script
    public func test(_ value: String) {
        testCallback(value)
    }
}
```

Developers will now be able to call this function using:

```swift
UnityBridge.getInstance().api.test("this works so well!");
```

What we achieved here is quite powerful. You can now create more advanced
functions that will perform data share or copy.

As an example, your `API` could read vertices using an [UnsafePointer](https://developer.apple.com/documentation/swift/unsafepointer), but return an array of float for your developers.

## Fix Unity Not Showing Up

Coming back to the issue about how I _"fixed"_ the Unity framework not showing
up.

I basically wait until everything is ready in Unity to send this `"ready"`
messsage. The native code receives the call, and proceeds to start showing Unity.
This way, I can ensure that there is a delay between the loading of the framework
and the display. Moreover, this also ensures that a developer will not attempt
to use an API that wouldn't fully initialized.

On the iOS side, you can create a class containing all the method that can be
triggered from the Unity side:

UnityBridge.swift_

```swift
class API: NativeCallsProtocol {
    internal weak var bridge: UnityBridge!

    /**
        Internal methods are called by Unity

        This object is registered as a listener of those calls using `FrameworkLibAPI.registerAPIforNativeCalls(api)`.
        Those calls are forwarded from Unity to the native app
     */

    internal func onUnityStateChange(_ state: String) {
        switch state {
        case "ready":
            bridge.unityGotReady()
        default:
            return
        }
    }
}

class UnityBridge: UIResponder, UIApplicationDelegate, UnityFrameworkListener {
    public internal(set) var isReady: Bool = false

    public var api: API

    public var onReady: () -> Void = {}

    ...

    override internal init() {
        ufw = UnityBridge.loadUnityFramework()!
        ufw.setDataBundleId("com.unity3d.framework")
        api = API()

        super.init()

        api.bridge = self
        ufw.register(self)
        // This calls register the `api` object. Once registered, Unity call
        // will be forwarded to the `api` instance.
        FrameworkLibAPI.registerAPIforNativeCalls(api)

        ufw.runEmbedded(withArgc: CommandLine.argc, argv: CommandLine.unsafeArgv, appLaunchOpts: nil)
    }

    public func show(controller: UIViewController) {
        if isReady {
            ufw.showUnityWindow()
        }
        if let view = self.view {
            controller.view?.addSubview(view)
        }
    }

    internal func unityGotReady() {
        isReady = true
        onReady()
    }
}
```

_ContentView.swift_

```swift
struct MyViewController: UIViewControllerRepresentable {
    func makeUIViewController(context _: Context) -> UIViewController {
        let vc = UIViewController()
        UnityBridge.getInstance().onReady = {
            UnityBridge.getInstance().show(controller: vc)
        }
        return vc
    }
    func updateUIViewController(_: UIViewController, context _: Context) {}
}
```

## Going Further

You made it! Don't forget that the entire code presented here is available
in [this repository]([this repository](https://github.com/DavidPeicho/unity-swiftui-example)). Check it out if you have any issue that isn't clear
in this post.

I hope this post can help some people struggling with some integration issues.
I haven't spent too much time on it, so some of my integration code can still
be a bit rough on the edges.

I would recommend readers to improve some parts. For instance, the `UnityBridge`
object could directly be exported from your Unity app. Anyone integrating your Unity app could directly build it and access the API.

There are also corner cases I didn't care to check and fix for now. For instance,
it's technically possible for a developer to use the api before it's available.
The code needs to be improved and made more robust.

If you have any issues, or if you think this post contain mistake, please either:
* Open an issue on my [GitHub repository](https://github.com/DavidPeicho/davidpeicho.github.io)
* Or contact me via [Twitter](https://twitter.com/DavidPeicho)

