---
title: "Unity 2021 - SwiftUI Integration, Revisited!"
date: 2021-12-22
slug: "unity-swiftui-integration-revisited"
description: "How to integrate Unity 2021 into a SwiftUI iOS application in a sweet way"
keywords: [ "unity", "graphics", "ios", "swiftui", "swift" ]
tags: [ "unity", "ios", "swiftui" ]
images: [ "/images/posts/unityswiftui-revisited.jpg" ]
draft: false
math: false
---

Earlier this year, I wrote a [first blog post]({{<ref "/blog/unity-swift-integration" >}}) explaining how to integrate easily **Unity** in a **SwiftUI** application.

I am now back with a **(much)** better [solution](https://github.com/DavidPeicho/unity-swiftui-example/tree/main) than what I introduced earlier.

<!--more-->

<video autoplay loop muted playsinline src="demo.mp4" style="max-height: 800px; display: block; margin: auto"></video>

{{< hint warning >}}

**Please note**: I want to stress out that I am a graphics programmer and **not** a
Swift developer. The solution proposed here is what I came up with after
investigating our Unity+SwiftUI integration.

This solution might be wrong, but I am yet to find something that works better.

If you think there is a better way to do that, please reach out to me so I can
update this blog post, as well as my own integration code :)
{{< /hint >}}

## Demo

I put together a sample you can use as-is. It's available on [here](https://github.com/DavidPeicho/unity-swiftui-example/tree/main), my GitHub.

The [README.md](https://github.com/DavidPeicho/unity-swiftui-example/blob/main/README.md) file is detailed and will guide you through the steps to run the demo.

## SwiftUI + Unity: Problem

If you try to run Unity the way the initial sample did, you might end up with the window created by Unity
on top of the `UIWindow` created by SwiftUI:

{{< image src="unity-covering-ui.png" >}}

You can see above the Unity window in **red**, and the window for our UI in **orange**. As expected,
the result is a screen with only the Unity view visible:

{{< image src="unity-but-no-ui.jpg" >}}

However, you are a smart programmer! You decide to change the **z-ordering** of the Unity window
to be in the background. You figure out a way, and you think it's really nice! (heuuu):

```swift
struct ContentView: View {
    var body: some View {
        ZStack {
            Text("This text overlaps Unity!").onAppear {
                let api = UnityBridge.getInstance()
                api.show()
                if let window = api.view?.window {
                    // Yeah, that's... hacky... but you know, when
                    // you are out of options, you do what you can :)
                    window.windowLevel = .normal - 10000.0
                }
            }
        }
    }
}
```

annnnnnnnnnnnnnd.... that doesn't work :')

{{< image src="ui-in-front-doesnt-work.jpg" >}}

But again, you are a smart programmer and you are resourceful. SwiftUI views are wrapped into
a `UIHostingController`, and that the associated view isn't transparent.

You have the **perfect** idea, why not go for another beautiful hack:

```swift
struct ContentView: View {
    var body: some View {
        ZStack {
            Text("This text overlaps Unity!").onAppear {
                let api = UnityBridge.getInstance()
                api.show()
                if let window = api.view?.window {
                    // Set Unity drawing order to a lower number.
                    window.windowLevel = .normal - 10000.0
                    // Updates the background of the UIHostingView.
                    let windowUI = UIApplication.shared.windows[1]
                    if let controller = windowUI.rootViewController {
                        controller.view.isOpaque = false
                        controller.view.backgroundColor = UIColor(
                            red: 0, green: 0, blue: 0, alpha: 0.0
                        )
                    }
                }
            }
        }
    }
}
```

Here, you are basically taking the window of our SwiftUI hierarchy, and changing the
background of the root view to transparent.

But does that even work?

{{< image src="working-example.jpg" >}}

It **works**!

Wait... the cube is supposed to stop spinning when there is a touch event... Touch events aren't forwarded to the Unity view!

Fortunately, there might be a **clean** way to do all of that. Let's have a look together!

## SwiftUI + Unity: Solution

To sum up our issues:
* The `UIHostingController` view isn't transparent by default
* Events aren't sent to the Unity window

To fix those issues, we will need to generate our own `UIHostingController` and to
add it to a custom `UIWindow` instance. We will override the [hitTest](https://developer.apple.com/documentation/uikit/uiview/1622469-hittest) method of the UI window to allow events to go through it to reach the Unity window.

In order to easily customize the window, we will bring back the `AppDelegate` and `SceneDelegate`!

### UIKit Lifecycle

The idea is to modify the `SceneDelegate` class in to create the `UIHostingController` that makes
the bridge between `UIKit` and `SwiftUI`.

#### Delete previous 'main' entry point

Start by removing the `main` annotation from your `App`:

```swift
@main
struct sandboxApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

becomes

```swift
// Just remove it you aren't going to need it :)
// If you want to keep it as a view, simply remove the `@main` annotation.
```

#### Create the `AppDelegate` class

{{< expand AppDelegate.swift >}}

```swift
import UIKit

@main
class AppDelegate: NSObject, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        return true
    }

    func application(
        _ application: UIApplication,
        configurationForConnecting connectingSceneSession: UISceneSession,
        options: UIScene.ConnectionOptions
    ) -> UISceneConfiguration {
        // You need to create the `SceneDelegate` class
        // for this to work.
        let sceneConfig = UISceneConfiguration(
            name: nil,
            sessionRole: connectingSceneSession.role
        )
        sceneConfig.delegateClass = SceneDelegate.self
        return sceneConfig
    }
}
```

{{< /expand >}}

#### Create the `SceneDelegate` class

{{< expand SceneDelegate.swift >}}

```swift
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(
        _ scene: UIScene,
        willConnectTo session: UISceneSession,
        options connectionOptions: UIScene.ConnectionOptions
    ) {
        if let windowScene = scene as? UIWindowScene {
            // Creates the bridge between UIKit and SwiftUI.
            // This is done automatically when not using an `App`.
            let vc = UIHostingController(rootView: ContentView())
            // Sets the UIHostingView to transparent so we can see
            // the Unity window behind it.
            vc.view.isOpaque = false
            vc.view.backgroundColor = UIColor(
                red: 0,
                green: 0,
                blue: 0,
                alpha: 0.0
            )

            self.window = UIWindow(windowScene: windowScene)
            self.window!.windowLevel = .normal + 100.0
            self.window!.rootViewController = vc
            self.window!.makeKeyAndVisible()
        }
    }

    func sceneDidDisconnect(_ scene: UIScene) {}

    func sceneDidBecomeActive(_ scene: UIScene) {}

    func sceneWillResignActive(_ scene: UIScene) {}

    func sceneWillEnterForeground(_ scene: UIScene) {}

    func sceneDidEnterBackground(_ scene: UIScene) {}
}
```

{{< /expand >}}

You should now expect the same result as what we got with our hacks:

{{< image src="working-example.jpg" >}}

{{< hint warning >}}

Changing the app structure like that required a full rebuild for me.

If your `SceneDelegate` isn't triggered (and you connected it!), just try
to delete the application and do a complete build.

{{< /hint >}}

### Event Forwarding

For the events, we will mark our `UIHostingController`'s view with a special tag (**identifier*)
that will be used to know when the UI window should ignore an event or not.

{{< image src="passthrough.jpg" >}}

Let's have a look at the above screenshot. The **red** area represents our `UIHostingController`'s view.
The **green** area represents the normal UI views that will catch gestures. What we want is basically to
ignore the events when they are reaching the `UIHostingController`'s view.

Let's create a custom `UIWindow` where we will implement this logic. Create a new class called `UIWindowCustom`:

{{< expand UIWindowCustom.swift >}}

```swift
/// Custom Window class used to allow events to pass through
/// depending on what view is targeted.
///
/// Because our application is multi-windows, this is useful to allow event
/// to go through
class UIWindowCustom: UIWindow {

    /// The tag is used to identify the view during `hitTest`.
    ///
    /// - Note:
    /// Be careful not to share this tag with other views that shouldn't act as passthroughs.
    public static let PassthroughTag = 999999

    override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
        guard let view = super.hitTest(point, with: event) else {
            return nil
        }
        if view.tag == UIWindowCustom.PassthroughTag {
            // Propagates event that are caught by passthrough views.
            return nil
        }
        // Do not propagate events, we reached a "normal" view.
        return view
    }

}
```

{{< /expand >}}

Now, all we need to do is to use this custom window for our SwiftUI hierarchy. You will thus
need to replace the line (in the `SceneDelegate` class):

```swift
self.window = UIWindow(windowScene: windowScene)
```

by

```swift
self.window = UIWindowCustom(windowScene: windowScene)
```

In addition, you also need to tag the background view as a passthrough:

```swift
let vc = UIHostingController(rootView: ContentView())

...

// Tags the background UI view in order to let event flow
// to the Unity window.
vc.view.tag = UIWindowCustom.PassthroughTag
```

And voila!

<video autoplay loop muted playsinline src="event-example.mp4" style="max-height: 800px; display: block; margin: auto"></video>

{{< hint info >}}

I changed the text by a color picker for the demo in order
to have a view with meaningful interactions.

{{< /hint >}}

* The cube stops spinning on the Unity side when a touch event
  is received
* The color picker is done on the SwiftUI side and the events
  are processed correctly

## Improved Build

We have seen how to fix our drawing and gesture issues, but we haven't talked
about smoothing our build workflow.

If you read the previous blog post, you must already be annoyed with something: Each time we make a new build, we have to manually update the visible of our bridging header **and** the target membership of the data folder.

This is okay if you build twice, but it's absolutely not okay in any real world scenario.

We will fix that by using a `BuildPostprocessor`. Let's create a file called `AutoBuilder.cs`:

{{< image src="autobuilder-folder.jpg" >}}

{{< expand AutoBuilder.cs >}}

```cs
/// <summary>
/// This class will update the generated XCode configuration.
///
/// This is used to automate some manual steps that we keep
/// doing over-and-over when building.
/// </summary>
public static class AutoBuilder
{
    private static string MODULE_MAP = "UnityFramework.modulemap";
    private static string INTERFACE_HEADER = "NativeCallProxy.h";

    /// <summary>
    /// Retrieves the name of the project
    /// </summary>
    static string GetProjectName()
    {
        string[] s = Application.dataPath.Split('/');
        return s[s.Length - 2];
    }

    static string[] GetScenePaths()
    {
        string[] scenes = new string[EditorBuildSettings.scenes.Length];
        for(int i = 0; i < scenes.Length; i++)
        {
            scenes[i] = EditorBuildSettings.scenes[i].path;
        }
        return scenes;
    }
    [MenuItem("File/AutoBuilder/iOS")]
    static void PerformiOSBuild()
    {
        EditorUserBuildSettings.SwitchActiveBuildTarget(BuildTargetGroup.iOS, BuildTarget.iOS);
        BuildPipeline.BuildPlayer(GetScenePaths(), "Build/iOS", BuildTarget.iOS, BuildOptions.None);
    }

    [PostProcessBuild]
    public static void OnPostProcessBuild(BuildTarget buildTarget, string path)
    {
        switch (buildTarget)
        {
            case BuildTarget.iOS:
            {
                var xcodePath = path + "/Unity-Iphone.xcodeproj/project.pbxproj";
                var proj = new PBXProject();
                proj.ReadFromFile(xcodePath);

                var targetGuid = proj.GetUnityFrameworkTargetGuid();

                proj.SetBuildProperty(targetGuid, "COREML_CODEGEN_LANGUAGE", "Swift");
                proj.SetBuildProperty(targetGuid, "SWIFT_VERSION", "5.0");
                proj.AddBuildProperty(targetGuid, "ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES", "NO");
                proj.SetBuildProperty(targetGuid, "EMBEDDED_CONTENT_CONTAINS_SWIFT", "YES");
                proj.SetBuildProperty(
                    targetGuid,
                    "FRAMERWORK_SEARCH_PATHS",
                    "$(inherited) $(PROJECT_DIR) $(PROJECT_DIR)/Frameworks"
                );
                proj.SetBuildProperty(targetGuid, "DEFINES_MODULE", "YES");

                // Adds the data folder to the Unity target.
                // This is basically the manual step we were doing before!
                var dataGUID = proj.FindFileGuidByProjectPath("Data");
                proj.AddFileToBuild(targetGuid, dataGUID);

                /**
                 * Module Map
                 */

                var moduleFileName = "UnityFramework/UnityFramework.modulemap";
                var moduleFile = path + "/" + moduleFileName;
                if (!File.Exists(moduleFile))
                {
                    FileUtil.CopyFileOrDirectory("Assets/Plugins/iOS/" + AutoBuilder.MODULE_MAP, moduleFile);
                    proj.AddFile(moduleFile, moduleFileName);
                    proj.AddBuildProperty(targetGuid, "MODULEMAP_FILE", "$(SRCROOT)/" + moduleFileName);
                }

                /**
                 * Headers
                 */

                // Sets the visiblity of our native API header.
                // This is basically the manual step we were doing before!
                var unityInterfaceGuid = proj.FindFileGuidByProjectPath("Libraries/Plugins/iOS/" + AutoBuilder.INTERFACE_HEADER);
                proj.AddPublicHeaderToBuild(targetGuid, unityInterfaceGuid);

                proj.WriteToFile(xcodePath);
                break;
            }
        }
    }
}
```

{{< /expand >}}

The code:

* Sets the appropriate Swift Compiler **flags**
* Adds the *'Data'* folder to the Unity target
* Sets the visibility of the communication header to `public`

I also introduced a new file: `UnityFramework.modulemap`. This is used
to map `#include` to a module import. For more information about what
modulemaps are, please refer to the [Clang LLVM documentation](https://clang.llvm.org/docs/Modules.html). With this file,
it's now possible to easily use our `NativeCallProxy` in swift without a bridging header.

Because everything is automatically copied and setup during the Unity build, you should
now remove the bridging header we created during the previous blog post. You need to:

* Remove the file `NativeCallProxy-Bridging-Header.h`
* Remove the header entry from the XCode target **Build Settings Tab**

That's it!

With this code, you basically have an already setup build, ready to be used :)

From now on, each time you build your Unity project, you simply need to re-build your xcode project,
isn't that futuristic? **2022 is coming**.

## Improved Communication

For the communication, I decided to make a trade-off between
simplicity and performance.

Basically, I have two different kind of communications:
* JSON messaging
* Function pointers

### Messaging: JSON

For my use case, I have a good **99%** of my API points that are called only one time or less per minute, with only a **few kilobytes** per messages.

Why would I bother with FFI and wrapping those APIs when I can just exchange simple JSON data?

On Unity's side, I have a [script](https://github.com/DavidPeicho/unity-swiftui-example/blob/main/unityapp/Assets/Scripts/API.cs) that handles all my JSON APIs:

{{< expand API.cs >}}

```cs
/// <summary>
/// This structure holds the type of an incoming message.
/// Based on the type, we will parse the extra provided data.
/// </summary>
public struct Message
{
    public string type;
}

/// <summary>
/// This structure holds the type of an incoming message, as well
/// as some data.
/// </summary>
public struct MessageWithData<T>
{
    [JsonProperty(Required = Newtonsoft.Json.Required.AllowNull)]
    public string type;

    [JsonProperty(Required = Newtonsoft.Json.Required.AllowNull)]
    public T data;
}

public class API : MonoBehaviour
{
    public GameObject cube;

    void ReceiveMessage(string serializedMessage)
    {
        var header = JsonConvert.DeserializeObject<Message>(
            serializedMessage
        );
        switch (header.type) {
            case "change-color":
                _UpdateCubeColor(serializedMessage);
                break;
            default:
                Debug.LogError(
                    "Unrecognized message '" + header.type + "'"
                );
                break;
        }
    }

    private void _UpdateCubeColor(string serialized)
    {
        var msg = JsonConvert.DeserializeObject<MessageWithData<float[]>>(
            serialized
        );
        if (msg.data != null && msg.data.Length >= 3)
        {
            var color = new Color(msg.data[0], msg.data[1], msg.data[2]);
            var renderer = cube.GetComponent<MeshRenderer>();
            renderer?.sharedMaterial?.SetColor("_Color", color);
        }
    }
}
```

{{< /expand >}}

This is really simple, but gets the job done really nicely! This script
basically reacts to JSON sent by the native side. Those JSON have a really
simple structure:

```json
{
    // Used to know what action to perform when this message is received.
    // For instance, the type could be:
    //     * `change-color` to change the color of the cube
    //     * `scale-mesh` to scale a mesh
    //
    // Anything your API support :)
    "type": "message-identifier",

    // Data associated with this message.
    "data": {}
}
```

### Function Pointers

In the first version of this [blog post]({{<ref "/blog/unity-swift-integration" >}}), I showed how to directly call a function
from the native side.

As a reminder, this was done by calling a native function and passing
the Unity function pointer as an argument.

I still make good use of those for:

* **Functions** that exchange heavy data, such as:
  * vertices
  * image data
  * etc...
* **Functions** that are called several times per frame

Choosing whether you should use function pointers or simple string
messages will be on a per-feature basis.

{{< hint warning >}}

Be **really** careful when calling using function pointers like that.
You might need to synchronize the call to be sure that the user is performing an action at the appropriate lifecycle instant.

{{< /hint >}}

### Swift Abstraction

We don't want other developers (or just ourselves!) to have to use our `NativeCallProxy` header as-is.

One of the improvement I made as well was to distribute a **Swift** safe and friendly API wrapper via the Unity build.

The API wrapper for this demo looks like:

{{< expand API.swift >}}

```swift

/// Serialized structure sent to Unity.
///
/// This is used on the Unity side to decide what to do when a message
/// arrives.
struct MessageWithData<T: Encodable>: Encodable {
    var type: String
    var data: T
}

/// Swift API to handle Native <> Unity communication.
///
/// - Note:
///   - Message passing is done via serialized JSON
///   - Message passing is done via function pointer exchanged between Unity <> Native
public class UnityAPI: NativeCallsProtocol {

    // Name of the gameobject that receives the
    // messages from the native side.
    private static let API_GAMEOBJECT = "APIEntryPoint"
    // Name of the method to call when sending
    // messages from the native side.
    private static let API_MESSAGE_FUNCTION = "ReceiveMessage"

    public weak var communicator: UnityCommunicationProtocol!
    public var ready: () -> () = {}

    /**
        Function pointers to static functions declared in Unity
     */

    private var testCallback: TestDelegate!

    public init() {}

    /**
     * Public API for developers.
     */

    /// Friendly wrapper arround the message passing system.
    ///
    /// - Note:
    /// This wrapper is used to get friendlier API for Swift developers.
    /// They shouldn't have to care about how the color is sent to Unity.
    public func setColor(r: CGFloat, g: CGFloat, b: CGFloat) {
        let data = [r, g, b]
        sendMessage(type: "change-color", data: data)
    }

    public func test(_ value: String) {
        self.testCallback(value)
    }

    /**
     * Internal API.
     */

    public func onUnityStateChange(_ state: String) {
        switch (state) {
        case "ready":
            self.ready()
        default:
            return
        }
    }

    public func onSetTestDelegate(_ delegate: TestDelegate!) {
        self.testCallback = delegate
    }

    /**
     * Private  API.
     */

    /// Internal function sending message to Unity.
    private func sendMessage<T: Encodable>(type: String, data: T) {
        let message = MessageWithData(type: type, data: data)
        let encoder = JSONEncoder()
        let json = try! encoder.encode(message)
        communicator.sendMessageToGameObject(
            go: UnityAPI.API_GAMEOBJECT,
            function: UnityAPI.API_MESSAGE_FUNCTION,
            message: String(data: json, encoding: .utf8)!
        )
    }
}

```

{{< /expand >}}

Because it implements the `NativeCallsProtocol`, you can also directly
use it in the bridge file:

```swift
class UnityBridge:
    UIResponder,
    UIApplicationDelegate,
    UnityFrameworkListener {

    ...

    public let api: UnityAPI

    internal override init() {
        ...

        // The `UnityAPI` is a friendly communication point
        // available to developers that want to communicate
        // with the Unity side!
        self.api = UnityAPI()
        self.api.communicator = self
        self.ufw.register(self)

        FrameworkLibAPI.registerAPIforNativeCalls(self.api)

        ...
    }

    ...

}
```

I like this method because:

* The message identifiers can be hidden from the developer
* The Swift wrapper can freely
    * delay calls
    * cache calls
    * do any intermediary step between Unity and the develop
* We can expose method using Swift objects, like `UIColor`, etc...

In addition, I like to have the API entirely wrapped in the Unity build instead of directly in the application. The exposed API is anyway intrinsic
to the Unity build we are using.

## Going Further

Starting from [Swift 5.5](https://docs.swift.org/swift-book/LanguageGuide/Concurrency.html), the new method attributes `async` and `await`
are available.

What does it mean for us?

We will be able to improve even further the Unity - Swift communication.

Imagine the following use case:
* You send a message from the native side to Unity
* Unity performs an action
* Unity sends a response back

Such a scenario can be handled right now, but the Swift code will become quickly verbose and hard to maintain.
You will end up with a lot of callbacks, nested on potentially multiple levels.

Add to the scenario a couple of calls you need to schedule in a particular
order, and it becomes pain to manage!

With `async` andc `await`, writing asynchronous code and defining the order
of resolution will be a lot simpler. Simple idea to explore...

## Conclusion

You made it! Don't forget that the entire code presented here is available
in [this repository](https://github.com/DavidPeicho/unity-swiftui-example).

I am fairly happy with the result I have now. It works well and nothing magical occurs in the view hierarchy behind my back.

As a sidenote, in my use case the communication is **almost** always
one-sided: from native side to Unity. If you need more complex scenario
with back-and-forth messaging, you might want to spend some time designing
a better communication system.

Hopefully, this blog post is final and this solution can help you as well!
