// import React, { createContext, useContext, useState, useEffect } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// // Create context
// const UserContext = createContext();

// // Custom hook for using context

// export const UserProvider = ({ children }) => {
//     const [user, setUser] = useState(null); // { email, token }
  
//     useEffect(() => {
//       const loadUser = async () => {
//         try {
//           // Remove this if you don't want to clear AsyncStorage on every app start
//            //await AsyncStorage.clear();
  
//           const storedUser = await AsyncStorage.getItem("user");
//           console.log("Stored user", storedUser);
//           if (storedUser) {
//             const parsed = JSON.parse(storedUser);
//             console.log("Parsed user", parsed);
//             setUser(JSON.parse(storedUser));
//           }
//         } catch (err) {
//           console.log("Error loading user:", err);
//         }
//       };
  
//       loadUser();
//     }, []);
  
//     const login = async (newUser) => {A
//       try {
//         await AsyncStorage.setItem("user", JSON.stringify(newUser));
//         setUser(newUser);
//       } catch (err) {
//         console.log("Error saving user:", err);
//       }
//     };
  
//     const logout = async () => {
//       try {
//         await AsyncStorage.removeItem("user");
//         setUser(null);
//       } catch (err) {
//         console.log("Error removing user:", err);
//       }
//     };
  
//     return (
//       <UserContext.Provider value={{ user, login, logout }}>
//         {children}
//       </UserContext.Provider>
//     );
//   };


//   export const useUser = () => {
//     const context = useContext(UserContext);
//     if (!context) {
//       throw new Error('useUser must be used within a UserProvider');
//     }
//     return context;
//   };


// //   export const useUser = () => {
// //     return useContext(UserContext);
// //   };

// //export const useUser = () => useContext(UserContext);

// // // Provider component
// // export const UserProvider = ({ children }) => {
// //   const [user, setUser] = useState(null); // { email, token }

  // useEffect(() => {
  //   // Load user from AsyncStorage if exists
  //   const loadUser = async () => {
  //     try {
  //       await AsyncStorage.clear();
  //       const storedUser = await AsyncStorage.getItem("user");
  //       console.log("Stored user",storedUser)
  //       if (storedUser) {
  //         setUser(JSON.parse(storedUser));
  //       }
  //     } catch (err) {
  //       console.log("Error loading user:", err);
  //     }
  //   };

  //   loadUser();
  // }, []);

// // //   const login = async (userData) => {
// // //     setUser(userData);
// // //     await AsyncStorage.setItem("user", JSON.stringify(userData));
// // //   };

// // //   const logout = async () => {
// // //     setUser(null);
// // //     await AsyncStorage.removeItem("user");
// // //   };
// //     const setUser=(newUser)=>{
// //         AsyncStorage.setItem("user", newUser.user);
// //         setUser(newUser);
// //     }

// //   return (
// //     <UserContext.Provider value={{ user, setUser }}>
// //       {children}
// //     </UserContext.Provider>
// //   );
// // };



import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { email, token }

  useEffect(() => {
    // Load user from AsyncStorage if exists
    const loadUser = async () => {
      try {
        //await AsyncStorage.clear();
        const storedUser = await AsyncStorage.getItem("user");
        console.log("Stored user",storedUser)
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.log("Error loading user:", err);
      }
    };

    loadUser();
  }, []);

  const login = async (newUser) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
    } catch (err) {
      console.log("Error saving user:", err);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      setUser(null);
    } catch (err) {
      console.log("Error removing user:", err);
    }
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
