import { Form, ActionPanel, Action, showToast, closeMainWindow, popToRoot, getPreferenceValues } from "@raycast/api";
import { runAppleScript, useForm } from "@raycast/utils";

type Values = {
  dateTime?: Date | null;
};

function getTomorrowAtEleven(): Date {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(11, 0, 0, 0);
  return tomorrow;
}

function formatDateYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTimeHHMM(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function parseHHMM(time: string | undefined): { h: number; m: number } | undefined {
  if (!time) return undefined;
  const match = time.match(/^\s*(\d{1,2}):(\d{2})\s*$/);
  if (!match) return undefined;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (Number.isNaN(h) || Number.isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return undefined;
  return { h, m };
}

export default function Command() {
  const { devMode, defaultTime } = getPreferenceValues<{ devMode?: boolean; defaultTime?: string }>();
  const isDev = Boolean(devMode) || ["1", "true", "TRUE", "True"].includes(String(process.env.DEV_MODE));
  const { handleSubmit, itemProps } = useForm<Values>({
    onSubmit: async (values) => {
      const selected = values.dateTime;
      if (!selected) {
        showToast({ title: "Date & time is required" });
        return;
      }

      const parsedDefault = parseHHMM(defaultTime) ?? { h: 11, m: 0 };
      const selectedDate = new Date(selected);
      const isTimeUnset = selectedDate.getHours() === 0 && selectedDate.getMinutes() === 0 && selectedDate.getSeconds() === 0;
      if (isTimeUnset) {
        selectedDate.setHours(parsedDefault.h, parsedDefault.m, 0, 0);
      }
      const dateStr = formatDateYYYYMMDD(selectedDate);
      const timeStr = formatTimeHHMM(selectedDate);

      // Close the Raycast window before sending any keystrokes
      await closeMainWindow({ clearRootSearch: true });

      const script = `
      set d1 to 0.05 -- adjust this delay once
      set d2 to 0.1 -- adjust this delay once
      set d3 to 0.3 -- adjust this delay once
      tell application "System Events"
        set frontName to name of first application process whose frontmost is true
      end tell
      if frontName is not "Slack" then return "SKIP_NOT_SLACK"
      -- detect if focus is in a text input (textarea/textfield)
      set pressUpFirst to false
      try
        tell application "System Events"
          set focusedElement to value of attribute "AXFocusedUIElement" of application process frontName
          set roleName to value of attribute "AXRole" of focusedElement
        end tell
        if roleName is in {"AXTextArea", "AXTextField"} then set pressUpFirst to true
      end try
      tell application "System Events"
        delay d1
        if pressUpFirst then
          key code 126
          delay d2
        end if
        keystroke "m"
        delay d1
        key code 48
        delay d1
        keystroke "${dateStr}"
        delay d1
        key code 48
        delay d1
        key code 48
        delay d1
        keystroke "${timeStr}"
        delay d2
        key code 48
        delay d2
        key code 48
        delay d2
        key code 48
        delay d2
        try
          keystroke return
        end try

      end tell`;

      try {
        const result = await runAppleScript(script);
        if (result && String(result).includes("SKIP_NOT_SLACK")) {
          showToast({ title: "Skipped", message: "Slack not active" });
          return;
        }
        showToast({ title: isDev ? "Keystrokes sent (Developer Mode)" : "Keystrokes sent" });
      } catch (error) {
        showToast({ title: "Failed to send keystrokes", message: String(error) });
      } finally {
        // After automation, reset to root so reopening Raycast doesn't show this form
        await popToRoot({ clearSearchBar: true });
      }
    },
    validation: {
      dateTime: (value) => {
        if (!value) return "Required";
      },
    },
    initialValues: (() => {
      const base = getTomorrowAtEleven();
      const parsed = parseHHMM(defaultTime);
      if (parsed) {
        base.setHours(parsed.h, parsed.m, 0, 0);
      }
      return { dateTime: base };
    })(),
  });

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.DatePicker type={Form.DatePicker.Type.DateTime} title="Date & Time" {...itemProps.dateTime} />
    </Form>
  );
}
