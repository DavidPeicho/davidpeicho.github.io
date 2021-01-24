---
title: "Unity 2020 In SwiftUI App"
date: 2021-01-22
slug: "unity-swiftui-integration"
description: "How to integrate Unity 2020 into a SwiftUI iOS application"
keywords: [ "unity", "graphics", "ios", "swiftui", "swift" ]
tags: [ "unity", "ios", "swiftui" ]
images: [ "/images/posts/raymarching-2.jpg" ]
draft: false
math: false
---

At the time of writing, there is no available sample that demonstrates how
to integrate Unity as library into an iOS application based on SwiftUI. This blog post
shares [my solution](https://github.com/DavidPeicho/unity-swiftui-example) to the problem hoping it can help others.

<!--more-->

<video autoplay loop muted playsinline src="result.mp4" style="max-height: 800px; display: block; margin: auto"></video>

## Introduction

This blog post will be less graphics-oriented than the usual ones. However, it's
still related to rendering and I believe it could help the community, so why
shouldn't I write it :)

When I first tried to integrate Unity into an iOS native app, I had a few goals in mind that needed a little more than what I could at the time on StackOverflow and public samples.

This article will describe how to:

* Integrate Unity with the SwiftUI framework
* Add native UI views overlaying Unity's rendering
* Communicate **efficiently** data from Unity to the native side
* Communicate **efficiently** data from the native side to Unity

Spoiler alert: the last bullet point doesn't use [sendMessageToGOWithName()](hhttps://docs.unity3d.com/Manual/UnityasaLibrary-iOS.html)!

## Build

### iOS Example App

Let's build an iOS application that will host your Unity game. You can either
start from scratch, or skip this step to directly integrate Unity in an existing
app.

Open XCode and create a new iOS application using SwiftUI. Don't forget to
choose the `SwiftUI App` lifecycle.

{{< hint info >}}

You can use any lifecycle you prefer. Obviously, the integration may be slightly
different, but the overall code should remain identical.

{{< /hint >}}

### Unity Project Generation

We need to generate a XCode project from Unity. This project will generate the `UnityFramework` framework described in the [doc](https://docs.unity3d.com/Manual/UnityasaLibrary-iOS.html).

In my [available sample](https://github.com/DavidPeicho/unity-swiftui-example),
I exported the project at `unityapp/Build/iOS`.

### Workspace

In order to easily share code between those two projects, we are going to
create an XCode workspace. Create a workspace and reference your Unity project
as well as your example.

For more information about how to create a workspace and add the `UnityFramework`
as a dependendcy, please have a look at the [example](https://github.com/Unity-Technologies/uaal-example/blob/master/docs/ios.md) from Unity Technologies.

{{< hint info >}}

You don't **have** to create a workspace. You can just add the the Unity framework as a dependency to your native application.

{{< /hint >}}

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

{{< hint info >}}

Thanks to _Simon Tysland_ for sharing the original `UnityEmbeddedSwift.swift`
file that was wrapping the Unity framework management in Swift

{{< /hint >}}

The `UnityBridge` class is used to:

* Load the UnityFramework at runtime, i.e., open the `UnityFramework.framework` file,
and get the exported instance
* Run the Unity instance
* Show the Unity instance on the phone

Just keep in mind that the `unityDidUnload()` method is triggered by Unity when the
framework is unloaded. This is possible because we first register our `UnityBridge`
object as a delegate with the call:

```swift
ufw.register(self)
```

Let's try our wrapper to ensure it's properly working. We are going to display
our game in the background, and overlay some text made with the SwiftUI framework.

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

{{< image src="unity-integration-fail.jpg" >}}

As you can see, Unity doesn't display **anything**. However, looking at the
console we can see it running.

It looks like Unity needs some delay before we can show it. I haven't figure
out why yet. Maybe the framework re-create a view asynchroneously. I can't tell for
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
scene and all the GameObjects are ready. When they are, the code on th
Unity side will notify the native app that it can start showing and that the API
is available.

Before looking at [my solution](#unity-not-showing-up-fix), let's look at how we can communicate data from
Unity scripts to native code.

## Communication: Unity to Native

Calling some native code from Unity can be done using
[Foreign Function Interface (FFI)](https://en.wikipedia.org/wiki/Foreign_function_interface).

All we have to do is to expose the functions we want to call. In order to be sure our functions don't get mangled, we will need to annotate them as `extern C`.

Let's create two new files in the Unity app, in the folder `Assets/Plugins/iOS/`.
After updating those files, you will need to re-build the Unity app.

{{< hint info >}}

For debugging purposes, I would advised to directly modify the XCode generated
project if you want to iterate faster.

You can edit the files in `unityapp/Build/iOS/Libraries/Plugins/iOS`. Those
files are copied by Unity when generating the XCode project.

{{< /hint >}}

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

On the Unity side, our code will call `sendUnityStateUpdate()`. We will specify in
Unity where to find the symbol.

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

HostNativeAPI.sendUnityStateUpdate(string state);

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
[DllImport("__Internal")]
```

Let the compiler knows that this function symbol will be available in the binary
after linking.

Consequently, the `sendUnityStateUpdate()` function is in charge of forwarding
the call to the object containing the `onUnityStateChange()` method.

The last thing we haven't talked about yet is `registerAPIforNativeCalls()`. This
function saves the reference of an object implementing the `NativeCallProtocol`
protocol. This allows us to transfer the calls to an object pointed to by a
user (i.e., developer integrating the Unity app). Every call performed on the
Unity side is forward to this delegate object.

{{< hint info >}}

The code provided above is taken from the [Unity example](https://github.com/Unity-Technologies/uaal-example/blob/master/UnityProject/Assets/Plugins/iOS/NativeCallProxy.mm). This is the way they decided to forward the call.

Alternatively, you could also just export functions that will be
available to the Unity side, without going through all the `FrameworkLibAPI` code.

However, I like this implementation so I can add glue code between the
C data and the Objective-C one.

{{< /hint >}}

Congratulations, you just made your first native call from a Unity script!

All you have to now is to create this delegate that will receives the calls from
Unity. The delegate should implement the `NativeCallProtocol`, and should be
registered on the native side using:

```swift
FrameworkLibAPI.registerAPIforNativeCalls(delegateToRegister)
```

We will anyway create this delegate together in a few sections, as it will be
needed to fix the issue with Unity not showing up.

## Communication: Native to Unity

The native side may need to get data from Unity as well.
However, the only API exposed by the Unity framework is the
[sendMessageToGOWithName()](https://docs.unity3d.com/Manual/UnityasaLibrary-iOS.html) method.

This is **not** good. It only take a string argument.

What happens if I need to send a vertex buffer? Something heavy?

For my use case, I have a lot of heavy data I want Unity to access
without any copy. I decided to re-use what we did in the
[Unity to native section](#communication-unity-to-native) to achieve that.

The idea is simple. We call a function from the native app, and we give it as
an argument a function pointer on the Unity side. The native app can save this
function pointer and call it later.

Obviously, Unity and the native app can only communicate using C data structures:
raw pointers, struct, etc...

Let's modify the Objective-C code to expose such a function:

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

Our Unity script needs to be modified accordingly:

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

Let's finish by modifying our `API` class to save the function pointer, and
provide a nice API to our developers:

__UnityBridge.swift__

```csharp
class API: NativeCallsProtocol {

    ..

    /// Function pointer pointing to a static function in Unity
    private var testCallback: TestDelegate!

    /// API simply calling the function declared in the Unity script
    public func test(_ value: String) {
        testCallback(value)
    }
}
```

You can give it a try to ensure everything is working:

```swift
UnityBridge.getInstance().api.test("this works so well!");
```

What we achieved here is powerful. You can now create more advanced
functions that will share information between both sides.

As an example, your `API` could read vertices using an [UnsafePointer](https://developer.apple.com/documentation/swift/unsafepointer), but return an array of float for your developers.

## Unity Not Showing Up: "Fix"

Coming back to the issue about how I _"fixed"_ the Unity view not showing up.

I decided to use the `sendUnityStateUpdate()` function to inform the native
app when Unity was ready to show up. This way, I can ensure that there is a
delay between the loading of the framework and the display. Moreover, this also
ensures that developers will not attempt to use the API before it's fully initialized.

Let's finally create the delegate that receives call coming from Unity:

_UnityBridge.swift_

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

The above code is an extension of everything we have been doing so far. When
our Unity GameObject API is ready, it will trigger the method `onUnityStateChange()`
of our delegate. This method is used to call the `onReady` callback. Finally,
the callback is used to show Unity. Thus, we separated the instanciation of the
framework and the call to display the Unity view by a delay.

In addition to that, as I said in the beginning of this post, it's important for
me to expose an API to the user only when everything is fully ready on Unity's
side.

## Going Further

You made it! Don't forget that the entire code presented here is available
in [this repository](https://github.com/DavidPeicho/unity-swiftui-example). Check it out if you have any issue that isn't clear in this post.

I hope this post can help people struggling with integration issues. Some of the
ideas presented here can still be a bit rough on the edges.

I would recommend readers to improve some parts. For instance, the `UnityBridge`
object could directly be exported from your Unity app. Anyone integrating your Unity app could directly build it and access the API.

There are also corner cases I didn't care to fix for now:

* It's technically possible for a developer to use the api before it's available.
* `[DllImport ("__Internal")]` will not work properly on some platform where
plugins linking is different. For cross-platform implementation, you will need
specific code path (`#if`)

If you have any issues, or if you think this post contain mistake, please either:
* Open an issue on my [GitHub repository](https://github.com/DavidPeicho/davidpeicho.github.io)
* Or contact me via [Twitter](https://twitter.com/DavidPeicho)
