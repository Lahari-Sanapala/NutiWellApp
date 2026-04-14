// // app/_layout.jsx
// import { Stack } from "expo-router";

// export default function Layout() {
//   return <Stack screenOptions={{ headerShown: false }} />;
// }

// import { Stack } from "expo-router";
// import { UserProvider } from "../context/authContext";

// export default function Layout() {
//   return (
//     <UserProvider>
//       <Stack   screenOptions={{ headerShown: false }}/>
//     </UserProvider>
//   );
// }

// _layout.jsx (or _app.js if using a custom entry point)
// _layout.jsx
import React from "react";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // ✅ correct boolean, no quotes
      }}
    />
  );
}


