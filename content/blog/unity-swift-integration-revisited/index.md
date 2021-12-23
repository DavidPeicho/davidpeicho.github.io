---
title: "Unity 2021 - SwiftUI Integration, Revisited!"
date: 2021-12-22
slug: "unity-swiftui-integration-revisited"
description: "How to integrate Unity 2021 into a SwiftUI iOS application in a sweet way"
keywords: [ "unity", "graphics", "ios", "swiftui", "swift" ]
tags: [ "unity", "ios", "swiftui" ]
images: [ "/images/posts/unityswiftui.jpg" ]
draft: false
math: false
---

Earlier this year, I wrote a [first blog post]({{<ref "/blog/unity-swift-integration" >}}) explaining how to integrate easily **Unity** in a **SwiftUI** application.

I was frustrated by how complex it was. Really.

I am now back with a **(much)** better [solution](https://github.com/DavidPeicho/unity-swiftui-example/tree/main). than what I already presented.

<!--more-->

<video autoplay loop muted playsinline src="demo.mp4" style="max-height: 800px; display: block; margin: auto"></video>

{{< hint note >}}

Compared to the previous blog post, I am here building the Unity app in:
`root/UnityBuild`.

You can technically build wherever you want, as long as you link properly
the generated `.xcodeproj` in your workspace.

{{< /hint >}}

{{< hint warning >}}

**Please note**: I want to stress out that I am a graphics programmer and **not** a
Swift developer. The solution proposed here is what I came up with after
investigating our Unity+SwiftUI integration.

This solution might be wrong, but I am yet to find something that works better.

If you think there is a better way to do that, please reach out to me so I can
update this blog post, as well as my own integration code :)
{{< /hint >}}

## Demo

The integration demo is available [here](https://github.com/DavidPeicho/unity-swiftui-example/tree/main).

The [README.md](https://github.com/DavidPeicho/unity-swiftui-example/blob/main/README.md) file is
super detailed and will guide you through how to run the demo.

## SwiftUI + Unity: Problem

If you try to run Unity the way the initial sample did, you might end up with the window created by Unity
on top of the `UIWindow` created by SwiftUI:

{{< image src="unity-covering-ui.png" >}}

You can see above the Unity window in **red**, and the window for our UI in **orange**. As expected,
the result is a screen with only the Unity view visible:

{{< image src="unity-but-no-ui.jpg" >}}

However, you are a smart programer! You decide to change the z-ordering of the Unity window
to be in the background using:

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

But again, you are a smart programer and you are resourceful. You understand that SwiftUI views are wrapped into
something called a UIHostingView, and that this view isn't transparent. You have the **perfect** idea, why not
go for another beautiful hack:

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
background of the root view to transparent. Does that work?

{{< image src="working-example.jpg" >}}

It **works**!

Wait... the cube is supposed to stop spinning when there is a touch event...

Touch events... aren't... **forwarded**.

Fortunately, I found a **clean** way to do all of that. At least, the solution
looks elegant (or good enough) to me to be satisfied. Let's have a look together!

## SwiftUI + Unity: Solution

To sum up our issues:
* The SwiftUI `UIHostingView` isn't transparent by default
* Events aren't sent to the Unity window

To fix those issues, we will need to generate our own `UIHostingView` and to
add it to a custom `UIWindow` instance. We will override the [hitTest](https://developer.apple.com/documentation/uikit/uiview/1622469-hittest) method of the window to allow events to go through and reach the Unity window.

In order to easily customize the window, we will bring back... the `AppDelegate` and `SceneDelegate`!

### UIKit Lifecycle

The idea is to modify the `SceneDelegate` class in order to customize the `UIHostingView` that makes
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
struct sandboxApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
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

    func sceneDidDisconnect(_ scene: UIScene) {
    }

    func sceneDidBecomeActive(_ scene: UIScene) {
    }

    func sceneWillResignActive(_ scene: UIScene) {
    }

    func sceneWillEnterForeground(_ scene: UIScene) {
    }

    func sceneDidEnterBackground(_ scene: UIScene) {
    }
}
```

{{< /expand >}}

Normally, you should see the same result we had earlier:

{{< image src="working-example.jpg" >}}

{{< hint info >}}

Changing the app structure like that required a full rebuild for me.

If your `SceneDelegate` isn't triggered (and you connected it!), just try
to delete the application and do a complete build.

{{< /hint >}}

### Event Forwarding

For the events, we will mark our `UIHostingView` (the view of the `UIHostingController` controller)
with a special tag (**identifier*) that will be used to know when the UI window should ignore an event or not.

{{< image src="passthrough.jpg" >}}

The **red** area on the above picture represents our `UIHostingView`. The **green** area
represents the normal UI item that will catch gestures, and so prevent propagation to the Unity window.

Let's create a custom `UIWindow` that will let events flow when they are hitting our passthrough.
Create a new class called `UIWindowCustom`:

{{< expand PassthroughView.swift >}}

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
need replace the line:

```swift
self.window = UIWindow(windowScene: windowScene)
```

by

```swift
self.window = UIWindowCustom(windowScene: windowScene)
```

in the `SceneDelegate` class.

Still in the `SceneDelegate` class, you also need to tag the background view as a passthrough:

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

### XCode Auto Setup

If you read the previous blog post, you must already be annoyed with something. Each time
we make a new build, we have to manually update the visible of our bridging header **and** the
target membership of the data folder.

This is okay if you build twice, but it's absolutely not okay in any real world use case.

We will fix that by using a `BuildPostprocessor`. Let's create a file called `AutoBuilder.cs`
into an `Editor` folder:

{{< image src="autobuilder-folder.jpg" >}}

{{< hint info >}}

You are obviously free to choose the folder structure and naming conventions
you prefer!

{{< /hint >}}

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

The code given above:

* Sets the appropriate Swift Compiler flags
* Adds the `Data` folder to the Unity target
* Sets the visibility of the communication header to `public`

{{< /expand >}}

Because everything is automatically copied and setup during the Unity build, you should
now remove the bridging header we created during the previous blog post. You need to:

* Remove the file `NativeCallProxy-Bridging-Header.h`
* Remove the header entry from the XCode target `Build Settings` tab

That's it!

With this code, you basically have an already setup build, ready to be used :)

From now on, each time you build your Unity project, you simply need to re-build your xcode project,
isn't that futuristic? I smell 2022 is nearby.

### Swift NativeCallProxy Wrapper

I haven't had time yet to write this section. For more information, please
have a look at the [repository](https://github.com/DavidPeicho/unity-swiftui-example).

## Improved Communication

I haven't had time yet to write this section. For more information, please
have a look at the [repository](https://github.com/DavidPeicho/unity-swiftui-example).

## Conclusion

You made it! Don't forget that the entire code presented here is available
in [this repository](https://github.com/DavidPeicho/unity-swiftui-example).

I am fairly happy with the result I have now. It works well and nothing magical
occurs in the view / hierarchy tree.

Hopefuly, this blog post is final and this solution can help you as well!
