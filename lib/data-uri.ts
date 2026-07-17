type Base64DataUri = {
  mimeType: string;
  payload: string;
};

export function parseBase64DataUri(value: string): Base64DataUri | null {
  if (!value.startsWith("data:")) {
    return null;
  }

  const separator = value.indexOf(";base64,");

  if (separator <= 5) {
    return null;
  }

  const mimeType = value.slice(5, separator);
  const payload = value.slice(separator + ";base64,".length);

  if (!mimeType || !payload) {
    return null;
  }

  return { mimeType, payload };
}
