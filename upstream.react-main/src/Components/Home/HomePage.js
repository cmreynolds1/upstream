import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div style={{ textAlign: 'center', margin: '50px' }}>
      <h1>Welcome to Upstream</h1>
      <img src="/full_logo_upstream.png" alt="Upstream Logo" style={{ maxWidth: '100%', height: 'auto' }} />
      <div style={{ margin: 'auto', maxWidth: '600px' }}>
      <p>
      Upstream is an game organizational tool designed to simplify how you manage and sort your video game collection. Upstream allows gamers to effortlessly organize their games across multiple platforms in one centralized location. Whether you're looking to categorize your games by completion, achivements, or even dropped games. Upstream makes it possible with just a few clicks. The best part? Upstream is available to use right now, offering a seamless and hassle-free setup process. Say goodbye to the clutter and hello to a more organized gaming experience with Upstream. Start optimizing your gaming library today and enjoy a more streamlined and enjoyable gaming experience.
      </p>
      </div>
      <div style={{ margin: '20px' }}>
        <Link to="/login" style={{ marginRight: '10px' }}>
          <button>Login</button>
        </Link>
        <Link to="/register">
          <button>Register</button>
        </Link>
      </div>
    </div>
  );
}

export default HomePage;
