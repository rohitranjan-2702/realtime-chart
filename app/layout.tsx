import "./globals.css";
import React from "react";
import cx from "classnames";
import { sfPro, inter } from "./fonts";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cx(sfPro.variable, inter.variable)}>
        <main className=" bg-[#141521]">{children}</main>
      </body>
    </html>
  );
}
