import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Routes, Route } from "react-router-dom";

import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import '@aws-amplify/ui-react/styles.css';
import { AuthProvider } from './Components/Auth/useAuth';

import SiteNav from './Components/Common/SiteNav';
import SiteFooter from './Components/Common/SiteFooter';

import HomePage from './Components/Home/HomePage';
import LoginPage from './Components/Auth/LoginPage'
import RegisterPage from './Components/Auth/RegisterPage';
import ValidatePage from './Components/Auth/ValidatePage';
import ResetPass from './Components/Auth/ResetPass';
import PrivateRoutes from './Components/Auth/PrivateRoute';
import SteamGamesList from './Components/SteamGamesList/SteamGamesList';
import ForumPage from './Components/Discussions/ForumPage';
import Friends from './Components/Friends/Friends';
import GameLists from './Components/GameLists/GameList';
import ProfilePage from './Components/UserProfile/UserProfile';

Amplify.configure(awsExports);

function App() {
  return (
    <div>
      <AuthProvider>
        <SiteNav />
        <Routes>
          <Route path='*' element={<HomePage />} />
          <Route path='/' exact={true} element={<HomePage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/validate' element={<ValidatePage />} />
          <Route path='/resetpass' element={<ResetPass />} />

          <Route element={<PrivateRoutes />}>
            <Route path='/dashboard' element={<SteamGamesList />} exact />
            <Route path='/forumpage' element = {<ForumPage />} exact />
            <Route path='/friends' element = {<Friends />} exact />
            <Route path='/lists' element = {<GameLists />} exact/>
            <Route path='/profile' element = {<ProfilePage/>} exact/>
          </Route>

        </Routes>
        <SiteFooter />
      </AuthProvider>
    </div>
  );
}

export default App;