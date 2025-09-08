// Logout.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Remove token from localStorage
    localStorage.removeItem("token");

    // Optionally, remove any other user data
    localStorage.removeItem("user");

    // Redirect to login page after logout
    navigate("/", { replace: true });
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>You have been logged out!</h2>
    </div>
  );
};

export default Logout;
