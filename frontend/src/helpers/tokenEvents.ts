export const emitTokenUpdated = (token: string | null) => {
  window.dispatchEvent(new CustomEvent("token-updated", { detail: token }));
};