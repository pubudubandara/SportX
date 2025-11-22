# SportX

SportX is a React Native app (React Native CLI) for browsing sports leagues, teams, matches and chatting with an integrated Gemini-powered chatbot enriched with TheSportsDB live data.

**Quick test credentials**
- **Username:** `admin`
- **Password:** `admin`

**Important:** Do NOT commit your `.env` file. The repository should include `.env` in `.gitignore`.

## Requirements
- Node.js (LTS recommended)
- Yarn or npm
- React Native CLI toolchain (Android SDK / Xcode for iOS)

## Install dependencies
Using `yarn`:
```
yarn install
```
Or using `npm`:
```
npm install
```

## Environment variables
Create a `.env` file in the project root (this file must NOT be committed). At minimum provide the Gemini API key used by the app:

```
GEMINI_API_KEY=your_gemini_api_key_here
# Example: GEMINI_API_KEY=ya29... (keep secret)
```

The app will pick up `GEMINI_API_KEY` from your `.env` at runtime. Ensure `.env` is listed in `.gitignore`.

## Running the app (Android)
Open a PowerShell terminal and run:

```powershell
npx react-native start
npx react-native run-android
```

## Running the app (iOS)
From macOS with Xcode installed:

```bash
npx react-native start
npx react-native run-ios
```

## Run tests
```
npm test
```
or
```
yarn test
```

## Gemini Chatbot setup notes
- This app uses the Gemini HTTP API. Put your API key into the `.env` file as shown above.
- Keep the key private and do not push `.env` to version control.

## Useful info for developers
- Default selected country: `England` if no country is selected in Profile.
- The Profile screen is the place to change the application-wide selected country (persisted to the app store).
- Team/league images are loaded from TheSportsDB; if large images fail, verify network and fallback placeholders in the UI.

## Contributing
- Open a branch from `chatbot` or `main` for feature work.
- Follow existing code style and theming patterns (use `getColors`/`createStyles` where used).

## Troubleshooting
- If you see issues with the Gemini integration, verify `GEMINI_API_KEY` in your `.env` and check the app's network logs.
- If SafeArea warnings appear, ensure `react-native-safe-area-context` is installed and imports are from that package.

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
