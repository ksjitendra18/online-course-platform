// import { cookies } from "next/headers";

// const getCurrentUserAndRole = async () => {
//   const authToken = cookies().get("auth-token")?.value;
//   if (!authToken) {
//     return null;
//   }
//   const userSession = await prisma.session.findFirst({
//     where: {
//       id: authToken,
//     },
//   });

//   if (!userSession) {
//     return null;
//   }

//   const user = await db.query.user.findUnique({
//     where: { userId: userSession.userId },
//   });

//   if (!user) {
//     return null;
//   }

//   return {
//     userId: user.userId,
//     role: user.role,
//     name: user.name,
//     email: user.email,
//   };
// };

// export default getCurrentUserAndRole;
