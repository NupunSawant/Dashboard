export const getErrorMessage = (err: any, fallback = "Something went wrong") => {
  const data = err?.response?.data;

  // common formats
  if (typeof data?.message === "string") return data.message;
  if (Array.isArray(data?.errors) && data.errors.length) {
    return data.errors.map((e: any) => e?.msg || e?.message || String(e)).join(", ");
  }
  if (typeof data?.error === "string") return data.error;

  return err?.message || fallback;
};
