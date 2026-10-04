import { Archivo_Black } from "next/font/google";

/** Font judul tebal untuk galeri Works; hanya dipasang di halaman yang memakainya. */
export const displayFont = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-display"
});
