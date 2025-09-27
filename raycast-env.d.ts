/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `add-slack-reminder` command */
  export type AddSlackReminder = ExtensionPreferences & {
  /** Developer Mode - Show developer-mode toasts and behaviors */
  "devMode": boolean,
  /** Default Time (HH:MM) - Used if no time is provided in the picker */
  "defaultTime": string
}
}

declare namespace Arguments {
  /** Arguments passed to the `add-slack-reminder` command */
  export type AddSlackReminder = {}
}

