# DUET Fire TV and controller mode

This change adds an opt-in, remote-first interface to the existing DUET browser game. The regular site remains the default. Open `https://duet.loptrlab.com/?firetv=1#home` to use the TV layout when the updated site is deployed.

## Inputs

- **Fire TV remote or keyboard:** D-pad/arrows move focus, Select/Enter/Space chooses, Play/Pause pauses or resumes, and Back/Escape returns from a match.
- **Standard gamepad:** Gamepad API D-pad or left stick moves focus, A selects, B or the standard Back/Select button returns, and Start/Menu pauses or resumes. Fire TV WebView supports the standard Gamepad API and maps the Amazon Fire Game Controller to the standard layout. Many Bluetooth HID console controllers expose that layout as well, but compatibility depends on the controller and Fire OS/browser version. [1] [2]
- **Accessibility switches/controllers:** keyboard-emulating switches can use the arrow and Enter/Space path. Controllers exposed by the browser as a standard gamepad use the mapping above. This is not a claim that every single-switch or custom accessibility device is supported; confirm with the particular device and its OS/browser integration.

The board has a visible focus indicator, roving keyboard focus, and spoken square names. TV mode removes the board's default hidden state so assistive technology can reach its square controls. These improvements do not replace a hands-on VoiceView or accessibility-device test.

## Run locally

From the repository root:

```sh
npm install
npm start
```

Open `http://localhost:8080/?firetv=1#home`. Use a compatible controller paired to the device, or test with keyboard arrows, Enter/Space, Escape, and Play/Pause where available. Automated desktop browser testing does not establish Fire TV hardware compatibility.

## Fire TV validation and hackathon evidence

Test the TV remote, a standard-layout controller, menu navigation, local computer play, both local and remote board navigation, pause/resume, Back, readable 1080p layout, and the keyboard fallback. For accessibility, test the actual switch/controller and Fire TV VoiceView on the target device. Record any unsupported controller or focus behavior accurately.

The Amazon Developer Hackathon rules accept web technologies for the Fire TV track, but the app must run on Fire OS or Vega OS and the required demonstration video must show it running on an actual Fire TV or Fire TV/Vega simulator. A public website alone is not that device demonstration. [3]

## Browser previews

The screenshots below are Chromium previews at 1920×1080, not Fire TV hardware captures.

![Fire TV mode title screen](preview.png)
![Fire TV mode gameplay screen](gameplay-preview.png)

This repository change is a TV-ready HTML5 client enhancement. It is not a native Fire TV package, an Appstore submission, or a claim of physical-device or accessibility certification.

## References

[1]: https://developer.amazon.com/docs/fire-tv/supporting-controllers-in-web-apps.html "Amazon Fire TV: Supporting Controllers in Web Apps"
[2]: https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API "MDN: Using the Gamepad API"
[3]: https://amazonappdev2026.devpost.com/rules "Amazon Developer Hackathon 2026: Official Rules"
