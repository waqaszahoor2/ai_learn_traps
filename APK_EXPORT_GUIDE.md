# APK Export & Production Build Instructions

Since this environment cannot generate a signed Android APK directly due to system restrictions/execution policies, follow these steps to export the Production APK on your local machine.

## Prerequisites
-   **Expo Account**: [Sign up here](https://expo.dev/signup)
-   **EAS CLI**: Install via `npm install -g eas-cli`
-   **Login**: Run `eas login`

## Option 1: Cloud Build (Easiest)
This manages the build via Expo's cloud servers.

1.  **Navigate to Mobile Folder**:
    ```powershell
    cd mobile
    ```

2.  **Run Build Command**:
    ```powershell
    eas build -p android --profile production
    ```

3.  **Wait & Download**:
    -   The CLI will give you a link to track the build.
    -   Once finished, you will receive a direct link to download the `.apk` file.

## Option 2: Local Build (Advanced)
If you have Android Studio and Java installed:

1.  **Navigate to Mobile Folder**:
    ```powershell
    cd mobile
    ```

2.  **Prebuild**:
    ```powershell
    npx expo prebuild
    ```

3.  **Build with Gradle**:
    ```powershell
    cd android
    ./gradlew assembleRelease
    ```

4.  **Locate APK**:
    The file will be at `mobile/android/app/build/outputs/apk/release/app-release.apk`.

---
## Final Testing Checklist

Before distributing, verify:
1.  **Backend Connectivity**: Ensure your Production APK points to a real server URL, not `localhost` or `10.0.2.2`. 
    -   *Action*: Edit `src/api.ts` to replace `http://10.0.2.2:8000` with your deployed backend URL.
2.  **Permissions**: React Native default permissions should suffice for this app.
3.  **Assets**: Ensure all icons/images in `assets/` are correctly sized.

**Ready for Launch!** 🚀
