import { en } from "./en";

// Every language must have the same keys as the English file.
export type Messages = typeof en;

// The app has one language for now. To add another, choose it here.
export const messages: Messages = en;
