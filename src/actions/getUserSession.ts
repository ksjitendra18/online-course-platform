const getUserSession = async () => {
  console.log("url");
  const res = await fetch("http://localhost:3000/api/auth/status", {
    cache: "no-cache",
  });

  console.log("res", res.status);
  if (res.status === 200) {
    const resData = await res.json();
    console.log("resData", resData);
    return { currentUser: resData.currentUser };
  } else {
    return null;
  }
};

export default getUserSession;
