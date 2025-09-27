import { Form, ActionPanel, Action, showToast, closeMainWindow, getPreferenceValues } from "@raycast/api";
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

export default function Command() {
  const { devMode } = getPreferenceValues<{ devMode?: boolean }>();
  const isDev = Boolean(devMode) || ["1", "true", "TRUE", "True"].includes(String(process.env.DEV_MODE));
  const { handleSubmit, itemProps } = useForm<Values>({
    onSubmit: async (values) => {
      const selected = values.dateTime;
      if (!selected) {
        showToast({ title: "Date & time is required" });
        return;
      }

      const dateStr = formatDateYYYYMMDD(selected);
      const timeStr = formatTimeHHMM(selected);

      await closeMainWindow();

      const script = `
      set d1 to 0.05 -- adjust this delay once
      set d2 to 0.1 -- adjust this delay once
      tell application "System Events"
        delay 0.3
        key code 126
        delay d1
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
        await runAppleScript(script);
        showToast({ title: isDev ? "Keystrokes sent (Developer Mode)" : "Keystrokes sent" });
      } catch (error) {
        showToast({ title: "Failed to send keystrokes", message: String(error) });
      }
    },
    validation: {
      dateTime: (value) => {
        if (!value) return "Required";
      },
    },
    initialValues: {
      dateTime: getTomorrowAtEleven(),
    },
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
